export type Player = {
  id: string;
  slug: string;
  full_name: string;
  grad_year: number;
  position: string | null;
  height_inches: number | null;
  hometown: string | null;
  high_school: string | null;
  club_team: string | null;
  gpa: number | null;
  bio: string | null;
  stat_line: string | null;
  highlight_url: string | null;
  photo_url: string | null;
  contact_email: string | null;
  is_verified: boolean;
  is_published: boolean;
  subscription_status: "inactive" | "active" | "past_due" | "canceled";
  created_at: string;
  updated_at: string;
};

export function heightLabel(inches: number | null) {
  if (!inches) return null;
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
}

export function embedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    // Hudl and others: link out instead of embedding.
    return null;
  } catch {
    return null;
  }
}
