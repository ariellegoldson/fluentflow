"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { ParticlesHeader } from "@/components/particles-header";
import { Suspense } from "react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="relative border-b border-gray-200 bg-white overflow-hidden">
      {/* Particle Background */}
      <Suspense fallback={null}>
        <ParticlesHeader />
      </Suspense>
      
      <div className="relative z-10 flex h-16 items-center justify-between px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <h1 className="text-2xl font-bold text-brand-pink-dark" style={{ fontFamily: 'Brush Script MT, cursive' }}>
            FluentFlow
          </h1>
        </motion.div>

        <div className="flex items-center space-x-4">
          {session?.user && (
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{session.user.name || session.user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}