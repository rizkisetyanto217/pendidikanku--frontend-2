import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface SholatScheduleCardProps {
  location: string; // contoh: "DKI Jakarta"
  slug: string; // contoh: "masjid-alhidayah"
}

export default function SholatScheduleCard({
  location,
  slug,
}: SholatScheduleCardProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const getHijriDate = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/cal/hijr/?adj=-1&date=${today}`
    );
    const [day, hijri] = res.data.data.date;
    return `${day}, ${hijri}`;
  };

  const getNextPrayerTime = async () => {
    const base = "https://api.myquran.com/v2";
    const kota = 1301;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const todayRes = await axios.get(
      `${base}/sholat/jadwal/${kota}/${todayStr}`
    );
    const todayData = todayRes.data.data.jadwal;

    const times = {
      Subuh: todayData.subuh,
      Dzuhur: todayData.dzuhur,
      Ashar: todayData.ashar,
      Maghrib: todayData.maghrib,
      Isya: todayData.isya,
    };

    const nextPrayer = Object.entries(times).find(([_, time]) => {
      const [h, m] = time.split(":").map(Number);
      const prayerTime = new Date(now);
      prayerTime.setHours(h, m, 0, 0);
      return prayerTime > now;
    });

    if (nextPrayer) return nextPrayer;

    const besok = new Date(now);
    besok.setDate(besok.getDate() + 1);
    const besokStr = besok.toISOString().split("T")[0];
    const besokRes = await axios.get(
      `${base}/sholat/jadwal/${kota}/${besokStr}`
    );
    return ["Subuh", besokRes.data.data.jadwal.subuh];
  };

  const { data: hijriDate, isLoading: loadingHijri } = useQuery({
    queryKey: ["hijri-date"],
    queryFn: getHijriDate,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const { data: prayerData, isLoading: loadingPrayer } = useQuery({
    queryKey: ["prayer-time"],
    queryFn: getNextPrayerTime,
    staleTime: 1000 * 60 * 5,
  });

  const prayerName = prayerData?.[0];
  const prayerTime = prayerData?.[1];

  return (
    <Link to={`/masjid/${slug}/sholat`}>
      <div
        className="rounded-xl p-3 flex justify-between items-center w-full max-w-md shadow-md cursor-pointer hover:opacity-90 transition"
        style={{
          backgroundColor: theme.secondary,
          color: theme.white1,
          maxWidth:"100%"
        }}
      >
        {/* Waktu Sholat */}
        <div
          className="text-left pr-3 border-r"
          style={{ borderColor: `${theme.white1}80` }}
        >
          <p className="text-sm font-semibold">
            {loadingPrayer ? "..." : prayerName}
          </p>
          <p className="text-xl font-bold leading-tight">
            {loadingPrayer ? "--:--" : prayerTime}
          </p>
        </div>

        {/* Tanggal Hijriah & Lokasi */}
        <div className="flex-1 pl-3">
          <p className="text-sm font-semibold">
            {loadingHijri ? "Memuat tanggal..." : hijriDate}
          </p>
          <p className="text-xs">{location}</p>
        </div>
      </div>
    </Link>
  );
}
