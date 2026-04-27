"use client";

import { Map, LayoutGrid, Calendar, User, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@base-ui/react/button";
import type { Tab } from "./ResponsiveNav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateMenu } from "./CreateMenuContext";

export default function BottomNav() {
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

  // Split tabs: left side, create button (center), right side
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-40 md:hidden">
      {/* Left tabs */}
      {leftTabs.map((tab) => {
        const isActive =
          tab.id === "profile"
            ? pathname.startsWith("/profile")
            : pathname === tab.href;
        return (
          <Link href={tab.href} key={tab.id} className="flex-1 flex justify-center">
            <Button
              className={`flex flex-col items-center justify-center w-full h-16 bg-transparent border-none shadow-none hover:bg-gray-800/50 transition-colors duration-200 ${isActive ? "text-blue-400" : "text-gray-400"}`}
            >
              <tab.icon size={24} className="mb-1" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Button>
          </Link>
        );
      })}

      {/* Create button - center prominence */}
      <button
        onClick={openCreateMenu}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all active:scale-95"
      >
        <Plus size={28} />
      </button>

      {/* Right tabs */}
      {rightTabs.map((tab) => {
        const isActive =
          tab.id === "profile"
            ? pathname.startsWith("/profile")
            : pathname === tab.href;
        return (
          <Link href={tab.href} key={tab.id} className="flex-1 flex justify-center">
            <Button
              className={`flex flex-col items-center justify-center w-full h-16 bg-transparent border-none shadow-none hover:bg-gray-800/50 transition-colors duration-200 ${isActive ? "text-blue-400" : "text-gray-400"}`}
            >
              <tab.icon size={24} className="mb-1" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
