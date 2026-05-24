import manifestData from "@/features/presentations/data/templates-2/manifest.json";
import type { TemplateTwoSummary } from "@/features/presentations/data/templates-2";

const TEMPLATE_MANIFEST_KEY = "presentation-generator:templates-2:manifest";

type RedisResult<T> = {
  result?: T;
  error?: string;
};

export type TemplateManagerState = {
  templates: TemplateTwoSummary[];
  storage: "static" | "redis";
  editable: boolean;
};

function getStaticTemplates() {
  return manifestData as TemplateTwoSummary[];
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

async function redisCommand<T>(command: unknown[]) {
  const config = getRedisConfig();

  if (!config) {
    throw new Error("Template storage is not configured.");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Template storage request failed.");
  }

  const payload = (await response.json()) as RedisResult<T>;

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

function normalizeTemplates(templates: TemplateTwoSummary[]) {
  return templates.map((template, index) => {
    const id =
      template.id?.trim() ||
      template.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `template-${index + 1}`;

    return {
      id,
      title: template.title?.trim() || `Template ${index + 1}`,
      href: template.href?.trim() || `/templates-2/${id}`,
      slideCount: Number(template.slideCount) || 1,
      thumbnail: template.thumbnail?.trim() || "",
      source: template.source?.trim() || "",
    };
  });
}

export async function getTemplateManagerState(): Promise<TemplateManagerState> {
  const config = getRedisConfig();

  if (!config) {
    return {
      templates: getStaticTemplates(),
      storage: "static",
      editable: false,
    };
  }

  const storedTemplates = await redisCommand<string | null>([
    "GET",
    TEMPLATE_MANIFEST_KEY,
  ]);

  if (!storedTemplates) {
    const templates = getStaticTemplates();
    await saveManagedTemplates(templates);

    return {
      templates,
      storage: "redis",
      editable: true,
    };
  }

  return {
    templates: normalizeTemplates(JSON.parse(storedTemplates)),
    storage: "redis",
    editable: true,
  };
}

export async function saveManagedTemplates(templates: TemplateTwoSummary[]) {
  await redisCommand([
    "SET",
    TEMPLATE_MANIFEST_KEY,
    JSON.stringify(normalizeTemplates(templates)),
  ]);
}

export function isTemplateAdminAuthorized(password: string | null) {
  const adminPassword = process.env.TEMPLATE_ADMIN_PASSWORD;

  return Boolean(adminPassword && password && password === adminPassword);
}
