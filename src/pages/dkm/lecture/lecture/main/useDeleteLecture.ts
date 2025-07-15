import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export function useDeleteLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      await axios.delete(`/api/a/lectures/${lectureId}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lectures"],
      });
    },
  });
}
