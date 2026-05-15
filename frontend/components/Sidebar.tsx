"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, FileText, BarChart3, Settings, PlusCircle,
  ChevronLeft, ChevronRight, LogOut, Shield, Eye, UserCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Beranda"           },
  { href: "/new-application", icon: PlusCircle,    label: "Pengajuan Baru"    },
  { href: "/applications",  icon: FileText,        label: "Daftar Pengajuan"  },
  { href: "/analytics",     icon: BarChart3,       label: "Analisis"          },
  { href: "/settings",      icon: Settings,        label: "Pengaturan", adminOnly: true },
];

const ROLE_CONFIG = {
  admin:          { label: "Administrator",  icon: Shield,    color: "text-amber-400 bg-amber-400/10"  },
  credit_officer: { label: "Petugas Kredit", icon: UserCheck, color: "text-blue-400 bg-blue-400/10"   },
  viewer:         { label: "Pengamat",       icon: Eye,       color: "text-slate-400 bg-slate-400/10" },
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const roleCfg = user ? ROLE_CONFIG[user.role] : ROLE_CONFIG.viewer;
  const RoleIcon = roleCfg.icon;

  return (
    <aside
      className={`
        relative flex flex-col bg-[#0F2544] border-r border-white/5
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[68px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg shrink-0">
          <span className="text-white font-bold text-sm">LA</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm leading-tight">BANK</p>
            <p className="text-slate-400 text-[10px]">Pusat Layanan </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && user?.role !== "admin") return null;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${active
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Officer Info */}
      <div className="px-2 pb-4 space-y-2">
        {user && (
          <div className={`px-3 py-3 rounded-lg bg-white/5 border border-white/5 ${collapsed ? "flex justify-center" : ""}`}>
            {collapsed ? (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white text-xs font-medium truncate">{user.name}</p>
                    <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleCfg.color}`}>
                  <RoleIcon size={9} />
                  {roleCfg.label}
                </span>
              </>
            )}
          </div>
        )}

        <button
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-slate-400 hover:text-red-400 hover:bg-red-400/5
            transition-colors duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#0F2544] border border-white/10
                   flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
