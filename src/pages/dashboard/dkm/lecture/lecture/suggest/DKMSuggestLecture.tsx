import PageHeader from "@/components/common/home/PageHeaderDashboard";
import SimpleTable from "@/components/common/main/SimpleTable";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";

interface Advice {
  advice_id: string;
  advice_description: string;
  advice_lecture_id: string;
  advice_user_id: string;
  advice_created_at: string;
}

const getAdvicesByLecture = async (lectureId: string): Promise<Advice[]> => {
  const res = await axios.get(`/api/a/advices/by-lecture/${lectureId}`);
  return res.data;
};

export default function DKMSuggestLecture() {
  const { id: lectureId } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["advices", lectureId],
    queryFn: () => getAdvicesByLecture(lectureId!),
    enabled: !!lectureId,
  });

  const columns = ["No", "Pengirim", "Saran & Masukan", "Tanggal", "Aksi"];

  const rows = useMemo(() => {
    if (!data) return [];

    return data.map((item, index) => [
      index + 1,
      "Pengguna", // Bisa diganti jika ada data nama user
      item.advice_description,
      <FormattedDate value={item.advice_created_at} />,
      <div onClick={(e) => e.stopPropagation()}>
        <ActionEditDelete
          onEdit={() => console.log("Edit", item.advice_id)}
          onDelete={() => {
            if (confirm("Yakin ingin menghapus saran ini?")) {
              console.log("Delete", item.advice_id);
              // tambahkan fungsi hapus kalau sudah siap
            }
          }}
        />
      </div>,
    ]);
  }, [data]);

  return (
    <>
      <PageHeader title="Saran & Masukan" onBackClick={() => history.back()} />
      <div className="mt-4">
        <SimpleTable
          columns={columns}
          rows={rows}
          emptyText={isLoading ? "Memuat data..." : "Belum ada saran masuk."}
        />
      </div>
    </>
  );
}
