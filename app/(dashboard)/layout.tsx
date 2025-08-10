"use client";

import { Header } from "@/components/layout/header";
import { MainNav } from "@/components/layout/main-nav";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4"
        >
          <MainNav />
        </motion.aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}