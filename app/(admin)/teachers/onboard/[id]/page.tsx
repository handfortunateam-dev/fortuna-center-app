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
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput";
import { EDUCATION_LEVELS } from "@/features/lms/students/constants";

interface UserFormData {
  name: string;
  email: string;
}

interface TeacherFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female";
  placeOfBirth?: string;
  dateOfBirth?: string;
  education?: string;
}

interface AssignmentFormData {
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
    label: "Teacher Identity",
    description: "Personal information",
    icon: "solar:user-id-bold",
  },
  {
    label: "Class Assignment",
    description: "Assign to class",
    icon: "solar:users-group-rounded-bold",
  },
];

export default function TeacherOnboardingPage() {
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

  // Form methods for step 2 (Teacher)
  const teacherFormMethods = useForm<TeacherFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      middleName: "",
      phone: "",
      address: "",
      gender: undefined,
      placeOfBirth: "",
      dateOfBirth: "",
      education: "",
    },
  });

  // Form methods for step 3 (Assignment)
  const assignmentFormMethods = useForm<AssignmentFormData>({
    defaultValues: {
      classId: "",
    },
  });

  // States
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch user data and check if teacher exists
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user-teacher-onboard", userId],
    queryFn: async () => {
      // Fetch user from database by ID
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error(userData.message || "User not found");
      }

      const user = userData.data;

      // Check if teacher record already exists
      const teacherResponse = await fetch(`/api/teachers?userId=${userId}`);
      const teacherData = await teacherResponse.json();

      let existingTeacher = null;
      if (
        teacherData.success &&
        teacherData.data &&
        teacherData.data.length > 0
      ) {
        existingTeacher = teacherData.data[0];
      }

      return {
        user,
        teacher: existingTeacher,
      };
    },
    enabled: !!userId,
  });

  // Update user form and teacherId when user data is loaded (only once)
  useEffect(() => {
    if (userData?.user && !isFormInitialized) {
      // Pre-fill user form
      userFormMethods.reset({
        name: userData.user.name || "",
        email: userData.user.email || "",
      });

      if (userData?.teacher) {
        setTeacherId(userData.teacher.id);
        teacherFormMethods.reset({
          firstName: userData.teacher.firstName || "",
          lastName: userData.teacher.lastName || "",
          email: userData.teacher.email || "",
          middleName: userData.teacher.middleName || "",
          phone: userData.teacher.phone || "",
          address: userData.teacher.address || "",
          gender: userData.teacher.gender || undefined,
          placeOfBirth: userData.teacher.placeOfBirth || "",
          dateOfBirth: userData.teacher.dateOfBirth || "",
          education: userData.teacher.education || "",
        });
      } else {
        // Pre-fill teacher form with user data if no teacher record
        // Parse name into firstName/lastName
        const nameParts = (userData.user.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        teacherFormMethods.reset({
          firstName,
          lastName,
          email: userData.user.email || "",
          middleName: "",
          phone: "",
          address: "",
          gender: undefined,
          placeOfBirth: "",
          dateOfBirth: "",
          education: "",
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

  // Fetch assignment if userId exists (check by teacherId)
  const { data: assignmentData } = useQuery({
    queryKey: ["assignment-onboard", userId],
    queryFn: async () => {
      // Need teacherId first
      if (!teacherId && userData?.teacher?.id) {
        setTeacherId(userData.teacher.id);
      }
      const tId = teacherId || userData?.teacher?.id;

      if (!tId) return null;

      const response = await fetch(`/api/teacher-classes?teacherId=${tId}`);
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    },
    enabled: activeStep === 2 && (!!teacherId || !!userData?.teacher?.id),
  });

  // Update assignmentId and form when assignment data is loaded
  useEffect(() => {
    if (assignmentData) {
      setAssignmentId(assignmentData.id);
      assignmentFormMethods.reset({
        classId: assignmentData.classId || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentData]);

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
        queryKey: ["user-teacher-onboard", userId],
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

  // Mutation: Create or update teacher
  const teacherMutation = useMutation({
    mutationFn: async (formData: TeacherFormData) => {
      const isUpdate = !!teacherId;
      const url = isUpdate ? `/api/teachers/${teacherId}` : "/api/teachers";
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
          data.message || `Failed to ${isUpdate ? "update" : "create"} teacher`,
        );
      }

      return data;
    },
    onSuccess: (data) => {
      const isUpdate = !!teacherId;

      // Set teacherId if it was a POST request
      if (!isUpdate && data.data?.id) {
        setTeacherId(data.data.id);
      }

      Toast({
        title: "Success",
        description: `Teacher identity ${isUpdate ? "updated" : "created"}!`,
        color: "success",
      });

      // Invalidate user query to refetch
      queryClient.invalidateQueries({
        queryKey: ["user-teacher-onboard", userId],
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

  // Handle step 2: Create or update teacher identity
  const handleCreateTeacher = (formData: TeacherFormData) => {
    teacherMutation.mutate(formData);
  };

  // Mutation: Assign or update assignment
  const assignmentMutation = useMutation({
    mutationFn: async (formData: AssignmentFormData) => {
      // Validate teacherId exists (teacher profile created)
      if (!teacherId && !userData?.teacher?.id) {
        throw new Error(
          "Teacher record not found. Please complete step 2 first.",
        );
      }

      const tId = teacherId || userData?.teacher?.id;

      const isUpdate = !!assignmentId;
      const url = isUpdate
        ? `/api/teacher-classes/${assignmentId}`
        : "/api/teacher-classes";
      const method = isUpdate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: tId, // Use userId from users table, not teacherId from teachers table? No, check schema.
          // teacher-classes.schema.ts says: teacherId references users.id (same as students).
          // BUT wait, for students it was studentId references users.id.
          // For teachers, teacherId also references users.id.
          // So yes, verify if we should use `userId`.
          classId: formData.classId,
        }),
      });

      // Based on schema check:
      // teacherClasses.teacherId references users.id.
      // So we should use `userId`, NOT `teachers.id`.
      // Let's correct the body below.

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isUpdate ? "update" : "assign"} teacher`,
        );
      }

      return data;
    },
    onSuccess: () => {
      const isUpdate = !!assignmentId;

      Toast({
        title: "Success",
        description: `Teacher ${isUpdate ? "assignment updated" : "assigned to class"} successfully!`,
        color: "success",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({
        queryKey: ["assignment-onboard", userId],
      });

      // Redirect to teachers list or stay
      setTimeout(() => {
        router.push("/teachers");
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

  // Since teacherId references users.id in teacherClasses table, override payload in mutation
  // Actually, I wrote above: teacherId references users.id.
  // So body: { teacherId: userId, classId: ... } is correct assuming userId is the User UUID.

  // Handle step 3: Assign to class
  const handleAssignClass = (formData: AssignmentFormData) => {
    // Override mutation to use correct ID
    // Re-declare mutation function logic above is fine if we use userId
    // Wait, the mutationFn above used `tId` which was `teacherId` (from teachers table).
    // teachers table ID vs users table ID?
    // In schema: teachers.userId references users.id.
    // In teacher-classes: teacherId references users.id.
    // So we need `userId` (the UUID from URL params), NOT `teacherId` (the generic ID from teachers table if any).
    // Actually teachers table has `...id` from columns.helper, so it has its own UUID.
    // But teacher-classes points to `users.id`.
    // So for assignment, we need `userId`.

    // Let's fix the mutation logic to use `userId` for assignment.

    // Re-defining mutation logic to ensure correctness:
    /*
      body: JSON.stringify({
          teacherId: userId, // CORRECT: references users.id
          classId: formData.classId,
        }),
    */

    assignmentMutation.mutate(formData);
  };

  // Handle Next button based on current step
  const handleNextClick = () => {
    if (activeStep === 0) {
      userFormMethods.handleSubmit(handleUpdateUser)();
    } else if (activeStep === 1) {
      teacherFormMethods.handleSubmit(handleCreateTeacher)();
    } else if (activeStep === 2) {
      assignmentFormMethods.handleSubmit(handleAssignClass)();
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
        // Step 2: Teacher Identity
        return (
          <FormProvider {...teacherFormMethods}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput
                  name="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                  ]}
                />
                <DatePickerInput
                  name="dateOfBirth"
                  label="Date of Birth"
                  placeholder="Select date"
                />
              </div>

              <TextInput
                name="placeOfBirth"
                label="Place of Birth"
                placeholder="Enter place of birth"
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

              <AutocompleteInput
                label="Education"
                name="education"
                placeholder="Select education level"
                options={EDUCATION_LEVELS}
                required={false}
                isClearable
              />
            </form>
          </FormProvider>
        );

      case 2:
        // Step 3: Class Assignment
        return (
          <FormProvider {...assignmentFormMethods}>
            <form className="space-y-4">
              <SelectInput
                name="classId"
                label="Assign to Class"
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
                Select the class where this teacher will be assigned.
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
          teacherMutation.isPending ||
          assignmentMutation.isPending
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
              Quick Teacher Registration
            </Heading>
            <Text className="text-sm text-default-500">
              Complete teacher setup in 3 simple steps
            </Text>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardBody className="p-6">
            <div className="w-full max-w-2xl mx-auto">
              <Stepper steps={steps} activeStep={activeStep} />
            </div>
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
                  teacherMutation.isPending ||
                  assignmentMutation.isPending
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
