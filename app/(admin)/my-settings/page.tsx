"use client";

import { useGetIdentity } from "@/hooks/useGetIdentity";
import { Button, Card, CardBody, Input, Checkbox } from "@heroui/react";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import axios from "axios";
import { Icon } from "@iconify/react";

interface ProfileData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export default function MySettingsPage() {
  const { user, loading } = useGetIdentity();
  const queryClient = useQueryClient();
  const methods = useForm<ProfileData>();
  const { register, handleSubmit, reset, watch, setValue } = methods;

  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: ProfileData) => {
      const payload: any = { name: data.name, email: data.email };
      if (changePassword && data.password) {
        payload.password = data.password;
      }
      await apiClient.patch("/auth/me", payload);
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Profile updated successfully.",
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["identity"] });
      setChangePassword(false);
      setValue("password", "");
      setValue("confirmPassword", "");
    },
    onError: (error) => {
      let message = "Failed to update profile";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      Toast({
        title: "Error",
        description: message,
        color: "danger",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    if (changePassword) {
      if (data.password !== data.confirmPassword) {
        Toast({
          title: "Error",
          description: "Passwords do not match",
          color: "danger",
        });
        return;
      }
      if (!data.password || data.password.length < 6) {
        Toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          color: "danger",
        });
        return;
      }
    }
    updateProfile(data);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-default-200 animate-pulse rounded-lg"></div>
        <div className="h-[400px] w-full bg-default-100 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Heading>Access Denied</Heading>
        <Text>Please log in to view this page.</Text>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Heading className="text-2xl font-bold">My Settings</Heading>
        <Text className="text-default-500">
          Manage your account preferences
        </Text>
      </div>

      <Card className="p-4">
        <CardBody>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="space-y-4">
                <Heading className="text-lg font-semibold border-b pb-2">
                  Profile Information
                </Heading>
                <div className="grid gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your full name"
                    variant="bordered"
                    {...register("name", { required: true })}
                    startContent={
                      <Icon
                        icon="solar:user-bold"
                        className="text-default-400"
                      />
                    }
                  />
                  <Input
                    label="Email Address"
                    placeholder="Your email address"
                    variant="bordered"
                    type="email"
                    isDisabled
                    {...register("email")}
                    startContent={
                      <Icon
                        icon="solar:letter-bold"
                        className="text-default-400"
                      />
                    }
                    description="Email changes are currently not supported. Please contact your administrator."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <Heading className="text-lg font-semibold">Security</Heading>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    isSelected={changePassword}
                    onValueChange={setChangePassword}
                  >
                    Change Password
                  </Checkbox>
                </div>

                {changePassword && (
                  <div className="grid gap-4 p-4 bg-default-50 rounded-xl border border-default-200">
                    <Input
                      label="New Password"
                      placeholder="Enter new password"
                      variant="bordered"
                      type="password"
                      {...register("password")}
                      startContent={
                        <Icon
                          icon="solar:lock-password-bold"
                          className="text-default-400"
                        />
                      }
                    />
                    <Input
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      variant="bordered"
                      type="password"
                      {...register("confirmPassword")}
                      startContent={
                        <Icon
                          icon="solar:lock-check-bold"
                          className="text-default-400"
                        />
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isPending}
                  className="font-semibold shadow-md shadow-primary/20"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    </div>
  );
}
