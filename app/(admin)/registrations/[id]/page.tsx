"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast/index";
import {
  useRegistration,
  useUpdateRegistration,
} from "@/features/registration/services/registrationService";
import { StateMessage } from "@/components/state-message";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Registration } from "@/features/registration/interfaces";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

const statusColorMap: Record<
  Registration["status"],
  "warning" | "primary" | "success" | "danger"
> = {
  pending: "warning",
  reviewed: "primary",
  accepted: "success",
  rejected: "danger",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text
        size="xs"
        color="muted"
        className="uppercase tracking-wide font-medium"
      >
        {label}
      </Text>
      <Text size="sm">{value || "-"}</Text>
    </div>
  );
}

export default function RegistrationDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: reg, isLoading, isError } = useRegistration(id);
  const { mutateAsync: updateRegistration } = useUpdateRegistration();
  const [adminNotes, setAdminNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "reviewed" | "accepted" | "rejected" | "revert" | "notes" | null
  >(null);

  if (isLoading) return <LoadingScreen isLoading={true} />;
  if (isError || !reg) return <StateMessage message="Registration Not Found" />;

  const handleStatusChange = async (newStatus: Registration["status"]) => {
    const actionKey = newStatus === "pending" ? "revert" : newStatus;
    setLoadingAction(actionKey);
    try {
      const result = await updateRegistration({
        id,
        payload: {
          status: newStatus,
          ...(adminNotes ? { adminNotes } : {}),
        },
      });

      if (newStatus === "accepted" && result.studentCreated) {
        Toast({
          title: "Accepted!",
          description: `Siswa baru dibuat dengan ID: ${result.student?.studentId}`,
          color: "success",
        });
      } else if (newStatus === "accepted" && !result.studentCreated) {
        Toast({
          title: "Accepted",
          description: result.message || "Registrasi diterima.",
          color: "warning",
        });
      } else if (newStatus === "rejected") {
        Toast({
          title: "Rejected",
          description: "Registrasi telah ditolak.",
          color: "danger",
        });
      } else {
        Toast({
          title: "Updated",
          description: `Status diubah ke "${newStatus}"`,
          color: "warning",
        });
      }

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      Toast({ title: "Error", description: message, color: "danger" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!adminNotes.trim()) return;
    setLoadingAction("notes");
    try {
      await updateRegistration({ id, payload: { adminNotes } });
      Toast({
        title: "Saved",
        description: "Admin notes saved",
        color: "success",
      });
    } catch {
      Toast({
        title: "Error",
        description: "Failed to save notes",
        color: "danger",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <LoadingScreen isLoading={loadingAction !== null}/>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/registrations")}
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </Button>
          <div>
            <Heading size="xl">Registration Detail</Heading>
            <Text size="sm" color="muted">
              Submitted on{" "}
              {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
        </div>
        <Chip
          color={statusColorMap[reg.status]}
          variant="flat"
          size="lg"
          className="capitalize font-semibold"
        >
          {reg.status}
        </Chip>
      </div>

      {/* Main Info */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-default-100 dark:border-default-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon icon="lucide:user" className="w-5 h-5" />
            </div>
            <Text size="md" weight="semibold">
              Data Pendaftar
            </Text>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoRow
              label="Nama Lengkap"
              value={[reg.firstName, reg.middleName, reg.lastName]
                .filter(Boolean)
                .join(" ")}
            />
            <InfoRow label="Nama Panggilan" value={reg.nickname} />
            <InfoRow
              label="Jenis Kelamin"
              value={reg.gender === "male" ? "Laki-laki" : "Perempuan"}
            />
            <InfoRow
              label="Tempat & Tanggal Lahir"
              value={
                [
                  reg.placeOfBirth,
                  reg.dateOfBirth
                    ? new Date(reg.dateOfBirth).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"
              }
            />

            <Divider className="sm:col-span-2" />

            <InfoRow label="Nomor HP" value={reg.phone} />
            <InfoRow label="Email" value={reg.email} />
            <InfoRow label="Alamat" value={reg.address} />

            <Divider className="sm:col-span-2" />

            <InfoRow label="Pendidikan Terakhir" value={reg.education} />
            <InfoRow label="Pekerjaan" value={reg.occupation} />
            <InfoRow label="Link Pendaftaran" value={reg.linkSlug} />
          </div>
        </CardBody>
      </Card>

      {/* Admin Notes */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-default-100 dark:border-default-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
              <Icon icon="lucide:notebook-pen" className="w-5 h-5" />
            </div>
            <Text size="md" weight="semibold">
              Catatan Admin
            </Text>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-5 space-y-3">
          {reg.adminNotes && (
            <div className="p-3 bg-default-50 dark:bg-default-800/50 rounded-lg border border-default-200 dark:border-default-700">
              <Text size="sm">{reg.adminNotes}</Text>
            </div>
          )}
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-default-300 dark:border-default-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tambahkan catatan admin (opsional)..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="flat"
              color="default"
              onPress={handleSaveNotes}
              isLoading={loadingAction === "notes"}
              isDisabled={!adminNotes.trim() || loadingAction !== null}
              startContent={
                loadingAction !== "notes" ? (
                  <Icon icon="lucide:save" className="w-4 h-4" />
                ) : undefined
              }
            >
              Save Notes
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      {reg.status !== "accepted" && reg.status !== "rejected" && (
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="px-6 py-5">
            <Text size="sm" color="muted" className="mb-4">
              Ubah status registrasi ini:
            </Text>
            <div className="flex flex-wrap gap-3">
              {reg.status === "pending" && (
                <Button
                  color="primary"
                  variant="flat"
                  isLoading={loadingAction === "reviewed"}
                  isDisabled={loadingAction !== null}
                  onPress={() => handleStatusChange("reviewed")}
                  startContent={
                    loadingAction !== "reviewed" ? (
                      <Icon icon="lucide:eye" className="w-4 h-4" />
                    ) : undefined
                  }
                >
                  Mark as Reviewed
                </Button>
              )}
              <Button
                color="success"
                isLoading={loadingAction === "accepted"}
                isDisabled={loadingAction !== null}
                onPress={() => handleStatusChange("accepted")}
                startContent={
                  loadingAction !== "accepted" ? (
                    <Icon icon="lucide:check-circle" className="w-4 h-4" />
                  ) : undefined
                }
              >
                Accept & Create Student
              </Button>
              <Button
                color="danger"
                variant="flat"
                isLoading={loadingAction === "rejected"}
                isDisabled={loadingAction !== null}
                onPress={() => handleStatusChange("rejected")}
                startContent={
                  loadingAction !== "rejected" ? (
                    <Icon icon="lucide:x-circle" className="w-4 h-4" />
                  ) : undefined
                }
              >
                Reject
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {reg.status === "accepted" && (
        <Card className="border border-success-200 bg-success-50/50 dark:bg-success-900/10 shadow-sm">
          <CardBody className="px-6 py-4 flex flex-row items-center gap-3">
            <Icon
              icon="lucide:check-circle-2"
              className="w-6 h-6 text-success"
            />
            <div>
              <Text size="sm" weight="semibold" color="success">
                Registrasi diterima
              </Text>
              <Text size="xs" color="muted">
                Data siswa telah dibuat secara otomatis. Lihat di menu Students.
              </Text>
            </div>
            <Button
              size="sm"
              color="success"
              variant="flat"
              className="ml-auto"
              onPress={() => router.push("/students")}
              startContent={<Icon icon="lucide:users" className="w-4 h-4" />}
            >
              Go to Students
            </Button>
          </CardBody>
        </Card>
      )}

      {reg.status === "rejected" && (
        <Card className="border border-danger-200 bg-danger-50/50 dark:bg-danger-900/10 shadow-sm">
          <CardBody className="px-6 py-4 flex flex-row items-center gap-3">
            <Icon icon="lucide:x-circle" className="w-6 h-6 text-danger" />
            <Text size="sm" weight="semibold" color="danger">
              Registrasi ditolak
            </Text>
            <Button
              size="sm"
              variant="flat"
              color="default"
              className="ml-auto"
              isLoading={loadingAction === "revert"}
              isDisabled={loadingAction !== null}
              onPress={() => handleStatusChange("pending")}
            >
              Revert to Pending
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
