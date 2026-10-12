"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  Box,
  LogOut,
  Bell,
  Folder,
  Mail,
  HomeIcon,
  LogOutIcon
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { endPoints } from "@/config";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const router = useRouter();
  const { user, isLoggedIn, logout, firebaseToken, loading: userLoading } = useUser();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (userLoading) return;

      if (!isLoggedIn) {
        router.push("/auth/login");
        return;
      }

      try {
        // Check if user is admin via getRole endpoint
        const res = await adminFetch(endPoints.getRole);

        if (!res.ok) {
          router.replace("/auth/login");
          return;
        }

        const json = await res.json();
        if (json.successful && json.isAdmin) {
          setIsAdmin(true);
        } else {
          await logout();
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.replace("/auth/login");
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAccess();
  }, [firebaseToken, isLoggedIn, userLoading, router, logout]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard />, href: "/admin" },
    { name: "Categories", icon: <Folder />, href: "/admin/categories" },
    { name: "Products", icon: <Box />, href: "/admin/products" },
    { name: "Contact", icon: <Mail />, href: "/admin/contacts" },
    { name: "Orders", icon: <ShoppingCart />, href: "/admin/orders" },
    { name: "Users", icon: <Users />, href: "/admin/users" },
    { name: "Home", icon: <HomeIcon />, href: "https://elhoda.com" },
    { name: "Logout", icon: <LogOutIcon />, action: handleLogout },
  ];

  // Show loading while checking admin status
  if (checkingAdmin || userLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If not admin, don't render (redirect will happen in useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md transition-transform z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:w-64 w-64`}
      >
        <div className="flex items-center justify-center h-20 border-b">
          <h1 className="text-xl font-bold text-emerald-700">El-Hodah Admin</h1>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            item.action ? (
              <button
                key={item.name}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          ))}
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-700 text-white rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 h-16">
          <h2 className="text-lg font-semibold text-gray-800">لوحة التحكم</h2>
          <div className="flex items-center gap-6">
            <Bell className="text-gray-600 cursor-pointer" />
            <span className="font-medium text-gray-700">{user?.name || "Admin"}</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
