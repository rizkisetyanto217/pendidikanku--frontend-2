import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios"; // pakai yang sudah ada baseURL-nya

export function useDeleteLectureSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/a/lecture-sessions/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lecture-sessions"],
      });
    },
  });
}
