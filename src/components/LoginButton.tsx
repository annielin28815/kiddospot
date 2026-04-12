"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button title="登出" className="cursor-pointer" onClick={() => signOut()}>
        <LogOut />
      </button>
    );
  }

  return (
    <button title="登入" className="cursor-pointer" onClick={() => signIn("google")}>
      <LogIn />
    </button>
  );
}