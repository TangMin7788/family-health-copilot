import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, type Report, type ReportCreate } from "@/lib/api";

export function useReports(viewer: string) {
  return useQuery({
    queryKey: ["reports", viewer],
    queryFn: async () => {
      console.log('🔍 Fetching reports for viewer:', viewer);
      try {
        const response = await reportsApi.list(viewer);
        console.log('✅ Reports fetched successfully:', response.data.length, 'reports');
        return response.data;
      } catch (error) {
        console.error('❌ Error fetching reports:', error);
        throw error;
      }
    },
    enabled: !!viewer,
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const response = await reportsApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReportCreate) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
