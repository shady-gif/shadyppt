import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { getTemplateManagerState } from "@/features/presentations/lib/template-manager-store";

export const dynamic = "force-dynamic";

export default async function TemplatesTwoPage() {
  const { templates } = await getTemplateManagerState();

  return (
    <main className="min-h-screen bg-[#11100e] px-5 py-5 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Back home"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                Select a file
              </p>
              <h1 className="text-xl font-medium">Templates 2</h1>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={template.href}
              className="group rounded-lg border border-white/10 bg-white/[0.045] p-3 transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              <div className="relative aspect-video overflow-hidden rounded-md bg-[#ddd9d0]">
                {template.thumbnail ? (
                  <Image
                    src={template.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-cover transition group-hover:scale-[1.02]"
                    unoptimized={template.thumbnail.endsWith(".svg")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="size-8 text-black/35" />
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-white">
                    {template.title}
                  </h2>
                  <p className="mt-1 text-xs text-white/45">
                    {template.slideCount} slides
                  </p>
                </div>

                <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/50">
                  PPTX
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
