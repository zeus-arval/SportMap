type CurrentUser = { id: string; username: string; firstName: string };

export class UserService {
  private readonly baseUrl = "/api";
  private cache: CurrentUser | null = null;
  private fetched = false;
  private inflight: Promise<CurrentUser | null> | null = null;

  async getCurrentUser(): Promise<CurrentUser | null> {
    if (this.fetched) return this.cache;
    if (!this.inflight) {
      this.inflight = fetch(`${this.baseUrl}/user/me`)
        .then(async (r) => {
          if (!r.ok) return null;
          const data = (await r.json()) as CurrentUser;
          this.cache = data;
          return data;
        })
        .catch(() => null)
        .finally(() => {
          this.fetched = true;
          this.inflight = null;
        });
    }
    return this.inflight;
  }
}

export const userService = new UserService();
