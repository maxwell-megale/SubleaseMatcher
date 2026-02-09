"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopBar, MainBody, CenteredContent, ButtonLinkM, Heading } from "@/components/ui";
import DropdownBox from "@/components/edit-profile/DropdownBox";

type Option = { value: string; label: string };

import { apiClient } from "@/lib/api-client";

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showInSwipe, setShowInSwipe] = useState(true);
  const [role, setRole] = useState("Seeker");
  const [loading, setLoading] = useState(true);

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      const token = (session as any)?.accessToken;
      if (token) {
        try {
          const user = await apiClient.users.getMe(token);
          // Set state from backend
          setEmailNotifications(!!user.email_notifications_enabled);
          setShowInSwipe(user.show_in_swipe !== false); // Default true

          // Role from session is usually fine, but let's sync
          if (session?.user) {
            const currentRole = (session.user as any).role;
            if (currentRole) {
              setRole(currentRole.charAt(0).toUpperCase() + currentRole.slice(1).toLowerCase());
            }
          }
        } catch (err) {
          console.error("Failed to load user settings", err);
        } finally {
          setLoading(false);
        }
      }
    };
    if (session?.user) {
      loadSettings();
    }
  }, [session]);

  const roleOptions: Option[] = [
    { label: "Seeker", value: "Seeker" },
    { label: "Host", value: "Host" },
  ];

  const submit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = (session as any)?.accessToken;
    if (!token) return;

    try {
      // 1. Persist to Backend
      await apiClient.users.updateMe(token, {
        show_in_swipe: showInSwipe,
        email_notifications_enabled: emailNotifications
      });

      // 2. Update Session Role
      await update({ role: role.toUpperCase() });

      // 3. Redirect
      if (role.toUpperCase() === "SEEKER") {
        router.push("/seeker/swipe-matcher");
      } else {
        router.push("/lister/swipe-matcher");
      }
      alert("Settings saved!");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings.");
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/auth/sign-in';
  };

  return (
    <MainBody>
      <TopBar title="Sublease Matcher" />
      <CenteredContent>
        <div className="px-5 pt-8 pb-4 flex flex-col gap-6 max-w-[520px] w-full mx-auto">
          <Heading text="Account Settings" />

          <h2 className="text-lg font-bold text-[var(--primary)]">Preferences</h2>

          <div className="flex justify-between items-center border-4 border-[var(--primary)] rounded-2xl p-4 bg-[var(--card)]">
            <span className="font-bold text-lg text-[var(--foreground)]">Show me in swipe</span>
            <input
              type="checkbox"
              checked={showInSwipe}
              onChange={(e) => setShowInSwipe(e.target.checked)}
              className="w-6 h-6 accent-[var(--primary)]"
            />
          </div>

          <h2 className="text-lg font-bold text-[var(--primary)]">Role</h2>

          <DropdownBox
            placeholder="Select role"
            value={role}
            options={roleOptions}
            onChange={(value: string) => setRole(value)}
            size="md"
          />

          <div className="pt-2">
            <ButtonLinkM onClick={submit}>Submit</ButtonLinkM>
          </div>

          <div className="text-center mt-4 mb-6">
            <button
              className="underline text-[var(--primary)] font-bold uppercase tracking-wide"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </CenteredContent>
    </MainBody>
  );
}
