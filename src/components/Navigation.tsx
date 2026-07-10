"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UploadCloud, LogOut, Building2, Users, Database, Target, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, [pathname]);

  // Hide nav on login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const baseNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Targets", href: "/targets", icon: Target },
    { name: "All Data", href: "/reservations", icon: Database },
  ];

  const adminNavItems = [
    { name: "Upload", href: "/upload", icon: UploadCloud },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Target Settings", href: "/admin/targets", icon: Settings },
  ];

  const navItems = role === "ADMIN" ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-auto md:h-16 flex flex-col md:flex-row md:items-center justify-between py-3 md:py-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <span>Booking.com <span className="text-indigo-400">100 ล้าน</span></span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between md:justify-end mt-4 md:mt-0 w-full md:w-auto overflow-x-auto no-scrollbar gap-2 pb-1 md:pb-0">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors ml-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
