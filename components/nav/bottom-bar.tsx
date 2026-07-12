"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChefHat, LayoutGrid, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/today", label: "Today", Icon: LayoutGrid },
  { href: "/plan", label: "Plan", Icon: CalendarDays },
  { href: "/recipes", label: "Recipes", Icon: ChefHat },
  { href: "/progress", label: "Progress", Icon: LineChart },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomBar() {
  const pathname = usePathname();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="safe-bottom w-full max-w-[440px] px-4 pb-2">
        <nav className="pointer-events-auto flex items-center justify-between rounded-full border border-line bg-surface/80 px-3 py-2 shadow-card backdrop-blur-xl">
          {TABS.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-fuel" : "text-dim hover:text-muted"
                )}
              >
                <Icon
                  className={cn("size-[22px]", isActive && "drop-shadow-[0_0_8px_rgba(0,229,160,0.5)]")}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
