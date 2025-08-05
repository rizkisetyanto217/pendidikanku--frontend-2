import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface SholatScheduleCardProps {
  location: string;
  slug: string;
}

export default function SholatScheduleCard({
  location,
  slug,
}: SholatScheduleCardProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [now, setNow] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: Date;
  } | null>(null);
  const [showingCurrentPrayer, setShowingCurrentPrayer] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getHijriDate = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `https://api.myquran.com/v2/cal/hijr/?adj=-1&date=${today}`
    );
    const [day, hijri] = res.data.data.date;
    return `${day}, ${hijri}`;
  };

  const getPrayerSchedule = async () => {
    const base = "https://api.myquran.com/v2";
    const kota = 1301;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const [resToday, resTomorrow] = await Promise.all([
      axios.get(`${base}/sholat/jadwal/${kota}/${todayStr}`),
      axios.get(`${base}/sholat/jadwal/${kota}/${tomorrowStr}`),
    ]);

    const jadwalToday = resToday.data.data.jadwal;
    const jadwalTomorrow = resTomorrow.data.data.jadwal;

    const toDate = (time: string, baseDate: Date) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date(baseDate);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const scheduleToday = [
      { name: "Subuh", time: toDate(jadwalToday.subuh, today) },
      { name: "Dzuhur", time: toDate(jadwalToday.dzuhur, today) },
      { name: "Ashar", time: toDate(jadwalToday.ashar, today) },
      { name: "Maghrib", time: toDate(jadwalToday.maghrib, today) },
      { name: "Isya", time: toDate(jadwalToday.isya, today) },
    ];

    const subuhBesok = {
      name: "Subuh",
      time: toDate(jadwalTomorrow.subuh, tomorrow),
    };

    return [...scheduleToday, subuhBesok]; // total 6 item
  };

  const { data: hijriDate, isLoading: loadingHijri } = useQuery({
    queryKey: ["hijri-date"],
    queryFn: getHijriDate,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const { data: schedule, isLoading: loadingPrayer } = useQuery({
    queryKey: ["prayer-schedule"],
    queryFn: getPrayerSchedule,
    staleTime: 1000 * 60 * 15,
  });

  // Logic untuk tentukan waktu sholat berikutnya (dengan 15 menit delay setelah masuk waktu)
  useEffect(() => {
    if (!schedule) return;

    const updatedPrayer = schedule.find((item, index) => {
      const currentPrayerTime = item.time;
      const nextPrayerTime =
        schedule[index + 1]?.time ||
        new Date(currentPrayerTime.getTime() + 24 * 60 * 60 * 1000); // default ke besok

      const isBeforePrayer = now < currentPrayerTime;

      const isDuringPrayer =
        now >= currentPrayerTime &&
        now < new Date(currentPrayerTime.getTime() + 15 * 60 * 1000);

      if (isBeforePrayer) {
        setShowingCurrentPrayer(false);
        return true;
      }

      if (isDuringPrayer) {
        setShowingCurrentPrayer(true);
        return true;
      }

      return false;
    });

    if (updatedPrayer) {
      setNextPrayer(updatedPrayer);
    }
  }, [now, schedule]);

  const getCountdown = () => {
    if (!nextPrayer) return null;

    const target = showingCurrentPrayer
      ? new Date(nextPrayer.time.getTime() + 15 * 60 * 1000)
      : nextPrayer.time;

    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "00:00";

    const totalMinutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  };

  return (
    <Link to={`/masjid/${slug}/sholat`}>
      <div
        className="rounded-xl p-3 grid grid-cols-3 gap-3 items-center w-full max-w-md shadow-md cursor-pointer hover:opacity-90 transition"
        style={{
          backgroundColor: theme.secondary,
          color: theme.white1,
          maxWidth: "100%",
          gridTemplateColumns: "0.9fr 1.1fr 1.5fr", // Grid 1 lebih kecil
        }}
      >
        {/* Grid 1: Waktu Sholat */}
        <div
          className="text-left border-r pr-3"
          style={{ borderColor: `${theme.white1}80` }}
        >
          <p className="text-sm font-semibold">
            {loadingPrayer || !nextPrayer ? "..." : nextPrayer.name}
          </p>
          <p className="text-xl font-bold leading-tight">
            {loadingPrayer || !nextPrayer
              ? "--:--"
              : nextPrayer.time.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
          </p>
        </div>

        {/* Grid 2: Tanggal Hijriah & Lokasi */}
        <div
          className="text-left border-r px-3"
          style={{ borderColor: `${theme.white1}80` }}
        >
          <p className="text-sm font-semibold">
            {loadingHijri ? "Memuat tanggal..." : hijriDate}
          </p>
          <p className="text-xs">{location}</p>
        </div>

        {/* Grid 3: Hitung Mundur */}
        <div className="text-left pl-3">
          {nextPrayer && (
            <p className="text-sm">
              {showingCurrentPrayer ? "Waktu Sholat Berlangsung" : "Menuju"}{" "}
              {nextPrayer.name}: {getCountdown()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
