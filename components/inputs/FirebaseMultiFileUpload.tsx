"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface AttachedFile {
  url: string;
  type: "image" | "video" | "document" | "audio";
  name: string;
  file?: File;
  previewUrl?: string;
}

interface FirebaseMultiFileUploadProps {
  name: string;
  label: string;
  maxFiles?: number;
  allowedTypes?: string[];
  helperText?: string;
}

export function FirebaseMultiFileUpload({
  name,
  label,
  maxFiles = 5,
  allowedTypes = ["image/*", "video/*", "application/pdf", "audio/*"],
  helperText,
}: FirebaseMultiFileUploadProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<AttachedFile | null>(null);

  const currentFiles: AttachedFile[] = watch(name) || [];

  const getFileType = (mimeType: string): AttachedFile["type"] => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (currentFiles.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const newFile: AttachedFile = {
      url: "",
      name: file.name,
      type: getFileType(file.type),
      file: file,
      previewUrl: URL.createObjectURL(file),
    };

    setValue(name, [...currentFiles, newFile], {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    const fileToRemove = currentFiles[index];
    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }

    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    setValue(name, newFiles, { shouldValidate: true, shouldDirty: true });
  };

  const handlePreview = (file: AttachedFile) => {
    setSelectedFile(file);
    onOpen();
  };

  const renderThumbnail = (file: AttachedFile) => {
    const src = file.previewUrl || file.url;

    if (file.type === "image" && src) {
      return (
        <div
          className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
          onClick={() => handlePreview(file)}
        >
          <Image
            src={src}
            alt={file.name}
            classNames={{
              wrapper: "w-full h-full",
              img: "w-full h-full object-cover",
            }}
            radius="none"
          />
        </div>
      );
    }

    return (
      <div
        className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 cursor-pointer"
        onClick={() => handlePreview(file)}
      >
        {file.type === "video" ? (
          <Icon icon="lucide:video" className="w-5 h-5" />
        ) : file.type === "audio" ? (
          <Icon icon="lucide:music" className="w-5 h-5" />
        ) : (
          <Icon icon="lucide:file-text" className="w-5 h-5" />
        )}
      </div>
    );
  };

  const error = errors[name];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* File List */}
      <div className="space-y-2">
        {currentFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              {renderThumbnail(file)}

              <div
                className="flex flex-col min-w-0 cursor-pointer"
                onClick={() => handlePreview(file)}
              >
                <span className="text-sm font-medium truncate text-gray-700 block max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {file.type}
                </span>
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={() => handleRemove(index)}
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      {currentFiles.length < maxFiles && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={allowedTypes.join(",")}
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center text-gray-500">
            <Icon icon="lucide:upload" className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">
              Click to upload ({currentFiles.length}/{maxFiles})
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Image, Video, Audio, or PDF
            </span>
          </div>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center">
          <Icon icon="lucide:alert-circle" className="h-4 w-4 mr-1" />
          {error.message as string}
        </p>
      )}

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                File Preview
              </ModalHeader>
              <ModalBody className="items-center justify-center p-6 bg-gray-50/50 min-h-[300px]">
                {selectedFile && (
                  <>
                    {selectedFile.type === "image" && (
                      <Image
                        src={selectedFile.previewUrl || selectedFile.url}
                        alt={selectedFile.name}
                        className="max-h-[70vh] object-contain mx-auto"
                      />
                    )}

                    {selectedFile.type === "video" && (
                      <video
                        controls
                        className="max-h-[70vh] w-full bg-black rounded-lg"
                      >
                        <source
                          src={selectedFile.previewUrl || selectedFile.url}
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}

                    {selectedFile.type === "audio" && (
                      <audio controls className="w-full mt-4">
                        <source
                          src={selectedFile.previewUrl || selectedFile.url}
                        />
                        Your browser does not support the audio element.
                      </audio>
                    )}

                    {selectedFile.type === "document" && (
                      <div className="w-full h-[70vh] flex flex-col items-center justify-center">
                        {selectedFile.name.toLowerCase().endsWith(".pdf") ||
                        (selectedFile.file &&
                          selectedFile.file.type === "application/pdf") ? (
                          <iframe
                            src={selectedFile.previewUrl || selectedFile.url}
                            className="w-full h-full rounded-lg border border-gray-200"
                            title="PDF Preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Icon
                              icon="lucide:file-text"
                              className="w-24 h-24 text-gray-300"
                            />
                            <p className="text-lg font-medium text-gray-600">
                              {selectedFile.name}
                            </p>
                            <Button
                              as={Link}
                              href={selectedFile.previewUrl || selectedFile.url}
                              target="_blank"
                              color="primary"
                              showAnchorIcon
                            >
                              Open Document
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
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
