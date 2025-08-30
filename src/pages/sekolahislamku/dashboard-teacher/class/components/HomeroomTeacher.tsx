import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
  Badge,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  ArrowLeft,
  Users,
  UserCheck,
  MapPin,
  UserPlus,
  Edit3,
  Trash2,
  GraduationCap,
  Clock,
  X,
  Save,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

type LocationState = {
  homeroom?: string;
  assistants?: string[];
  room?: string;
  studentsCount?: number;
};

type ModalType = "edit" | "addAssistant" | null;

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  palette: Palette;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, palette, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: `${palette.black1}60` }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-hidden"
        style={{
          background: palette.white1,
          border: `1px solid ${palette.black1}10`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${palette.primary}10, ${palette.primary}05)`,
            borderColor: `${palette.black1}10`,
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: palette.black1 }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: `${palette.black1}10`,
              color: palette.black1,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Form Input Component
const FormInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  palette: Palette;
  required?: boolean;
}> = ({ label, value, onChange, placeholder, palette, required }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium opacity-80">
      {label}
      {required && <span style={{ color: palette.error1 }}> *</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
      style={{
        background: palette.white2,
        border: `1px solid ${palette.black1}20`,
        color: palette.black1,
        // focusRingColor: palette.primary,
      }}
    />
  </div>
);

// Assistant Item Component
const AssistantItem: React.FC<{
  assistant: string;
  onRemove: () => void;
  palette: Palette;
}> = ({ assistant, onRemove, palette }) => (
  <div
    className="flex items-center justify-between p-3 rounded-lg border"
    style={{
      background: palette.white2,
      border: `1px solid ${palette.black1}10`,
    }}
  >
    <span className="font-medium">{assistant}</span>
    <button
      onClick={onRemove}
      className="p-1 rounded-full transition-all duration-200 hover:scale-105"
      style={{
        background: `${palette.error1}10`,
        color: palette.error1,
      }}
    >
      <X size={16} />
    </button>
  </div>
);

const HomeroomTeacher: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editData, setEditData] = useState({
    homeroom: state?.homeroom || "",
    room: state?.room || "",
    assistants: state?.assistants || [],
  });
  const [newAssistant, setNewAssistant] = useState("");

  const currentDate = new Date().toISOString();

  const handleDelete = async () => {
    const res = await Swal.fire({
      title: "Hapus Wali Kelas?",
      text: `Wali kelas "${state?.homeroom}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: palette.error1,
      cancelButtonColor: palette.silver2,
      background: palette.white1,
      color: palette.black1,
    });
    if (!res.isConfirmed) return;

    await Swal.fire({
      title: "Terhapus",
      text: "Data wali kelas berhasil dihapus.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });

    navigate(-1);
  };

  const handleSaveEdit = async () => {
    if (!editData.homeroom.trim()) {
      await Swal.fire({
        title: "Error",
        text: "Nama wali kelas tidak boleh kosong.",
        icon: "error",
        background: palette.white1,
        color: palette.black1,
      });
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await Swal.fire({
      title: "Berhasil",
      text: "Data wali kelas berhasil diperbarui.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });

    setModalType(null);
  };

  const handleAddAssistant = () => {
    if (!newAssistant.trim()) return;

    setEditData((prev) => ({
      ...prev,
      assistants: [...prev.assistants, newAssistant.trim()],
    }));
    setNewAssistant("");
  };

  const handleRemoveAssistant = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      assistants: prev.assistants.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAssistants = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await Swal.fire({
      title: "Berhasil",
      text: "Daftar guru pendamping berhasil diperbarui.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: palette.white1,
      color: palette.black1,
    });

    setModalType(null);
  };

  const openEditModal = () => {
    setEditData({
      homeroom: state?.homeroom || "",
      room: state?.room || "",
      assistants: state?.assistants || [],
    });
    setModalType("edit");
  };

  const openAssistantModal = () => {
    setEditData((prev) => ({
      ...prev,
      assistants: state?.assistants || [],
    }));
    setNewAssistant("");
    setModalType("addAssistant");
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar */}
      <ParentTopBar
        palette={palette}
        title="Wali Kelas"
        gregorianDate={currentDate}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-20 shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <section className="flex-1 space-y-8">
            {/* Header dengan tombol kembali */}
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
                <h1 className="text-2xl font-bold">Detail Wali Kelas</h1>
                <p className="text-sm opacity-70 mt-1">
                  Informasi lengkap wali kelas dan pendamping
                </p>
              </div>
            </div>

            {/* Card profil wali kelas */}
            <SectionCard palette={palette} className="overflow-hidden">
              {/* Header card dengan gradient */}
              <div
                className="px-6 py-4 border-b"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary}15, ${palette.primary}10)`,
                  borderColor: `${palette.black1}10`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${palette.primary}20` }}
                    >
                      <UserCheck size={24} style={{ color: palette.primary }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        Profil Wali Kelas
                      </h2>
                      <p className="text-sm opacity-60">
                        Informasi dasar wali kelas
                      </p>
                    </div>
                  </div>

                  {/* Action buttons - mobile friendly */}
                  <div className="flex gap-2">
                    <button
                      onClick={openAssistantModal}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: `${palette.primary}10`,
                        color: palette.primary,
                      }}
                      title="Kelola Pendamping"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      onClick={openEditModal}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: `${palette.primary}10`,
                        color: palette.primary,
                      }}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: `${palette.error1}10`,
                        color: palette.error1,
                      }}
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content card */}
              <div className="p-6 space-y-6">
                {/* Informasi utama dalam grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nama Wali Kelas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium opacity-60">
                      <GraduationCap size={12} />
                      NAMA WALI KELAS
                    </div>
                    <p className="text-xl font-bold">
                      {state?.homeroom || (
                        <span className="opacity-60 font-normal text-base">
                          Belum ada data
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Ruangan */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium opacity-60">
                      <MapPin size={12} />
                      RUANG KELAS
                    </div>
                    <p className="text-xl font-bold">
                      {state?.room || (
                        <span className="opacity-60 font-normal text-base">
                          Belum ditentukan
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Pendamping */}
                {state?.assistants?.length ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                      <Users size={14} />
                      Guru Pendamping
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {state.assistants.map((assistant, index) => (
                        <Badge
                          key={index}
                          palette={palette}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {assistant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                      <Users size={14} />
                      Guru Pendamping
                    </div>
                    <p className="text-sm opacity-60 italic">
                      Belum ada guru pendamping
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div
                  className="h-px"
                  style={{ background: `${palette.black1}10` }}
                />

                {/* Statistik */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{ background: `${palette.primary}05` }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Users size={24} style={{ color: palette.primary }} />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: palette.primary }}
                    >
                      {state?.studentsCount ?? 0}
                    </p>
                    <p className="text-xs opacity-70 mt-1">Total Siswa</p>
                  </div>

                  <div
                    className="p-4 rounded-lg text-center"
                    style={{ background: `${palette.primary}05` }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <UserCheck size={24} style={{ color: palette.primary }} />
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: palette.primary }}
                    >
                      {(state?.assistants?.length ?? 0) + 1}
                    </p>
                    <p className="text-xs opacity-70 mt-1">Total Pengajar</p>
                  </div>

                  <div
                    className="p-4 rounded-lg text-center"
                    style={{ background: `${palette.silver2}20` }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Clock size={24} style={{ color: palette.silver2 }} />
                    </div>
                    <p
                      className="text-lg font-bold"
                      style={{ color: palette.silver2 }}
                    >
                      Aktif
                    </p>
                    <p className="text-xs opacity-70 mt-1">Status</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Action buttons yang lebih prominent */}
            <SectionCard palette={palette} className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: palette.primary }}
                />
                Aksi Tersedia
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Btn
                  palette={palette}
                  onClick={openAssistantModal}
                  className="w-full py-3 font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} />
                  Kelola Pendamping
                </Btn>
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={openEditModal}
                  className="w-full py-3 font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Edit3 size={18} />
                  Edit Data
                </Btn>
                <Btn
                  palette={palette}
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full py-3 font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Hapus Wali Kelas
                </Btn>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>

      {/* Edit Modal */}
      <Modal
        isOpen={modalType === "edit"}
        onClose={() => setModalType(null)}
        title="Edit Wali Kelas"
        palette={palette}
      >
        <div className="space-y-4">
          <FormInput
            label="Nama Wali Kelas"
            value={editData.homeroom}
            onChange={(value) =>
              setEditData((prev) => ({ ...prev, homeroom: value }))
            }
            placeholder="Masukkan nama wali kelas"
            palette={palette}
            required
          />

          <FormInput
            label="Ruang Kelas"
            value={editData.room}
            onChange={(value) =>
              setEditData((prev) => ({ ...prev, room: value }))
            }
            placeholder="Contoh: Kelas 1A, Ruang 101"
            palette={palette}
          />

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalType(null)}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: `${palette.black1}10`,
                color: palette.black1,
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: palette.primary,
                color: palette.white1,
              }}
            >
              <Save size={18} />
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Assistant Modal */}
      <Modal
        isOpen={modalType === "addAssistant"}
        onClose={() => setModalType(null)}
        title="Kelola Guru Pendamping"
        palette={palette}
      >
        <div className="space-y-4">
          {/* Add new assistant */}
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-80">
              Tambah Guru Pendamping
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAssistant}
                onChange={(e) => setNewAssistant(e.target.value)}
                placeholder="Nama guru pendamping"
                className="flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2"
                style={{
                  background: palette.white2,
                  border: `1px solid ${palette.black1}20`,
                  color: palette.black1,
                }}
                onKeyPress={(e) => e.key === "Enter" && handleAddAssistant()}
              />
              <button
                onClick={handleAddAssistant}
                disabled={!newAssistant.trim()}
                className="px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: palette.primary,
                  color: palette.white1,
                }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Current assistants */}
          {editData.assistants.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-80">
                Guru Pendamping Saat Ini
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editData.assistants.map((assistant, index) => (
                  <AssistantItem
                    key={index}
                    assistant={assistant}
                    onRemove={() => handleRemoveAssistant(index)}
                    palette={palette}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalType(null)}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: `${palette.black1}10`,
                color: palette.black1,
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSaveAssistants}
              className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: palette.primary,
                color: palette.white1,
              }}
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomeroomTeacher;
