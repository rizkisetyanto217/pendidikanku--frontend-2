import React, { useRef, useEffect, useState } from "react";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface AttendanceModalProps {
  show: boolean;
  onClose: () => void;
  sessionId: string;
  onSuccess?: () => void;
}

export default function AttendanceModal({
  show,
  onClose,
  sessionId,
  onSuccess,
}: AttendanceModalProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [attendanceChoice, setAttendanceChoice] = useState<string | null>(null);
  const [kajianInsight, setKajianInsight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  const handleAttendanceSubmit = async () => {
    if (!attendanceChoice) return;

    try {
      setIsSubmitting(true);

      let status = 0; // default tidak hadir
      if (attendanceChoice === "tatap_muka") status = 1;
      else if (attendanceChoice === "online") status = 2;

      await axios.post("/public/user-lecture-sessions-attendance", {
        user_lecture_sessions_attendance_lecture_session_id: sessionId,
        user_lecture_sessions_attendance_status: status,
        user_lecture_sessions_attendance_notes:
          status !== 0 ? kajianInsight : "",
      });

      alert("✅ Kehadiran berhasil dicatat.");
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mencatat kehadiran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg p-5"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          border: `1px solid ${theme.silver1}`,
        }}
      >
        <h2 className="text-base font-semibold mb-4">Catat Kehadiran</h2>

        {/* Pilihan Kehadiran */}
        <div className="space-y-2">
          {[
            { value: "tatap_muka", label: "Hadir Tatap Muka" },
            { value: "online", label: "Hadir Online" },
            { value: "tidak_hadir", label: "Tidak Hadir" },
          ].map((opt) => (
            <div
              key={opt.value}
              onClick={() => setAttendanceChoice(opt.value)}
              className="cursor-pointer flex items-center justify-between p-3 rounded hover:opacity-90 transition-all"
              style={{
                backgroundColor: theme.white2,
                border: `1px solid ${theme.silver1}`,
              }}
            >
              <span className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="attendance"
                  checked={attendanceChoice === opt.value}
                  readOnly
                />
                <span style={{ color: theme.black1 }}>{opt.label}</span>
              </span>
              <span style={{ color: theme.silver4 }}>›</span>
            </div>
          ))}
        </div>

        {/* Insight */}
        {attendanceChoice !== "tidak_hadir" && attendanceChoice !== null && (
          <div className="mt-4">
            <label className="block text-sm mb-1">
              Hal-hal yang didapatkan dari kajian:
            </label>
            <textarea
              value={kajianInsight}
              onChange={(e) => setKajianInsight(e.target.value)}
              className="w-full p-2 text-sm rounded"
              rows={3}
              placeholder="Tulis insight yang kamu dapatkan..."
              style={{
                backgroundColor: theme.white2,
                color: theme.black1,
                border: `1px solid ${theme.silver1}`,
              }}
            />
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="text-sm px-4 py-1 rounded"
            style={{ color: theme.silver2 }}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleAttendanceSubmit}
            className="text-sm px-4 py-1 rounded"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
              opacity: isSubmitting || !attendanceChoice ? 0.5 : 1,
            }}
            disabled={isSubmitting || !attendanceChoice}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
