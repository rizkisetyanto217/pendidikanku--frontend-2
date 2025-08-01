import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MasjidMyProfile() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { data: userData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      return res.data.user;
    },
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", "me"],
    queryFn: async () => {
      const res = await axios.get("/api/u/users-profiles/me");
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-4">Memuat profil...</div>;

  const formFields = [
    {
      label: "Nama",
      value: profileData?.full_name || userData?.user_name || "-",
    },
    { label: "Nama Donatur", value: profileData?.donor_name || "-" },
    { label: "Password", value: "********" },
    { label: "Email", value: userData?.email || "-" },
    { label: "Nomor Telp", value: profileData?.phone_number || "-" },
    {
      label: "Domisili (Kecamatan, Kota/Kabupaten)",
      value: profileData?.location || "-",
    },
    { label: "Tanggal Lahir", value: profileData?.date_of_birth || "-" },
    { label: "Jenis Kelamin", value: profileData?.gender || "-" },
    { label: "Pekerjaan", value: profileData?.occupation || "-" },
  ];

  return (
    <div className="px-4 pt-6 pb-24 space-y-4">
      <h1 className="text-lg font-semibold">Profil</h1>
      <p className="text-sm text-muted-foreground">
        Harap diisi profil pengguna untuk kemajuan aplikasi. Data pengguna insya
        Allah akan kami lindungi.
      </p>

      <div className="space-y-4">
        {formFields.map((field, idx) => (
          <div
            key={idx}
            className="rounded-xl border flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900"
            style={{ borderColor: theme.black1 }}
          >
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                {field.label}
              </div>
              <div className="text-sm font-medium text-foreground">
                {field.value}
              </div>
            </div>
            <PencilIcon size={18} className="text-muted-foreground" />
          </div>
        ))}
      </div>

      <Button className="w-full mt-4">Simpan</Button>
    </div>
  );
}
