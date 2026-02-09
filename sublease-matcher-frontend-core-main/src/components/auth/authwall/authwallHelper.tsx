// authwallClient.tsx
"use client";

import React from "react";
import { SignIn } from "../signin/signin";

type AuthWallClientProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
};

export function AuthWallClient({
  children,
  isAuthenticated,
}: AuthWallClientProps) {
  if (!isAuthenticated) {
    return (
      <div className="m-3">
        <SignIn />
      </div>
    );
  }

  return <>{children}</>;
}
