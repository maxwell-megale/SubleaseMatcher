"use server";

import { signIn } from "@/auth";
import { signInSchema } from "@/lib/zod";

export type SignInState = {
  error: boolean;
  success: boolean;
  message: string;
};

export async function authenticateUser(
  prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const credentials = { email: email, password: password };
  try {
    const { email, password } = await signInSchema.parseAsync(credentials);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: true, message: "Invalid credentials.", success: false };
    }

    return { error: false, message: "Signed in successfully.", success: true };
  } catch {
    return {
      error: true,
      message:
        "Problem with signing in. Check that your email and password are formatted correctly, caps-lock is off, etc.",
      success: false,
    };
  }
}
