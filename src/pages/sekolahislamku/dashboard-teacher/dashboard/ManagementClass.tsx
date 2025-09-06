import React, { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  Btn,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// ⬇️ Sesuaikan path import sesuai struktur project
import { ArrowLeft, Users, BookOpen, Calendar } from "lucide-react";
import ParentTopBar from "../../components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";
import ModalEditManagementClass, {
  ClassInfo,
} from "./ModalEditManagementClass";
import AddStudent from "./AddStudent";
import Swal from "sweetalert2";

const ManagementClass = () => {
  const { className } = useParams();
  const location = useLocation() as {
    state?: { className?: string; students?: number; lastSubject?: string };
  };
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const info = location.state;
  const currentDate = new Date().toISOString();

  //   state modal edit
  // ✨ state tampilan lokal (tidak mendeklarasikan sumber data baru)
  const [overrides, setOverrides] = useState<ClassInfo | null>(null);
  const view = useMemo(() => {
    return {
      className:
        overrides?.className ?? info?.className ?? String(className ?? ""),
      students:
        typeof overrides?.students === "number"
          ? overrides?.students
          : typeof info?.students === "number"
            ? info?.students
            : undefined,
      lastSubject: overrides?.lastSubject ?? info?.lastSubject ?? undefined,
    };
  }, [overrides, info, className]);
  const [editOpen, setEditOpen] = useState(false);

  //   state add student
  const [openAdd, setOpenAdd] = useState(false);

  //   state delete
  const handleDeleteClass = async () => {
    const res = await Swal.fire({
      title: "Hapus kelas?",
      text: `Kelas “${view.className || className}” akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: palette.error1, // warnanya mengikuti tema
      cancelButtonColor: palette.silver2,
      background: palette.white1,
      color: palette.black1,
    });

    if (!res.isConfirmed) return;

    try {
      // (opsional) tampilkan loading
      await Swal.fire({
        title: "Menghapus…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        showConfirmButton: false,
        background: palette.white1,
      });

      // TODO: panggil API penghapusan di sini
      // await axios.delete(`/api/kelas/${idKelas}`);

      // sukses
      await Swal.fire({
        title: "Terhapus",
        text: "Kelas berhasil dihapus.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        background: palette.white1,
        color: palette.black1,
      });

      // misal balik ke halaman sebelumnya
      navigate(-1);
    } catch (e: any) {
      await Swal.fire({
        title: "Gagal menghapus",
        text: e?.message ?? "Terjadi kesalahan saat menghapus kelas.",
        icon: "error",
        confirmButtonText: "Tutup",
        background: palette.white1,
        color: palette.black1,
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Topbar */}
      <ParentTopBar
        palette={palette}
        title="Manajemen Kelas"
        gregorianDate={currentDate}
      />
      {/* Modal Edit */}
      <ModalEditManagementClass
        open={editOpen}
        onClose={() => setEditOpen(false)}
        palette={palette}
        title="Edit Kelas"
        defaultValue={{
          className: view.className,
          students: view.students,
          lastSubject: view.lastSubject,
        }}
        onSubmit={(val) => {
          // di sini bisa dihubungkan ke backend (PUT) bila perlu
          setOverrides(val);
        }}
      />

      <AddStudent
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        palette={palette}
        onSubmit={(val) => {
          console.log("Student added:", val);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-20 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <section className="flex-1 space-y-8 min-w-0 pb-2">
            {/* Header dengan tombol kembali dan judul */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: palette.white1,
                  border: `1px solid ${palette.black1}20`,
                  color: palette.black1,
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">
                  Kelas {info?.className ?? String(className)}
                </h1>
                <p
                  className="text-sm opacity-90 mt-1"
                  style={{ color: palette.black2 }}
                >
                  Kelola informasi dan data kelas
                </p>
              </div>
            </div>

            {/* Info kelas dalam card yang lebih menarik */}
            <SectionCard palette={palette} className="overflow-hidden">
              {/* Header card */}
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary2}15, ${palette.primary2}10)`,
                  borderColor: `${palette.black1}10`,
                }}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen size={20} />
                  Informasi Kelas
                </h2>
              </div>

              {/* Content card */}
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Nama Kelas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: palette.primary2,
                          color: palette.black2,
                        }}
                      />
                      NAMA KELAS
                    </div>
                    <p className="text-xl font-bold">
                      {info?.className ?? String(className)}
                    </p>
                  </div>

                  {/* Jumlah Siswa */}
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-2 text-xs font-medium opacity-80"
                      style={{ color: palette.black2 }}
                    >
                      <Users size={12} />
                      JUMLAH SISWA
                    </div>
                    <p
                      className="text-xl font-bold flex items-center gap-2"
                      style={{ color: palette.black2 }}
                    >
                      {typeof info?.students === "number" ? (
                        <>
                          {info?.students}
                          <span
                            className="text-sm font-normal opacity-80"
                            style={{ color: palette.black2 }}
                          >
                            siswa
                          </span>
                        </>
                      ) : (
                        <span className="text-base opacity-60">
                          Tidak ada data
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Pelajaran Terakhir */}
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-2 text-xs font-medium opacity-80"
                      style={{ color: palette.black2 }}
                    >
                      <Calendar size={12} />
                      PELAJARAN TERAKHIR
                    </div>
                    <p className="text-lg font-semibold">
                      {info?.lastSubject ?? (
                        <span className="opacity-60 font-normal">
                          Belum ada pelajaran
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="my-6 h-px "
                  style={{ background: `${palette.black1}10` }}
                />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 justify-end ">
                  <Btn
                    palette={palette}
                    variant="white1"
                    onClick={() => setOpenAdd(true)}
                    className="px-6 py-2 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Tambah Siswa
                  </Btn>
                  <Btn
                    variant="ghost"
                    palette={palette}
                    onClick={() => setEditOpen(true)}
                    className="px-6 py-2 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Edit Kelas
                  </Btn>
                  <Btn
                    variant="destructive"
                    palette={palette}
                    onClick={handleDeleteClass}
                    className="px-6 py-2 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Hapus Kelas
                  </Btn>
                </div>
              </div>
            </SectionCard>

            {/* Card tambahan untuk statistik atau aksi cepat */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Stats */}
              <SectionCard palette={palette} className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: palette.black2 }}
                  />
                  Statistik Singkat
                </h3>
                <div className="space-y-3">
                  <div
                    className="flex justify-between items-center py-2"
                    style={{ color: palette.black2 }}
                  >
                    <span className="text-sm opacity-90">Status Kelas</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${palette.primary2}20`,
                        color: palette.black2,
                      }}
                    >
                      Aktif
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span
                      className="text-sm opacity-90"
                      style={{ color: palette.black2 }}
                    >
                      Kehadiran Hari Ini
                    </span>
                    <span className="font-medium">-</span>
                  </div>
                  <div
                    className="flex justify-between items-center py-2"
                    style={{ color: palette.black2 }}
                  >
                    <span className="text-sm opacity-90">Tugas Pending</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </SectionCard>

              {/* Quick Actions */}
              <SectionCard palette={palette} className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: palette.primary2, color: palette.black2 }}
                  />
                  Aksi Cepat
                </h3>
                <div className="space-y-3">
                  <button
                    className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: `${palette.primary2}05`,
                      border: `1px solid ${palette.primary2}20`,
                    }}
                    onClick={() => alert("Lihat daftar siswa")}
                  >
                    <div className="font-medium">Lihat Daftar Siswa</div>
                    <div
                      className="text-xs opacity-90 mt-1"
                      style={{ color: palette.black2 }}
                    >
                      Kelola data siswa dalam kelas
                    </div>
                  </button>
                  <button
                    className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: `${palette.primary2}05`,
                      border: `1px solid ${palette.primary2}20`,
                    }}
                    onClick={() => alert("Buat jadwal")}
                  >
                    <div className="font-medium">Atur Jadwal Pelajaran</div>
                    <div
                      className="text-xs opacity-90 mt-1"
                      style={{ color: palette.black2 }}
                    >
                      Kelola jadwal mata pelajaran
                    </div>
                  </button>
                </div>
              </SectionCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ManagementClass;
