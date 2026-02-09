"use client";
import { useState } from "react";
import { Input } from "@/components/ui/default/input";
import { Button } from "@/components/ui/default/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/default/input-otp";

type InputEmailProps = {
  formAction: (formData: FormData) => void;
  redirectUrl?: string;
};

function InputEmail({ formAction, redirectUrl }: InputEmailProps) {
  return (
    <form action={formAction}>
      <Input name="redirectUrl" type="hidden" value={redirectUrl ?? ""} />
      <div className="mx-auto space-y-4">
        <label className="block">
          Email:
          <Input name="email" type="email" required />
        </label>
        <Button type="submit" className="mx-auto mt-3">
          Send Reset Code
        </Button>
      </div>
    </form>
  );
}

type InputPinProps = {
  formAction: (formData: FormData) => void;
  pin?: string;
};
function InputPin({ formAction, pin }: InputPinProps) {
  const [otp, setOtp] = useState(pin);
  return (
    <form action={formAction}>
      <div className="mx-auto space-y-4">
        <label className="block">
          Code sent to your email
          <InputOTP maxLength={6} value={otp} onChange={setOtp} name="pin">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </label>
        <Button type="submit" className="mx-auto mt-3">
          Validate
        </Button>
      </div>
    </form>
  );
}

type InputNewPWProps = {
  formAction: (formData: FormData) => void;
  email: string;
  pin: string;
};
function InputNewPW({ formAction, email, pin }: InputNewPWProps) {
  const minimumPasswordLength = 8;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction}>
      <Input name="pin" type="hidden" value={pin} />
      <Input name="email" type="hidden" value={email} />
      <div className="mx-auto space-y-4">
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
          Change Password
        </Button>
      </div>
    </form>
  );
}

export { InputEmail, InputPin, InputNewPW };
