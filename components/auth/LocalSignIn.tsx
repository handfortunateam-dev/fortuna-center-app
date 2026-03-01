"use client";

import { useForm, FormProvider } from "react-hook-form";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { TextInput } from "@/components/inputs/TextInput";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Heading } from "../heading";
import { Text } from "../text";
import { useState } from "react";

interface LoginData {
  email: string;
  password?: string;
}

// ── Full-screen redirect loading overlay ──────────────────────────────────────
function RedirectingOverlay({ name }: { name?: string }) {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-150 animate-pulse" />
        <Image
          src="/android-chrome-512x512.png"
          alt="Fortuna Center"
          width={80}
          height={80}
          className="relative rounded-2xl shadow-xl"
        />
      </div>

      {/* Spinner + text */}
      <div className="flex flex-col items-center gap-4">
        {/* Three-dot bouncing dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-primary"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            Welcome back{name ? `, ${name.split(" ")[0]}` : ""}!
          </p>
          <p className="text-sm text-default-500 mt-1">
            Taking you to your dashboard…
          </p>
        </div>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LocalSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [redirecting, setRedirecting] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();

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
    onSuccess: (data) => {
      // Show loading screen immediately — don't block on cache invalidation
      setUserName(data?.user?.name);
      setRedirecting(true);

      // Fire-and-forget cache invalidation in background
      queryClient.invalidateQueries({ queryKey: ["identity"] });

      Toast({
        title: "Success",
        description: "Logged in successfully",
        color: "success",
      });

      // Small delay so loading screen renders before Next.js starts navigation
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
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
    <>
      {/* Loading overlay shown immediately after successful login */}
      {redirecting && <RedirectingOverlay name={userName} />}

      <Card className="mx-auto w-[calc(100%-2rem)] sm:w-full max-w-[420px] shadow-2xl border border-default-100 bg-content1 rounded-2xl overflow-visible">
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
                    {/* TextInput handles this internal logic */}
                  </button>
                }
              />
              <Button
                type="submit"
                color="primary"
                className="w-full font-semibold shadow-md shadow-primary/20 mt-2 h-10"
                isLoading={isPending || redirecting}
              >
                {redirecting ? "Redirecting…" : "Continue"}
              </Button>
            </form>
          </FormProvider>

          {/* <div className="mt-6 text-center text-small text-default-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-semibold hover:underline ml-1"
            >
              Sign up
            </Link>
          </div> */}
        </CardBody>

        <div className="bg-default-50/50 py-4 text-center border-t border-default-100 rounded-b-2xl">
          <div className="flex items-center justify-center gap-2 text-tiny text-default-400 font-medium">
            <Icon icon="solar:shield-check-bold" className="text-default-400" />
            Secured by Fortuna Center
          </div>
        </div>
      </Card>
    </>
  );
}
