// src/hooks/useMeta.ts
import useSWR from "swr";

type FilterOption = {
  id: string;
  name: string;
};

type MetaResponse = {
  tags: FilterOption[];
  facilities: FilterOption[];
};

const fetcher = async (url: string): Promise<MetaResponse> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch meta");
  }

  return res.json();
};

export function useMeta() {
  const { data, error, isLoading, mutate } = useSWR<MetaResponse>(
    "/api/meta",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60,
      keepPreviousData: true,
    }
  );

  return {
    tags: data?.tags ?? [],
    facilities: data?.facilities ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}