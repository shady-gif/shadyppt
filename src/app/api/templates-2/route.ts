import {
  getTemplateManagerState,
  isTemplateAdminAuthorized,
  saveManagedTemplates,
} from "@/features/presentations/lib/template-manager-store";
import type { TemplateTwoSummary } from "@/features/presentations/data/templates-2";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getTemplateManagerState();

  return Response.json(state);
}

export async function PUT(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (!isTemplateAdminAuthorized(password)) {
    return Response.json(
      { error: "Invalid admin password." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { templates?: TemplateTwoSummary[] };

  if (!Array.isArray(body.templates)) {
    return Response.json(
      { error: "Expected a templates array." },
      { status: 400 },
    );
  }

  await saveManagedTemplates(body.templates);

  return Response.json(await getTemplateManagerState());
}
