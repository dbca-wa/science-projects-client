// src/lib/hooks/tanstack/useGuideSections.ts
import { getGuideSections } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

// Types
export interface ContentField {
  id: string;
  title?: string;
  field_key: string;
  description?: string;
  order: number;
}

export interface GuideSection {
  id: string;
  title: string;
  order: number;
  show_divider_after: boolean;
  category?: string;
  is_active: boolean;
  content_fields: ContentField[];
}

export const useGuideSections = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["guideSections"],
    queryFn: getGuideSections,
    retry: false,
  });

  return {
    guideSections: data as GuideSection[],
    isLoading,
    error,
  };
};
