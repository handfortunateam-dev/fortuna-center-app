"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import {
  Card,
  CardBody,
  CardHeader,
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Tooltip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// ─── Types ────────────────────────────────────────────────────────
interface LessonItem {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  className: string | null;
  classCode: string | null;
  order: number;
  publishedAt: string | null;
  materialCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassGroup {
  classId: string;
  className: string | null;
  classCode: string | null;
  teachers: { name: string; image: string | null }[];
  lessons: LessonItem[];
  totalMaterials: number;
}

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  materials: MaterialItem[];
}

interface MaterialItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  order: number;
}

// ─── Helpers ──────────────────────────────────────────────────────
const materialTypeConfig: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  video: { icon: "lucide:play-circle", color: "text-red-500", label: "Video" },
  pdf: { icon: "lucide:file-text", color: "text-red-600", label: "PDF" },
  ppt: {
    icon: "lucide:presentation",
    color: "text-orange-500",
    label: "Slides",
  },
  audio: { icon: "lucide:headphones", color: "text-purple-500", label: "Audio" },
  link: { icon: "lucide:link", color: "text-blue-500", label: "Link" },
  text: { icon: "lucide:align-left", color: "text-gray-500", label: "Teks" },
  file: { icon: "lucide:file-down", color: "text-gray-400", label: "File" },
};

function getMaterialConfig(type: string) {
  return materialTypeConfig[type] || materialTypeConfig.file;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Page Component ───────────────────────────────────────────────
export default function AdminLessonsPage() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();

  // 1) Fetch grouped data
  const { data: groupedRes, isLoading } = useQuery({
    queryKey: ["admin-lessons-grouped", search],
    queryFn: async () => {
      const params = new URLSearchParams({ view: "grouped" });
      if (search) params.set("q", search);
      const res = await apiClient.get<{ success: boolean; data: ClassGroup[] }>(
        `/lessons?${params.toString()}`,
      );
      return res.data;
    },
  });

  // 2) Fetch detail for selected lesson
  const { data: detailRes, isLoading: isDetailLoading } = useQuery({
    queryKey: ["admin-lesson-detail", selectedLessonId],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: LessonDetail;
      }>(`/lessons/${selectedLessonId}`);
      return res.data;
    },
    enabled: !!selectedLessonId,
  });

  // 3) Fetch classes list for dropdown filter
  const { data: classesRes } = useQuery({
    queryKey: ["admin-classes-lookup"],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: { id: string; name: string; code: string }[];
      }>("/classes");
      return res.data;
    },
  });

  const classGroups = groupedRes?.data || [];
  const classesLookup = classesRes?.data || [];
  const detail = detailRes?.data;

  // Client-side filter by class
  const filtered =
    filterClass === "all"
      ? classGroups
      : classGroups.filter((g) => g.classId === filterClass);

  // Stats
  const totalLessons = classGroups.reduce(
    (a, g) => a + g.lessons.length,
    0,
  );
  const totalMaterials = classGroups.reduce(
    (a, g) => a + g.totalMaterials,
    0,
  );
  const publishedLessons = classGroups.reduce(
    (a, g) => a + g.lessons.filter((l) => l.publishedAt).length,
    0,
  );

  const handleViewDetail = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    onDetailOpen();
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Heading as="h1" size="3xl" weight="bold">
          Lessons Overview
        </Heading>
        <Text color="muted" className="mt-1">
          Monitor all lesson materials and activities created by teachers in each class.
        </Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="lucide:layers"
          iconColor="text-blue-500"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          label="Total Kelas"
          value={classGroups.length}
        />
        <StatCard
          icon="lucide:book-open"
          iconColor="text-indigo-500"
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          label="Total Lessons"
          value={totalLessons}
        />
        <StatCard
          icon="lucide:file-stack"
          iconColor="text-amber-500"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          label="Total Materi"
          value={totalMaterials}
        />
        <StatCard
          icon="lucide:check-circle"
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          label="Published"
          value={publishedLessons}
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Cari lesson..."
          startContent={
            <Icon
              icon="lucide:search"
              className="text-default-400 text-lg"
            />
          }
          value={search}
          onValueChange={setSearch}
          className="flex-1"
          isClearable
          onClear={() => setSearch("")}
        />
        <Select
          label="Kelas"
          placeholder="Semua Kelas"
          className="w-full sm:max-w-[220px]"
          selectedKeys={[filterClass]}
          onChange={(e) => setFilterClass(e.target.value || "all")}
        >
          {[
            <SelectItem key="all" value="all">
              Semua Kelas
            </SelectItem>,
            ...classesLookup.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.code})
              </SelectItem>
            )),
          ]}
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="space-y-5">
          {filtered.map((group) => (
            <ClassGroupCard
              key={group.classId}
              group={group}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onOpenChange={onDetailOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-lg font-semibold">
                  {detail?.title || "Lesson Detail"}
                </span>
                {detail?.description && (
                  <span className="text-sm font-normal text-default-500">
                    {detail.description}
                  </span>
                )}
              </ModalHeader>
              <ModalBody className="pb-6">
                {isDetailLoading ? (
                  <div className="flex justify-center py-10">
                    <Spinner />
                  </div>
                ) : !detail?.materials || detail.materials.length === 0 ? (
                  <div className="text-center py-10 text-default-400">
                    <Icon
                      icon="lucide:inbox"
                      className="text-4xl mx-auto mb-2"
                    />
                    <p>Belum ada materi di lesson ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detail.materials.map((mat, idx) => {
                      const cfg = getMaterialConfig(mat.type);
                      return (
                        <div
                          key={mat.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-default-200 hover:border-primary-200 transition-colors"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-default-100 shrink-0">
                            <Icon
                              icon={cfg.icon}
                              className={`text-xl ${cfg.color}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">
                              {mat.title}
                            </p>
                            {mat.description && (
                              <p className="text-xs text-default-500 truncate">
                                {mat.description}
                              </p>
                            )}
                          </div>
                          <Chip size="sm" variant="flat" className="shrink-0">
                            {cfg.label}
                          </Chip>
                          {mat.content && mat.type === "link" && (
                            <Tooltip content="Buka link">
                              <a
                                href={mat.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-600"
                              >
                                <Icon icon="lucide:external-link" />
                              </a>
                            </Tooltip>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <Card className="border border-default-200 shadow-sm">
      <CardBody className="flex flex-row items-center gap-3 py-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon icon={icon} className={`text-xl ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-default-500 mt-0.5">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <div className="text-center py-20 rounded-xl border-2 border-dashed border-default-200 bg-default-50">
      <div className="bg-default-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon
          icon="lucide:book-open"
          className="text-3xl text-default-400"
        />
      </div>
      <h3 className="text-lg font-semibold text-default-700">
        {search ? "Tidak ditemukan" : "Belum Ada Lesson"}
      </h3>
      <p className="text-default-500 mt-1 text-sm">
        {search
          ? `Tidak ada lesson yang cocok dengan "${search}".`
          : "Guru belum membuat lesson untuk kelas manapun."}
      </p>
    </div>
  );
}

// ─── Class Group Card ─────────────────────────────────────────────
function ClassGroupCard({
  group,
  onViewDetail,
}: {
  group: ClassGroup;
  onViewDetail: (lessonId: string) => void;
}) {
  return (
    <Card className="border border-default-200 overflow-hidden shadow-sm">
      {/* Class Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Icon icon="lucide:school" className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                {group.className || "Unknown Class"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-white/20 text-white text-xs"
                >
                  {group.classCode}
                </Chip>
                <span className="text-white/70 text-xs">
                  {group.lessons.length} lesson ·{" "}
                  {group.totalMaterials} materi
                </span>
              </div>
            </div>
          </div>

          {/* Teachers */}
          {group.teachers.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <AvatarGroup max={3} size="sm">
                {group.teachers.map((t, i) => (
                  <Tooltip key={i} content={t.name}>
                    <Avatar
                      name={t.name}
                      src={t.image || undefined}
                      size="sm"
                      className="ring-2 ring-white/30"
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>
              <span className="text-white/70 text-xs ml-1">
                {group.teachers.map((t) => t.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Lessons List */}
      <CardBody className="p-0">
        {group.lessons.length === 0 ? (
          <div className="text-center py-8 text-default-400">
            <Icon icon="lucide:inbox" className="text-3xl mx-auto mb-2" />
            <p className="text-sm">Belum ada lesson.</p>
          </div>
        ) : (
          <Accordion variant="light" className="px-0">
            {group.lessons.map((lesson, idx) => (
              <AccordionItem
                key={lesson.id}
                aria-label={lesson.title}
                title={
                  <div className="flex items-center gap-3 w-full pr-2">
                    {/* Order Badge */}
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-semibold shrink-0">
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate">
                        {lesson.title}
                      </span>
                      {lesson.description && (
                        <span className="text-xs text-default-400 block truncate">
                          {lesson.description}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={lesson.publishedAt ? "success" : "default"}
                        startContent={
                          <Icon
                            icon={
                              lesson.publishedAt
                                ? "lucide:globe"
                                : "lucide:eye-off"
                            }
                            className="text-xs"
                          />
                        }
                      >
                        {lesson.publishedAt ? "Published" : "Draft"}
                      </Chip>
                      <Chip size="sm" variant="flat">
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:files" className="text-xs" />
                          {lesson.materialCount}
                        </span>
                      </Chip>
                    </div>
                  </div>
                }
              >
                {/* Expanded : lesson detail summary */}
                <div className="px-4 pb-4">
                  <div className="bg-default-50 dark:bg-default-100/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-default-400 text-xs uppercase tracking-wide">
                          Kelas
                        </p>
                        <p className="font-medium mt-0.5">
                          {lesson.className} ({lesson.classCode})
                        </p>
                      </div>
                      <div>
                        <p className="text-default-400 text-xs uppercase tracking-wide">
                          Jumlah Materi
                        </p>
                        <p className="font-medium mt-0.5">
                          {lesson.materialCount} item
                        </p>
                      </div>
                      <div>
                        <p className="text-default-400 text-xs uppercase tracking-wide">
                          Status
                        </p>
                        <p className="font-medium mt-0.5">
                          {lesson.publishedAt ? (
                            <span className="text-success-600">Published</span>
                          ) : (
                            <span className="text-default-400">Draft</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-default-400 text-xs uppercase tracking-wide">
                          Dibuat
                        </p>
                        <p className="font-medium mt-0.5">
                          {formatDate(lesson.createdAt)}
                        </p>
                      </div>
                    </div>

                    {lesson.materialCount > 0 && (
                      <>
                        <Divider className="my-3" />
                        <button
                          onClick={() => onViewDetail(lesson.id)}
                          className="flex items-center gap-2 text-primary text-sm font-medium hover:underline cursor-pointer"
                        >
                          <Icon icon="lucide:eye" className="text-base" />
                          Lihat {lesson.materialCount} materi
                        </button>
                      </>
                    )}

                    {lesson.materialCount === 0 && (
                      <>
                        <Divider className="my-3" />
                        <p className="text-default-400 text-xs flex items-center gap-1.5">
                          <Icon icon="lucide:info" className="text-sm" />
                          Guru belum menambahkan materi ke lesson ini.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardBody>
    </Card>
  );
}
