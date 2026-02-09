import React from "react";
import { redirect } from "next/navigation";

export default function Page(): React.ReactElement {
    redirect("/seeker/swipe-matcher");
    return <></>;
}