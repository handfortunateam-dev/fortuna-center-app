"use client";

import React, { useRef, useState } from "react";
import { Button, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/lib/firebase"; // Ensure firebase is initialized
import { Toast } from "@/components/toast";

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = "*",
  label = "Upload File",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `materials/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          Toast({
            title: "Error",
            description: "File upload failed",
            color: "danger",
          });
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUploadComplete(downloadURL, file.name);
          setIsUploading(false);
          Toast({
            title: "Success",
            description: "File uploaded successfully",
            color: "success",
          });
        },
      );
    } catch (error) {
      console.error("Error starting upload:", error);
      setIsUploading(false);
      Toast({
        title: "Error",
        description: "Failed to start upload",
        color: "danger",
      });
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />

      {!isUploading && !fileName && (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon
            icon="lucide:upload-cloud"
            className="text-4xl mx-auto mb-2 text-gray-400"
          />
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Click to browse</p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2 p-4 border rounded-lg bg-default-50">
          <div className="flex justify-between text-xs mb-1">
            <span className="truncate max-w-[80%] font-medium">{fileName}</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress size="sm" value={uploadProgress} color="primary" />
        </div>
      )}

      {!isUploading && fileName && (
        <div className="flex items-center justify-between p-3 border border-success-200 bg-success-50 rounded-lg text-success-700">
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon icon="lucide:check-circle" />
            <span className="text-sm truncate font-medium">{fileName}</span>
          </div>
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={() => {
              setFileName("");
              fileInputRef.current!.value = "";
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
