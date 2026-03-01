"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TicketStatusChip } from "@/components/ticket/TicketStatusChip";
import { ITicket } from "../interface";
import { TICKET_STATUSES } from "../constant";

export function AdminSupport() {
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      const result = await res.json();
      return result.data as ITicket[];
    },
  });

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

      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Help & Support (Admin)</h1>
          <p className="text-default-500">
            Manage all student and staff support tickets
          </p>
        </div>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
              <Icon icon="lucide:ticket-x" className="w-12 h-12 mb-2" />
              <p>No tickets to review</p>
            </div>
          ) : (
            <Table aria-label="Tickets table">
              <TableHeader>
                <TableColumn>Ticket ID</TableColumn>
                <TableColumn>Subject</TableColumn>
                <TableColumn>Category</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Created</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">
                      {ticket.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {ticket.category.replace("_", " ")}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <TicketStatusChip status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => openTicketModal(ticket)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

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
    </div>
  );
}
