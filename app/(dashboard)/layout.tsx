import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Blocks, Key, LayoutDashboard, FlaskConical } from "lucide-react";

const navItems = [
  { href: "/plugins", label: "Plugins", icon: Blocks },
  { href: "/api-keys", label: "API Keys", icon: Key },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/plugins" className="flex items-center gap-2 font-semibold">
            <FlaskConical className="h-5 w-5 text-primary" />
            <span>SME-Plug</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { avatarBox: "h-8 w-8" },
            }}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
