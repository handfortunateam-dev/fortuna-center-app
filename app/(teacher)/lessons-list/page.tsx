"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  Button,
  Accordion,
  AccordionItem,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast";
import FileUpload from "@/components/inputs/FileUpload";
import { useForm, Controller } from "react-hook-form";

// Types
interface Lesson {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  order: number;
  materials: Material[];
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: "video" | "pdf" | "link" | "text" | "file" | "ppt" | "audio";
  content: string | null;
  lessonId: string;
  order: number;
}

export default function LessonsListPage() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Modal states
  const {
    isOpen: isLessonModalOpen,
    onOpen: onLessonModalOpen,
    onOpenChange: onLessonModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMaterialModalOpen,
    onOpen: onMaterialModalOpen,
    onOpenChange: onMaterialModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPreviewModalOpen,
    onOpen: onPreviewModalOpen,
    onOpenChange: onPreviewModalOpenChange,
  } = useDisclosure();

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [targetLessonId, setTargetLessonId] = useState<string>("");

  // Forms
  const {
    register: registerLesson,
    handleSubmit: handleSubmitLesson,
    reset: resetLesson,
    setValue: setValueLesson,
  } = useForm({
    defaultValues: { title: "", description: "" },
  });

  const {
    register: registerMaterial,
    handleSubmit: handleSubmitMaterial,
    reset: resetMaterial,
    control: controlMaterial,
    watch: watchMaterial,
    setValue: setValueMaterial,
  } = useForm({
    defaultValues: { title: "", description: "", type: "link", content: "" },
  });

  // Fetch Classes (Assigned to Teacher)
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const res = await apiClient.get<{ id: string; name: string }[]>("/teacher/classes");
      return res.data;
    },
  });

  // Initialize selected class
  React.useEffect(() => {
    if (classesData && classesData.length > 0 && !selectedClassId) {
      setSelectedClassId(classesData[0].id);
    }
  }, [classesData, selectedClassId]);

  // Fetch Lessons for Selected Class
  const { data: lessonsData, isLoading: isLessonsLoading } = useQuery({
    queryKey: ["lessons", selectedClassId],
    queryFn: async () => {
      const res = await apiClient.get<Lesson[]>(
        `/teacher/lessons?classId=${selectedClassId}`,
      );
      return res.data;
    },
    enabled: !!selectedClassId,
  });

  // Mutations
  const createLessonMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post("/teacher/lessons", { ...data, classId: selectedClassId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Lesson created successfully",
        color: "success",
      });
      onLessonModalOpenChange();
      resetLesson();
    },
    onError: () =>
      Toast({
        title: "Error",
        description: "Failed to create lesson",
        color: "danger",
      }),
  });

  const updateLessonMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.patch(`/teacher/lessons/${editingLesson?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Lesson updated successfully",
        color: "success",
      });
      onLessonModalOpenChange();
      setEditingLesson(null);
      resetLesson();
    },
    onError: () =>
      Toast({
        title: "Error",
        description: "Failed to update lesson",
        color: "danger",
      }),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/teacher/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Lesson deleted successfully",
        color: "success",
      });
    },
    onError: () =>
      Toast({
        title: "Error",
        description: "Failed to delete lesson",
        color: "danger",
      }),
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post("/teacher/lessons/materials", {
        ...data,
        lessonId: targetLessonId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Material added successfully",
        color: "success",
      });
      onMaterialModalOpenChange();
      resetMaterial();
    },
    onError: (err) => {
      console.error(err);
      Toast({
        title: "Error",
        description: "Failed to add material",
        color: "danger",
      });
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.patch(
        `/teacher/lessons/materials/${editingMaterial?.id}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Material updated successfully",
        color: "success",
      });
      onMaterialModalOpenChange();
      setEditingMaterial(null);
      resetMaterial();
    },
    onError: () =>
      Toast({
        title: "Error",
        description: "Failed to update material",
        color: "danger",
      }),
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/teacher/lessons/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedClassId] });
      Toast({
        title: "Success",
        description: "Material deleted successfully",
        color: "success",
      });
    },
    onError: () =>
      Toast({
        title: "Error",
        description: "Failed to delete material",
        color: "danger",
      }),
  });

  // Handlers
  const handleOpenCreateLesson = () => {
    setEditingLesson(null);
    resetLesson();
    onLessonModalOpen();
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setValueLesson("title", lesson.title);
    setValueLesson("description", lesson.description || "");
    onLessonModalOpen();
  };

  const handleOpenCreateMaterial = (lessonId: string) => {
    setTargetLessonId(lessonId);
    setEditingMaterial(null);
    resetMaterial();
    onMaterialModalOpen();
  };

  const handleOpenEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    resetMaterial({
      title: material.title,
      description: material.description || "",
      type: material.type,
      content: material.content || "",
    });
    onMaterialModalOpen();
  };

  const handleOpenPreview = (material: Material) => {
    setPreviewMaterial(material);
    onPreviewModalOpen();
  };

  const onLessonSubmit = (data: any) => {
    if (editingLesson) {
      updateLessonMutation.mutate(data);
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const onMaterialSubmit = (data: any) => {
    if (editingMaterial) {
      updateMaterialMutation.mutate(data);
    } else {
      createMaterialMutation.mutate(data);
    }
  };

  const handleUploadComplete = (url: string, fileName: string) => {
    setValueMaterial("content", url);
    const currentTitle = watchMaterial("title");
    if (!currentTitle) {
      setValueMaterial("title", fileName);
    }
    Toast({
      title: "Success",
      description: "File attached. Please submit the form.",
      color: "success",
    });
  };

  const materialTypeOptions = [
    { key: "link", label: "Link / URL", icon: "lucide:link" },
    { key: "video", label: "Video", icon: "lucide:video" },
    { key: "pdf", label: "PDF Document", icon: "lucide:file-text" },
    { key: "ppt", label: "PowerPoint / Slides", icon: "lucide:presentation" },
    { key: "audio", label: "Audio / Voice", icon: "lucide:mic" },
    { key: "text", label: "Rich Text", icon: "lucide:align-left" },
    { key: "file", label: "General File", icon: "lucide:file" },
  ];

  const renderMaterialIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Icon icon="logos:youtube-icon" className="text-xl" />;
      case "pdf":
        return (
          <Icon icon="lucide:file-text" className="text-xl text-red-500" />
        );
      case "ppt":
        return (
          <Icon
            icon="lucide:presentation"
            className="text-xl text-orange-500"
          />
        );
      case "audio":
        return <Icon icon="lucide:mic" className="text-xl text-purple-500" />;
      case "link":
        return <Icon icon="lucide:link" className="text-xl text-blue-500" />;
      case "text":
        return (
          <Icon icon="lucide:align-left" className="text-xl text-gray-500" />
        );
      default:
        return <Icon icon="lucide:file" className="text-xl text-gray-400" />;
    }
  };

  if (isClassesLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Heading as="h1" size="3xl" weight="bold">
            Lessons & Materials
          </Heading>
          <Text color="muted">Manage curriculum content for your classes.</Text>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            label="Class"
            placeholder="Select a class"
            className="max-w-xs min-w-[200px]"
            selectedKeys={selectedClassId ? [selectedClassId] : []}
            onChange={(e) => setSelectedClassId(e.target.value)}
            isLoading={isClassesLoading}
          >
            {(classesData || []).map((c: any) => (
              <SelectItem key={c.id} value={c.id} textValue={c.name}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            startContent={<Icon icon="lucide:plus" />}
            onPress={handleOpenCreateLesson}
          >
            New Lesson
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isLessonsLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : !lessonsData || lessonsData.length === 0 ? (
          <div className="text-center py-16 bg-default-50 rounded-lg border border-dashed border-default-200">
            <div className="bg-default-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Icon
                icon="lucide:book-open"
                className="text-3xl text-default-400"
              />
            </div>
            <h3 className="text-lg font-semibold">No lessons found</h3>
            <p className="text-default-500 mb-6">
              Start by creating your first lesson module.
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={handleOpenCreateLesson}
            >
              Create Lesson
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonsData.map((lesson) => (
              <Card key={lesson.id} className="border border-default-200">
                <CardBody className="p-0">
                  <Accordion variant="splitted" className="px-0">
                    <AccordionItem
                      key="1"
                      aria-label={lesson.title}
                      title={
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-lg">
                              {lesson.title}
                            </span>
                            {lesson.description && (
                              <span className="text-sm text-default-500">
                                {lesson.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <Icon icon="lucide:more-vertical" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Lesson actions">
                                <DropdownItem
                                  key="edit"
                                  startContent={<Icon icon="lucide:edit" />}
                                  onPress={() => handleOpenEditLesson(lesson)}
                                >
                                  Edit Lesson
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  startContent={<Icon icon="lucide:trash-2" />}
                                  onPress={() =>
                                    deleteLessonMutation.mutate(lesson.id)
                                  }
                                >
                                  Delete Lesson
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>
                      }
                    >
                      <div className="px-4 pb-4">
                        <div className="mb-4 flex justify-between items-center bg-default-50 p-2 rounded-lg">
                          <span className="text-sm font-medium text-default-600 uppercase">
                            Class Materials
                          </span>
                          <Button
                            size="sm"
                            color="secondary"
                            variant="flat"
                            startContent={<Icon icon="lucide:plus" />}
                            onPress={() => handleOpenCreateMaterial(lesson.id)}
                          >
                            Add Material
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {lesson.materials && lesson.materials.length > 0 ? (
                            lesson.materials.map((material) => (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 border border-default-100 rounded-lg hover:border-primary-200 transition-colors group"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="bg-default-100 p-2 rounded">
                                    {renderMaterialIcon(material.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">
                                      {material.title}
                                    </h4>
                                    {material.description && (
                                      <p className="text-xs text-default-500 truncate">
                                        {material.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {material.type === "link" &&
                                    material.content && (
                                      <Button
                                        size="sm"
                                        isIconOnly
                                        variant="flat"
                                        as="a"
                                        href={material.content}
                                        target="_blank"
                                      >
                                        <Icon icon="lucide:external-link" />
                                      </Button>
                                    )}
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="flat"
                                    color="secondary"
                                    onPress={() => handleOpenPreview(material)}
                                    title="Preview Material"
                                  >
                                    <Icon icon="lucide:eye" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    variant="flat"
                                    onPress={() =>
                                      handleOpenEditMaterial(material)
                                    }
                                  >
                                    <Icon icon="lucide:edit-2" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    isIconOnly
                                    color="danger"
                                    variant="flat"
                                    onPress={() =>
                                      deleteMaterialMutation.mutate(material.id)
                                    }
                                  >
                                    <Icon icon="lucide:trash-2" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-default-400">
                              No materials added yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      <Modal isOpen={isLessonModalOpen} onOpenChange={onLessonModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmitLesson(onLessonSubmit)}>
              <ModalHeader>
                {editingLesson ? "Edit Lesson" : "Create New Lesson"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="e.g. Chapter 1: Introduction"
                  {...registerLesson("title", { required: true })}
                />
                <Textarea
                  label="Description"
                  placeholder="Brief summary of this lesson module"
                  {...registerLesson("description")}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={
                    createLessonMutation.isPending ||
                    updateLessonMutation.isPending
                  }
                >
                  {editingLesson ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onOpenChange={onMaterialModalOpenChange}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmitMaterial(onMaterialSubmit)}>
              <ModalHeader>
                {editingMaterial ? "Edit Material" : "Add Material"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="e.g. Lecture Slides"
                  {...registerMaterial("title", { required: true })}
                />
                <Controller
                  name="type"
                  control={controlMaterial}
                  render={({ field }) => (
                    <Select
                      label="Material Type"
                      selectedKeys={[field.value]}
                      onChange={field.onChange}
                    >
                      {materialTypeOptions.map((opt) => (
                        <SelectItem
                          key={opt.key}
                          value={opt.key}
                          startContent={<Icon icon={opt.icon} />}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                {/* Conditional Input based on Type */}
                {watchMaterial("type") === "file" ||
                watchMaterial("type") === "pdf" ||
                watchMaterial("type") === "ppt" ||
                watchMaterial("type") === "audio" ||
                (watchMaterial("type") === "video" &&
                  !watchMaterial("content")?.includes("youtube")) ? (
                  <div className="mb-4">
                    <p className="text-small text-default-500 mb-1">
                      Upload File
                    </p>
                    <FileUpload
                      onUploadComplete={handleUploadComplete}
                      accept={
                        watchMaterial("type") === "pdf"
                          ? ".pdf"
                          : watchMaterial("type") === "ppt"
                            ? ".ppt,.pptx"
                            : watchMaterial("type") === "audio"
                              ? "audio/*"
                              : watchMaterial("type") === "video"
                                ? "video/*"
                                : "*"
                      }
                      label={`Upload ${watchMaterial("type").toUpperCase()}`}
                    />
                    <Input
                      className="mt-2 hidden" // Hidden but registered to keep value
                      {...registerMaterial("content")}
                    />
                    {watchMaterial("content") && (
                      <p className="text-xs text-success mt-1 break-all">
                        Linked: {watchMaterial("content")}
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    label={
                      watchMaterial("type") === "link" ||
                      watchMaterial("type") === "video"
                        ? "URL / Link"
                        : "Content / Value"
                    }
                    placeholder="https://..."
                    {...registerMaterial("content")}
                    description="For 'Video' enter YouTube link. For 'Link' enter URL."
                  />
                )}

                <Textarea
                  label="Description"
                  placeholder="Optional notes about this material"
                  {...registerMaterial("description")}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={
                    createMaterialMutation.isPending ||
                    updateMaterialMutation.isPending
                  }
                >
                  {editingMaterial ? "Update" : "Add Material"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onOpenChange={onPreviewModalOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {previewMaterial?.title}
                <span className="text-sm font-normal text-default-500 capitalize">
                  {previewMaterial?.type} Preview
                </span>
              </ModalHeader>
              <ModalBody className="pb-6">
                {previewMaterial?.description && (
                  <div className="mb-4 p-3 bg-default-50 rounded-lg text-sm text-default-600">
                    {previewMaterial.description}
                  </div>
                )}

                <div className="w-full flex justify-center bg-black/5 rounded-lg overflow-hidden min-h-[200px] items-center">
                  {/* Video / YouTube */}
                  {previewMaterial?.type === "video" &&
                    previewMaterial.content &&
                    (previewMaterial.content.includes("youtube") ||
                    previewMaterial.content.includes("youtu.be") ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${previewMaterial.content.split("v=")[1]?.split("&")[0] || previewMaterial.content.split("/").pop()}`}
                        className="w-full aspect-video"
                        allowFullScreen
                        title="Video Preview"
                      ></iframe>
                    ) : (
                      <video
                        controls
                        className="w-full max-h-[500px]"
                        src={previewMaterial.content}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ))}

                  {/* PDF */}
                  {previewMaterial?.type === "pdf" &&
                    previewMaterial.content && (
                      <iframe
                        src={previewMaterial.content}
                        className="w-full h-[600px]"
                        title="PDF Preview"
                      ></iframe>
                    )}

                  {/* PPT / Office Documents */}
                  {(previewMaterial?.type === "ppt" ||
                    (previewMaterial?.type === "file" &&
                      (previewMaterial.content?.endsWith(".ppt") ||
                        previewMaterial.content?.endsWith(".pptx") ||
                        previewMaterial.content?.endsWith(".doc") ||
                        previewMaterial.content?.endsWith(".docx")))) &&
                    previewMaterial.content && (
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterial.content)}&embedded=true`}
                        className="w-full h-[600px]"
                        frameBorder="0"
                        title="Office Preview"
                      ></iframe>
                    )}

                  {/* Audio */}
                  {previewMaterial?.type === "audio" &&
                    previewMaterial.content && (
                      <div className="p-10 w-full text-center">
                        <Icon
                          icon="lucide:mic"
                          className="text-6xl mx-auto text-purple-500 mb-4"
                        />
                        <audio controls className="w-full">
                          <source src={previewMaterial.content} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                  {/* Generic File */}
                  {previewMaterial?.type === "file" &&
                    previewMaterial.content &&
                    !(
                      previewMaterial.content.endsWith(".ppt") ||
                      previewMaterial.content.endsWith(".pptx") ||
                      previewMaterial.content.endsWith(".doc") ||
                      previewMaterial.content.endsWith(".docx")
                    ) && (
                      <div className="text-center p-8">
                        <Icon
                          icon="lucide:file"
                          className="text-6xl mx-auto text-default-400 mb-4"
                        />
                        <p className="mb-4">
                          This file cannot be previewed directly.
                        </p>
                        <Button
                          as="a"
                          href={previewMaterial.content}
                          target="_blank"
                          color="primary"
                          variant="flat"
                        >
                          Download / View File
                        </Button>
                      </div>
                    )}

                  {/* Text */}
                  {previewMaterial?.type === "text" &&
                    previewMaterial.content && (
                      <div className="p-4 w-full bg-white dark:bg-zinc-900 text-left whitespace-pre-wrap">
                        {previewMaterial.content}
                      </div>
                    )}

                  {/* Link */}
                  {previewMaterial?.type === "link" &&
                    previewMaterial.content && (
                      <div className="text-center p-8 w-full">
                        <Icon
                          icon="lucide:link"
                          className="text-6xl mx-auto text-blue-500 mb-4"
                        />
                        <p className="mb-6 text-lg break-all">
                          {previewMaterial.content}
                        </p>
                        <Button
                          as="a"
                          href={previewMaterial.content}
                          target="_blank"
                          color="primary"
                        >
                          Open Link{" "}
                          <Icon icon="lucide:external-link" className="ml-2" />
                        </Button>
                      </div>
                    )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close Preview
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
