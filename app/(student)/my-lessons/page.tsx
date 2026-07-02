"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Accordion,
  AccordionItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  useStudentLessons,
  useStudentClasses,
  LessonMaterial,
} from "@/services/studentPortalService";

export default function MyLessonsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [previewMaterial, setPreviewMaterial] = useState<LessonMaterial | null>(
    null,
  );

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onOpenChange: onPreviewOpenChange,
  } = useDisclosure();

  // Fetch all lessons grouped by class
  const { data: lessonsResponse, isLoading: isLessonsLoading } =
    useStudentLessons();
  const { data: classesResponse, isLoading: isClassesLoading } =
    useStudentClasses();

  const lessonsData = lessonsResponse?.data || [];
  const classesData = classesResponse?.data || [];

  // Filter lessons based on selected class
  const filteredLessons =
    selectedClassId === "all"
      ? lessonsData
      : lessonsData.filter((c) => c.id === selectedClassId);

  const handlePreview = (material: LessonMaterial) => {
    setPreviewMaterial(material);
    onPreviewOpen();
  };

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

  const getMaterialTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      video: "Video",
      pdf: "PDF",
      ppt: "Slides",
      audio: "Audio",
      link: "Link",
      text: "Text",
      file: "File",
    };
    return labels[type] || "File";
  };

  if (isLessonsLoading || isClassesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
          <p className="text-gray-500">
            Access learning materials from your enrolled classes.
          </p>
        </div>

        <Select
          label="Filter Class"
          placeholder="All Classes"
          className="max-w-xs min-w-[200px]"
          selectedKeys={[selectedClassId]}
          onChange={(e) => setSelectedClassId(e.target.value || "all")}
        >
          {[
            <SelectItem key="all">All Classes</SelectItem>,
            ...classesData.map((c) => (
              <SelectItem key={c.id}>{c.name}</SelectItem>
            )),
          ]}
        </Select>
      </div>

      {/* Content */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
          <Icon
            icon="lucide:book-open"
            className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400"
          />
          <h3 className="text-lg font-medium text-gray-900">
            No Materials Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Teacher has not added any materials for your class.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLessons.map((classData) => (
            <Card key={classData.id} className="border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Icon icon="lucide:school" className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{classData.name}</h2>
                    <p className="text-sm text-white/80">
                      {classData.lessons.length} Materials
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="p-0">
                {classData.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon
                      icon="lucide:inbox"
                      className="text-4xl mx-auto mb-2 opacity-50"
                    />
                    <p>No materials available for this class.</p>
                  </div>
                ) : (
                  <Accordion variant="light" className="px-0">
                    {classData.lessons.map((lesson, index) => (
                      <AccordionItem
                        key={lesson.id}
                        aria-label={lesson.title}
                        title={
                          <div className="flex items-center gap-3">
                            <div className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-medium">
                                {lesson.title}
                              </span>
                              {lesson.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <Chip
                              size="sm"
                              variant="flat"
                              color="default"
                              className="ml-auto"
                            >
                              {lesson.materials.length} item
                            </Chip>
                          </div>
                        }
                      >
                        <div className="pb-4 px-2">
                          {lesson.materials.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">
                              No materials in this lesson.
                            </p>
                          ) : (
                            <div className="grid gap-3">
                              {lesson.materials.map((material) => (
                                <div
                                  key={material.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                      {renderMaterialIcon(material.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-800 truncate">
                                        {material.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Chip
                                          size="sm"
                                          variant="flat"
                                          color={
                                            material.type === "video"
                                              ? "danger"
                                              : material.type === "pdf"
                                                ? "warning"
                                                : material.type === "ppt"
                                                  ? "secondary"
                                                  : "default"
                                          }
                                        >
                                          {getMaterialTypeLabel(material.type)}
                                        </Chip>
                                        {material.description && (
                                          <span className="text-xs text-gray-500 truncate">
                                            {material.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {material.type === "link" &&
                                      material.content && (
                                        <Button
                                          size="sm"
                                          color="primary"
                                          variant="flat"
                                          as="a"
                                          href={material.content}
                                          target="_blank"
                                          startContent={
                                            <Icon icon="lucide:external-link" />
                                          }
                                        >
                                          Open
                                        </Button>
                                      )}
                                    {material.type === "file" &&
                                      material.content && (
                                        <Button
                                          size="sm"
                                          color="primary"
                                          variant="flat"
                                          as="a"
                                          href={material.content}
                                          target="_blank"
                                          startContent={
                                            <Icon icon="lucide:download" />
                                          }
                                        >
                                          Download
                                        </Button>
                                      )}
                                    {[
                                      "video",
                                      "pdf",
                                      "ppt",
                                      "audio",
                                      "text",
                                    ].includes(material.type) && (
                                      <Button
                                        size="sm"
                                        color="primary"
                                        variant="solid"
                                        onPress={() => handlePreview(material)}
                                        startContent={
                                          <Icon icon="lucide:play" />
                                        }
                                      >
                                        View
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onOpenChange={onPreviewOpenChange}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  {previewMaterial && renderMaterialIcon(previewMaterial.type)}
                  <div>
                    <span>{previewMaterial?.title}</span>
                    <p className="text-sm font-normal text-gray-500 capitalize">
                      {previewMaterial?.type}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="pb-6">
                {previewMaterial?.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    {previewMaterial.description}
                  </div>
                )}

                <div className="w-full flex justify-center bg-black/5 rounded-lg overflow-hidden min-h-[300px] items-center">
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
                        Browser does not support video.
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
                  {previewMaterial?.type === "ppt" &&
                    previewMaterial.content && (
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterial.content)}&embedded=true`}
                        className="w-full h-[600px]"
                        frameBorder="0"
                        title="Slides Preview"
                      ></iframe>
                    )}

                  {/* Audio */}
                  {previewMaterial?.type === "audio" &&
                    previewMaterial.content && (
                      <div className="p-10 w-full text-center">
                        <Icon
                          icon="lucide:headphones"
                          className="text-6xl mx-auto text-purple-500 mb-4"
                        />
                        <p className="mb-4 text-gray-600">
                          {previewMaterial.title}
                        </p>
                        <audio controls className="w-full max-w-md mx-auto">
                          <source src={previewMaterial.content} />
                          Browser does not support audio.
                        </audio>
                      </div>
                    )}

                  {/* Text */}
                  {previewMaterial?.type === "text" &&
                    previewMaterial.content && (
                      <div className="p-6 w-full bg-white text-left whitespace-pre-wrap text-gray-700">
                        {previewMaterial.content}
                      </div>
                    )}

                  {/* Link (fallback) */}
                  {previewMaterial?.type === "link" &&
                    previewMaterial.content && (
                      <div className="text-center p-8 w-full">
                        <Icon
                          icon="lucide:link"
                          className="text-6xl mx-auto text-blue-500 mb-4"
                        />
                        <p className="mb-6 text-lg break-all text-gray-600">
                          {previewMaterial.content}
                        </p>
                        <Button
                          as="a"
                          href={previewMaterial.content}
                          target="_blank"
                          color="primary"
                          size="lg"
                        >
                          Open Link{" "}
                          <Icon icon="lucide:external-link" className="ml-2" />
                        </Button>
                      </div>
                    )}

                  {/* File (fallback) */}
                  {previewMaterial?.type === "file" &&
                    previewMaterial.content && (
                      <div className="text-center p-8">
                        <Icon
                          icon="lucide:file"
                          className="text-6xl mx-auto text-gray-400 mb-4"
                        />
                        <p className="mb-4 text-gray-500">
                          This file cannot be previewed directly.
                        </p>
                        <Button
                          as="a"
                          href={previewMaterial.content}
                          target="_blank"
                          color="primary"
                          variant="flat"
                          startContent={<Icon icon="lucide:download" />}
                        >
                          Download File
                        </Button>
                      </div>
                    )}
                </div>
              </ModalBody>
              <ModalFooter>
                {previewMaterial?.content &&
                  ["pdf", "ppt", "file", "audio", "video"].includes(
                    previewMaterial.type,
                  ) && (
                    <Button
                      as="a"
                      href={previewMaterial.content}
                      target="_blank"
                      variant="flat"
                      startContent={<Icon icon="lucide:download" />}
                    >
                      Download
                    </Button>
                  )}
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
