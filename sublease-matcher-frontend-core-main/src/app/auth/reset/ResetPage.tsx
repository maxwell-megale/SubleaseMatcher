// app/auth/reset/ResetPage.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useActionState } from "react";
import React from "react";
import {
  InputEmail,
  InputPin,
  InputNewPW,
} from "@/components/auth/reset/reset";
import {
  sendResetEmail,
  validatePin,
  resetPassword,
} from "@/components/auth/reset/resetHelper";

type Props = {
  redirectUrl?: string;
  pin?: string;
};

const initialState = { error: false, success: false, message: "", data: "" };

export default function ResetPage({ redirectUrl, pin }: Props) {
  const router = useRouter();

  // which panel to show
  let show: "email" | "pin" | "pw" = pin ? "pin" : "email";

  const [emailState, emailFormAction] = useActionState(
    sendResetEmail,
    initialState,
  );
  const [pinState, pinFormAction] = useActionState(validatePin, initialState);
  const [newPWState, newPWFormAction] = useActionState(
    resetPassword,
    initialState,
  );

  const allStates = [emailState, pinState, newPWState];

  // advance the flow based on success
  show = emailState.success ? "pin" : show;
  show = pinState.success ? "pw" : show;

  useEffect(() => {
    if (!newPWState.error && newPWState.success) {
      if (redirectUrl) router.push(redirectUrl);
      else router.refresh();
    }
  }, [redirectUrl, newPWState, router]);

  return (
    <div className="w-md mx-auto m-3">
      <h3 className="text-2xl">Reset Password</h3>

      {show === "email" && (
        <InputEmail
          formAction={emailFormAction}
          redirectUrl={redirectUrl ?? ""}
        />
      )}

      {show === "pin" &&
        (pin ? (
          <InputPin formAction={pinFormAction} pin={pin} />
        ) : (
          <InputPin formAction={pinFormAction} />
        ))}

      {show === "pw" && (
        <InputNewPW
          formAction={newPWFormAction}
          email={emailState.data}
          pin={pinState.data}
        />
      )}

      {allStates.map((state, i) => (
        <p key={i} className={state.error ? "text-red-600" : "hidden"}>
          {state.message}
        </p>
      ))}
    </div>
  );
}
