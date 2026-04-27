"use client";

import { useRouter } from "next/navigation";
import { Calendar, MapPin, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateMenuProps {
  open: boolean;
  onClose: () => void;
}

interface CreateOption {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  event?: string;
  color: string;
}

export default function CreateMenu({ open, onClose }: CreateMenuProps) {
  const router = useRouter();

  const handleSelect = (option: CreateOption) => {
    onClose();
    if (option.event) {
      // Navigate to the target page, then dispatch event after mount
      if (option.href) {
        router.push(option.href);
        // Delay event dispatch until after navigation completes
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(option.event!));
        }, 100);
      } else {
        window.dispatchEvent(new CustomEvent(option.event));
      }
    } else if (option.href) {
      router.push(option.href);
    }
  };

  const options: CreateOption[] = [
    {
      id: "event",
      label: "Create Event",
      icon: Calendar,
      href: "/events",
      event: "open-create-event",
      color: "from-blue-600 to-cyan-500",
    },
    {
      id: "place",
      label: "Add Place",
      icon: MapPin,
      href: "/map",
      event: "open-add-place",
      color: "from-green-600 to-emerald-500",
    },
    {
      id: "post",
      label: "New Post",
      icon: Camera,
      event: "open-create-post",
      color: "from-purple-600 to-pink-500",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 300, mass: 0.8 }}
            className="w-full max-w-lg bg-[#12121a] rounded-t-3xl border-t border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto -mt-2 mb-4" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">Create New</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-white font-medium text-base">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}