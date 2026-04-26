"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Edit2, Share2, Flag, Grid, Bookmark } from "lucide-react";
import ImageComponent from "@/components/ImageComponent";
import EditProfileModal from "@/components/profile/EditProfileModal";
import SettingsModal from "@/components/profile/SettingsModal";
import { imageService } from "@/services/image.service";
import { UserProfile } from "@/services/profile.service";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isOwn = currentUser?.username === params.username;

  const { profile, posts, settings, imageId, loading, notFound: userNotFound,
    setProfile, setSettings, setImageId } = useProfile(params.username, isOwn);

  const [removeError, setRemoveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  if (userNotFound) notFound();

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${params.username}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [params.username]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setRemoveError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/profile-picture", { method: "POST", body: formData });
      if (response.ok) {
        const data = (await response.json()) as { imageId?: string };
        if (data.imageId) setImageId(data.imageId);
      } else {
        setRemoveError("Upload failed. Please try again.");
      }
    } catch {
      setRemoveError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    setRemoveError(null);
    const result = await imageService.deleteProfilePicture();
    if (result.isSucceed) setImageId(null);
    else setRemoveError(result.message ?? "Failed to remove profile picture.");
  };

  const handleProfileSaved = (updated: UserProfile) => {
    setProfile(updated);
    setShowEdit(false);
    if (updated.userName !== params.username) router.replace(`/profile/${updated.userName}`);
  };

  if (loading) return (
    <div className="h-full w-full bg-[#0a0a0f] flex flex-col items-center gap-6 p-8 pt-20">
      <div className="w-28 h-28 rounded-full bg-white/5 animate-pulse" />
      <div className="w-32 h-5 rounded-full bg-white/5 animate-pulse" />
      <div className="w-24 h-3 rounded-full bg-white/5 animate-pulse" />
    </div>
  );

  return (
    <div className="w-full h-full bg-[#0a0a0f] overflow-y-auto pb-24">
      {profile && <EditProfileModal open={showEdit} profile={profile} onSave={handleProfileSaved} onClose={() => setShowEdit(false)} />}
      {settings && <SettingsModal open={showSettings} settings={settings} onSave={(s) => { setSettings(s); setShowSettings(false); }} onClose={() => setShowSettings(false)} />}

      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-b from-blue-900/20 to-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
        </div>
        {isOwn && (
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-12 right-4 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      <div className="px-4 -mt-20 relative z-10">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="rounded-full p-[3px] bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg shadow-blue-900/20">
            <div className="rounded-full border-[3px] border-[#0a0a0f]">
              <ImageComponent
                imageId={imageId}
                alt={`${params.username}'s profile picture`}
                size="full"
                showRemove={false}
                onUploadSuccess={undefined}
              />
            </div>
          </div>
          {isOwn && (
            <div className="flex gap-3 mt-3">
              <label className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                {uploading ? "Uploading..." : "Upload photo"}
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleUpload} />
              </label>
              {!!imageId && (
                <button onClick={handleRemove} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Remove
                </button>
              )}
            </div>
          )}

          {removeError && <p role="alert" className="text-red-400 text-xs mb-2">{removeError}</p>}

          <h1 className="text-2xl font-bold text-white mb-1">
            {profile && (profile.firstName || profile.lastName)
              ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
              : params.username}
          </h1>
          <p className="text-gray-400 text-sm mb-1">@{params.username}</p>
          {profile?.roleName && (
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-3">
              {profile.roleName}
            </span>
          )}
          {profile?.birthdate && (
            <p className="text-gray-500 text-xs mb-3">{new Date(profile.birthdate).toLocaleDateString()}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center space-x-8 w-full mb-8">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{posts.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Posts</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwn ? (
          <div className="w-full flex space-x-3 mb-8">
            <button
              onClick={() => setShowEdit(true)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center"
            >
              <Edit2 size={16} className="mr-2" /> Edit Profile
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-[#12121a] border border-white/10 text-white font-semibold text-sm flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              {copied ? "Copied!" : <><Share2 size={16} className="mr-2" /> Share</>}
            </button>
          </div>
        ) : (
          <div className="w-full mb-8">
            <button
              onClick={handleShare}
              className="w-full py-3 rounded-xl bg-[#12121a] border border-white/10 text-white font-semibold text-sm flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              {copied ? "Copied!" : <><Share2 size={16} className="mr-2" /> Share Profile</>}
            </button>
          </div>
        )}

        {/* Content Tabs */}
        <div>
          <div className="flex border-b border-white/10 mb-4">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 pb-3 font-medium text-sm flex items-center justify-center transition-colors ${activeTab === "posts" ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Grid size={16} className="mr-2" /> Posts
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 pb-3 font-medium text-sm flex items-center justify-center transition-colors ${activeTab === "saved" ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Bookmark size={16} className="mr-2" /> Saved
            </button>
          </div>

          {activeTab === "posts" && (
            posts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No posts yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-[#12121a] p-4 rounded-2xl border border-white/5 flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-white font-medium text-sm">{post.title}</p>
                      <button className="p-1 text-gray-600 hover:text-gray-400 transition-colors">
                        <Flag size={12} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{post.content}</p>
                    <p className="text-gray-600 text-xs mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {activeTab === "saved" && (
            <p className="text-gray-500 text-sm text-center py-8">No saved items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
