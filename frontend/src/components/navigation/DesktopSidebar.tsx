"use client";

import { Map, LayoutGrid, Calendar, User, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@base-ui/react/button";
import type { Tab } from "./ResponsiveNav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateMenu } from "./CreateMenuContext";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const { open: openCreateMenu } = useCreateMenu();

  const tabs: {
    id: Tab;
    icon: React.ElementType;
    label: string;
    href: string;
  }[] = [
    { id: "map", icon: Map, label: "Map", href: "/map" },
    { id: "feed", icon: LayoutGrid, label: "Feed", href: "/feed" },
    { id: "events", icon: Calendar, label: "Events", href: "/events" },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      href: currentUser ? `/profile/${currentUser.username}` : "#",
    },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-[#0a0a0f]/90 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 z-40">
      <div className="flex flex-col gap-2 flex-1 justify-start pt-2">
        {tabs.map((tab) => {
          const isActive =
            tab.id === "profile"
              ? pathname.startsWith("/profile")
              : pathname === tab.href;
          return (
            <Link href={tab.href} key={tab.id}>
              <Button
                className={`flex flex-col items-center justify-center w-12 h-12 bg-transparent border-none shadow-none hover:bg-gray-800/50 transition-colors duration-200 ${isActive ? "text-blue-400" : "text-gray-400"}`}
              >
                <tab.icon size={24} className="mb-1" />
                <span className="text-[8px] font-medium">{tab.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Create button at bottom */}
      <button
        onClick={openCreateMenu}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all active:scale-95 mt-auto"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
