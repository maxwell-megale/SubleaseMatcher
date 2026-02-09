// app/auth/reset/page.tsx
import ResetPage from "./ResetPage";

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const redirectUrl =
    typeof sp.redirectUrl === "string" ? sp.redirectUrl : undefined;

  const pin = typeof sp.pin === "string" ? sp.pin : undefined;

  return <ResetPage redirectUrl={redirectUrl} pin={pin} />;
}
