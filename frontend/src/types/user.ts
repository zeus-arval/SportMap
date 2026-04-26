export type UserProfile = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  birthdate?: string | null;
  roleName?: string | null;
};

export type UserPost = {
  id: string;
  title: string;
  content: string;
  status: number;
  authorId: string | null;
  createdAt: string;
};

export type UserSettings = {
  id: string;
  birthdatePrivacy: "public" | "private";
};

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  userName?: string;
  birthdate?: string;
};
