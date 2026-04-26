import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";

export type CurrentUser = { id: string; username: string; firstName: string };

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    userService.getCurrentUser().then(setUser);
  }, []);

  return user;
}
