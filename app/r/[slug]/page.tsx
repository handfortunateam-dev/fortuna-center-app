"use client";

import { useParams } from "next/navigation";
import { useValidateSlug } from "@/features/registration/services/registrationService";
import { RegistrationForm } from "@/features/registration/forms/RegistrationForm";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

export default function RegisterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setTheme } = useTheme();

  const hasSetTheme = useRef(false);

  useEffect(() => {
    // Force set the global theme to light on this page only once when visited
    if (!hasSetTheme.current) {
      setTheme("light");
      hasSetTheme.current = true;
    }
  }, [setTheme]);

  const { data: link, isLoading, isError } = useValidateSlug(slug);

  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} />;
  }

  if (isError || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <Icon icon="lucide:link-2-off" className="w-8 h-8 text-danger" />
          </div>
          <Heading size="xl" weight="bold" className="text-default-900">
            Invalid Link
          </Heading>
          <Text size="sm" color="muted">
            This registration link is invalid or no longer active. Please
            contact Fortuna Center for more information.
          </Text>
        </div>
      </div>
    );
  }

  return <RegistrationForm slug={slug} linkLabel={link.label} />;
}
