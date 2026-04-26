export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getTimeUntilShort(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return "Started";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `In ${days}d`;
  if (hours > 0) return `In ${hours}h`;
  return "Soon";
}

export function getTimeUntilLong(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return "Already started";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Starts in ${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0)
    return `Starts in ${minutes} minute${minutes > 1 ? "s" : ""}`;
  return "Starting now";
}

export function formatJoinDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Convert a local Date to a UTC ISO-8601 string for the API. */
export function toUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Format a UTC ISO string as a `datetime-local` value in the user's timezone.
 * datetime-local inputs expect "YYYY-MM-DDTHH:mm" in local time.
 */
export function utcToLocalInput(utcIso: string): string {
  const d = new Date(utcIso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Convert a `datetime-local` value (local time) to a UTC ISO string.
 * The input value is "YYYY-MM-DDTHH:mm" which `new Date()` parses as local.
 */
export function localInputToUTC(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 0);
  return d;
}

export interface DatePreset {
  label: string;
  getRange: () => { from: string; to: string };
}

export const DATE_PRESETS: DatePreset[] = [
  {
    label: "Today",
    getRange: () => ({
      from: toUTCString(startOfDay(new Date())),
      to: toUTCString(endOfDay(new Date())),
    }),
  },
  {
    label: "Tomorrow",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return { from: toUTCString(startOfDay(d)), to: toUTCString(endOfDay(d)) };
    },
  },
  {
    label: "This week",
    getRange: () => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + (7 - end.getDay()));
      return { from: toUTCString(now), to: toUTCString(endOfDay(end)) };
    },
  },
  {
    label: "This weekend",
    getRange: () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 6=Sat

      if (day === 0) {
        // Sunday — show rest of today
        return { from: toUTCString(now), to: toUTCString(endOfDay(now)) };
      }

      if (day === 6) {
        // Saturday — show today through end of Sunday
        const sun = new Date(now);
        sun.setDate(sun.getDate() + 1);
        return { from: toUTCString(now), to: toUTCString(endOfDay(sun)) };
      }

      // Mon–Fri — show upcoming Saturday through Sunday
      const sat = new Date(now);
      sat.setDate(sat.getDate() + (6 - day));
      const sun = new Date(sat);
      sun.setDate(sun.getDate() + 1);
      return { from: toUTCString(startOfDay(sat)), to: toUTCString(endOfDay(sun)) };
    },
  },
  {
    label: "Next 30 days",
    getRange: () => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + 30);
      return { from: toUTCString(now), to: toUTCString(endOfDay(end)) };
    },
  },
];
