import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const payload = (await request.json()) as RegisterBody;
  const { email, password, firstName, lastName } = payload;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const { user, token } = await apiClient.auth.register({
      email,
      password,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    });

    return NextResponse.json(
      {
        message: "Account created.",
        account: user,
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to register account.";
    // Check for specific backend error messages if needed
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
