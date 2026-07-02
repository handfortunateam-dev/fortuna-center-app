import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  RegistrationLink,
  Registration,
  CreateRegistrationLinkPayload,
  UpdateRegistrationLinkPayload,
} from "../interfaces";

// ─── Registration Links ───

export function useRegistrationLinks() {
  return useQuery<RegistrationLink[]>({
    queryKey: ["registration-links"],
    queryFn: async () => {
      const { data } = await apiClient.get("/registration-links");
      return data.data;
    },
  });
}

export function useRegistrationLink(id: string) {
  return useQuery<RegistrationLink>({
    queryKey: ["registration-links", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/registration-links/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRegistrationLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRegistrationLinkPayload) => {
      const { data } = await apiClient.post("/registration-links", payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-links"] }),
  });
}

export function useUpdateRegistrationLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRegistrationLinkPayload;
    }) => {
      const { data } = await apiClient.patch(
        `/registration-links/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-links"] }),
  });
}

export function useDeleteRegistrationLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/registration-links/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-links"] }),
  });
}

// ─── Registrations ───

export function useRegistrations(filters?: {
  status?: string;
  linkSlug?: string;
}) {
  return useQuery<Registration[]>({
    queryKey: ["registrations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.linkSlug) params.set("linkSlug", filters.linkSlug);
      const { data } = await apiClient.get(
        `/registrations?${params.toString()}`,
      );
      return data.data;
    },
  });
}

export function useRegistration(id: string) {
  return useQuery<Registration>({
    queryKey: ["registrations", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/registrations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: string; adminNotes?: string };
    }) => {
      const { data } = await apiClient.patch(
        `/registrations/${id}`,
        payload,
      );
      // Return full response so callers can access studentCreated, student, message, etc.
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  });
}

export function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/registrations/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  });
}

// ─── Public registration submission (no auth) ───

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim pendaftaran");
      return data;
    },
  });
}

// ─── Public slug validation (no auth) ───

export function useValidateSlug(slug: string) {
  return useQuery<{ slug: string; label: string; isActive: boolean }>({
    queryKey: ["validate-slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/register/validate/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    },
    enabled: !!slug,
    retry: false,
  });
}
