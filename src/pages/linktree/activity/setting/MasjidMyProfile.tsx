import React, { useEffect, useMemo, useState } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// === Bentuk payload sesuai API ===
type ProfilePayload = {
  donation_name?: string;
  full_name?: string;
  date_of_birth?: string | null; // kirim null jika kosong
  phone_number?: string;
  bio?: string;
  location?: string;
  occupation?: string;
};

export default function MasjidMyProfile() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();

  // auth (buat email & fallback nama)
  const { data: userData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () =>
      (await axios.get("/api/auth/me")).data.user as {
        user_name?: string;
        email?: string;
      },
    staleTime: 5 * 60 * 1000,
  });

  // profile
  const {
    data: profileData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user-profile", "me"],
    queryFn: async () =>
      (await axios.get("/api/u/users-profiles/me")).data.data as ProfilePayload,
    staleTime: 5 * 60 * 1000,
  });

  // state form
  const [form, setForm] = useState<ProfilePayload>({
    donation_name: "",
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    bio: "",
    location: "",
    occupation: "",
  });

  useEffect(() => {
    if (!profileData) return;
    setForm({
      donation_name: profileData.donation_name ?? "Hamba Allah",
      full_name: profileData.full_name ?? userData?.user_name ?? "",
      date_of_birth: profileData.date_of_birth ?? "",
      phone_number: profileData.phone_number ?? "",
      bio: profileData.bio ?? "",
      location: profileData.location ?? "",
      occupation: profileData.occupation ?? "",
    });
  }, [profileData, userData?.user_name]);

  const email = userData?.email ?? "-";

  const updateField = (k: keyof ProfilePayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const initial = useMemo<ProfilePayload>(
    () => ({
      donation_name: profileData?.donation_name ?? "Hamba Allah",
      full_name: profileData?.full_name ?? userData?.user_name ?? "",
      date_of_birth: profileData?.date_of_birth ?? "",
      phone_number: profileData?.phone_number ?? "",
      bio: profileData?.bio ?? "",
      location: profileData?.location ?? "",
      occupation: profileData?.occupation ?? "",
    }),
    [profileData, userData?.user_name]
  );

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initial),
    [form, initial]
  );

  const [saved, setSaved] = useState<null | "ok" | "err">(null);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (payload: ProfilePayload) => {
      const body: ProfilePayload = {
        donation_name: payload.donation_name?.trim(),
        full_name: payload.full_name?.trim(),
        // kosong -> null (sesuai contoh respons)
        date_of_birth: payload.date_of_birth ? payload.date_of_birth : null,
        phone_number: payload.phone_number?.trim(),
        bio: payload.bio,
        location: payload.location?.trim(),
        occupation: payload.occupation?.trim(),
      };
      const res = await axios.put("/api/u/users-profiles", body);
      return res.data;
    },
    onSuccess: async () => {
      setSaved("ok");
      await qc.invalidateQueries({ queryKey: ["user-profile", "me"] });
    },
    onError: () => setSaved("err"),
    onSettled: () => setTimeout(() => setSaved(null), 2000),
  });

  if (isLoading) {
    return (
      <div className="p-4" style={{ color: theme.silver2 }}>
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-4" style={{ color: theme.black1 }}>
      <h1
        className="text-lg font-semibold md:hidden"
        style={{ color: theme.black1 }}
      >
        Profil
      </h1>
      <p className="text-sm" style={{ color: theme.silver2 }}>
        Harap lengkapi profil pengguna untuk kemajuan aplikasi.
      </p>

      {saved === "ok" && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: theme.success1, color: theme.white1 }}
        >
          ✅ Profil berhasil disimpan.
        </div>
      )}
      {saved === "err" && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: theme.error1, color: theme.white1 }}
        >
          ❌ Gagal menyimpan profil. Coba lagi.
        </div>
      )}

      <div className="space-y-3">
        <FieldCard theme={theme} label="Nama">
          <Input
            theme={theme}
            value={form.full_name ?? ""}
            onChange={(e) => updateField("full_name", e.target.value)}
            placeholder="Nama lengkap"
          />
        </FieldCard>

        <FieldCard theme={theme} label="Nama Donatur">
          <Input
            theme={theme}
            value={form.donation_name ?? ""}
            onChange={(e) => updateField("donation_name", e.target.value)}
            placeholder="Hamba Allah"
          />
        </FieldCard>

        <FieldCard theme={theme} label="Email">
          <Input theme={theme} value={email} disabled />
        </FieldCard>

        <FieldCard theme={theme} label="Nomor Telp">
          <Input
            theme={theme}
            value={form.phone_number ?? ""}
            onChange={(e) => updateField("phone_number", e.target.value)}
            placeholder="08xxxxxxxxxx"
            inputMode="tel"
          />
        </FieldCard>

        <FieldCard theme={theme} label="Domisili (Kecamatan, Kota/Kabupaten)">
          <Input
            theme={theme}
            value={form.location ?? ""}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Kramat Jati, Jakarta Timur"
          />
        </FieldCard>

        <FieldCard theme={theme} label="Tanggal Lahir">
          <Input
            theme={theme}
            type="date"
            value={(form.date_of_birth ?? "") as string}
            onChange={(e) => updateField("date_of_birth", e.target.value)}
          />
        </FieldCard>

        <FieldCard theme={theme} label="Pekerjaan">
          <Input
            theme={theme}
            value={form.occupation ?? ""}
            onChange={(e) => updateField("occupation", e.target.value)}
            placeholder="Karyawan, Wiraswasta, ..."
          />
        </FieldCard>

        <FieldCard theme={theme} label="Bio">
          <Textarea
            theme={theme}
            value={form.bio ?? ""}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Ceritakan sedikit tentang Anda"
          />
        </FieldCard>
      </div>

      <Button
        className="w-full mt-4 hover:opacity-90 transition"
        style={{
          backgroundColor: isDirty ? theme.primary : theme.silver1,
          color: isDirty ? theme.white1 : theme.black2,
          cursor: isPending || !isDirty ? "not-allowed" : "pointer",
          opacity: isPending || !isDirty ? 0.8 : 1,
        }}
        disabled={isPending || !isDirty}
        onClick={() => saveProfile(form)}
      >
        {isPending ? "Menyimpan..." : "Simpan"}
      </Button>

      {isFetching && (
        <div className="text-xs" style={{ color: theme.silver2 }}>
          Menyinkronkan data...
        </div>
      )}
    </div>
  );
}

/* ==== UI kecil ==== */

function FieldCard({
  children,
  label,
  theme,
}: {
  children: React.ReactNode;
  label: string;
  theme: typeof colors.light;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{ backgroundColor: theme.white2, borderColor: theme.silver1 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div
            className="text-xs font-medium mb-1"
            style={{ color: theme.silver2 }}
          >
            {label}
          </div>
          {children}
        </div>
        <PencilIcon size={18} style={{ color: theme.silver4 }} />
      </div>
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    theme: typeof colors.light;
  }
) {
  const { theme, style, ...rest } = props;
  return (
    <input
      {...rest}
      className="w-full rounded-md px-3 py-2 text-sm outline-none"
      style={{
        backgroundColor: theme.white1,
        border: `1px solid ${theme.silver1}`,
        color: theme.black1,
        ...style,
      }}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    theme: typeof colors.light;
  }
) {
  const { theme, style, ...rest } = props;
  return (
    <textarea
      {...rest}
      rows={4}
      className="w-full rounded-md px-3 py-2 text-sm outline-none resize-y"
      style={{
        backgroundColor: theme.white1,
        border: `1px solid ${theme.silver1}`,
        color: theme.black1,
        ...style,
      }}
    />
  );
}
