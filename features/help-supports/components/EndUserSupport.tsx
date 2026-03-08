"use client";

import React, { useState } from "react";
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { format } from "date-fns";
import { TicketStatusChip } from "@/components/ticket/TicketStatusChip";
import { ITicket } from "../interface";
import { ListGrid, createColumns } from "@/components/table";
import { Icon } from "@iconify/react";

export function EndUserSupport() {
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

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
    {
      key: "actions",
      label: "Actions",
      align: "center",
      value: (ticket) => (
        <Button
          size="sm"
          variant="light"
          onPress={() => setSelectedTicket(ticket)}
        >
          View
        </Button>
      ),
    },
  ]);

  return (
    <>
      <ListGrid<ITicket>
        title="Help & Support"
        description="Manage your support tickets"
        resourcePath="/tickets"
        columns={columns}
        basePath="/help-support"
        enableSearch={true}
        searchPlaceholder="Search tickets..."
        enableCreate={true}
        enableShow={false}
        enableEdit={false}
        enableDelete={false}
        actionButtons={{
          custom: [
            {
              key: "view",
              label: "",
              icon: <Icon icon="lucide:eye" />,
              onClick(id, item) {
                setSelectedTicket(item as never);
              },
            },
          ],
        }}
        onRowClick={(item) => setSelectedTicket(item)}
      />

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
                  <p className="text-default-700">
                    {selectedTicket.description}
                  </p>
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
    </>
  );
}
