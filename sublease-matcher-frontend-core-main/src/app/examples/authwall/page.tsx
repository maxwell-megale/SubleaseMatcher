import { AuthWall } from "@/components/auth/authwall/authwall";
export default function Page() {
  return (
    <>
      <AuthWall>
        <h1 className="text-red-600 text-4xl">
          This content should be behind an authwall.
        </h1>
      </AuthWall>
    </>
  );
}
