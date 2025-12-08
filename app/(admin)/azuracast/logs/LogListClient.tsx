"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
} from "@heroui/react";
import { ListGrid } from "@/components/ui/ListGrid";
import { AzuraLogFile } from "@/services/azurecast/interfaces";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/ui/Toast";

const STATION_ID = process.env.NEXT_PUBLIC_AZURACAST_STATION_ID || "1";

type LogRow = AzuraLogFile & {
  sizeFormatted: string;
  updatedAtFormatted: string;
};

function formatBytes(size: number): string {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  const value = size / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${
    units[exponent]
  }`;
}

function formatTimestamp(timestamp: number): string {
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(ms).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLogEndpoint(log: { name: string; path: string }): string | null {
  const base = `/api/station/${STATION_ID}/log/`;
  const haystack = `${log.name} ${log.path}`.toLowerCase();

  if (
    haystack.includes("liquidsoap_log") ||
    haystack.includes("liquidsoap.log") ||
    haystack.includes("liquidsoap log")
  ) {
    return `${base}liquidsoap_log?position=0`;
  }
  if (
    haystack.includes("liquidsoap_liq") ||
    haystack.includes("liquidsoap.liq")
  ) {
    return `${base}liquidsoap_liq`;
  }
  if (
    haystack.includes("icecast_error_log") ||
    haystack.includes("icecast_error.log") ||
    haystack.includes("icecast error")
  ) {
    return `${base}icecast_error_log?position=0`;
  }
  if (
    haystack.includes("icecast_access_log") ||
    haystack.includes("icecast_access.log") ||
    haystack.includes("icecast access")
  ) {
    return `${base}icecast_access_log?position=0`;
  }
  if (haystack.includes("icecast_xml") || haystack.includes("icecast.xml")) {
    return `${base}icecast_xml`;
  }
  if (haystack.includes("nginx")) {
    return `${base}station_nginx`;
  }

  return null;
}

interface LogListClientProps {
  logs: AzuraLogFile[];
  error: string | null;
}

export default function LogListClient({ logs, error }: LogListClientProps) {
  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logContent, setLogContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const rows: LogRow[] = useMemo(
    () =>
      (logs || []).map((log) => ({
        ...log,
        sizeFormatted: formatBytes(log.size),
        updatedAtFormatted: formatTimestamp(log.timestamp),
      })),
    [logs]
  );

  const fetchLogContent = useCallback(async (log: LogRow) => {
    setIsLoadingContent(true);
    setContentError(null);
    setLogContent("");

    const endpoint = getLogEndpoint(log);
    if (!endpoint) {
      setContentError("Endpoint untuk log ini belum dikonfigurasi.");
      setIsLoadingContent(false);
      return;
    }

    try {
      const url = `/api/azuracast/log-content?path=${encodeURIComponent(
        endpoint
      )}`;
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `Gagal mengambil log (${res.status})`);
      }

      // Try to parse as JSON first, as AzuraCast API often returns { contents: "..." }
      try {
        const json = JSON.parse(text);
        if (json && typeof json.contents === "string") {
          setLogContent(json.contents);
        } else {
          setLogContent(text);
        }
      } catch {
        setLogContent(text || "(kosong)");
      }
    } catch (err) {
      setContentError(
        err instanceof Error ? err.message : "Gagal mengambil konten log."
      );
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const handleOpenLog = useCallback(
    (log: LogRow) => {
      setSelectedLog(log);
      setIsModalOpen(true);
      fetchLogContent(log);
    },
    [fetchLogContent]
  );

  const copyToClipboard = () => {
    if (!logContent) return;
    navigator.clipboard.writeText(logContent);
    Toast({
      title: "Berhasil",
      description: "Log berhasil disalin ke clipboard",
      color: "success",
    });
  };

  useEffect(() => {
    if (isModalOpen && autoScroll && logContainerRef.current) {
      // Small timeout to ensure content is rendered
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop =
            logContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [logContent, isModalOpen, autoScroll]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Nama",
        value: (log: LogRow) => (
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {log.name}
          </div>
        ),
      },
      {
        key: "path",
        label: "Lokasi",
        value: (log: LogRow) => (
          <code className="block max-w-xl truncate rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {log.path}
          </code>
        ),
      },
      {
        key: "sizeFormatted",
        label: "Ukuran",
        value: (log: LogRow) => log.sizeFormatted,
      },
      {
        key: "updatedAtFormatted",
        label: "Diperbarui",
        value: (log: LogRow) => log.updatedAtFormatted,
      },
      {
        key: "view",
        label: "Aksi",
        align: "center" as const,
        value: (log: LogRow) => (
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={() => handleOpenLog(log)}
          >
            Lihat
          </Button>
        ),
      },
    ],
    [handleOpenLog]
  );

  const renderLogContent = () => {
    const lines = (logContent || "")
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          (kosong)
        </div>
      );
    }

    return (
      <div
        ref={logContainerRef}
        className="max-h-[60vh] space-y-0.5 overflow-auto rounded-lg border border-gray-200 bg-[#1e1e1e] p-3 text-xs font-mono text-gray-300 shadow-inner dark:border-gray-800"
      >
        {lines.map((line, idx) => {
          const match = line.match(
            /^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.*)$/
          );
          const timestamp = match?.[1];
          const message = match?.[2] ?? line;
          return (
            <div
              key={`${idx}`}
              className="flex gap-2 border-l-2 border-transparent px-1 hover:bg-white/5 hover:border-blue-500"
            >
              {timestamp ? (
                <>
                  <span className="shrink-0 text-blue-400 select-none">
                    {timestamp}
                  </span>
                  <span className="break-all whitespace-pre-wrap text-gray-300">
                    {message}
                  </span>
                </>
              ) : (
                <span className="break-all whitespace-pre-wrap text-gray-300">
                  {line}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm dark:border-red-800 dark:bg-red-900/30 dark:text-red-100">
          <p className="font-semibold">Tidak dapat memuat log</p>
          <p className="text-sm text-red-700 dark:text-red-100">{error}</p>
        </div>
      ) : (
        <ListGrid
          title=" AzuraCast Logs"
          description="Daftar file log yang tersedia dari AzuraCast Admin API."
          data={rows}
          keyField="name"
          idField="name"
          nameField="name"
          columns={columns as never}
          pageSize={10}
          showPagination
          empty={
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Belum ada data log yang tersedia.
            </div>
          }
        />
      )}

      <Modal
        isOpen={isModalOpen}
        size="5xl"
        scrollBehavior="inside"
        onOpenChange={setIsModalOpen}
        classNames={{
          base: "bg-white dark:bg-[#0f0f0f]",
          header: "border-b border-gray-200 dark:border-gray-800",
          footer: "border-t border-gray-200 dark:border-gray-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">
                    {selectedLog?.name ?? "Log Viewer"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      isSelected={autoScroll}
                      onValueChange={setAutoScroll}
                    >
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Auto Scroll
                      </span>
                    </Switch>
                  </div>
                </div>
                {selectedLog?.path && (
                  <code className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {selectedLog.path}
                  </code>
                )}
              </ModalHeader>
              <ModalBody className="p-4 bg-[#1e1e1e]">
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner color="primary" />
                  </div>
                ) : contentError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100">
                    {contentError}
                  </div>
                ) : (
                  renderLogContent()
                )}
              </ModalBody>
              <ModalFooter className="justify-between">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={copyToClipboard}
                  startContent={<Icon icon="solar:copy-linear" />}
                >
                  Copy to Clipboard
                </Button>
                <div className="flex gap-2">
                  <Button variant="light" onPress={() => onClose()}>
                    Tutup
                  </Button>
                  <Button
                    color="primary"
                    variant="solid"
                    isLoading={isLoadingContent}
                    isDisabled={!selectedLog}
                    onPress={() => selectedLog && fetchLogContent(selectedLog)}
                  >
                    Refresh
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
