import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { isTemplateAdminAuthorized } from "@/features/presentations/lib/template-manager-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadPayload = {
  kind?: "pptx" | "thumbnail";
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as UploadPayload;

        if (!isTemplateAdminAuthorized(payload.password || null)) {
          throw new Error("Invalid admin password.");
        }

        if (payload.kind !== "pptx" && payload.kind !== "thumbnail") {
          throw new Error("Invalid upload type.");
        }

        return {
          allowedContentTypes:
            payload.kind === "pptx"
              ? [
                  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ]
              : ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ kind: payload.kind }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not prepare upload.",
      },
      { status: 400 },
    );
  }
}
