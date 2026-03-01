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
  Select,
  SelectItem,
  Textarea,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea as TextareaInput,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TicketStatusChip } from "@/components/ticket/TicketStatusChip";

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const categoryOptions = [
  { key: "bug", label: "Bug" },
  { key: "feature_request", label: "Feature Request" },
  { key: "billing", label: "Billing" },
  { key: "other", label: "Other" },
];

const statusOptions = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export default function AdminHelpSupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      const result = await res.json();
      return result.data as Ticket[];
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setIsModalOpen(false);
      setNewTicket({ subject: "", category: "", description: "" });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: { id: string; status?: string; adminResponse?: string }) => {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminResponse }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setSelectedTicket(null);
      setAdminResponse("");
    },
  });

  const handleCreateTicket = () => {
    if (newTicket.subject && newTicket.category && newTicket.description) {
      createTicketMutation.mutate(newTicket);
    }
  };

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateTicketMutation.mutate({ id: ticketId, status, adminResponse });
    setAdminResponse("");
  };

  const handleAddResponse = (ticketId: string) => {
    updateTicketMutation.mutate({ id: ticketId, adminResponse });
    setAdminResponse("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-default-500">Manage all support tickets</p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" />}
          onPress={() => setIsModalOpen(true)}
        >
          Create New Ticket
        </Button>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
              <Icon icon="lucide:ticket-x" className="w-12 h-12 mb-2" />
              <p>No tickets yet</p>
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
                        variant="light"
                        onPress={() => setSelectedTicket(ticket)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Create New Ticket
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4 py-2">
              <Input
                label="Subject"
                placeholder="Enter ticket subject"
                value={newTicket.subject}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, subject: e.target.value })
                }
              />
              <Select
                label="Category"
                placeholder="Select a category"
                selectedKeys={[newTicket.category]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNewTicket({ ...newTicket, category: selected });
                }}
              >
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
              <Textarea
                label="Description"
                placeholder="Describe your issue in detail..."
                minRows={4}
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={createTicketMutation.isPending}
              onPress={handleCreateTicket}
            >
              Submit Ticket
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View/Edit Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
          setAdminResponse("");
        }}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>Ticket Details</span>
              {selectedTicket && (
                <TicketStatusChip status={selectedTicket.status} />
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedTicket && (
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <p className="text-sm text-default-500">Ticket ID</p>
                  <p className="font-mono text-xs">{selectedTicket.id}</p>
                </div>
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
                  <p className="text-default-700">{selectedTicket.description}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Created</p>
                  <p>{format(new Date(selectedTicket.createdAt), "PPpp")}</p>
                </div>
                
                <Divider />
                
                {/* Admin Response Section */}
                <div>
                  <p className="text-sm font-medium mb-2">Admin Response</p>
                  {selectedTicket.adminResponse ? (
                    <div className="bg-success-50 p-3 rounded-md mb-3">
                      <p className="text-success-700">{selectedTicket.adminResponse}</p>
                      {selectedTicket.resolvedAt && (
                        <p className="text-xs text-success-600 mt-1">
                          Resolved at: {format(new Date(selectedTicket.resolvedAt), "PPpp")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-default-400 text-sm mb-2">No response yet</p>
                  )}
                  <TextareaInput
                    placeholder="Add a response..."
                    minRows={2}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                  <Button
                    size="sm"
                    color="primary"
                    className="mt-2"
                    isLoading={updateTicketMutation.isPending}
                    onPress={() => handleAddResponse(selectedTicket.id)}
                    isDisabled={!adminResponse.trim()}
                  >
                    Add Response
                  </Button>
                </div>

                <Divider />

                {/* Status Update */}
                <div>
                  <p className="text-sm font-medium mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
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
            <Button variant="flat" onPress={() => {
              setSelectedTicket(null);
              setAdminResponse("");
            }}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
