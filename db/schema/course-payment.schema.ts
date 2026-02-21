import { pgTable, text, uuid, integer, date, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema";
import { students } from "./students.schema";
import { classes } from "./class.schema";
import { id, timestamps } from "./columns.helper";

// ── Payment Status Enum ──────────────────────────────────────────────────────
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid"]);

// ── Course Payment Table ─────────────────────────────────────────────────────
/**
 * Menyimpan transaksi pembayaran kursus bulanan per-siswa per-kelas.
 *
 * Setiap record merepresentasikan tagihan 1 bulan untuk 1 siswa di 1 kelas.
 * Admin/guru mencatat pembayaran secara manual (tidak ada payment gateway).
 *
 * Contoh:
 *   studentId = <uuid siswa>
 *   classId   = <uuid kelas "Children A – Tue/Thu 03.30pm">
 *   month     = 12
 *   year      = 2025
 *   amount    = 300000
 *   status    = "paid"
 *   paidAt    = "2025-12-03"
 */
export const coursePayments = pgTable("course_payments", {
    ...id,

    // Siswa yang membayar
    studentId: uuid("student_id")
        .references(() => students.id, { onDelete: "cascade" })
        .notNull(),

    // Kelas yang dibayar
    classId: uuid("class_id")
        .references(() => classes.id, { onDelete: "cascade" })
        .notNull(),

    // Periode tagihan (bulan 1-12, tahun 4-digit)
    month: integer("month").notNull(),   // 1 = Januari … 12 = Desember
    year: integer("year").notNull(),

    // Nominal tagihan (dalam Rupiah, tanpa desimal)
    amount: integer("amount").notNull().default(0),

    // Status pembayaran
    status: paymentStatusEnum("status").notNull().default("unpaid"),

    // Tanggal pembayaran (diisi saat status berubah ke "paid")
    paidAt: date("paid_at"),

    // Catatan tambahan (opsional — misal: "Bayar tunai via transfer BCA")
    notes: text("notes"),

    // Siapa yang mencatat pembayaran ini (admin/guru)
    recordedBy: uuid("recorded_by").references(() => users.id),

    ...timestamps,
}, (table) => ({
    // Mencegah duplikasi tagihan untuk periode yang sama (Siswa X, Kelas Y, Bulan Z, Tahun W)
    unqPaymentPeriod: uniqueIndex("unq_payment_period").on(table.studentId, table.classId, table.month, table.year),
}));

// ── Relations ────────────────────────────────────────────────────────────────
export const coursePaymentsRelations = relations(coursePayments, ({ one }) => ({
    student: one(students, {
        fields: [coursePayments.studentId],
        references: [students.id],
        relationName: "student_payments",
    }),
    class: one(classes, {
        fields: [coursePayments.classId],
        references: [classes.id],
    }),
    recorder: one(users, {
        fields: [coursePayments.recordedBy],
        references: [users.id],
        relationName: "recorded_payments",
    }),
}));

// ── Type Exports ─────────────────────────────────────────────────────────────
export type CoursePayment = typeof coursePayments.$inferSelect;
export type NewCoursePayment = typeof coursePayments.$inferInsert;
