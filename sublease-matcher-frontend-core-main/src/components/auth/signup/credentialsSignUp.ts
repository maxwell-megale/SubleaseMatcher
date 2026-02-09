"use server";
import { signIn } from "@/auth";
import { signInSchema } from "@/lib/zod";

export type RegisterState = {
  error: boolean;
  success: boolean;
  message: string;
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const credentials = { email: email, password: password };
  try {
    const { email, password } = await signInSchema.parseAsync(credentials);

    // Registation process goes here

    // Finish by logging the user in
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: true, message: "Invalid credentials.", success: false };
    }

    return { error: false, message: "Signed up successfully.", success: true };
  } catch {
    return {
      error: true,
      message:
        "Problem with registration. Check that your email and password are formatted correctly, caps-lock is off, etc.",
      success: false,
    };
  }
}
