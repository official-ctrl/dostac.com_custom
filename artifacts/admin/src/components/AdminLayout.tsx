import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Megaphone,
  Inbox,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Info,
  Settings2,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p) => p === "/" },
  { href: "/banners", label: "Banners", icon: ImageIcon, match: (p) => p.startsWith("/banners") },
  { href: "/about", label: "About", icon: Info, match: (p) => p.startsWith("/about") },
  { href: "/process", label: "Process", icon: Settings2, match: (p) => p.startsWith("/process") },
  { href: "/products", label: "Products", icon: Package, match: (p) => p.startsWith("/products") },
  { href: "/notices", label: "Notices", icon: Megaphone, match: (p) => p.startsWith("/notices") },
  { href: "/inquiries", label: "Inquiries", icon: Inbox, match: (p) => p.startsWith("/inquiries") },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="w-64 shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white">dostac</span>
            <span className="text-xs uppercase tracking-[0.25em] text-sidebar-foreground/60 ml-1">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = item.match(location);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white",
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-white transition-colors"
            data-testid="link-public-site"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public site
          </a>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-white truncate">{user?.name ?? ""}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent/40 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
