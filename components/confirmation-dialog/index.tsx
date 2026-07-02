/**
 * Confirmation Dialog Component
 * Uses HeroUI Modal for confirmation dialogs
 */

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
// import { AlertTriangle } from "lucide-react";
import { Icon } from "@iconify/react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      backdrop="opaque"
      isDismissable={!isLoading}
      isOpen={isOpen}
      placement="center"
      onClose={onClose}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon
                icon="heroicons:exclamation-triangle"
                className="w-5 h-5 text-warning"
              />
              <span>{title}</span>
            </ModalHeader>
            <ModalBody>
              <p className="text-default-600">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                isDisabled={isLoading}
                variant="light"
                onPress={onCloseModal}
              >
                {cancelLabel}
              </Button>
              <Button
                color={confirmColor}
                isLoading={isLoading}
                onPress={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
