"use client";

import Image from "next/image";
import Link from "next/link";
import { MonitorCog, User } from "lucide-react";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src="/homepage-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,205,216,0.06),rgba(9,12,18,0.08)_35%,rgba(3,8,12,0.42)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(0deg,rgba(0,0,0,0.56),transparent)]" />

      <section className="relative z-10 flex min-h-screen items-end justify-end px-6 py-12 sm:px-10 md:px-16 lg:px-24">
        <div className="mb-1 ml-auto flex w-full max-w-[680px] flex-col items-end text-right">
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-normal text-white drop-shadow-[0_5px_22px_rgba(0,0,0,0.52)] sm:text-6xl md:text-7xl">
            Sarrthak Chauhan
          </h1>

          <p className="mt-4 text-3xl font-medium leading-tight tracking-normal text-white/90 drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl">
            MBA 2nd year
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/templates-2"
              className="group inline-flex h-18 min-w-72 items-center justify-center gap-4 rounded-full bg-[linear-gradient(100deg,#dbe5ff,#f6d7ff)] px-9 text-2xl font-semibold text-[#20212a] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_28px_65px_rgba(0,0,0,0.34)] sm:h-20 sm:text-3xl"
            >
              <MonitorCog className="size-9 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:rotate-6 sm:size-10" />
              <span>View Template</span>
            </Link>

            <Link
              href="/contact"
              className="group inline-flex h-18 min-w-72 items-center justify-center gap-4 rounded-full bg-[linear-gradient(100deg,#ceffe2,#d8ffc8)] px-9 text-2xl font-semibold text-[#112a24] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_28px_65px_rgba(0,0,0,0.34)] sm:h-20 sm:text-3xl"
            >
              <User className="size-9 fill-current transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 sm:size-10" />
              <span>Contact सार्थक</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
