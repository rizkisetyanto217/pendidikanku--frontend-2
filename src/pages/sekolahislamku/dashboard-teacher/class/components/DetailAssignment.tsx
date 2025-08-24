import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Plus } from "lucide-react";
import Swal from "sweetalert2"; // ⬅️ import sweetalert2
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  SectionCard,
  Btn,
  LinkBtn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import TeacherTopBar from "@/pages/sekolahislamku/components/home/TeacherTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";
import ModalAddAssignmentClass from "./ModalAddAssignmentClass";
import ModalEditAssignmentClass from "./ModalEditAssignmentClass";

type AssignmentState = {
  title?: string;
  dueDate?: string;
  submitted?: number;
  total?: number;
};

export default function DetailAssignment() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const assignment = (location.state as any)?.assignment as
    | AssignmentState
    | undefined;

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  // 🔹 Function Delete pakai SweetAlert2
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Tugas?",
      text: `Apakah Anda yakin ingin menghapus tugas "${assignment?.title ?? assignmentId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      // TODO: sambungkan ke API delete
      console.log("Tugas dihapus:", assignmentId);

      await Swal.fire("Terhapus!", "Tugas berhasil dihapus.", "success");

      // Redirect ke daftar tugas setelah hapus
      navigate("../assignments");
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar
        palette={palette}
        title="Detail Tugas"
        gregorianDate={new Date().toISOString()}
        dateFmt={(d) => fmtDate(d)}
      />

      {/* Modal Edit */}
      <ModalEditAssignmentClass
        open={showEdit}
        onClose={() => setShowEdit(false)}
        palette={palette}
        defaultValues={{
          title: assignment?.title,
          dueDate: assignment?.dueDate,
          total: assignment?.total,
          submitted: assignment?.submitted,
        }}
        onSubmit={(payload) => {
          console.log("Update assignment:", payload);
          setShowEdit(false);
        }}
      />

      {/* Modal Tambah */}
      <ModalAddAssignmentClass
        open={showAdd}
        onClose={() => setShowAdd(false)}
        palette={palette}
        onSubmit={(payload) => {
          console.log("Tugas baru:", payload);
          setShowAdd(false);
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <aside className="lg:w-64 mb-6 lg:mb-0 lg:sticky lg:top-16 shrink-0">
            <TeacherSidebarNav palette={palette} />
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                >
                  <ArrowLeft size={20} />
                </button>
                <span>Detail Tugas</span>
              </div>

              <Btn
                palette={palette}
                size="sm"
                variant="white1"
                onClick={() => setShowAdd(true)}
              >
                <Plus size={16} className="mr-1" /> Tambah Tugas
              </Btn>
            </div>

            <SectionCard palette={palette} className="p-4 space-y-4">
              <div className="font-bold text-xl">
                {assignment?.title ?? `Assignment ${assignmentId}`}
              </div>

              <div
                className="text-sm space-y-1"
                style={{ color: palette.black2 }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Batas: {fmtDate(assignment?.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    Terkumpul: {assignment?.submitted ?? 0}/
                    {assignment?.total ?? 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Btn palette={palette} size="sm">
                  Nilai
                </Btn>
                <Btn
                  palette={palette}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEdit(true)}
                >
                  Edit
                </Btn>
                <Btn
                  palette={palette}
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Hapus
                </Btn>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
