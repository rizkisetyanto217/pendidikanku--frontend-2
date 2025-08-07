import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import BottomNavbar from "@/components/common/public/ButtonNavbar";

export default function MasjidSholat({
  kotaId = 1301,
  location = "DKI Jakarta",
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams();

  const [now, setNow] = useState(new Date());
  const [nextPrayerData, setNextPrayerData] = useState<{
    name: string;
    time: Date;
  } | null>(null);
  const [showingCurrentPrayer, setShowingCurrentPrayer] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================
  // ⏱️ Hitung Mundur Waktu Sholat
  // ==========================
  const getCountdown = () => {
    if (!nextPrayerData) return null;

    const target = showingCurrentPrayer
      ? new Date(nextPrayerData.time.getTime() + 15 * 60 * 1000)
      : nextPrayerData.time;

    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "00:00";

    const totalMinutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // ==========================
  // 📅 Ambil Tanggal Hijriyah
  // ==========================
  const getHijriDate = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/cal/hijr/?adj=-1&date=${today}`
    );
    const [day, hijri] = res.data.data.date;
    return `${day}, ${hijri}`;
  };

  // ==========================
  // 🕌 Ambil Jadwal Sholat Hari Ini
  // ==========================
  const getTodaySchedule = async () => {
    const today = new Date();
    const todayFixed = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayStr = todayFixed.toISOString().split("T")[0];

    const res = await axios.get(
      `https://api.myquran.com/v2/sholat/jadwal/${kotaId}/${todayStr}`
    );

    return res.data.data;
  };

  // ==========================
  // 🔁 Queries
  // ==========================
  const { data: hijriDate, isLoading: loadingHijri } = useQuery({
    queryKey: ["hijri-date"],
    queryFn: getHijriDate,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const {
    data: scheduleData,
    isLoading: loadingSchedule,
    error: errorSchedule,
  } = useQuery({
    queryKey: ["jadwal-hari-ini", kotaId],
    queryFn: getTodaySchedule,
    staleTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    if (!scheduleData?.jadwal) return;

    const today = new Date();
    const todayFixed = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const toDate = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date(todayFixed);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const scheduleToday = [
      { name: "Subuh", time: toDate(scheduleData.jadwal.subuh) },
      { name: "Dzuhur", time: toDate(scheduleData.jadwal.dzuhur) },
      { name: "Ashar", time: toDate(scheduleData.jadwal.ashar) },
      { name: "Maghrib", time: toDate(scheduleData.jadwal.maghrib) },
      { name: "Isya", time: toDate(scheduleData.jadwal.isya) },
    ];

    const updatedPrayer = scheduleToday.find((item) => {
      const start = item.time;
      const end = new Date(start.getTime() + 15 * 60 * 1000);

      if (now >= start && now < end) {
        setShowingCurrentPrayer(true);
        return true;
      }

      if (now < start) {
        setShowingCurrentPrayer(false);
        return true;
      }

      return false;
    });

    if (updatedPrayer) {
      setNextPrayerData(updatedPrayer);
    } else {
      setNextPrayerData(null);
    }
  }, [now, scheduleData]);

  useEffect(() => {
    if (errorSchedule)
      console.error("❌ Gagal mengambil jadwal:", errorSchedule);
    console.log("🕐 Sekarang:", now.toLocaleTimeString());
    console.log("🕌 Jadwal:", scheduleData?.jadwal);
    console.log("➡️ Selanjutnya:", nextPrayerData);
  }, [now, scheduleData, nextPrayerData, errorSchedule]);

  const jadwal = scheduleData?.jadwal;
  const jadwalList = [
    // { label: "Imsak", time: jadwal?.imsak },
    { label: "Subuh", time: jadwal?.subuh },
    { label: "Terbit", time: jadwal?.terbit },
    // { label: "Dhuha", time: jadwal?.dhuha },
    { label: "Dzuhur", time: jadwal?.dzuhur },
    { label: "Ashar", time: jadwal?.ashar },
    { label: "Maghrib", time: jadwal?.maghrib },
    { label: "Isya", time: jadwal?.isya },
  ];

  // ==========================
  // 📦 UI
  // ==========================
  return (
    <>
      <PageHeaderUser
        title="Profil DKM & Pengajar"
        onBackClick={() => navigate(`/masjid/${slug}`)}
      />

      <div
        className="w-full max-w-2xl mx-auto pb-28 space-y-6"
        style={{ color: theme.white1 }}
      >
        <div
          className="rounded-2xl p-5 shadow-lg"
          style={{ backgroundColor: theme.secondary }}
        >
          <div
            className="rounded-xl px-4 py-3 mb-4 space-y-2 text-center"
            style={{
              backgroundColor: `${theme.specialColor}10`,
              borderColor: `${theme.white1}30`,
              borderWidth: 1,
            }}
          >
            <p className="text-base tracking-wide text-primary">
              {loadingHijri ? "..." : hijriDate} • {location}
            </p>

            <p className="text-5xl font-bold text-primary">
              {loadingSchedule || !nextPrayerData
                ? "--:--"
                : nextPrayerData.time.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
            </p>

            <p className="text-sm font-medium text-primary">
              {showingCurrentPrayer ? "Sedang Berlangsung" : "Menuju"}{" "}
              <span className="font-bold text-primary">
                {nextPrayerData?.name}
              </span>{" "}
              • {getCountdown()}
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3">
            🕌 Jadwal Sholat Hari Ini
          </h3>
          <table className="w-full text-sm table-auto">
            <tbody>
              {loadingSchedule ? (
                <tr>
                  <td colSpan={2} className="text-center py-4">
                    Memuat...
                  </td>
                </tr>
              ) : (
                jadwalList.map((item, index) => (
                  <tr
                    key={item.label}
                    className={`border-t border-white/10 ${
                      index % 2 === 1 ? "bg-white/5" : ""
                    }`}
                  >
                    <td className="py-2 px-1">{item.label}</td>
                    <td className="py-2 px-1 text-right font-semibold">
                      {item.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="text-xs mt-4 opacity-80 text-right">
            Lokasi: {scheduleData?.lokasi || "-"} • Tanggal:{" "}
            {jadwal?.tanggal || "-"}
          </p>
        </div>
      </div>

      <BottomNavbar />
    </>
  );
}
