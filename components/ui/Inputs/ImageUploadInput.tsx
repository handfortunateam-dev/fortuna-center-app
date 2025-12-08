"use client";

import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { Button, Image } from "@heroui/react";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
}

export function ImageUploadInput({
  name,
  label,
  required = false,
  helperText,
}: ImageUploadProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentValue = watch(name);

  // Set preview if there's already a value (for edit mode)
  // useEffect(() => {
  if (currentValue && typeof currentValue === "string" && !previewUrl) {
    setPreviewUrl(currentValue);
  }
  // }, [currentValue, previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Store file object for later upload
    setSelectedFile(file);

    // Show preview immediately using object URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Store the file object in form (will be uploaded on submit)
    setValue(name, file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemove = () => {
    // Revoke object URL to free memory
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setSelectedFile(null);
    setValue(name, "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const error = errors[name];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="flat"
            className="absolute top-2 right-2 z-[9999]"
            onPress={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <ImageIcon className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to select image
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB (will upload on save)
            </p>
          </div>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}
