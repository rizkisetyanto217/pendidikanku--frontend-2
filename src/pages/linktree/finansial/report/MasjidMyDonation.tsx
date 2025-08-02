import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useParams } from "react-router-dom";
import FormattedDate from "@/constants/formattedDate";

export default function MasjidMyDonation() {
  const { slug } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["my-donations", slug],
    queryFn: async () => {
      const res = await api.get(`/public/donations/by-user/${slug}`);
      console.log("📦 Data donasi by slug:", res.data);
      return res.data;
    },
    enabled: !!slug,
  });

  const format = (n: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(n || 0)}`;

  return (
    <>
      <PageHeaderUser title="Donasi Saya" onBackClick={() => history.back()} />
      <div className="p-4 space-y-4">
        {isLoading ? (
          <p style={{ color: theme.silver2 }}>Memuat donasi...</p>
        ) : !data?.length ? (
          <p style={{ color: theme.silver2 }}>Belum ada donasi.</p>
        ) : (
          data.map((item: any) => (
            <div
              key={item.donation_id}
              className="p-4 rounded border space-y-2"
              style={{ borderColor: theme.silver1 }}
            >
              <div className="flex justify-between items-center">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  {item.donation_name || "Anonim"}
                </h3>
                <FormattedDate value={item.created_at} className="text-xs" />
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>💰 Total Donasi</span>
                  <span>{format(item.donation_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Untuk Masjid</span>
                  <span>{format(item.donation_amount_masjid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dukungan Aplikasi</span>
                  <span>{format(item.donation_amount_masjidku)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="pl-2 text-gray-500">↳ ke Masjid</span>
                  <span>{format(item.donation_amount_masjidku_to_masjid)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="pl-2 text-gray-500">↳ ke Masjidku</span>
                  <span>{format(item.donation_amount_masjidku_to_app)}</span>
                </div>
              </div>

              {item.donation_message && (
                <p
                  className="text-sm italic mt-2"
                  style={{ color: theme.black2 }}
                >
                  “{item.donation_message}”
                </p>
              )}

              <div
                className="text-xs flex justify-between items-center pt-2 border-t"
                style={{ borderColor: theme.silver1 }}
              >
                <span style={{ color: theme.silver2 }}>
                  Status: {item.donation_status}
                </span>
                <span style={{ color: theme.primary }}>
                  ❤️ {item.like_count || 0}{" "}
                  {item.is_liked_by_user && "(Anda menyukai)"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
