"use client";

import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import type { TemplateTwoSummary } from "@/features/presentations/data/templates-2";

type TemplateManagerResponse = {
  templates: TemplateTwoSummary[];
  storage: "static" | "redis";
  editable: boolean;
};

function createBlankTemplate(index: number): TemplateTwoSummary {
  const id = `template-${index + 1}`;

  return {
    id,
    title: `Template ${index + 1}`,
    href: `/templates-2/${id}`,
    slideCount: 1,
    thumbnail: "",
    source: "",
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);

  return nextItems;
}

export function TemplateAdminClient() {
  const [templates, setTemplates] = useState<TemplateTwoSummary[]>([]);
  const [password, setPassword] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("template-admin-password") || "",
  );
  const [storage, setStorage] = useState<TemplateManagerResponse["storage"]>(
    "static",
  );
  const [editable, setEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const canSave = useMemo(
    () => editable && password.trim().length > 0 && !isSaving,
    [editable, isSaving, password],
  );

  useEffect(() => {
    async function loadTemplates() {
      const response = await fetch("/api/templates-2", {
        cache: "no-store",
      });
      const data = (await response.json()) as TemplateManagerResponse;

      setTemplates(data.templates);
      setStorage(data.storage);
      setEditable(data.editable);
      setIsLoading(false);
    }

    void loadTemplates();
  }, []);

  function updateTemplate(
    index: number,
    field: keyof TemplateTwoSummary,
    value: string,
  ) {
    setTemplates((currentTemplates) =>
      currentTemplates.map((template, templateIndex) =>
        templateIndex === index
          ? {
              ...template,
              [field]: field === "slideCount" ? Number(value) : value,
            }
          : template,
      ),
    );
  }

  async function saveTemplates() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    window.localStorage.setItem("template-admin-password", password);

    try {
      const response = await fetch("/api/templates-2", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ templates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save templates.");
      }

      setTemplates(data.templates);
      setStorage(data.storage);
      setEditable(data.editable);
      setMessage("Saved. Your public templates page will use this order.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadTemplateAsset(
    kind: "pptx" | "thumbnail",
    file: File,
  ) {
    if (!password.trim()) {
      throw new Error("Enter your admin password before uploading.");
    }

    const extension = file.name.split(".").pop() || (kind === "pptx" ? "pptx" : "png");
    const safeName =
      file.name
        .trim()
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `${kind}-${Date.now()}`;

    const blob = await upload(`templates/${kind}/${safeName}.${extension}`, file, {
      access: "public",
      handleUploadUrl: "/api/templates-2/upload",
      clientPayload: JSON.stringify({ kind, password }),
    });

    return {
      url: blob.url,
      fileName: file.name,
    };
  }

  async function addUploadedPpt(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const upload = await uploadTemplateAsset("pptx", file);
      const uploadedUrl = upload.url || "";
      const title = file.name.replace(/\.pptx$/i, "").trim() || "Uploaded PPT";
      const id =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `uploaded-${Date.now()}`;

      setTemplates((currentTemplates) => [
        ...currentTemplates,
        {
          id,
          title,
          href: uploadedUrl,
          slideCount: 1,
          thumbnail: "",
          source: uploadedUrl,
        },
      ]);
      setMessage(
        "PPT uploaded. Add a thumbnail if you want, then click Save changes.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadThumbnail(index: number, file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const upload = await uploadTemplateAsset("thumbnail", file);
      updateTemplate(index, "thumbnail", upload.url || "");
      setMessage("Thumbnail uploaded. Click Save changes to publish it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#11100e] px-5 py-5 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/templates-2"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to templates"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Backend manager
              </p>
              <h1 className="text-xl font-medium">Templates</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void saveTemplates()}
            disabled={!canSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </header>

        <section className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:grid-cols-[1fr_280px] sm:items-end">
          <div>
            <p className="text-sm font-medium text-white/80">
              Storage: {storage === "redis" ? "Connected" : "Not connected"}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/48">
              Upload PPT files, rename cards, reorder templates, and publish the
              changes to your public templates page.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/35">
              Admin password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
              placeholder="Set in Vercel env"
            />
          </label>
        </section>

        {message ? (
          <p className="mb-4 rounded-lg border border-white/10 bg-black/24 px-4 py-3 text-sm text-white/70">
            {message}
          </p>
        ) : null}

        <section className="mb-5 rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-white/80">Upload PPT</h2>
              <p className="mt-1 text-sm leading-6 text-white/45">
                This creates a template card that opens the uploaded PPT file.
                Editable slide conversion can be added as the next step.
              </p>
            </div>

            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isUploading ? "Uploading..." : "Choose PPTX"}
              <input
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="sr-only"
                disabled={isUploading}
                onChange={(event) => {
                  void addUploadedPpt(event.target.files?.[0] || null);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center text-white/45">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Loading templates
          </div>
        ) : (
          <section className="space-y-3">
            {templates.map((template, index) => (
              <article
                key={`${template.id}-${index}`}
                className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 lg:grid-cols-[88px_1fr_110px]"
              >
                <div className="flex gap-2 lg:flex-col">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      setTemplates((currentTemplates) =>
                        moveItem(currentTemplates, index, index - 1),
                      )
                    }
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Move template up"
                  >
                    <ArrowUp className="size-4" />
                  </button>

                  <button
                    type="button"
                    disabled={index === templates.length - 1}
                    onClick={() =>
                      setTemplates((currentTemplates) =>
                        moveItem(currentTemplates, index, index + 1),
                      )
                    }
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Move template down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/35">
                      Title
                    </span>
                    <input
                      value={template.title}
                      onChange={(event) =>
                        updateTemplate(index, "title", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-white/35">ID</span>
                    <input
                      value={template.id}
                      onChange={(event) =>
                        updateTemplate(index, "id", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-white/35">
                      Route
                    </span>
                    <input
                      value={template.href}
                      onChange={(event) =>
                        updateTemplate(index, "href", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-white/35">
                      Slide count
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={template.slideCount}
                      onChange={(event) =>
                        updateTemplate(index, "slideCount", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs text-white/35">
                      Thumbnail
                    </span>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={template.thumbnail}
                        onChange={(event) =>
                          updateTemplate(index, "thumbnail", event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                      />
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/8 px-3 text-sm text-white/72 transition hover:bg-white/12 hover:text-white">
                        <Upload className="size-4" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={isUploading}
                          onChange={(event) => {
                            void uploadThumbnail(
                              index,
                              event.target.files?.[0] || null,
                            );
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs text-white/35">
                      PPT source
                    </span>
                    <input
                      value={template.source}
                      onChange={(event) =>
                        updateTemplate(index, "source", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-white/35"
                    />
                  </label>
                </div>

                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setTemplates((currentTemplates) =>
                        currentTemplates.filter(
                          (_template, templateIndex) => templateIndex !== index,
                        ),
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 text-sm text-red-100 transition hover:bg-red-500/18"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}

            <button
              type="button"
              onClick={() =>
                setTemplates((currentTemplates) => [
                  ...currentTemplates,
                  createBlankTemplate(currentTemplates.length),
                ])
              }
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-4 text-sm font-medium text-white/75 transition hover:bg-white/12 hover:text-white"
            >
              <Plus className="size-4" />
              Add template
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
