"use client";

import { useEffect, useState } from "react";
import { Card, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { AnalyticsData } from "@/features/lms/students/analytics/types";
import { OverviewSection } from "@/features/lms/students/analytics/OverviewSection";
import { StudentDemographics } from "@/features/lms/students/analytics/StudentDemographics";
import { TeacherDemographics } from "@/features/lms/students/analytics/TeacherDemographics";
import { DirtyDataModal } from "@/features/lms/students/analytics/DirtyDataModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function AnalyticsUsersPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBar, setSelectedBar] = useState<{
    field: "education" | "occupation" | "ages";
    value: string;
  } | null>(null);

  const reloadAnalytics = () => {
    fetch("/api/analytics/users")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error);
  };

  const handleExportChart = (chartId: string, name: string) => {
    const el = document.getElementById(chartId);
    if (!el) return;

    const svg = el.querySelector("svg");
    if (!svg) return;

    const NS = "http://www.w3.org/2000/svg";
    const rect = svg.getBoundingClientRect();
    const PAD = 32;
    const TITLE_H = 60;
    const FOOTER_H = 30;
    const SCALE = 2;
    const W = rect.width + PAD * 2;
    const H = rect.height + TITLE_H + PAD + FOOTER_H;

    // Clone the chart SVG and fix dimensions
    const cloned = svg.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute("width", String(rect.width));
    cloned.setAttribute("height", String(rect.height));
    // Remove foreignObject nodes — CSS-class-based content breaks canvas rendering
    cloned.querySelectorAll("foreignObject").forEach((fo) => fo.remove());

    // Build wrapper SVG
    const wrap = document.createElementNS(NS, "svg");
    wrap.setAttribute("xmlns", NS);
    wrap.setAttribute("width", String(W));
    wrap.setAttribute("height", String(H));

    const mkEl = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };

    // White card background
    wrap.appendChild(mkEl("rect", { width: String(W), height: String(H), fill: "#ffffff", rx: "16" }));
    // Subtle card border
    wrap.appendChild(mkEl("rect", { x: "1", y: "1", width: String(W - 2), height: String(H - 2), fill: "none", stroke: "#E5E7EB", "stroke-width": "1.5", rx: "15" }));
    // Title
    const titleEl = mkEl("text", {
      x: String(PAD), y: String(PAD + 16),
      "font-family": "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      "font-size": "18", "font-weight": "700", fill: "#111827",
    });
    titleEl.textContent = name;
    wrap.appendChild(titleEl);
    // Thin divider below title
    wrap.appendChild(mkEl("line", { x1: String(PAD), y1: String(TITLE_H - 1), x2: String(W - PAD), y2: String(TITLE_H - 1), stroke: "#F3F4F6", "stroke-width": "1" }));
    // Chart group offset below title
    const g = document.createElementNS(NS, "g");
    g.setAttribute("transform", `translate(${PAD}, ${TITLE_H})`);
    g.appendChild(cloned);
    wrap.appendChild(g);
    // Footer: date left, brand right
    const dateStr = new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
    const footerY = String(H - 10);
    const footerFont = { "font-family": "system-ui, -apple-system, sans-serif", "font-size": "10", fill: "#9CA3AF" };
    const dateEl = mkEl("text", { x: String(PAD), y: footerY, ...footerFont });
    dateEl.textContent = dateStr;
    wrap.appendChild(dateEl);
    const brandEl = mkEl("text", { x: String(W - PAD), y: footerY, "text-anchor": "end", ...footerFont });
    brandEl.textContent = "Fortuna Center Analytics";
    wrap.appendChild(brandEl);

    // Render to high-DPI canvas (2×)
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const blob = new Blob([new XMLSerializer().serializeToString(wrap)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `${name.toLowerCase().replace(/\s+/g, "_")}_chart.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  useEffect(() => {
    fetch("/api/analytics/users")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-48 h-10 rounded-xl" />
          <Skeleton className="w-64 h-4 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[400px] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 !bg-transparent border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="text-danger text-6xl"
            />
            <p className="text-default-500 font-medium">
              Failed to load analytics data
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-12"
    >
      <OverviewSection
        data={data}
        onExportChart={handleExportChart}
        onPrint={() => window.print()}
      />

      <StudentDemographics
        data={data}
        onExportChart={handleExportChart}
        onBarClick={(field, value) => setSelectedBar({ field, value })}
      />

      <TeacherDemographics
        data={data}
        onExportChart={handleExportChart}
      />

      {selectedBar && (
        <DirtyDataModal
          isOpen={!!selectedBar}
          onClose={() => setSelectedBar(null)}
          field={selectedBar.field}
          value={selectedBar.value}
          onSaved={reloadAnalytics}
        />
      )}
    </motion.div>
  );
}
