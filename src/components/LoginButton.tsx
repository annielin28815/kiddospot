"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()}>
        <LogOut />
      </button>
    );
  }

  return (
    <button onClick={() => signIn("google")}>
      <LogIn />
    </button>
  );
}