import { useIsMobile } from "@/hooks/isMobile";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";

const dummyPengurus = [
  {
    id: 1,
    type: "pengurus",
    role: "Ketua DKM",
    name: "Bapak Hardi",
    jabatan: "Ketua DKM",
    sambutan:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    aktivitas: "Menjadi pengajar tetap di Masjid daerah jabodetabek.",
    lainnya: "Sudah menjadi ketua DKM sejak 2020.",
  },
  {
    id: 2,
    type: "pengurus",
    role: "Bendahara",
    name: "Ustadz Muhammad Yassir",
    jabatan: "Bendahara",
    sambutan: "Sambutan dari bendahara.",
    aktivitas: "Mengelola keuangan masjid.",
    lainnya: "Sudah menjadi bendahara sejak 2021.",
  },
  {
    id: 3,
    type: "pengurus",
    role: "Sekretaris",
    name: "Ustadz Taufiq",
    jabatan: "Sekretaris",
    sambutan: "Sambutan dari sekretaris.",
    aktivitas: "Membantu pencatatan dan administrasi.",
    lainnya: "Sudah menjadi sekretaris sejak 2022.",
  },
];

const dummyPengajar = [
  {
    id: 1,
    type: "pengajar",
    title: "Kajian Tematik",
    name: "Ustadz Firza, Lc",
    bidang: "Ushul Fiqh",
    sambutan:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    pendidikan: [
      "S1 Universitas Islam Madinah jurusan Hadist",
      "S2 Universitas Islam Madinah jurusan Hadist",
    ],
    aktivitas: "Menjadi pengajar tetap di Masjid daerah jabodetabek.",
  },
  {
    id: 2,
    type: "pengajar",
    title: "Kajian Aqidah",
    name: "Ustadz Taufiq",
    bidang: "Aqidah",
    sambutan: "Contoh sambutan dari ustadz Taufiq.",
    pendidikan: ["S1 UIN Jakarta", "S2 Universitas Al-Azhar"],
    aktivitas: "Aktif sebagai pembina pengajian remaja masjid.",
  },
];

export default function MasjidDKMPengajarProfil() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const handleSelect = (person: any) => {
    if (isMobile) {
      navigate("/dkm/pengajar/edit/" + person.id);
    } else {
      setSelectedDetail(person);
    }
  };

  const renderPersonCard = (item: any, label?: string) => {
    const isActive =
      selectedDetail?.id === item.id && selectedDetail?.type === item.type;

    return (
      <button
        key={`${item.type}-${item.id}`}
        onClick={() => handleSelect(item)}
        className={`w-full flex justify-between items-center p-3 rounded border ${
          isActive ? "bg-emerald-50" : "bg-white"
        } hover:bg-gray-100 mt-2`}
      >
        <span className="flex flex-col items-start text-left">
          <span className="font-medium">{label || item.title}</span>
          <span className="text-sm text-gray-600">{item.name}</span>
        </span>
        <span className="text-lg">›</span>
      </button>
    );
  };

  return (
    <>
      <PageHeader
        title="Profil DKM & Pengajar"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="md:flex md:gap-6">
        <div className="md:w-1/2 space-y-4">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">DKM Masjid</h2>
            {dummyPengurus.map((item) => renderPersonCard(item, item.role))}
          </div>

          <div className="pt-4">
            <h3 className="text-md font-semibold text-emerald-700">Pengajar</h3>
            {dummyPengajar.map((item) => renderPersonCard(item))}
          </div>
        </div>

        {!isMobile && (
          <div className="md:w-1/2 bg-white rounded shadow p-4 space-y-3 mt-6 md:mt-0">
            {selectedDetail ? (
              <>
                <h3 className="text-lg font-semibold text-sky-700">
                  {selectedDetail.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-700">
                  {selectedDetail.jabatan && (
                    <div>
                      <p className="font-semibold">Jabatan</p>
                      <p>{selectedDetail.jabatan}</p>
                    </div>
                  )}

                  {selectedDetail.bidang && (
                    <div>
                      <p className="font-semibold">Bidang Pengajaran</p>
                      <p>{selectedDetail.bidang}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">Sambutan</p>
                    <p>{selectedDetail.sambutan}</p>
                  </div>

                  {selectedDetail.pendidikan?.length > 0 && (
                    <div>
                      <p className="font-semibold">Latar Belakang Pendidikan</p>
                      <ul className="list-disc list-inside">
                        {selectedDetail.pendidikan.map(
                          (item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">Aktivitas</p>
                    <p>{selectedDetail.aktivitas}</p>
                  </div>

                  {selectedDetail.lainnya && (
                    <div>
                      <p className="font-semibold">Lainnya</p>
                      <p>{selectedDetail.lainnya}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Klik salah satu untuk melihat detail.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
