"use client";

import { useEffect, useRef, useCallback, memo, useState } from "react";
import { Icon } from "@iconify/react";
import { uploadFileToFirebase } from "@/services/storageService";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
];

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "Huge", value: "5" },
];

const BLOCK_FORMATS = [
  { label: "Normal", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
  { label: "Heading 4", value: "H4" },
  { label: "Quote", value: "BLOCKQUOTE" },
  { label: "Code", value: "PRE" },
];

// Memoized toolbar button to prevent re-renders
const ToolbarButton = memo(function ToolbarButton({
  icon,
  label,
  onMouseDown,
}: {
  icon: string;
  label: string;
  onMouseDown: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus loss
        onMouseDown();
      }}
      className="p-1.5 rounded hover:bg-default-200 dark:hover:bg-default-700 transition-colors text-default-600 dark:text-400"
      title={label}
    >
      <Icon icon={icon} className="text-lg" />
    </button>
  );
});

// Memoized toolbar select
const ToolbarSelect = memo(function ToolbarSelect({
  options,
  onSelect,
  defaultValue,
  title,
  width = "w-24",
}: {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  defaultValue?: string;
  title: string;
  width?: string;
}) {
  return (
    <select
      className={`${width} h-8 px-2 text-sm border border-default-200 dark:border-default-700 rounded bg-white dark:bg-default-800 text-default-700 dark:text-default-300 focus:outline-none focus:border-primary cursor-pointer`}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        onSelect(e.target.value);
      }}
      defaultValue={defaultValue}
      title={title}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

const Separator = memo(function Separator() {
  return <div className="w-px h-6 bg-default-200 dark:bg-default-700 mx-1" />;
});

function TextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [isUploading, setIsUploading] = useState(false);

  // Keep onChange ref updated
  onChangeRef.current = onChange;

  // Initialize content ONLY once on mount
  useEffect(() => {
    if (!initializedRef.current && editorRef.current) {
      initializedRef.current = true;
      if (value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    // Notify parent of change
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle tab for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        execCommand(e.shiftKey ? "outdent" : "indent");
      }
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            execCommand("bold");
            break;
          case "i":
            e.preventDefault();
            execCommand("italic");
            break;
          case "u":
            e.preventDefault();
            execCommand("underline");
            break;
        }
      }
    },
    [execCommand],
  );

  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    const url = prompt("Enter URL:", "https://");
    if (url) {
      if (selectedText) {
        execCommand("createLink", url);
      } else {
        document.execCommand(
          "insertHTML",
          false,
          `<a href="${url}">${url}</a>`,
        );
        if (editorRef.current) {
          onChangeRef.current(editorRef.current.innerHTML);
        }
      }
    }
  }, [execCommand]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadFileToFirebase(file, "editor-images");

      // Focus editor before inserting
      if (editorRef.current) {
        editorRef.current.focus();
      }

      execCommand("insertImage", url);
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`border border-default-200 dark:border-default-700 rounded-xl overflow-hidden bg-white dark:bg-default-900 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-shadow ${className || ""}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800">
        {/* Block Format */}
        <ToolbarSelect
          options={BLOCK_FORMATS}
          onSelect={(val) => execCommand("formatBlock", val)}
          defaultValue="P"
          title="Paragraph Format"
          width="w-28"
        />

        <Separator />

        {/* Font Family */}
        <ToolbarSelect
          options={FONT_FAMILIES}
          onSelect={(val) => execCommand("fontName", val)}
          title="Font Family"
          width="w-32"
        />

        <Separator />

        {/* Font Size */}
        <ToolbarSelect
          options={FONT_SIZES}
          onSelect={(val) => execCommand("fontSize", val)}
          defaultValue="3"
          title="Font Size"
          width="w-20"
        />

        <Separator />

        {/* Text Formatting */}
        <div className="flex items-center">
          <ToolbarButton
            icon="mdi:format-bold"
            label="Bold (Ctrl+B)"
            onMouseDown={() => execCommand("bold")}
          />
          <ToolbarButton
            icon="mdi:format-italic"
            label="Italic (Ctrl+I)"
            onMouseDown={() => execCommand("italic")}
          />
          <ToolbarButton
            icon="mdi:format-underline"
            label="Underline (Ctrl+U)"
            onMouseDown={() => execCommand("underline")}
          />
          <ToolbarButton
            icon="mdi:format-strikethrough"
            label="Strikethrough"
            onMouseDown={() => execCommand("strikeThrough")}
          />
        </div>

        <Separator />

        {/* Lists */}
        <div className="flex items-center">
          <ToolbarButton
            icon="mdi:format-list-bulleted"
            label="Bullet List"
            onMouseDown={() => execCommand("insertUnorderedList")}
          />
          <ToolbarButton
            icon="mdi:format-list-numbered"
            label="Numbered List"
            onMouseDown={() => execCommand("insertOrderedList")}
          />
          <ToolbarButton
            icon="mdi:format-indent-decrease"
            label="Decrease Indent"
            onMouseDown={() => execCommand("outdent")}
          />
          <ToolbarButton
            icon="mdi:format-indent-increase"
            label="Increase Indent"
            onMouseDown={() => execCommand("indent")}
          />
        </div>

        <Separator />

        {/* Alignment */}
        <div className="flex items-center">
          <ToolbarButton
            icon="mdi:format-align-left"
            label="Align Left"
            onMouseDown={() => execCommand("justifyLeft")}
          />
          <ToolbarButton
            icon="mdi:format-align-center"
            label="Align Center"
            onMouseDown={() => execCommand("justifyCenter")}
          />
          <ToolbarButton
            icon="mdi:format-align-right"
            label="Align Right"
            onMouseDown={() => execCommand("justifyRight")}
          />
          <ToolbarButton
            icon="mdi:format-align-justify"
            label="Justify"
            onMouseDown={() => execCommand("justifyFull")}
          />
        </div>

        <Separator />

        {/* Insert */}
        <div className="flex items-center">
          <ToolbarButton
            icon="mdi:link-variant"
            label="Insert Link"
            onMouseDown={insertLink}
          />
          <ToolbarButton
            icon="mdi:image"
            label="Insert Image"
            onMouseDown={insertImage}
          />
        </div>

        <Separator />

        {/* Code & Clear */}
        <div className="flex items-center">
          <ToolbarButton
            icon="mdi:code-tags"
            label="Code"
            onMouseDown={() => execCommand("formatBlock", "PRE")}
          />
          <ToolbarButton
            icon="mdi:format-clear"
            label="Clear Formatting"
            onMouseDown={() => execCommand("removeFormat")}
          />
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="min-h-[300px] p-4 outline-none focus:outline-none
          text-default-900 dark:text-default-100
          empty:before:content-[attr(data-placeholder)] empty:before:text-default-400 dark:empty:before:text-default-600 empty:before:pointer-events-none
          prose prose-sm dark:prose-invert max-w-none
          [&>*]:my-2 [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg [&>h4]:text-base
          [&>blockquote]:border-l-4 [&>blockquote]:border-default-300 dark:[&>blockquote]:border-default-600 [&>blockquote]:pl-4 [&>blockquote]:italic
          [&>pre]:bg-default-100 dark:[&>pre]:bg-default-800 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:font-mono [&>pre]:text-sm
          [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6
          [&_a]:text-primary [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-lg"
        style={{
          minHeight: "300px",
          wordBreak: "break-word",
        }}
      />
    </div>
  );
}

export default memo(TextEditor);
