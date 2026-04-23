import { ResultOf } from "@/lib/result";
import type { UserProfile, UserPost, UserSettings, UpdateProfileRequest } from "@/types/user";

export type { UserProfile, UserPost, UserSettings, UpdateProfileRequest };

class ProfileService {
  private readonly baseUrl = "/api";

  async getProfileByUsername(username: string): Promise<ResultOf<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/u/${username}`);
      if (response.status === 404) return ResultOf.notFound(username);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserProfile);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getProfileById(id: string): Promise<ResultOf<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${id}`);
      if (response.status === 404) return ResultOf.notFound(id);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserProfile);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getPostsByUserId(userId: string): Promise<ResultOf<UserPost[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${userId}/posts`);
      if (response.status === 404) return ResultOf.withValue([]);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserPost[]);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ResultOf<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.status === 409) {
        const body = (await response.json()) as { error?: string };
        return ResultOf.withError(new Error(body.error ?? "Username already taken"));
      }
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserProfile);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getSettings(): Promise<ResultOf<UserSettings>> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserSettings);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async updateSettings(birthdatePrivacy: "public" | "private"): Promise<ResultOf<UserSettings>> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdatePrivacy }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return ResultOf.withValue((await response.json()) as UserSettings);
    } catch (error) {
      return ResultOf.withError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

export const profileService = new ProfileService();
