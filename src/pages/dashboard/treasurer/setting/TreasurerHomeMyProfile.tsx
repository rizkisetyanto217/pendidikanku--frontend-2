import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'
import UserProfileCard from '@/components/shared/profile/UserProfileCard'

export default function MyProfile() {
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  const profileData = {
    name: 'Ustadz Hariyadi',
    role: 'Admin DKM',
    jabatan: 'Ketua Masjid',
    ttdUrl: '/icons/ttd.svg',
    imageUrl: 'https://placehold.co/100x100',
    verified: true,
    sosial: ['whatsapp'],
    bio: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout...',
    tambahan: 'Tambahan deskripsi tentang profil pengguna yang bisa disesuaikan...',
  }

  return (
    <div
      className="space-y-6"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <UserProfileCard {...profileData} />
    </div>
  )
}
