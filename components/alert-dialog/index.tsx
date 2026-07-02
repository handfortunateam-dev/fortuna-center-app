/**
 * Alert Dialog Component
 * Uses HeroUI Modal for simple alerts/warnings
 */

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonLabel?: string;
  type?: "warning" | "danger" | "info" | "success";
}

export function AlertDialog({
  isOpen,
  onClose,
  title = "Attention",
  message = "",
  buttonLabel = "Close",
  type = "warning",
}: AlertDialogProps) {
  const iconMap = {
    warning: "solar:danger-triangle-bold-duotone",
    danger: "solar:danger-bold-duotone",
    info: "solar:info-circle-bold-duotone",
    success: "solar:check-circle-bold-duotone",
  };

  const colorMap = {
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
    success: "text-success",
  };

  const buttonColorMap = {
    warning: "warning",
    danger: "danger",
    info: "primary",
    success: "success",
  } as const;

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      placement="center"
      onClose={onClose}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <Icon
                className={`w-6 h-6 ${colorMap[type]}`}
                icon={iconMap[type]}
              />
              <span>{title}</span>
            </ModalHeader>
            <ModalBody>
              <p className="text-default-600">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button color={buttonColorMap[type]} onPress={onCloseModal}>
                {buttonLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
