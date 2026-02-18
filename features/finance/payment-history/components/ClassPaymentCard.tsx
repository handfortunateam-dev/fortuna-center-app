"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { ClassSummary, StudentPaymentInfo } from "../types";

interface ClassPaymentCardProps {
  classItem: ClassSummary;
  onPay: (student: StudentPaymentInfo, classItem: ClassSummary) => void;
}

export function ClassPaymentCard({ classItem, onPay }: ClassPaymentCardProps) {
  return (
    <Card className="border border-divider shadow-sm">
      <CardHeader className="bg-default-50 px-6 py-4 border-b border-divider flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-default-900">
            {classItem.name}
          </h3>
          <p className="text-xs text-default-500 uppercase tracking-wider font-semibold">
            {classItem.code} • {classItem.students.length} Students
          </p>
        </div>
        <div className="flex gap-2">
          <Chip size="sm" variant="flat" color="primary">
            {classItem.students.filter((s) => s.payment?.status === "paid").length}{" "}
            Paid
          </Chip>
          <Chip size="sm" variant="flat" color="danger">
            {
              classItem.students.filter(
                (s) => !s.payment || s.payment.status === "unpaid"
              ).length
            }{" "}
            Unpaid
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {classItem.students.length === 0 ? (
          <div className="p-6 text-center text-default-400 text-sm">
            No students enrolled in this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-default-500 uppercase bg-default-50/50 border-b border-divider">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student Name</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Paid Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {classItem.students.map((student) => {
                  const isPaid = student.payment?.status === "paid";
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-default-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-default-900">
                        {student.name}{" "}
                        <span className="text-default-400 font-normal">
                          ({student.studentId})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-default-500 text-sm">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-default-500 text-sm">
                        {student.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Chip
                          color={isPaid ? "success" : "danger"}
                          variant="flat"
                          size="sm"
                          startContent={
                            <Icon
                              icon={
                                isPaid
                                  ? "lucide:check-circle-2"
                                  : "lucide:x-circle"
                              }
                              className="w-3 h-3 ml-1"
                            />
                          }
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 text-default-500">
                        {student.payment?.paidAt
                          ? new Date(student.payment.paidAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isPaid ? (
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            startContent={
                              <Icon icon="solar:card-transfer-linear" />
                            }
                            onPress={() => onPay(student, classItem)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="light"
                            isDisabled
                            className="text-default-400"
                          >
                            Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
