import React, { useEffect, useState } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import {
  Btn,
  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* ================= Types ================ */
type Props = {
  open: boolean;
  palette: Palette;
  subjects: string[];
  masjidId: string; // ⬅️ WAJIB: untuk POST
  onClose: () => void;
  onCreated?: (created: any) => void; // opsional callback setelah tambah
  onDeleted?: (deletedId: string) => void; // opsional callback setelah hapus
};

type UserItem = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type ApiUsersSearchResponse = {
  code: number;
  status: string;
  message: string;
  data: {
    total: number;
    users: Array<{
      id: string;
      user_name: string;
      email?: string | null;
      phone?: string | null;
    }>;
  };
};

/* ================= Component ================ */
export default function AddTeacher({
  open,
  palette,
  subjects,
  masjidId,
  onClose,
  onCreated,
  onDeleted,
}: Props) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    nip: "",
    name: "",
    gender: "", // "L" | "P"
    phone: "",
    email: "",
    subject: "",
    status: "aktif" as "aktif" | "nonaktif",
  });

  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  // reset isi ketika modal ditutup
  useEffect(() => {
    if (!open) {
      setSearchQ("");
      setDebouncedQ("");
      setSelectedUserId(null);
      setForm((f) => ({
        ...f,
        nip: "",
        name: "",
        phone: "",
        email: "",
        subject: "",
        gender: "",
        status: "aktif",
      }));
    }
  }, [open]);

  /* ===== Search Users (min 3 karakter) ===== */
  const enabledSearch = open && debouncedQ.length >= 3;
  const userSearchQ = useQuery({
    queryKey: ["search-users", debouncedQ],
    enabled: enabledSearch,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await axios.get<ApiUsersSearchResponse>(
        "/api/a/users/search",
        {
          params: { q: debouncedQ, limit: 10 },
        }
      );
      const users = res.data?.data?.users ?? [];
      const items: UserItem[] = users.map((u) => ({
        id: u.id,
        name: u.user_name || "Tanpa Nama",
        email: u.email ?? null,
        phone: u.phone ?? null,
      }));
      return items;
    },
  });

  const handleSelectUser = (u: UserItem) => {
    setSelectedUserId(u.id);
    setForm((f) => ({
      ...f,
      name: u.name ?? f.name,
      email: u.email ?? f.email,
      phone: u.phone ?? f.phone,
    }));
  };
  const clearSelected = () => setSelectedUserId(null);

  /* ===== Mutations ===== */
  const addTeacher = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) throw new Error("Pilih user terlebih dahulu");
      const payload = {
        masjid_teachers_masjid_id: masjidId,
        masjid_teachers_user_id: selectedUserId,
      };
      const res = await axios.post("/api/a/masjid-teachers", payload);
      return res.data;
    },
    onSuccess: (data) => {
      // invalidasi list guru per masjid
      qc.invalidateQueries({ queryKey: ["masjid-teachers", masjidId] });
      onCreated?.(data);
      onClose();
    },
  });

  // komponen kecil untuk hapus guru tertentu (pakai di tempat lain juga bisa)
  const removeTeacher = useMutation({
    mutationFn: async (masjidTeacherId: string) => {
      await axios.delete(`/api/a/masjid-teachers/${masjidTeacherId}`);
      return masjidTeacherId;
    },
    onSuccess: (deletedId) => {
      qc.invalidateQueries({ queryKey: ["masjid-teachers", masjidId] });
      onDeleted?.(deletedId);
    },
  });

  if (!open) return null;

  const canSave = !!selectedUserId && !!masjidId && !addTeacher.isPending;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <SectionCard
        palette={palette}
        className="w-full max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: palette.white3, color: palette.quaternary }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <div
                className="font-semibold"
                style={{ color: palette.quaternary }}
              >
                Tambah Guru
              </div>
              <div className="text-xs" style={{ color: palette.secondary }}>
                Cari user terdaftar (min 3 karakter) lalu pilih.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            aria-label="Tutup"
            style={{ color: palette.secondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          {/* Pencarian user */}
          <div className="space-y-2">
            <label className="text-xs" style={{ color: palette.secondary }}>
              Cari User (min 3 karakter)
            </label>
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Contoh: rizki"
              className="w-full rounded-xl px-3 py-2 outline-none border"
              style={{
                borderColor: palette.white3,
                background: palette.white1,
                color: palette.quaternary,
              }}
            />
            {searchQ.trim().length > 0 && searchQ.trim().length < 3 && (
              <div className="text-xs" style={{ color: palette.secondary }}>
                Ketik minimal 3 karakter untuk mulai mencari.
              </div>
            )}

            {/* Hasil pencarian */}
            {enabledSearch && (
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: palette.white3,
                  background: palette.white1,
                }}
              >
                {userSearchQ.isLoading ? (
                  <div
                    className="px-3 py-2 text-sm"
                    style={{ color: palette.secondary }}
                  >
                    Mencari…
                  </div>
                ) : (userSearchQ.data?.length ?? 0) === 0 ? (
                  <div
                    className="px-3 py-2 text-sm"
                    style={{ color: palette.secondary }}
                  >
                    Tidak ada hasil.
                  </div>
                ) : (
                  <ul className="max-h-56 overflow-auto">
                    {userSearchQ.data!.map((u) => (
                      <li
                        key={u.id}
                        className="px-3 py-2 cursor-pointer hover:opacity-80 flex items-center justify-between"
                        onClick={() => handleSelectUser(u)}
                        style={{ color: palette.quaternary }}
                      >
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">
                            {u.name}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: palette.secondary }}
                          >
                            {u.email || "-"} · {u.phone || "-"}
                          </div>
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: palette.secondary }}
                        >
                          Pilih
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Badge user terpilih */}
            {selectedUserId && (
              <div
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm border"
                style={{
                  borderColor: palette.white3,
                  background: palette.white1,
                  color: palette.quaternary,
                }}
              >
                <span>
                  Terpilih: <b>{form.name}</b>
                </span>
                <button
                  className="text-xs underline"
                  style={{ color: palette.secondary }}
                  onClick={clearSelected}
                >
                  ganti/hapus
                </button>
              </div>
            )}
          </div>

          {/* (Opsional) field tambahan – tidak dipakai POST saat ini, tapi tetap ditampilkan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
              label="NIP"
              value={form.nip}
              onChange={(v) => setForm({ ...form, nip: v })}
              palette={palette}
            />
            <Field
              label="Mapel Utama"
              type="select"
              options={[
                { label: "Pilih Mapel", value: "" },
                ...subjects.map((s) => ({ label: s, value: s })),
              ]}
              value={form.subject}
              onChange={(v) => setForm({ ...form, subject: v })}
              palette={palette}
            />
          </div>

          {/* Error state */}
          {(addTeacher.isError || removeTeacher.isError) && (
            <div className="text-xs" style={{ color: palette.error1 }}>
              {
                // @ts-ignore
                (addTeacher.error?.response?.data?.message as string) ||
                  // @ts-ignore
                  (removeTeacher.error?.response?.data?.message as string) ||
                  "Terjadi kesalahan."
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-end gap-2 border-t"
          style={{ borderColor: palette.white3, background: palette.white1 }}
        >
          <Btn palette={palette} size="sm" variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn
            palette={palette}
            size="sm"
            disabled={!canSave}
            onClick={() => addTeacher.mutate()}
          >
            {addTeacher.isPending ? "Menyimpan..." : "Simpan"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============= Field helper ============= */
function Field({
  label,
  value,
  onChange,
  palette,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
  type?: "text" | "select" | "email" | "tel";
  options?: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs" style={{ color: palette.secondary }}>
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2 outline-none border bg-transparent"
          style={{
            borderColor: palette.white3,
            background: palette.white1,
            color: palette.quaternary,
          }}
        >
          {(options ?? []).map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          className="w-full rounded-xl px-3 py-2 outline-none border"
          style={{
            borderColor: palette.white3,
            background: palette.white1,
            color: palette.quaternary,
          }}
        />
      )}
    </div>
  );
}

/* ================= Optional: tombol hapus terpisah =================
   Pakai di daftar guru: <RemoveMasjidTeacherButton id={row.id} masjidId={masjidId} />
*/
export function RemoveMasjidTeacherButton({
  id,
  masjidId,
  palette,
  onDeleted,
}: {
  id: string; // masjid_teachers_id
  masjidId: string;
  palette: Palette;
  onDeleted?: (deletedId: string) => void;
}) {
  const qc = useQueryClient();
  const removeTeacher = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/a/masjid-teachers/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["masjid-teachers", masjidId] });
      onDeleted?.(id);
    },
  });

  return (
    <button
      className="px-2 py-1 rounded-lg border flex items-center gap-1 text-xs"
      onClick={() => removeTeacher.mutate()}
      disabled={removeTeacher.isPending}
      style={{ borderColor: palette.white3, color: palette.quaternary }}
      title="Hapus dari daftar guru"
    >
      <Trash2 size={14} /> {removeTeacher.isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
