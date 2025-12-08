"use client";

// import { AlertTriangle } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody } from "@heroui/react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Tidak dapat memuat data. Silakan coba lagi nanti.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Card className="w-full max-w-5xl shadow-md border border-red-200">
        <CardBody className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 text-red-600 rounded-full p-3">
            <Icon icon="heroicons:exclamation-triangle" className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-red-600">{title}</h2>
          <p className="text-gray-500 text-sm">{message}</p>
          {onRetry && (
            <Button color="danger" variant="flat" onPress={onRetry}>
              Coba Lagi
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
