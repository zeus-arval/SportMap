"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { profileService, UserSettings } from "@/services/profile.service";

interface Props {
  open: boolean;
  settings: UserSettings;
  onSave: (updated: UserSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ open, settings, onSave, onClose }: Props) {
  const [birthdatePrivacy, setBirthdatePrivacy] = useState<"public" | "private">(
    settings.birthdatePrivacy
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await profileService.updateSettings(birthdatePrivacy);
    setSaving(false);
    if (result.isSucceed && result.value) {
      onSave(result.value);
    } else {
      setError(result.error?.message ?? "Failed to save settings.");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="App Settings">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Privacy
        </h3>
        <p className="text-gray-500 text-xs mb-2">Birthdate visibility</p>
        <div className="flex gap-2">
          {(["public", "private"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setBirthdatePrivacy(v)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize ${
                birthdatePrivacy === v
                  ? "border-blue-500 text-blue-400 bg-blue-500/10"
                  : "border-white/10 text-gray-400 bg-white/5 hover:bg-white/10"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pb-safe">
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
