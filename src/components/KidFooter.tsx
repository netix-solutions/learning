"use client";
import Link from "next/link";
import { SwitchToParentButton } from "@/components/SwitchToParentButton";
export function KidFooter() {
  return <footer className="mt-auto w-full px-4 pb-6 pt-6"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-3xl border border-white bg-white/90 p-3"><Link href="/home" className="inline-flex min-h-12 items-center rounded-xl px-3 font-bold text-slate-700">⌂ Home</Link><SwitchToParentButton /></div></footer>;
}
