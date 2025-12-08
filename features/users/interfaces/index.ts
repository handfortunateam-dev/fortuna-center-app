export interface ClerkUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  emailVerified: boolean;
}

export interface ClerkUserDetail extends ClerkUser {
  phoneNumbers?: Array<{
    phoneNumber: string;
    verified: boolean;
  }>;
  externalAccounts?: Array<{
    provider: string;
    emailAddress: string;
  }>;
}

export interface UsersListParams {
  limit?: number;
  offset?: number;
  query?: string;
  orderBy?: string;
}

export interface UsersListResponse {
  data: ClerkUser[];
  totalCount: number;
}