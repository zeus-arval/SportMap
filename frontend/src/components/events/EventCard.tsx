"use client";

import { Calendar, User, Users, Clock, MapPin } from "lucide-react";
import type { EventData } from "@/types/event";
import { formatShortDate, formatTime, getTimeUntilShort } from "@/lib/date";
import { formatDistanceKm } from "@/lib/distance";

interface EventCardProps {
  event: EventData;
  currentUserId?: string | null;
  distanceKm?: number | null;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  onClick?: () => void;
}

export default function EventCard({
  event,
  currentUserId,
  distanceKm,
  onJoin,
  onLeave,
  onClick,
}: EventCardProps) {
  const isUpcoming = new Date(event.startTime) > new Date();
  const hasJoined =
    !!currentUserId &&
    !!event.participants?.some((p) => p.userId === currentUserId);

  return (
    <div
      onClick={onClick}
      className="bg-white/5 rounded-xl border border-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
    >
      {/* Date badge & time-until */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
            <Calendar size={14} className="text-blue-400 mr-1.5" />
            <span className="text-blue-400 text-xs font-medium">
              {formatShortDate(event.startTime)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <Clock size={12} className="mr-1" />
            {formatTime(event.startTime)}
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isUpcoming
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
          }`}
        >
          {getTimeUntilShort(event.startTime)}
        </span>
      </div>

      {/* Title & description */}
      <h3 className="text-white font-semibold text-sm mb-1">{event.title}</h3>
      {event.description && (
        <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <span className="flex items-center">
            <User size={12} className="mr-1 text-blue-400" />
            {event.hostUserName}
          </span>
          <span className="flex items-center">
            <Users size={12} className="mr-1" />
            {event.participantCount}
            {event.capacity ? `/${event.capacity}` : ""}
          </span>
          {distanceKm != null && (
            <span className="flex items-center text-purple-400/80">
              <MapPin size={12} className="mr-1" />
              {formatDistanceKm(distanceKm)}
            </span>
          )}
        </div>
        {isUpcoming && hasJoined && onLeave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLeave(event.id);
            }}
            className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Leave
          </button>
        )}
        {isUpcoming && !hasJoined && onJoin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(event.id);
            }}
            className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-colors"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}
