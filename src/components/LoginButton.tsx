"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Heart, LogOut, MapPinPlus, UserRound } from "lucide-react";
import { ui } from "@/src/lib/ui";

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

  const setMenuOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onMenuOpenChange?.(nextOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

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

    setMenuOpen(!open);
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

  const displayName = session?.user?.name || session?.user?.email || "使用者";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        title={session ? "帳號選單" : "登入"}
        aria-label={session ? "帳號選單" : "登入"}
        aria-haspopup={session ? "menu" : undefined}
        aria-expanded={session ? open : undefined}
        onClick={handleUserButtonClick}
        className={`${ui.iconButton} ${ui.iconButtonNeutral} h-11 w-11`}
      >
        <UserRound className="h-5 w-5" />
      </button>

      {session && open && (
        <div
          className={`absolute right-0 top-[calc(100%+10px)] z-[1100] w-60 ${ui.menuPanel}`}
          role="menu"
          aria-label="帳號選單"
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className={`${ui.caption} text-[var(--color-text-muted)]`}>
              已登入
            </p>
            <p
              className={`${ui.bodySm} mt-1 truncate font-medium text-[var(--color-text-primary)]`}
            >
              {displayName}
            </p>
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={handleFavoritesClick}
              className={ui.menuItem}
              role="menuitem"
            >
              <Heart className="h-4 w-4" />
              <span>我的收藏</span>
            </button>

            <button
              type="button"
              onClick={handleCreateClick}
              className={ui.menuItem}
              role="menuitem"
            >
              <MapPinPlus className="h-4 w-4" />
              <span>新增地點</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className={ui.menuItem}
              role="menuitem"
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