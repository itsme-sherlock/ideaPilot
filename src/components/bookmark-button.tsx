'use client';
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookmarkButton() {
  const handleBookmark = () => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      alert("📱 On iPhone: Tap Share → Add Bookmark.");
    } else if (/android/.test(ua)) {
      alert("📱 On Android: Tap ⋮ menu → Add to Home screen or Bookmark.");
    } else if (ua.indexOf("mac") !== -1) {
      alert("Press ⌘ + D to bookmark this page.");
    } else {
      alert("Press Ctrl + D to bookmark this page.");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBookmark}
      className="flex items-center gap-1"
    >
      <Bookmark className="h-4 w-4" />
    </Button>
  );
}
