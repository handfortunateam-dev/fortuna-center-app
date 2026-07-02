"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { useSubmitRegistration } from "../services/registrationService";
import { CreateRegistrationPayload } from "../interfaces";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  EDUCATION_LEVELS,
  OCCUPATION_TYPES,
} from "@/features/lms/students/constants";
import Image from "next/image";
import { DatePickerInput } from "@/components/inputs";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { Toast } from "@/components/toast";

interface RegistrationFormProps {
  slug: string;
  linkLabel: string;
}

export function RegistrationForm({ slug, linkLabel }: RegistrationFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: submitRegistration, isPending } =
    useSubmitRegistration();

  const methods = useForm<CreateRegistrationPayload>({
    defaultValues: {
      linkSlug: slug,
      firstName: "",
      middleName: "",
      lastName: "",
      nickname: "",
      gender: undefined,
      placeOfBirth: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      address: "",
      education: "",
      occupation: "",
      website: "", // honeypot
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const loading = isPending || isSubmitting;

  const onSubmit = async (data: CreateRegistrationPayload) => {
    try {
      await submitRegistration(data as unknown as Record<string, unknown>);
      setIsSuccess(true);

      // Trigger confetti effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 100,
      });

      Toast({
        title: "Registration successful",
        description: "Thank you for registering at Fortuna Center.",
        variant: "solid",
        color: "success",
      });
    } catch (error: unknown) {
      const err = error as Error;

      Toast({
        title: "Failed to submit registration",
        description:
          err.message || "Failed to submit registration. Please try again.",
        variant: "solid",
        color: "danger",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
            <Icon
              icon="lucide:check-circle-2"
              className="w-10 h-10 text-success"
            />
          </div>
          <Heading
            size="xl"
            weight="bold"
            align="center"
            className="text-default-900"
          >
            Registration Successful!
          </Heading>
          <Text size="sm" color="muted" align="center">
            Thank you for registering at Fortuna Center. We have received your
            data and will process it shortly. We will contact you via the phone
            number provided.
          </Text>
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <Text size="sm" color="primary" weight="medium" align="center">
              <Icon icon="lucide:phone" className="w-4 h-4 inline mr-1.5" />
              Contact us if you have any questions
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <LoadingScreen isLoading={loading} />
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Image
            src="/android-chrome-512x512.png"
            alt="Fortuna Center Logo"
            width={80}
            height={80}
            className="rounded-2xl"
          />
        </div>
        <Heading
          size="xl"
          weight="bold"
          className="text-default-900"
          align="center"
        >
          Registration Form
        </Heading>
        <Text size="sm" color="muted" align="center">
          {linkLabel} — Fortuna Center
        </Text>
      </div>

      <Card className="shadow-sm">
        <CardBody className="p-5 sm:p-6">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              {/* Honeypot — invisible to humans */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  {...methods.register("website")}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Hidden slug */}
              <input type="hidden" {...methods.register("linkSlug")} />

              {/* Identity */}
              <div>
                <Heading
                  size="sm"
                  weight="bold"
                  className="text-default-900 mb-3 flex items-center gap-2"
                  startContent={
                    <Icon icon="lucide:graduation-cap" className="w-4 h-4" />
                  }
                >
                  Personal Information
                </Heading>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                      name="firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      required
                      validation={{ required: "First name is required" }}
                    />
                    <TextInput
                      name="middleName"
                      label="Middle Name"
                      placeholder="Middle name (optional)"
                      required={false}
                    />
                    <TextInput
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter last name"
                      required
                      validation={{ required: "Last name is required" }}
                    />
                    <TextInput
                      name="nickname"
                      label="Nickname"
                      placeholder="Nickname"
                      required={true}
                    />
                  </div>

                  <SelectInput
                    name="gender"
                    label="Gender"
                    placeholder="Select gender"
                    required
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ]}
                    validation={{ required: "Gender is required" }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                      name="placeOfBirth"
                      label="Place of Birth"
                      placeholder="City of birth"
                      required={true}
                    />
                    <DatePickerInput
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                      required={true}
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <Heading
                  size="sm"
                  weight="bold"
                  className="text-default-900 mb-3 flex items-center gap-2"
                  startContent={
                    <Icon icon="lucide:phone" className="w-4 h-4" />
                  }
                >
                  Contact
                </Heading>
                <div className="flex flex-col gap-4">
                  <TextInput
                    name="phone"
                    label="Phone Number / WhatsApp"
                    placeholder="+628xxxxxxxxxx"
                    required
                    validation={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: "Invalid phone number format",
                      },
                    }}
                  />
                  <TextInput
                    name="email"
                    label="Email"
                    placeholder="email@example.com"
                    type="email"
                    required={true}
                  />
                  <TextareaInput
                    name="address"
                    label="Address"
                    placeholder="Full address"
                    minRows={2}
                    required={true}
                  />
                </div>
              </div>

              {/* Education & Occupation */}
              <div>
                <Heading
                  size="sm"
                  weight="bold"
                  className="text-default-900 mb-3 flex items-center gap-2"
                  startContent={
                    <Icon icon="lucide:briefcase" className="w-4 h-4" />
                  }
                >
                  Education & Occupation
                </Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectInput
                    name="education"
                    label="Latest Education"
                    placeholder="Select education"
                    options={EDUCATION_LEVELS}
                    required={true}
                  />
                  <SelectInput
                    name="occupation"
                    label="Occupation"
                    placeholder="Current occupation"
                    options={OCCUPATION_TYPES}
                    required={true}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isLoading={loading}
                  fullWidth
                  className="font-semibold"
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
                <Text size="xs" color="muted" className="mt-3 text-center">
                  By submitting this form, you agree that your data will be used
                  for the registration process at Fortuna Center.
                </Text>
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    </div>
  );
}
