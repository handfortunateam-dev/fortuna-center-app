"use client";

import {
  useForm,
  FormProvider,
  FieldValues,
  SubmitHandler,
  DefaultValues,
  UseFormReturn,
} from "react-hook-form";
import { ReactNode } from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { CreateOrEditButton } from "@/components/button/CreateOrEditButton";
import { Icon } from "@iconify/react";

interface CreateOrEditFormWrapperProps<T extends FieldValues> {
  children: ReactNode;
  onSubmit: SubmitHandler<T>;
  defaultValues?: DefaultValues<T>;
  mode?: "create" | "edit";
  backPath?: string;
  methods?: UseFormReturn<T>;
}

export const CreateOrEditFormWrapper = <T extends FieldValues>({
  children,
  onSubmit,
  defaultValues,
  mode = "create",
  backPath,
  methods: propMethods,
}: CreateOrEditFormWrapperProps<T>) => {
  const router = useRouter();

  // If methods are passed, use them. Otherwise, initialize local form.
  // Note: We always call useForm to adhere to Rules of Hooks,
  // but we prefer propMethods if available.
  const localMethods = useForm<T>({
    defaultValues,
    mode: "onBlur",
  });

  const methods = propMethods || localMethods;

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const rootError = errors.root?.message as string | undefined;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {rootError && (
          <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg p-3">
            <Icon
              icon="lucide:alert-circle"
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-800">{rootError}</p>
          </div>
        )}

        {children}

        <div className="flex gap-3 pt-4">
          <Button
            variant="bordered"
            onPress={() => (backPath ? router.push(backPath) : router.back())}
            isDisabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <div className="flex-1">
            <CreateOrEditButton
              mode={mode}
              type="submit"
              isLoading={isSubmitting}
              fullWidth
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
