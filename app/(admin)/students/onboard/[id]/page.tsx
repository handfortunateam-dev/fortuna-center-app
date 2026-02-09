"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm, FormProvider } from "react-hook-form";
import { Stepper, useStepper } from "@/components/stepper";
import { Toast } from "@/components/toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface UserFormData {
  name: string;
  email: string;
}

interface StudentFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

interface EnrollmentFormData {
  classId: string;
}

interface ClassOption {
  id: string;
  name: string;
}

const steps = [
  {
    label: "User Account",
    description: "Account created",
    icon: "solar:user-check-rounded-bold",
  },
  {
    label: "Student Identity",
    description: "Personal information",
    icon: "solar:document-add-bold",
  },
  {
    label: "Class Assignment",
    description: "Assign to class",
    icon: "solar:users-group-rounded-bold",
  },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  const { activeStep, handleNext, handleBack, isFirstStep, isLastStep } =
    useStepper(steps.length);

  // Form methods for step 1 (User)
  const userFormMethods = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Form methods for step 2 (Student)
  const studentFormMethods = useForm<StudentFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      middleName: "",
      phone: "",
      address: "",
    },
  });

  // Form methods for step 3
  const enrollmentFormMethods = useForm<EnrollmentFormData>({
    defaultValues: {
      classId: "",
    },
  });

  // States
  const [studentId, setStudentId] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch user data and check if student exists
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user-student-onboard", userId],
    queryFn: async () => {
      // Fetch user from database by ID
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error(userData.message || "User not found");
      }

      const user = userData.data;

      // Check if student record already exists
      const studentResponse = await fetch(`/api/students?userId=${userId}`);
      const studentData = await studentResponse.json();

      let existingStudent = null;
      if (
        studentData.success &&
        studentData.data &&
        studentData.data.length > 0
      ) {
        existingStudent = studentData.data[0];
      }

      return {
        user,
        student: existingStudent,
      };
    },
    enabled: !!userId,
  });

  // Update user form and studentId when user data is loaded (only once)
  useEffect(() => {
    if (userData?.user && !isFormInitialized) {
      // Pre-fill user form
      userFormMethods.reset({
        name: userData.user.name || "",
        email: userData.user.email || "",
      });

      if (userData?.student) {
        setStudentId(userData.student.id);
        studentFormMethods.reset({
          firstName: userData.student.firstName || "",
          lastName: userData.student.lastName || "",
          email: userData.student.email || "",
          middleName: userData.student.middleName || "",
          phone: userData.student.phone || "",
          address: userData.student.address || "",
        });
      } else {
        // Pre-fill student form with user data if no student record
        // Parse name into firstName/lastName
        const nameParts = (userData.user.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        studentFormMethods.reset({
          firstName,
          lastName,
          email: userData.user.email || "",
          middleName: "",
          phone: "",
          address: "",
        });
      }

      setIsFormInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, isFormInitialized]);

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes-onboard"],
    queryFn: async () => {
      const response = await fetch("/api/classes");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to fetch classes");
      return data.data || [];
    },
    enabled: activeStep === 2,
  });

  // Fetch enrollment if userId exists (check by userId, not studentId from students table)
  const { data: enrollmentData } = useQuery({
    queryKey: ["enrollment-onboard", userId],
    queryFn: async () => {
      const response = await fetch(
        `/api/class-enrollments?studentId=${userId}`,
      );
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    },
    enabled: activeStep === 2 && !!userId,
  });

  // Update enrollmentId and form when enrollment data is loaded
  useEffect(() => {
    if (enrollmentData) {
      setEnrollmentId(enrollmentData.id);
      enrollmentFormMethods.reset({
        classId: enrollmentData.classId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentData]);

  // Mutation: Update user
  const userMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      return data;
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "User information updated!",
        color: "success",
      });

      // Invalidate user query to refetch
      queryClient.invalidateQueries({
        queryKey: ["user-student-onboard", userId],
      });

      handleNext();
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "An error occurred",
        color: "danger",
      });
    },
  });

  // Handle step 1: Update user
  const handleUpdateUser = (formData: UserFormData) => {
    userMutation.mutate(formData);
  };

  // Mutation: Create or update student
  const studentMutation = useMutation({
    mutationFn: async (formData: StudentFormData) => {
      const isUpdate = !!studentId;
      const url = isUpdate ? `/api/students/${studentId}` : "/api/students";
      const method = isUpdate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isUpdate ? "update" : "create"} student`,
        );
      }

      return data;
    },
    onSuccess: (data) => {
      const isUpdate = !!studentId;

      // Set studentId if it was a POST request
      if (!isUpdate && data.data?.id) {
        setStudentId(data.data.id);
      }

      Toast({
        title: "Success",
        description: `Student identity ${isUpdate ? "updated" : "created"}!`,
        color: "success",
      });

      // Invalidate user query to refetch
      queryClient.invalidateQueries({
        queryKey: ["user-student-onboard", userId],
      });

      handleNext();
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "An error occurred",
        color: "danger",
      });
    },
  });

  // Handle step 2: Create or update student identity
  const handleCreateStudent = (formData: StudentFormData) => {
    studentMutation.mutate(formData);
  };

  // Mutation: Enroll or update enrollment
  const enrollmentMutation = useMutation({
    mutationFn: async (formData: EnrollmentFormData) => {
      // Validate studentId exists (student profile created)
      if (!studentId) {
        throw new Error(
          "Student record not found. Please complete step 2 first.",
        );
      }

      const isUpdate = !!enrollmentId;
      const url = isUpdate
        ? `/api/class-enrollments/${enrollmentId}`
        : "/api/class-enrollments";
      const method = isUpdate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userId, // Use userId from users table, not studentId from students table
          classId: formData.classId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isUpdate ? "update" : "enroll"} student`,
        );
      }

      return data;
    },
    onSuccess: () => {
      const isUpdate = !!enrollmentId;

      Toast({
        title: "Success",
        description: `Student ${isUpdate ? "enrollment updated" : "enrolled to class"} successfully!`,
        color: "success",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["enrollment-onboard", userId],
      });

      // Redirect to users list
      setTimeout(() => {
        router.push("/users");
      }, 1000);
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "An error occurred",
        color: "danger",
      });
    },
  });

  // Handle step 3: Enroll or update enrollment
  const handleEnrollToClass = (formData: EnrollmentFormData) => {
    enrollmentMutation.mutate(formData);
  };

  // Handle Next button based on current step
  const handleNextClick = () => {
    if (activeStep === 0) {
      userFormMethods.handleSubmit(handleUpdateUser)();
    } else if (activeStep === 1) {
      studentFormMethods.handleSubmit(handleCreateStudent)();
    } else if (activeStep === 2) {
      enrollmentFormMethods.handleSubmit(handleEnrollToClass)();
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Step 1: User Account
        return (
          <FormProvider {...userFormMethods}>
            <form className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-lg mb-4">
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-8 h-8 text-success-600"
                />
                <div>
                  <h3 className="font-semibold text-success-900">
                    User Account Created
                  </h3>
                  <p className="text-sm text-success-700">
                    You can review and edit user information below
                  </p>
                </div>
              </div>

              <TextInput
                name="name"
                label="Full Name"
                placeholder="Enter full name"
                required
                validation={{
                  required: "Name is required",
                }}
              />
              <TextInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email"
                required
                validation={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
              />
            </form>
          </FormProvider>
        );

      case 1:
        // Step 2: Student Identity
        return (
          <FormProvider {...studentFormMethods}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  validation={{
                    required: "First name is required",
                  }}
                />
                <TextInput
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  validation={{
                    required: "Last name is required",
                  }}
                />
              </div>
              <TextInput
                name="middleName"
                label="Middle Name (Optional)"
                placeholder="Enter middle name"
                required={false}
              />
              <TextInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email"
                required
                validation={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
              />
              <TextInput
                name="phone"
                label="Phone (Optional)"
                type="tel"
                placeholder="Enter phone number"
                required={false}
              />
              <TextInput
                name="address"
                label="Address (Optional)"
                placeholder="Enter address"
                required={false}
              />
            </form>
          </FormProvider>
        );

      case 2:
        // Step 3: Class Assignment
        return (
          <FormProvider {...enrollmentFormMethods}>
            <form className="space-y-4">
              <SelectInput
                name="classId"
                label="Select Class"
                placeholder="Choose a class"
                required
                validation={{
                  required: "Please select a class",
                }}
                options={classes.map((cls: ClassOption) => ({
                  label: cls.name,
                  value: cls.id,
                }))}
              />
              <p className="text-sm text-default-500">
                Select the class where this student will be enrolled.
              </p>
            </form>
          </FormProvider>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <LoadingScreen
        isLoading={
          isLoadingUser ||
          userMutation.isPending ||
          studentMutation.isPending ||
          enrollmentMutation.isPending
        }
      />
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/users")}
          >
            <Icon icon="solar:arrow-left-line-duotone" className="w-5 h-5" />
          </Button>
          <div>
            <Heading className="text-2xl font-bold">
              Quick Student Registration
            </Heading>
            <Text className="text-sm text-default-500">
              Complete student setup in 3 simple steps
            </Text>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardBody className="p-6">
            <Stepper steps={steps} activeStep={activeStep} />
          </CardBody>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader className="flex flex-col items-start px-6 py-4">
            <Heading className="text-xl font-semibold">
              {steps[activeStep].label}
            </Heading>
            <Text className="text-sm text-default-500">
              {steps[activeStep].description}
            </Text>
          </CardHeader>
          <CardBody className="px-6 py-4">{renderStepContent()}</CardBody>
        </Card>

        {/* Navigation Buttons */}
        <Card>
          <CardBody className="px-6 py-4">
            <div className="flex justify-between">
              <Button
                variant="flat"
                onPress={handleBack}
                isDisabled={isFirstStep}
                startContent={
                  <Icon
                    icon="solar:arrow-left-line-duotone"
                    className="w-4 h-4"
                  />
                }
              >
                Back
              </Button>
              <Button
                color="primary"
                onPress={handleNextClick}
                isDisabled={
                  isLoadingUser ||
                  userMutation.isPending ||
                  studentMutation.isPending ||
                  enrollmentMutation.isPending
                }
                endContent={
                  !isLastStep && (
                    <Icon
                      icon="solar:arrow-right-line-duotone"
                      className="w-4 h-4"
                    />
                  )
                }
              >
                {isLastStep ? "Finish & Enroll" : "Next"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
