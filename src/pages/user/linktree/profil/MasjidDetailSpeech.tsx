import PageHeader from "@/components/common/PageHeader";
import { useNavigate } from "react-router-dom";

const dummySambutan = [
  {
    id: 1,
    name: "Muhammad",
    role: "Pengajar",
    content:
      "Semoga Allah ta'ala mudahkan kita dalam menuntut ilmu agama. Allah ta'ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
  },
  {
    id: 2,
    name: "Budi",
    role: "Ketua DKM",
    content:
      "Semoga Allah ta'ala mudahkan kita dalam menuntut ilmu agama. Allah ta'ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
  },
];

export default function MasjidDetailSpeech() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Sambutan"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="space-y-4 mt-4">
        {dummySambutan.map((item) => (
          <div
            key={item.id}
            className="border rounded-md p-4 bg-white shadow-sm"
          >
            <p className="font-semibold text-gray-800">{item.name}</p>
            <p className="text-sm text-gray-500 mb-2">{item.role}</p>
            <p className="text-sm text-gray-700">{item.content}</p>
          </div>
        ))}
      </div>

   
    </>
  );
}
