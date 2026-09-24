"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/lib/admin/auth-actions";
import { ROLE_LABELS, type AdminUserInfo } from "@/lib/admin/types";

/**
 * Estructura del panel: barra lateral oscura (noche-900) con la navegación,
 * enlaces al programa público y la cuenta actual. En pantallas estrechas la
 * barra se pliega en una cabecera con botón de menú que abre un cajón
 * modal (<dialog>: foco atrapado y Esc para cerrar).
 */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/backstage", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/backstage/programa", label: "Programa", icon: CalendarDays },
  { href: "/backstage/espacios", label: "Espacios", icon: Building2 },
  { href: "/backstage/ajustes", label: "Ajustes", icon: Settings },
  { href: "/backstage/cuentas", label: "Cuentas", icon: Users, adminOnly: true },
];

const PUBLIC_LINKS = [
  { href: "/programa", label: "Ver programa (ES)" },
  { href: "/pt/programa", label: "Ver programa (PT)" },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function initials(user: AdminUserInfo): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function Brand() {
  return (
    <Link
      href="/backstage"
      className="flex items-center gap-2 rounded-md focus-visible:ring-offset-noche-900"
      aria-label="ieTIC 2027 · Panel — Resumen"
    >
      <span className="font-display text-lg font-bold tracking-tight text-white">ieTIC 2027</span>
      <span className="rounded bg-cian-300/15 px-1.5 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.18em] text-cian-300">
        Panel
      </span>
    </Link>
  );
}

function SidebarContent({ user, pathname }: { user: AdminUserInfo; pathname: string }) {
  const items = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");
  return (
    <div className="flex h-full flex-col">
      <div className="hidden px-5 pb-4 pt-5 lg:block">
        <Brand />
      </div>

      <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:ring-offset-noche-900",
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cian-300" aria-hidden="true" />
                  ) : null}
                  <Icon
                    className={cn("h-4 w-4 shrink-0", active ? "text-cian-300" : "text-white/50 group-hover:text-white/80")}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 font-mono text-[0.625rem] font-medium uppercase tracking-[0.18em] text-white/40">
          Web pública
        </p>
        <ul className="mt-1.5 space-y-0.5">
          {PUBLIC_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:ring-offset-noche-900"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                <span>
                  {link.label}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mar-600 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {initials(user)}
          </span>
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium text-white">{user.name || user.email}</p>
            <p className="truncate text-xs text-white/60">
              {user.name ? `${user.email} · ` : ""}
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white focus-visible:ring-offset-noche-900"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ user, children }: { user: AdminUserInfo; children: ReactNode }) {
  const pathname = usePathname() ?? "/backstage";
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Abre / cierra el cajón móvil como diálogo modal
  useEffect(() => {
    const d = drawer.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) {
      d.close();
      toggle.current?.focus();
    }
  }, [open]);

  // Al navegar, se cierra el cajón
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-papel">
      <a
        href="#contenido"
        className="sr-only-focusable fixed left-3 top-3 z-50 rounded-lg bg-white px-3 py-2 text-sm font-medium text-mar-700 shadow-elevada"
      >
        Saltar al contenido
      </a>

      {/* Barra lateral fija (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-noche-900 lg:block" aria-label="Panel de administración">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Cabecera (móvil y tableta) */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-noche-900 px-4 shadow-sm lg:hidden">
        <Brand />
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="panel-menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-offset-noche-900"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Abrir el menú</span>
        </button>
      </header>

      <dialog
        id="panel-menu"
        ref={drawer}
        aria-label="Menú del panel"
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          // Clic en el fondo oscuro (fuera del cajón)
          if (e.target === drawer.current) setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-noche-900 p-0 text-white backdrop:bg-noche-950/60 lg:hidden"
      >
        {open ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-offset-noche-900"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Cerrar el menú</span>
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <SidebarContent user={user} pathname={pathname} />
            </div>
          </div>
        ) : null}
      </dialog>

      <div className="lg:pl-64">
        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
