import React from "react";
import { redirect } from "next/navigation";

export default function Page(): React.ReactElement {
    redirect("/lister/swipe-matcher");
    return <></>;
}