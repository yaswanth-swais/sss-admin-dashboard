"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserRound,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { apiFetch } from "../../lib/api";

const navItems = [
  { key: "students", label: "Students", icon: Users },
  { key: "teachers", label: "Teachers", icon: UserRound },
  { key: "others", label: "Others", icon: Bell },
];

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "SSS";
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO || "";
const brandUrl =
  process.env.NEXT_PUBLIC_BRAND_URL;

const schoolName =
  process.env.NEXT_PUBLIC_SCHOOL_NAME || "SSS School";

const schoolLogo =
  process.env.NEXT_PUBLIC_SCHOOL_LOGO || brandLogo;

function BrandLogo({ src, alt, sizeClass = "h-11 w-11" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-xl object-contain`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-xl bg-white text-xs font-black text-[#151b36]`}
      aria-hidden="true"
    >
      {brandName.slice(0, 3).toUpperCase()}
    </div>
  );
}

export default function AdminShell({
  activeTab,
  onTabChange,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [logoutUrl, setLogoutUrl] = useState(
    "https://staging.sss.swais.in/"
  );

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const config = await apiFetch("/api/admin/config");

        const configuredUrl =
          config?.logout_url ||
          config?.logoutUrl ||
          config?.logout_redirect_url;

        if (mounted && configuredUrl) {
          setLogoutUrl(configuredUrl);
        }
      } catch {
        // Keep fallback logout URL.
      }
    }

    loadConfig();

    return () => {
      mounted = false;
    };
  }, []);

  function selectTab(key) {
    onTabChange(key);
    setMobileOpen(false);
  }

  async function confirmLogout() {
    if (logoutBusy) return;

    setLogoutBusy(true);

    try {
      window.location.href = logoutUrl;
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1228] text-white">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/10 bg-[#151b36] px-5 py-6 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* SCHOOL BRANDING */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 text-center">
            <div className="flex justify-center">
              <BrandLogo
                src={schoolLogo}
                alt={`${schoolName} logo`}
                sizeClass="h-16 w-16"
              />
            </div>

            <div className="mt-4 truncate text-lg font-extrabold tracking-tight">
              {schoolName}
            </div>

            <div className="mt-1 text-sm font-semibold text-cyan-300/80">
              Admin Dashboard
            </div>
          </div>

          <button
            type="button"
            className="ml-2 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-9 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left font-semibold transition ${
                  selected
                    ? "bg-gradient-to-r from-[#258af5] to-[#08b9dc] text-white shadow-lg shadow-cyan-950/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3.5 text-left font-semibold text-white/60 transition hover:bg-red-500/10 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex min-h-[78px] items-center justify-between border-b border-white/10 bg-[#171d3b]/95 px-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-2xl">
                Welcome, Admin
              </h1>

              <p className="hidden truncate text-sm text-white/45 sm:block">
                Manage {schoolName} records securely
              </p>
            </div>
          </div>

          {/* BRAND LOGO + NAME */}
          <a
            href={brandUrl}
            className="ml-4 flex shrink-0 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
            aria-label={`Open ${brandName}`}
          >
            <BrandLogo
              src={brandLogo}
              alt={`${brandName} logo`}
              sizeClass="h-10 w-10 sm:h-11 sm:w-11"
            />

            <span className="hidden text-sm font-extrabold tracking-wide text-white sm:inline">
              {brandName}
            </span>
          </a>
        </header>

        {/* CONTENT */}
        <main className="px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          {children}
        </main>
      </div>

      {/* LOGOUT MODAL */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11172d] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              Logout?
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Are you sure you want to leave the Admin Dashboard?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={logoutBusy}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                disabled={logoutBusy}
                className="rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {logoutBusy ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}