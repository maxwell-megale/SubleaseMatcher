"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TopBar, ButtonLinkM, MainBody, CenteredContent, Field, FieldRef } from '@/components/ui';

export default function Page() {
  const emailRef = useRef<FieldRef | null>(null);
  const passwordRef = useRef<FieldRef | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const val = (ref: React.RefObject<FieldRef | null>) => ref.current?.value?.() ?? '';

  const submit = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (submitting) return;
    const email = val(emailRef);
    const password = val(passwordRef);
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/role-select');
      }
    } catch (err) {
      console.error('Sign-in failed', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainBody>
      <TopBar showMenu={false} />

      {/* Content */}
      <CenteredContent>
        <h1 className="text-center text-2xl font-extrabold mb-6">Sign In</h1>

        <Field ref={emailRef} label="Email…" inputType="email" ariaLabel="Email" />

        <Field ref={passwordRef} label="Password…" inputType="password" ariaLabel="Password" />

        <ButtonLinkM onClick={submit}>{submitting ? 'Signing In…' : 'Submit'}</ButtonLinkM>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-px bg-[oklch(0.75_0_0/.7)]" />
          <div className="text-sm text-[oklch(0.45_0_0)]">or</div>
          <div className="flex-1 h-px bg-[oklch(0.75_0_0/.7)]" />
        </div>

        <ButtonLinkM variant="secondary" href="/auth/uwec">UWEC Secure Sign On</ButtonLinkM>

        <div className="min-h-5 text-center text-[color:rgba(0,0,0,.65)] mt-3">{error}</div>

        <div className="mt-4 text-center">
          <Link href="/auth/register" className="underline">
            Don’t have an account? Register
          </Link>
        </div>
      </CenteredContent>
    </MainBody>
  );
}
