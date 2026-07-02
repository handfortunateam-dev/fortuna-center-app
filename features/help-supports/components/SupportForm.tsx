"use client";

import React, { useState } from "react";
import {
  Button,
  Select,
  SelectItem,
  Textarea,
  Input,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TICKET_CATEGORIES } from "../constant";
import { apiClient } from "@/lib/axios";

export function SupportForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    description: "",
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      const { data } = await apiClient.post("/tickets", ticketData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      router.push("/help-support");
    },
  });

  const handleCreateTicket = () => {
    if (newTicket.subject && newTicket.category && newTicket.description) {
      createTicketMutation.mutate(newTicket);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <h1 className="text-xl font-bold px-2">Create New Ticket</h1>
      </CardHeader>
      <CardBody>
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
            selectedKeys={newTicket.category ? [newTicket.category] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setNewTicket({ ...newTicket, category: selected });
            }}
          >
            {TICKET_CATEGORIES.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
          <Textarea
            label="Description"
            placeholder="Describe your issue in detail..."
            minRows={6}
            value={newTicket.description}
            onChange={(e) =>
              setNewTicket({ ...newTicket, description: e.target.value })
            }
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="flat" onPress={() => router.push("/help-support")}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={createTicketMutation.isPending}
              onPress={handleCreateTicket}
            >
              Submit Ticket
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
