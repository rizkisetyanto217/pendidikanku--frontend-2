import { Link } from "react-router-dom";
import { CalendarDays, Bell, GraduationCap } from "lucide-react";
import PublicUserDropdown from "@/components/common/public/UserDropDown";
import { colors } from "@/constants/colorsThema";

interface ParentTopBarProps {
  palette: typeof colors.light;
  parentName?: string;
  hijriDate?: string;
  gregorianDate?: string;
  dateFmt?: (iso: string) => string;
}

function Badge({
  children,
  palette,
}: {
  children: React.ReactNode;
  palette: typeof colors.light;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: palette.secondary, color: palette.white1 }}
    >
      {children}
    </span>
  );
}

function Btn({
  children,
  palette,
}: {
  children: React.ReactNode;
  palette: typeof colors.light;
}) {
  return (
    <button
      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm rounded-2xl font-medium"
      style={{
        background: "transparent",
        color: palette.black1,
        border: `1px solid ${palette.silver1}`,
      }}
    >
      {children}
    </button>
  );
}

export default function ParentTopBar({
  palette,
  parentName,
  hijriDate,
  gregorianDate,
  dateFmt,
}: ParentTopBarProps) {
  return (
    <div
      className="sticky top-0 z-40 backdrop-blur border-b"
      style={{
        background: `${palette.white1}E6`,
        borderColor: palette.silver1,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* kiri */}
        <div className="flex items-center gap-3">
          <GraduationCap size={24} color={palette.primary} />
          <div className="leading-tight">
            <div style={{ fontSize: 12, color: palette.silver2 }}>
              Selamat datang,
            </div>
            <div style={{ fontWeight: 600 }}>{parentName ?? "Orang Tua"}</div>
          </div>
        </div>

        {/* kanan (desktop) */}
        <div
          className="hidden md:flex items-center gap-3"
          style={{ fontSize: 14, color: palette.silver2 }}
        >
          <CalendarDays size={16} />
          <span className="hidden sm:inline">
            {gregorianDate && dateFmt ? dateFmt(gregorianDate) : ""}
          </span>
          <Badge palette={palette}>{hijriDate}</Badge>

          <Link to="/notifikasi">
            <Btn palette={palette}>
              <Bell className="mr-2" size={16} /> Notifikasi
            </Btn>
          </Link>

          <PublicUserDropdown variant="icon" />
        </div>

        {/* kanan (mobile) */}
        <div className="md:hidden">
          <PublicUserDropdown variant="icon" />
        </div>
      </div>
    </div>
  );
}
