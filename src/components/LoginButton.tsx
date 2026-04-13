"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Heart, LogOut, MapPinPlus, UserRound } from "lucide-react";

type LoginButtonProps = {
  onOpenFavorites?: () => void;
  onOpenCreate?: () => void;
  onMenuOpenChange?: (open: boolean) => void;
};

export default function LoginButton({
  onOpenFavorites,
  onOpenCreate,
  onMenuOpenChange,
}: LoginButtonProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => {
    setOpen(true);
    onMenuOpenChange?.(true);
  };

  const handleClose = () => {
    setOpen(false);
    onMenuOpenChange?.(false);
  };

  const closeMenu = () => {
    setOpen(false);
    onMenuOpenChange?.(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        closeMenu();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleUserButtonClick = async () => {
    if (!session) {
      await signIn("google");
      return;
    }

    const nextOpen = !open;
    setOpen(nextOpen);
    onMenuOpenChange?.(nextOpen);
  };

  const handleFavoritesClick = () => {
    closeMenu();
    onOpenFavorites?.();
  };

  const handleCreateClick = () => {
    closeMenu();
    onOpenCreate?.();
  };

  const handleSignOut = async () => {
    closeMenu();
    await signOut();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        title={session ? "帳號選單" : "登入"}
        aria-label={session ? "帳號選單" : "登入"}
        aria-haspopup={session ? "menu" : undefined}
        aria-expanded={session ? open : undefined}
        onClick={handleUserButtonClick}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-brand-cream text-brand-ink shadow-soft transition hover:bg-white"
      >
        <UserRound className="h-5 w-5" />
      </button>

      {session && open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[1100] w-56 overflow-hidden rounded-[24px] border border-brand-line bg-white shadow-soft dark:bg-[#2A2421]">
          <div className="p-2">
            <button
              type="button"
              onClick={handleFavoritesClick}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-brand-ink transition hover:bg-brand-cream dark:text-white dark:hover:bg-white/10"
            >
              <Heart className="h-4 w-4" />
              <span>我的收藏</span>
            </button>

            <button
              type="button"
              onClick={handleCreateClick}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-brand-ink transition hover:bg-brand-cream dark:text-white dark:hover:bg-white/10"
            >
              <MapPinPlus className="h-4 w-4" />
              <span>新增地點</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-brand-ink transition hover:bg-brand-cream dark:text-white dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}