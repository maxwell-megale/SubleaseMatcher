import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const payload = (await request.json()) as LoginBody;
  const { email, password } = payload;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const { user, token } = await apiClient.auth.login({ email, password });
    return NextResponse.json({ message: "Signed in.", account: user, token }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to validate credentials right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
