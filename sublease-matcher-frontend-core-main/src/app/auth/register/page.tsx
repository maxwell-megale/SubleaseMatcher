'use client';

import React, { useRef, useState } from 'react';
import { TopBar, Field, ButtonLinkM, FieldRef, MainBody, CenteredContent } from '@/components/ui';

/** ── Page ────────────────────────────────────────────────────────────────── */
export default function Page() {
  const MIN = 8;

  const fRef = useRef<FieldRef | null>(null);
  const lRef = useRef<FieldRef | null>(null);
  const eRef = useRef<FieldRef | null>(null);
  const pRef = useRef<FieldRef | null>(null);
  const cRef = useRef<FieldRef | null>(null);

  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use FieldRef's value() API to read the content of forwarded refs
  const val = (r: React.RefObject<FieldRef | null>) => r.current?.value?.() || '';

  const submit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (submitting) return;
  const first = val(fRef);
  const last = val(lRef);
  const email = val(eRef);
  const pass = val(pRef);
  const cpass = val(cRef);

    setErr('');
    setSuccess('');

    if (!first || !last || !email || !pass || !cpass) {
      setErr('Please fill all fields.');
      return;
    }
    if (pass.length < MIN) {
      setErr(`Password must be at least ${MIN} characters.`);
      return;
    }
    if (pass !== cpass) {
      setErr("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: first,
          lastName: last,
          email,
          password: pass,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErr(data?.error || 'Unable to create your account.');
        return;
      }
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => window.location.assign('/auth/sign-in'), 800);
    } catch (error) {
      console.error('Registration failed', error);
      setErr('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainBody>
      <TopBar showMenu={false} />

      <CenteredContent>
        <div className="text-center font-extrabold text-[22px] drop-shadow-[0_2px_0_rgba(0,0,0,.25)]">
          Create your account
        </div>

        <Field ref={fRef} label="First Name…" inputType="text" ariaLabel="First Name" />
        <Field ref={lRef} label="Last Name…" inputType="text" ariaLabel="Last Name" />
        <Field ref={eRef} label="Email…" inputType="text" ariaLabel="Email" />
        <Field ref={pRef} label={`Password… (min ${MIN})`} inputType="password" ariaLabel="Password" />
        <Field ref={cRef} label="Confirm Password…" inputType="password" ariaLabel="Confirm Password" />

        <ButtonLinkM onClick={submit}>
          {submitting ? 'Creating Account…' : 'Create Account'}
        </ButtonLinkM>

        {/* OR */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-[2px] bg-[#dbe8ff]" />
          <div className="text-[color:rgba(0,0,0,.6)]">or</div>
          <div className="flex-1 h-[2px] bg-[#dbe8ff]" />
        </div>

        <ButtonLinkM href="/auth/uwec" variant="secondary">
          UWEC Secure Sign On
        </ButtonLinkM>

        <div className="min-h-5 text-center text-[color:rgba(0,0,0,.65)]">{err || success}</div>
        <div className="text-center">
          <a href="/auth/sign-in">Already have an account? Sign In</a>
        </div>
      </CenteredContent>
    </MainBody>
  );
}
