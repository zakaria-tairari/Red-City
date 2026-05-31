import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Menu,
  Search,
  Shield,
  User,
  X,
  LogOut,
  Globe,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useSearchStore } from "../../store/useSearchStore";
import { useAuthStore } from "@/store/useAuthStore";

const navLinks = [
  { name: "common.home", to: "/" },
  { name: "common.exploreLink", to: "/explore" },
  { name: "categories.restaurants", to: "/explore?category=2" },
  { name: "categories.hotelsShort", to: "/explore?category=7" },
  { name: "categories.activites", to: "/explore?category=3" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t } = useTranslation();
  const location = useLocation();

  const { toggle } = useSearchStore();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();

  const userIsAdmin = isAdmin();

  const isLinkActive = to => location.pathname + location.search === to;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-stone-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Red <span className="text-primary-600">City</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isLinkActive(link.to)
                  ? "text-primary-700"
                  : "text-stone-600 hover:text-primary-600",
              )}
            >
              {t(link.name)}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggle()}
            aria-label={t("nav.search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Authenticated User */}
          {isAuthenticated ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <User className="h-4 w-4" />

                  <span className="text-sm font-medium">
                    {user?.username || t("nav.dashboard")}
                  </span>
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={12}
                  className="z-50 min-w-60 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl"
                >
                  {/* User Info */}
                  <div className="border-b border-stone-100 px-3 py-3">
                    <p className="text-sm font-semibold text-stone-900">
                      {user?.first_name} {user?.last_name}
                    </p>

                    <p className="truncate text-xs text-stone-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* Dashboard */}
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard/profile"
                      className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-700 outline-none transition hover:bg-stone-100"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenu.Item>

                  {/* Favorites */}
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/dashboard"
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-700 outline-none transition hover:bg-stone-100"
                    >
                      <Heart className="h-4 w-4" />
                      {t("nav.favorites")}
                    </Link>
                  </DropdownMenu.Item>

                  {/* Admin */}
                  {userIsAdmin && (
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/admin"
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary-700 outline-none transition hover:bg-primary-50"
                      >
                        <Shield className="h-4 w-4" />
                        {t("nav.adminPanel")}
                      </Link>
                    </DropdownMenu.Item>
                  )}

                  {/* Language */}
                  <div className="my-2 border-t border-stone-100" />

                  <div className="flex items-center justify-between rounded-xl px-3 py-2">
                    <div className="flex items-center gap-3 text-sm text-stone-700">
                      <Globe className="h-4 w-4" />
                      {t("nav.language")}
                    </div>

                    <LanguageSwitcher />
                  </div>

                  {/* Logout */}
                  <div className="my-2 border-t border-stone-100" />

                  <DropdownMenu.Item
                    onSelect={() => logout()}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 outline-none transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="flex gap-2 items-center justify-center">
              <Button variant="ghost" asChild>
                <Link to="/login">{t("auth.login")}</Link>
              </Button>
              <LanguageSwitcher />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-stone-100 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 hover:bg-stone-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.name)}
                </Link>
              ))}

              <button
                onClick={() => {
                  toggle();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                <Search className="h-5 w-5" />
                {t("nav.searchPlaces")}
              </button>

              <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("nav.profile")}
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("nav.favorites")}
                      </Link>
                    </Button>

                    {userIsAdmin && (
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          {t("nav.adminPanel")}
                        </Link>
                      </Button>
                    )}

                    <div className="flex justify-center py-2">
                      <LanguageSwitcher />
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      {t("auth.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        {t("auth.login")}
                      </Link>
                    </Button>

                    <Button asChild className="w-full">
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        {t("auth.register")}
                      </Link>
                    </Button>

                    <div className="flex justify-center pt-2">
                      <LanguageSwitcher />
                    </div>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
