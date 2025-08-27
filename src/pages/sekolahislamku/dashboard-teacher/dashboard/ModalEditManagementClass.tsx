// src/pages/sekolahislamku/class/ModalEditManagementClass.tsx
import React, { useEffect, useState } from "react";
import {
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import InputField from "@/components/common/main/InputField";

export type ClassInfo = {
  className?: string;
  students?: number;
  lastSubject?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  palette: Palette;
  title?: string;
  defaultValue?: ClassInfo;
  onSubmit: (val: ClassInfo) => Promise<void> | void;
};

const ModalEditManagementClass: React.FC<Props> = ({
  open,
  onClose,
  palette,
  title = "Edit Kelas",
  defaultValue,
  onSubmit,
}) => {
  const [className, setClassName] = useState(defaultValue?.className ?? "");
  const [students, setStudents] = useState<string>(
    typeof defaultValue?.students === "number"
      ? String(defaultValue?.students)
      : ""
  );
  const [lastSubject, setLastSubject] = useState(
    defaultValue?.lastSubject ?? ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClassName(defaultValue?.className ?? "");
    setStudents(
      typeof defaultValue?.students === "number"
        ? String(defaultValue?.students)
        : ""
    );
    setLastSubject(defaultValue?.lastSubject ?? "");
  }, [open, defaultValue]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        className: className?.trim(),
        students: students ? Number(students) : undefined,
        lastSubject: lastSubject?.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal
    >
      <div
        className="w-full max-w-2xl rounded-2xl"
        style={{
          background: palette.white2,
          color: palette.black1,
          border: `1px solid ${palette.silver1}`,
        }}
      >
        <form
          onSubmit={submit}
          className="flex flex-col max-h-[90vh] rounded-2xl"
        >
          {/* Header sticky */}
          <div
            className="sticky top-0 z-10 p-4 border-b rounded-t-2xl"
            style={{ background: palette.white2, borderColor: palette.silver1 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Btn
                type="button"
                variant="white1"
                palette={palette}
                onClick={onClose}
              >
                Tutup
              </Btn>
            </div>
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 [-webkit-overflow-scrolling:touch] pb-4">
            <div className="grid grid-cols-1 gap-4 ">
              <InputField
                label="Nama Kelas"
                name="className"
                value={className}
                placeholder="Misal: TPA A / Kelas 7A"
                onChange={(e) => setClassName(e.currentTarget.value)}
              />
              <InputField
                label="Jumlah Siswa"
                name="students"
                type="number"
                value={students}
                placeholder="Misal: 30"
                onChange={(e) => setStudents(e.currentTarget.value)}
              />
              <InputField
                label="Pelajaran Terakhir"
                name="lastSubject"
                value={lastSubject}
                placeholder="Misal: Tahfidz Juz 30"
                onChange={(e) => setLastSubject(e.currentTarget.value)}
              />
            </div>
          </div>

          {/* Footer sticky */}
          <div
            className="sticky bottom-0 z-10 p-4 border-t flex justify-end gap-2 pb-[env(safe-area-inset-bottom)] bg-clip-padding rounded-b-2xl "
            style={{ background: palette.white2, borderColor: palette.silver1 }}
          >
            <Btn
              type="button"
              variant="white1"
              palette={palette}
              onClick={onClose}
            >
              Batal
            </Btn>
            <Btn type="submit" palette={palette} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditManagementClass;
