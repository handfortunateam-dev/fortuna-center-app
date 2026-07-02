"use client";

import React, { useState } from "react";
import {
  Button,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TicketStatusChip } from "@/components/ticket/TicketStatusChip";
import { ITicket } from "../interface";
import { TICKET_STATUSES } from "../constant";
import { ListGrid, createColumns } from "@/components/table";
import apiClient from "@/lib/axios";

export function AdminSupport() {
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const queryClient = useQueryClient();

  const updateTicketMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      response,
    }: {
      id: string;
      status?: string;
      response?: string;
    }) => {
      const payload: Record<string, string> = {};
      if (status) payload.status = status;
      if (response !== undefined) payload.adminResponse = response;

      const { data } = await apiClient.patch(`/tickets/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setSelectedTicket(null);
      setAdminResponse("");
    },
  });

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      status,
      response: adminResponse,
    });
  };

  const openTicketModal = (ticket: ITicket) => {
    setSelectedTicket(ticket);
    setAdminResponse(ticket.adminResponse || "");
  };

  const columns = createColumns<ITicket>([
    {
      key: "id",
      label: "Ticket ID",
      value: (ticket) => (
        <span className="font-mono text-xs">{ticket.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
    },
    {
      key: "category",
      label: "Category",
      value: (ticket) => (
        <Chip size="sm" variant="flat">
          {ticket.category.replace("_", " ")}
        </Chip>
      ),
    },
    {
      key: "status",
      label: "Status",
      value: (ticket) => <TicketStatusChip status={ticket.status} />,
    },
    {
      key: "createdAt",
      label: "Created",
      value: (ticket) => format(new Date(ticket.createdAt), "MMM dd, yyyy"),
    },
  ]);

  return (
    <>
      <ListGrid<ITicket>
        title="Help & Support (Admin)"
        description="Manage all student and staff support tickets"
        resourcePath="/tickets"
        columns={columns}
        basePath="/help-support"
        enableSearch={true}
        searchPlaceholder="Search tickets..."
        enableCreate={false}
        enableShow={false}
        enableEdit={false}
        enableDelete={true}
        actionButtons={{
          custom: [
            {
              key: "review",
              label: "",
              icon: <Icon icon="lucide:eye" />,
              onClick(id, item) {
                openTicketModal(item as ITicket);
              },
            },
          ],
        }}
        onRowClick={(item) => openTicketModal(item)}
      />

      {/* View/Review Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>Review Ticket</span>
              {selectedTicket && (
                <TicketStatusChip status={selectedTicket.status} />
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedTicket && (
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <p className="text-sm text-default-500">Subject</p>
                  <p className="font-medium">{selectedTicket.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Category</p>
                  <Chip size="sm" variant="flat">
                    {selectedTicket.category.replace("_", " ")}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500">Description</p>
                  <p className="text-default-700">
                    {selectedTicket.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Created</p>
                  <p>{format(new Date(selectedTicket.createdAt), "PPpp")}</p>
                </div>

                <Divider />

                <div>
                  <p className="text-sm font-medium mb-2">Admin Response</p>
                  <Textarea
                    placeholder="Provide your resolution response..."
                    minRows={3}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Update Status & Save
                  </p>
                  <div className="flex gap-2">
                    {TICKET_STATUSES.map((opt) => (
                      <Button
                        key={opt.key}
                        size="sm"
                        variant={
                          selectedTicket.status === opt.key
                            ? "solid"
                            : "bordered"
                        }
                        color={
                          opt.key === "resolved"
                            ? "success"
                            : opt.key === "closed"
                              ? "default"
                              : opt.key === "in_progress"
                                ? "primary"
                                : "warning"
                        }
                        onPress={() =>
                          handleUpdateStatus(selectedTicket.id, opt.key)
                        }
                        isLoading={
                          updateTicketMutation.isPending &&
                          selectedTicket.status !== opt.key
                        }
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setSelectedTicket(null)}>
              Close
            </Button>
            {selectedTicket && (
              <Button
                color="primary"
                onPress={() =>
                  handleUpdateStatus(selectedTicket.id, selectedTicket.status)
                }
                isLoading={updateTicketMutation.isPending}
              >
                Save Response Only
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
