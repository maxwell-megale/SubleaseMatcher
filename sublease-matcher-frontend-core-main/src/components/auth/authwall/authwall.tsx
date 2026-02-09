// authwallServer.tsx
import { auth } from "@/auth";
import { AuthWallClient } from "./authwallHelper";
import { SignOut } from "../signout/signout";

type AuthWallProps = {
  children: React.ReactNode;
};

export async function AuthWall({ children }: AuthWallProps) {
  const session = await auth();

  const isAuthenticated = !!session?.user;

  return (
    <AuthWallClient isAuthenticated={isAuthenticated}>
      <h1>{JSON.stringify(session)}</h1>
      <SignOut />
      {children}
    </AuthWallClient>
  );
}
