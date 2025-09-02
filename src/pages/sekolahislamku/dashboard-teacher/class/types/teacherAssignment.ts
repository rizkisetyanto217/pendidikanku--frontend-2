// Satu-satunya sumber kebenaran untuk data tugas kelas (dummy)

export type AssignmentStatus = "draft" | "terbit" | "selesai";
export type Attachment = { name: string; url?: string };
export type Assignment = {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO
  dueDate?: string; // ISO
  status: AssignmentStatus;
  totalSubmissions?: number;
  graded?: number;
  attachments?: Attachment[];
  author?: string;
};

const now = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const yst = new Date(now.getTime() - 864e5);

export const ASSIGNMENTS_BY_CLASS: Record<string, Assignment[]> = {
  "tpa-a": [
    {
      id: "a-001",
      title: "Latihan Tajwid: Idgham",
      description: "Kerjakan 10 soal tentang idgham bighunnah & bilaghunnah.",
      createdAt: iso(yst),
      dueDate: addDays(3),
      status: "terbit",
      totalSubmissions: 22,
      graded: 10,
      attachments: [{ name: "soal-idgham.pdf" }],
      author: "Ustadz Abdullah",
    },
    {
      id: "a-002",
      title: "Hafalan Surat An-Naba 1–10",
      description: "Upload rekaman bacaan ayat 1–10. Fokus makhraj & mad.",
      createdAt: iso(now),
      dueDate: addDays(5),
      status: "draft",
      totalSubmissions: 0,
      graded: 0,
      attachments: [],
      author: "Ustadzah Amina",
    },
  ],
  "tpa-b": [
    {
      id: "a-101",
      title: "Setoran Hafalan Juz 30 (Pekan Ini)",
      createdAt: iso(yst),
      dueDate: addDays(4),
      status: "terbit",
      totalSubmissions: 18,
      graded: 6,
      attachments: [{ name: "format-penilaian.xlsx" }],
      author: "Ustadz Salman",
    },
    {
      id: "a-102",
      title: "Pemahaman Tajwid Dasar",
      description: "Kuis mad thabi'i & ikhfa'.",
      createdAt: iso(now),
      dueDate: addDays(2),
      status: "terbit",
      totalSubmissions: 19,
      graded: 12,
      attachments: [],
      author: "Ustadzah Maryam",
    },
  ],
};

export async function fetchAssignmentsByClass(
  classId: string
): Promise<Assignment[]> {
  return Promise.resolve(ASSIGNMENTS_BY_CLASS[classId] ?? []);
}

export async function fetchAssignmentById(
  classId: string,
  assignmentId: string
): Promise<Assignment | undefined> {
  const list = ASSIGNMENTS_BY_CLASS[classId] ?? [];
  return Promise.resolve(list.find((a) => a.id === assignmentId));
}
