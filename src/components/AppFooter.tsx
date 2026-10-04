"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { KidFooter } from "@/components/KidFooter";

import { isStudentRoute } from '@/lib/student-routes';

export function AppFooter() {
  const pathname = usePathname();
  const isKid =
    isStudentRoute(pathname) || pathname === "/kids" || pathname === "/shop" || pathname === "/collection";

  return isKid ? <KidFooter /> : <SiteFooter />;
}
