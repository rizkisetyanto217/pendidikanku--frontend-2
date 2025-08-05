import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useEffect, useState } from "react";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import BottomNavbar from "@/components/common/public/ButtonNavbar";

export default function MasjidSholat({
  kotaId = 1301,
  location = "DKI Jakarta",
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams();

  // Hijriah
  const getHijriDate = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/cal/hijr/?adj=-1&date=${today}`
    );
    const [day, hijri] = res.data.data.date;
    return `${day}, ${hijri}`;
  };

  // Next prayer
  const getNextPrayerTime = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/${kotaId}/${todayStr}`
    );
    const jadwal = res.data.data.jadwal;

    const times = {
      Subuh: jadwal.subuh,
      Dzuhur: jadwal.dzuhur,
      Ashar: jadwal.ashar,
      Maghrib: jadwal.maghrib,
      Isya: jadwal.isya,
    };

    const now = new Date();
    const next = Object.entries(times).find(([_, t]) => {
      const [h, m] = t.split(":").map(Number);
      const time = new Date(now);
      time.setHours(h, m, 0, 0);
      return time > now;
    });

    return next || ["Subuh", jadwal.subuh];
  };

  // Jadwal hari ini
  const getTodaySchedule = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/${kotaId}/${todayStr}`
    );
    return res.data.data;
  };

  const { data: hijriDate, isLoading: loadingHijri } = useQuery({
    queryKey: ["hijri-date"],
    queryFn: getHijriDate,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const { data: prayerData, isLoading: loadingPrayer } = useQuery({
    queryKey: ["next-prayer", kotaId],
    queryFn: getNextPrayerTime,
    staleTime: 1000 * 60 * 5,
  });

  const { data: scheduleData, isLoading: loadingSchedule } = useQuery({
    queryKey: ["jadwal-hari-ini", kotaId],
    queryFn: getTodaySchedule,
    staleTime: 1000 * 60 * 30,
  });

  const prayerName = prayerData?.[0];
  const prayerTime = prayerData?.[1];
  const jadwal = scheduleData?.jadwal;

  const jadwalList = [
    { label: "Imsak", time: jadwal?.imsak },
    { label: "Subuh", time: jadwal?.subuh },
    { label: "Terbit", time: jadwal?.terbit },
    { label: "Dhuha", time: jadwal?.dhuha },
    { label: "Dzuhur", time: jadwal?.dzuhur },
    { label: "Ashar", time: jadwal?.ashar },
    { label: "Maghrib", time: jadwal?.maghrib },
    { label: "Isya", time: jadwal?.isya },
  ];

  return (
    <>
      <PageHeaderUser
        title="Profil DKM & Pengajar"
        onBackClick={() => navigate(`/masjid/${slug}`)}
      />
      <div
        className="w-full max-w-xl mx-auto space-y-6"
        style={{ color: theme.white1 }}
      >
        {/* Waktu Sholat Berikutnya */}
        <div
          className="rounded-xl p-4 flex justify-between items-center shadow-md"
          style={{ backgroundColor: theme.secondary }}
        >
          <div
            className="text-left pr-3 border-r"
            style={{ borderColor: `${theme.white1}80` }}
          >
            <p className="text-sm font-semibold">
              {loadingPrayer ? "..." : prayerName}
            </p>
            <p className="text-2xl font-bold leading-tight">
              {loadingPrayer ? "--:--" : prayerTime}
            </p>
          </div>
          <div className="flex-1 pl-3">
            <p className="text-sm font-semibold">
              {loadingHijri ? "..." : hijriDate}
            </p>
            <p className="text-xs">{location}</p>
          </div>
        </div>

        {/* Jadwal Lengkap Hari Ini */}
        <div
          className="rounded-xl p-4 shadow-md"
          style={{ backgroundColor: theme.secondary }}
        >
          <h3 className="text-lg font-semibold mb-3">Jadwal Sholat Hari Ini</h3>
          <table className="w-full text-sm">
            <tbody>
              {loadingSchedule ? (
                <tr>
                  <td colSpan={2} className="text-center py-4">
                    Memuat...
                  </td>
                </tr>
              ) : (
                jadwalList.map((item) => (
                  <tr key={item.label} className="border-t border-white/20">
                    <td className="py-1">{item.label}</td>
                    <td className="py-1 text-right font-semibold">
                      {item.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <p className="text-xs mt-3 opacity-80">
            Lokasi: {scheduleData?.lokasi || "-"} • Tanggal:{" "}
            {jadwal?.tanggal || "-"}
          </p>
        </div>
      </div>
      {/* Bottom Navigation */}
      <BottomNavbar />
    </>
  );
}
