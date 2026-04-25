import { useState, useEffect } from "react";
import { imageService } from "@/services/image.service";
import { profileService, UserProfile, UserPost, UserSettings } from "@/services/profile.service";

interface UseProfileResult {
  profile: UserProfile | null;
  posts: UserPost[];
  settings: UserSettings | null;
  imageId: string | null;
  loading: boolean;
  notFound: boolean;
  setProfile: (p: UserProfile) => void;
  setSettings: (s: UserSettings) => void;
  setImageId: (id: string | null) => void;
}

export function useProfile(username: string, isOwn: boolean): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [pictureResult, profileResult] = await Promise.all([
        imageService.getProfilePictureByUsername(username),
        profileService.getProfileByUsername(username),
      ]);
      if (cancelled) return;
      if (pictureResult === "NOT_FOUND" || !profileResult.isSucceed || !profileResult.value) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setImageId(pictureResult);
      setProfile(profileResult.value);
      setLoading(false);
      const postsResult = await profileService.getPostsByUserId(profileResult.value.id);
      if (!cancelled && postsResult.isSucceed && postsResult.value) setPosts(postsResult.value);
    };
    load();
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => {
    if (!isOwn) return;
    let cancelled = false;
    profileService.getSettings().then((r) => {
      if (!cancelled && r.isSucceed && r.value) setSettings(r.value);
    });
    return () => { cancelled = true; };
  }, [isOwn]);

  return { profile, posts, settings, imageId, loading, notFound, setProfile, setSettings, setImageId };
}
