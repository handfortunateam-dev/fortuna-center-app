"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TicketStatusChip } from "@/components/ticket/TicketStatusChip";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = [
  { key: "bug", label: "Bug" },
  { key: "feature_request", label: "Feature Request" },
  { key: "billing", label: "Billing" },
  { key: "other", label: "Other" },
];

export default function StudentHelpSupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
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

  const handleCreateTicket = () => {
    if (newTicket.subject && newTicket.category && newTicket.description) {
      createTicketMutation.mutate(newTicket);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-default-500">Manage your support tickets</p>
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
              <Button
                variant="light"
                color="primary"
                onPress={() => setIsModalOpen(true)}
              >
                Create your first ticket
              </Button>
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

      {/* View Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
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
                {selectedTicket.adminResponse && (
                  <div>
                    <p className="text-sm text-default-500">Admin Response</p>
                    <p className="text-default-700 bg-default-100 p-3 rounded-md">
                      {selectedTicket.adminResponse}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-default-500">Created</p>
                  <p>{format(new Date(selectedTicket.createdAt), "PPpp")}</p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setSelectedTicket(null)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
