import type { BaseData } from "@/types/base";
import { BaseService } from "./base.service";
import type { Result } from "@/lib/result";
import {ApiConfig} from "@/config/api";

export class ImageService extends BaseService<BaseData> {
  protected readonly endpoint = "profile-picture";

  constructor() {
    const baseUrl = ApiConfig.SecuredServerUrl;
    super(baseUrl);
  }

  async getProfilePictureByUsername(
    username: string
  ): Promise<string | null | "NOT_FOUND"> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}/${username}`);
      if (response.status === 404) return "NOT_FOUND";
      if (!response.ok) return null;
      const data = (await response.json()) as { profilePictureId?: string | null };
      return data.profilePictureId ?? null;
    } catch {
      return null;
    }
  }

  async getOwnProfilePictureId(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}`);
      if (response.status === 404) return null;
      if (!response.ok) return null;
      const data = (await response.json()) as { profilePictureId?: string };
      return data.profilePictureId ?? null;
    } catch {
      return null;
    }
  }

  async deleteProfilePicture(): Promise<Result> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.endpoint}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return { isSucceed: true };
    } catch (error) {
      return {
        isSucceed: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const imageService = new ImageService();
