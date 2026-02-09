"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { useActionState } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { registerUser } from "./credentialsSignUp";
import { Input } from "@/components/ui/default/input";
import { Button } from "@/components/ui/default/button";

const initialState = { error: false, success: false, message: "" };
type RegisterProps = {
  redirectUrl?: string;
};
const minimumPasswordLength = 8;
function SignUp({ redirectUrl }: RegisterProps) {
  const [state, formAction] = useActionState(registerUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (!state.error && state.success) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.refresh();
      }
    }
  }, [redirectUrl, state, router]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction}>
      <div className="w-md mx-auto space-y-4">
        <h3 className="text-2xl">Sign Up</h3>
        <label className="block">
          First Name:
          <Input name="fName" type="text" required />
        </label>

        <label className="block">
          Last Name:
          <Input name="lName" type="text" required />
        </label>

        <label className="block">
          Email:
          <Input name="email" type="email" required />
        </label>

        <label className="block">
          Password (Please use {minimumPasswordLength}+ characters):
          <Input
            name="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {password.length < minimumPasswordLength && (
          <p className={""}>
            (Your password is currently less than {minimumPasswordLength}{" "}
            characters.)
          </p>
        )}

        <label className="block">
          Confirm Password:
          <Input
            name="password"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {password != confirmPassword && (
          <p className={"text-red-600"}>Passwords don&apos;t match.</p>
        )}

        <Button
          type="submit"
          disabled={
            password != confirmPassword ||
            password.length < minimumPasswordLength
          }
          className="mx-auto mt-3"
        >
          Sign Up
        </Button>
        {state?.message && (
          <p className={state.error ? "text-red-600" : "text-green-600"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export { SignUp };
