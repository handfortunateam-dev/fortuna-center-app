"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { TextInput } from "@/components/inputs/TextInput";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Heading } from "../heading";
import { Text } from "../text";

interface LoginData {
  email: string;
  password?: string;
}

export default function LocalSignIn() {
  const router = useRouter();
  const methods = useForm<LoginData>({
    defaultValues: { email: "", password: "" },
  });
  const { handleSubmit } = methods;

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (data: LoginData) => {
      try {
        const res = await axios.post("/api/auth/login", data);
        return res.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || "Login failed");
        }
        throw new Error("Login failed");
      }
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Logged in successfully",
        color: "success",
      });
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    login(data);
  };

  return (
    <Card className="w-full max-w-[420px] shadow-2xl border border-default-100 bg-content1 rounded-2xl overflow-visible">
      {/* Header with Logo */}
      <div className="flex flex-col items-center pt-8 pb-2 px-8">
        <div className="mb-6">
          <Image
            src="/android-chrome-512x512.png"
            alt="Fortuna Center Logo"
            width={80}
            height={80}
            className="rounded-2xl"
          />
        </div>
        <Heading className="text-xl font-bold text-foreground">
          Sign in to Fortuna Center
        </Heading>
        <Text className="text-small text-default-500 mt-2 text-center">
          Welcome back! Please sign in to continue
        </Text>
      </div>

      <CardBody className="px-8 pb-8 pt-6">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <TextInput
              name="email"
              label="Email address"
              placeholder="Enter your email address"
              type="email"
              required
            />
            <TextInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              required
              endContent={
                <button
                  type="button"
                  className="focus:outline-none"
                  aria-label="toggle password visibility"
                >
                  {/* TextInput handles this internal logic mostly but we can rely on it */}
                </button>
              }
            />
            <Button
              type="submit"
              color="primary"
              className="w-full font-semibold shadow-md shadow-primary/20 mt-2 h-10"
              isLoading={isPending}
            >
              Continue
            </Button>
          </form>
        </FormProvider>

        <div className="mt-6 text-center text-small text-default-500">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-semibold hover:underline ml-1"
          >
            Sign up
          </Link>
        </div>
      </CardBody>

      <div className="bg-default-50/50 py-4 text-center border-t border-default-100 rounded-b-2xl">
        <div className="flex items-center justify-center gap-2 text-tiny text-default-400 font-medium">
          <Icon icon="solar:shield-check-bold" className="text-default-400" />
          Secured by Fortuna Center
        </div>
      </div>
    </Card>
  );
}
