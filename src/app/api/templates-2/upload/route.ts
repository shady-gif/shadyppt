import { put } from "@vercel/blob";

import { isTemplateAdminAuthorized } from "@/features/presentations/lib/template-manager-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createSafeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (!isTemplateAdminAuthorized(password)) {
    return Response.json(
      { error: "Invalid admin password." },
      { status: 401 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Blob storage is not connected." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  if (kind !== "pptx" && kind !== "thumbnail") {
    return Response.json({ error: "Invalid upload type." }, { status: 400 });
  }

  if (
    kind === "pptx" &&
    file.type !==
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" &&
    !file.name.toLowerCase().endsWith(".pptx")
  ) {
    return Response.json(
      { error: "Please upload a .pptx file." },
      { status: 400 },
    );
  }

  if (kind === "thumbnail" && !file.type.startsWith("image/")) {
    return Response.json(
      { error: "Please upload an image thumbnail." },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop() || (kind === "pptx" ? "pptx" : "png");
  const safeName = createSafeFileName(file.name) || `${kind}-${Date.now()}`;
  const pathname = `templates/${kind}/${safeName}.${extension}`;
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return Response.json({
    url: blob.url,
    pathname: blob.pathname,
    fileName: file.name,
  });
}
