import { ReactNode, useState, useEffect } from "react";
import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import {
  IconLayoutDashboard,
  IconBooks,
  IconChecklist,
  IconClock,
  IconRobot,
  IconPencilCheck,
  IconTrendingUp,
  IconSettings,
  IconLogout,
  IconBell,
  IconFlame,
  IconMenu2,
  IconShield,
  IconCrown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof IconLayoutDashboard;
  badge?: string;
};

const NAV_PRINCIPAL: NavItem[] = [
  { to: "/dashboard", label: "Dashboard",       icon: IconLayoutDashboard },
  { to: "/topicos",   label: "Temas",           icon: IconBooks },
  { to: "/exame",     label: "Simulação Exame", icon: IconClock },
];

const NAV_FERRAMENTAS: NavItem[] = [
  { to: "/tutor",    label: "Tutor IA",     icon: IconRobot, badge: "Beta" },
  { to: "/premium",  label: "Premium",      icon: IconCrown },
];

function pageTitleFor(path: string): { title: string; cta?: { label: string; to: string } } {
  if (path.startsWith("/dashboard")) return { title: "Dashboard", cta: { label: "Simular Exame", to: "/exame" } };
  if (path.startsWith("/topicos"))   return { title: "Temas" };
  if (path.startsWith("/quiz"))      return { title: "Quiz" };
  if (path.startsWith("/exame"))     return { title: "Simulação de Exame" };
  if (path.startsWith("/tutor"))     return { title: "Tutor IA" };
  if (path.startsWith("/premium"))   return { title: "Premium" };
  if (path.startsWith("/admin"))     return { title: "Administração" };
  return { title: "Economia A Trainer" };
}

function initialsOf(name?: string | null, email?: string | null) {
  const src = (name?.trim() || email?.split("@")[0] || "?").trim();
  const parts = src.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut, user, loading } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const path = router.state.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Colapsar automaticamente em viewports < 1100px (spec)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        A carregar…
      </div>
    );
  }
  if (!user) {
    return <RedirectToAuth />;
  }

  const { title, cta } = pageTitleFor(path);
  const initials = initialsOf(profile?.display_name, user.email);
  const sidebarWidth = collapsed ? "md:w-14" : "md:w-[232px]";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
          sidebarWidth
        )}
      >
        <SidebarContents collapsed={collapsed} path={path} isAdmin={isAdmin} />
        <SidebarFooter
          collapsed={collapsed}
          initials={initials}
          name={profile?.display_name ?? user.email ?? ""}
          roleLabel={isAdmin ? "Coordenação" : "Aluno"}
          onSignOut={async () => { await signOut(); navigate({ to: "/auth" }); }}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col">
            <SidebarContents collapsed={false} path={path} isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter
              collapsed={false}
              initials={initials}
              name={profile?.display_name ?? user.email ?? ""}
              roleLabel={isAdmin ? "Coordenação" : "Aluno"}
              onSignOut={async () => { await signOut(); navigate({ to: "/auth" }); }}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Topbar */}
        <header className="h-14 shrink-0 border-b border-border bg-card px-4 md:px-6 flex items-center gap-3">
          <button
            className="md:hidden rounded-md p-2 hover:bg-secondary"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <IconMenu2 size={20} />
          </button>
          <h1 className="text-[15px] font-semibold tracking-tight truncate">{title}</h1>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.95_0.04_60)] px-3 py-1 text-[11px] font-medium text-[var(--warning)]">
              <IconFlame size={14} /> {profile?.current_streak ?? 0} dias seguidos
            </span>
            <button className="rounded-md p-2 hover:bg-secondary" aria-label="Notificações">
              <IconBell size={18} />
            </button>
            {cta && (
              <Link
                to={cta.to}
                className="hidden sm:inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContents({
  collapsed,
  path,
  isAdmin,
  onNavigate,
}: {
  collapsed: boolean;
  path: string;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-4">
      <Link to="/dashboard" onClick={onNavigate} className="mb-4 flex items-center gap-2 px-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-serif text-lg">
          €
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight">Economia A</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Trainer</div>
          </div>
        )}
      </Link>

      <SidebarSection
        label="Principal"
        items={NAV_PRINCIPAL}
        path={path}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
      <SidebarSection
        label="Ferramentas"
        items={NAV_FERRAMENTAS}
        path={path}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
      {isAdmin && (
        <SidebarSection
          label="Gestão"
          items={[{ to: "/admin", label: "Administração", icon: IconShield }]}
          path={path}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/auth" });
  }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      A redirecionar…
    </div>
  );
}

function SidebarSection({
  label,
  items,
  path,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  path: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-3 px-2">
      {!collapsed && (
        <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-secondary"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-accent-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SidebarFooter({
  collapsed,
  initials,
  name,
  roleLabel,
  onSignOut,
}: {
  collapsed: boolean;
  initials: string;
  name: string;
  roleLabel: string;
  onSignOut: () => void;
}) {
  return (
    <div className="border-t border-sidebar-border p-3">
      <div className={cn("flex items-center gap-2.5", collapsed && "flex-col")}>
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
          style={{ backgroundColor: "var(--role-student)" }}
          aria-hidden
        >
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{name}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{roleLabel}</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onSignOut}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Terminar sessão"
            title="Terminar sessão"
          >
            <IconLogout size={16} />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={onSignOut}
          className="mt-2 grid w-full place-items-center rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Terminar sessão"
          title="Terminar sessão"
        >
          <IconLogout size={16} />
        </button>
      )}
    </div>
  );
}
