"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { profileService, UserProfile } from "@/services/profile.service";

interface Props {
  open: boolean;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

const fields = [
  { label: "First name", key: "firstName" },
  { label: "Last name", key: "lastName" },
  { label: "Username", key: "userName" },
] as const;

export default function EditProfileModal({ open, profile, onSave, onClose }: Props) {
  const [values, setValues] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    userName: profile.userName,
    birthdate: profile.birthdate ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await profileService.updateProfile({
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      userName: values.userName || undefined,
      birthdate: values.birthdate || undefined,
    });
    setSaving(false);
    if (result.isSucceed && result.value) {
      onSave(result.value);
    } else {
      setError(result.error?.message ?? "Failed to save changes.");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Profile">
      <div className="flex flex-col gap-3">
        {fields.map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs uppercase tracking-wider">{label}</label>
            <input
              value={values[key]}
              onChange={set(key)}
              className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-xs uppercase tracking-wider">Birthdate</label>
          <input
            type="date"
            value={values.birthdate}
            onChange={set("birthdate")}
            className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pb-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-[#12121a] border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </BottomSheet>
  );
}
