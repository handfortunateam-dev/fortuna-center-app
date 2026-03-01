"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { Changelog, CreateChangelogPayload } from "../interfaces";
import {
  useCreateChangeLog,
  useUpdateChangeLog,
} from "../services/changeLogsService";
import { useEffect } from "react";
import { Toast } from "@/components/toast";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  changelog?: Changelog | null;
}

const TYPES = ["FEATURE", "BUG_FIX", "IMPROVEMENT", "UPDATE"] as const;

export function ChangeLogModal({ isOpen, onOpenChange, changelog }: Props) {
  const isEditing = !!changelog;

  const { control, handleSubmit, reset } = useForm<CreateChangelogPayload>({
    defaultValues: {
      title: "",
      content: "",
      type: "FEATURE",
      version: "",
      isPublished: false,
    },
  });

  const { mutate: createLog, isPending: isCreating } = useCreateChangeLog();
  const { mutate: updateLog, isPending: isUpdating } = useUpdateChangeLog();

  useEffect(() => {
    if (isOpen) {
      if (changelog) {
        reset({
          title: changelog.title,
          content: changelog.content,
          type: changelog.type,
          version: changelog.version,
          isPublished: changelog.isPublished,
        });
      } else {
        reset({
          title: "",
          content: "",
          type: "FEATURE",
          version: "",
          isPublished: false,
        });
      }
    }
  }, [isOpen, changelog, reset]);

  const onSubmit = (data: CreateChangelogPayload) => {
    if (isEditing) {
      updateLog(
        { id: changelog.id, payload: data },
        {
          onSuccess: () => {
            Toast({
              title: "Changelog updated successfully",
              color: "success",
            });
            onOpenChange(false);
          },
          onError: (err: any) => {
            Toast({
              title:
                err.response?.data?.message ||
                err.message ||
                "Failed to update changelog",
              color: "danger",
            });
          },
        },
      );
    } else {
      createLog(data, {
        onSuccess: () => {
          Toast({
            title: "Changelog created successfully",
            color: "success",
          });
          onOpenChange(false);
        },
        onError: (err: any) => {
          Toast({
            title:
              err.response?.data?.message ||
              err.message ||
              "Failed to create changelog",
            color: "danger",
          });
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {isEditing ? "Edit Changelog" : "Create New Changelog"}
            </ModalHeader>
            <ModalBody>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Title"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <div className="flex gap-4">
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field, fieldState }) => (
                    <Select
                      label="Type"
                      variant="bordered"
                      selectedKeys={[field.value]}
                      onChange={(e) => field.onChange(e.target.value)}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      className="flex-1"
                    >
                      {TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="version"
                  control={control}
                  rules={{ required: "Version is required" }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      label="Version"
                      placeholder="e.g. 1.0.0"
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      className="flex-1"
                    />
                  )}
                />
              </div>

              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    label="Content"
                    variant="bordered"
                    minRows={5}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="isPublished"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium">
                      Publish immediately
                    </span>
                    <Switch
                      isSelected={value}
                      onValueChange={onChange}
                      size="sm"
                    />
                  </div>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isPending}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isPending}>
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
