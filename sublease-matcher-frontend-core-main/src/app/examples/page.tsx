// lib/getDocsPaths.ts
import fs from "fs";
import path from "path";
import Link from "next/link";

import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/default/card";

function getExamplesPaths() {
  const basePath = path.join(process.cwd(), "src", "app", "examples");
  const entries = fs.readdirSync(basePath, { withFileTypes: true });

  const dirsWithPages = entries
    .filter((entry) => entry.isDirectory())
    .filter((dir) => {
      const pagePath = path.join(basePath, dir.name, "page.tsx");
      return fs.existsSync(pagePath);
    });
  return dirsWithPages.map((dirent) => dirent.name);
}

export default function Page() {
  const pages = getExamplesPaths();

  return (
    <div className="container mx-auto">
      <h2 className="text-xl">Example components links</h2>
      {pages.map((page, id) => (
        <Card key={id} className="w-full m-2">
          <CardHeader>
            <CardTitle>{page}</CardTitle>
            <CardDescription>
              <Link href={`examples/` + page}>Go to {page}</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="border m-2">
            <iframe
              src={`examples/` + page}
              style={{ width: "100%", height: "300px;" }}
            ></iframe>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
