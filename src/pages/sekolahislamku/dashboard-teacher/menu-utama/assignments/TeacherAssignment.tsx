// src/pages/sekolahislamku/pages/teacher/TeacherAssignment.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  Calendar,
  FileText,
  Users,
  ChevronRight,
  ArrowLeft,
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  Filter,
  Search,
} from "lucide-react";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays > 0;
};

const TODAY_ISO = new Date().toISOString();

/* ===== Types ===== */
type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: "active" | "completed" | "overdue";
  class: string;
};

/* ===== Fake API ===== */
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Hafalan Surah Al-Fatihah",
    subject: "Tahsin & Tajwid",
    description:
      "Menghafal dan melafalkan Surah Al-Fatihah dengan tartil yang benar",
    dueDate: "2025-09-20",
    submitted: 23,
    total: 25,
    status: "active",
    class: "7A",
  },
  {
    id: "2",
    title: "Menulis Huruf Hijaiyah",
    subject: "Bahasa Arab",
    description: "Latihan menulis huruf hijaiyah dengan khat yang benar",
    dueDate: "2025-09-15",
    submitted: 25,
    total: 25,
    status: "completed",
    class: "7B",
  },
  {
    id: "3",
    title: "Praktik Wudhu",
    subject: "Fiqih",
    description: "Demonstrasi gerakan wudhu yang benar sesuai sunnah",
    dueDate: "2025-09-12",
    submitted: 18,
    total: 25,
    status: "overdue",
    class: "8A",
  },
  {
    id: "4",
    title: "Sejarah Peradaban Islam",
    subject: "Sejarah Islam",
    description: "Menulis esai tentang masa keemasan peradaban Islam",
    dueDate: "2025-09-25",
    submitted: 12,
    total: 28,
    status: "active",
    class: "9A",
  },
  {
    id: "5",
    title: "Adab Dalam Islam",
    subject: "Akhlak",
    description:
      "Presentasi tentang adab berinteraksi dengan orang tua dan guru",
    dueDate: "2025-09-18",
    submitted: 20,
    total: 22,
    status: "active",
    class: "8B",
  },
];

async function fetchAssignments(): Promise<Assignment[]> {
  return Promise.resolve(MOCK_ASSIGNMENTS);
}

function useAssignments() {
  return useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: fetchAssignments,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/* ===== Main Page ===== */
const TeacherAssignment: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "overdue"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assignments = [], isFetching } = useAssignments();

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesFilter = filter === "all" || assignment.status === filter;
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "overdue":
        return "Terlambat";
      default:
        return "Aktif";
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Tugas Guru"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriWithWeekday(TODAY_ISO)}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6 py-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="md:flex  hidden items-center gap-4">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft size={20} />
                </Btn>
                <div>
                  <h1 className="font-semibold text-xl">Kelola Tugas</h1>
                  <p className="text-sm mt-1" style={{ color: palette.black2 }}>
                    Pantau dan kelola tugas siswa
                  </p>
                </div>
              </div>
              <Btn
                palette={palette}
                onClick={() =>
                  navigate("/sekolahislamku/teacher/assignment/create")
                }
              >
                <Plus size={16} />
              </Btn>
            </div>

            {/* Filters & Search */}
            <SectionCard palette={palette}>
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: palette.black2 }}
                  />
                  <input
                    type="text"
                    placeholder="Cari tugas atau mata pelajaran..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: palette.silver1,
                      backgroundColor: palette.white1,
                      color: palette.black1,
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Tabs */}
                <div
                  className="flex gap-1 p-1 rounded-lg"
                  style={{ backgroundColor: palette.silver1 + "40" }}
                >
                  {[
                    { key: "all", label: "Semua", count: assignments.length },
                    {
                      key: "active",
                      label: "Aktif",
                      count: assignments.filter((a) => a.status === "active")
                        .length,
                    },
                    {
                      key: "completed",
                      label: "Selesai",
                      count: assignments.filter((a) => a.status === "completed")
                        .length,
                    },
                    {
                      key: "overdue",
                      label: "Terlambat",
                      count: assignments.filter((a) => a.status === "overdue")
                        .length,
                    },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        filter === key ? "text-white shadow-sm" : ""
                      }`}
                      style={{
                        backgroundColor:
                          filter === key ? palette.primary : "transparent",
                        color: filter === key ? "white" : palette.black2,
                      }}
                      onClick={() => setFilter(key as any)}
                    >
                      {label}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          filter === key ? "bg-white bg-opacity-30" : ""
                        }`}
                        style={{
                          backgroundColor:
                            filter === key
                              ? "rgba(255,255,255,0.3)"
                              : palette.silver1,
                          color: filter === key ? "white" : palette.black2,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Assignments List */}
            <div className="space-y-4">
              {isFetching && (
                <SectionCard palette={palette}>
                  <div className="p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: palette.silver1 }}
                      ></div>
                      <div className="flex-1 space-y-2">
                        <div
                          className="w-3/4 h-4 rounded"
                          style={{ backgroundColor: palette.silver1 }}
                        ></div>
                        <div
                          className="w-1/2 h-3 rounded"
                          style={{ backgroundColor: palette.silver1 }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {!isFetching && filteredAssignments.length === 0 && (
                <SectionCard palette={palette}>
                  <div className="p-12 text-center">
                    <FileText
                      size={48}
                      style={{ color: palette.silver1 }}
                      className="mx-auto mb-4"
                    />
                    <h3 className="font-medium text-lg mb-2">
                      Tidak ada tugas
                    </h3>
                    <p
                      className="text-sm mb-4"
                      style={{ color: palette.black2 }}
                    >
                      {searchTerm
                        ? "Tidak ditemukan tugas yang cocok dengan pencarian"
                        : "Belum ada tugas yang dibuat"}
                    </p>
                    {!searchTerm && (
                      <Btn
                        palette={palette}
                        onClick={() =>
                          navigate("/sekolahislamku/teacher/assignment/create")
                        }
                      >
                        <Plus size={16} />
                        Buat Tugas Pertama
                      </Btn>
                    )}
                  </div>
                </SectionCard>
              )}

              {!isFetching &&
                filteredAssignments.map((assignment) => {
                  const completionRate = Math.round(
                    (assignment.submitted / assignment.total) * 100
                  );

                  return (
                    <SectionCard
                      key={assignment.id}
                      palette={palette}
                      className="hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/sekolahislamku/teacher/assignment/${assignment.id}`
                        )
                      }
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: palette.primary + "20" }}
                          >
                            <BookOpen
                              size={20}
                              style={{ color: palette.primary }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                  {assignment.title}
                                </h3>
                                <div
                                  className="flex items-center gap-3 text-sm mb-2"
                                  style={{ color: palette.black2 }}
                                >
                                  <span className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    {assignment.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    Kelas {assignment.class}
                                  </span>
                                </div>
                                <p
                                  className="text-sm line-clamp-2 mb-3"
                                  style={{ color: palette.black2 }}
                                >
                                  {assignment.description}
                                </p>
                              </div>

                              <Badge
                                palette={palette}
                                variant={getStatusVariant(assignment.status)}
                              >
                                {getStatusText(assignment.status)}
                              </Badge>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div
                                className="flex items-center gap-4 text-sm"
                                style={{ color: palette.black2 }}
                              >
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {dateShort(assignment.dueDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  {assignment.submitted}/{assignment.total}{" "}
                                  selesai
                                </span>
                              </div>

                              {/* Progress */}
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {completionRate}%
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div
                                      className="h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        backgroundColor:
                                          completionRate === 100
                                            ? "#10B981"
                                            : palette.primary,
                                        width: `${completionRate}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <ChevronRight
                                  size={16}
                                  style={{ color: palette.black2 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherAssignment;
