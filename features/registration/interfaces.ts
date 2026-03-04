export interface RegistrationLink {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  linkSlug: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  gender: "male" | "female";
  placeOfBirth: string | null;
  dateOfBirth: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  education: string | null;
  occupation: string | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrationPayload {
  linkSlug: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nickname?: string;
  gender: "male" | "female";
  placeOfBirth?: string;
  dateOfBirth?: string;
  phone: string;
  email?: string;
  address?: string;
  education?: string;
  occupation?: string;
  website?: string; // honeypot
}

export interface CreateRegistrationLinkPayload {
  slug: string;
  label: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRegistrationLinkPayload {
  slug?: string;
  label?: string;
  description?: string;
  isActive?: boolean;
}
