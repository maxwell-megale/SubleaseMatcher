import { emailSchema, passwordSchema } from "@/lib/zod";

export type ResetState = {
  error: boolean;
  success: boolean;
  message: string;
  data: string;
};

async function sendResetEmail(
  prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const emailFromForm = formData.get("email") as string;
  const redirectUrl = formData.get("redirectUrl") as string;
  try {
    const { email } = await emailSchema.parseAsync({ email: emailFromForm });

    // Code to send email pin here
    console.log(redirectUrl);

    return {
      error: false,
      message: "Code sent successfully.",
      success: true,
      data: email,
    };
  } catch {
    return {
      error: true,
      message:
        "There's a problem with your email. Please check that it's formatted correctly.",
      success: false,
      data: emailFromForm,
    };
  }
}

async function validatePin(
  prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const pinFromForm = formData.get("pin") as string;
  try {
    // Code to validate pin sent via email here

    return {
      error: false,
      message: "Code validated successfully.",
      success: true,
      data: pinFromForm,
    };
  } catch {
    return {
      error: true,
      message:
        "There's a problem with the code. Please check that it's formatted correctly.",
      success: false,
      data: pinFromForm,
    };
  }
}

async function resetPassword(
  prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const emailFromForm = formData.get("email") as string;
  const passwordFromForm = formData.get("password") as string;
  const pinFromForm = formData.get("pin") as string;
  try {
    const { password } = await passwordSchema.parseAsync({
      password: passwordFromForm,
    });
    // Code to reset password here
    console.log(emailFromForm, pinFromForm, password);

    return {
      error: false,
      message: "Password reset successfully.",
      success: true,
      data: "",
    };
  } catch {
    return {
      error: true,
      message:
        "There's a problem with your password. Please check that it's formatted correctly.",
      success: false,
      data: "",
    };
  }
}

export { sendResetEmail, validatePin, resetPassword };
