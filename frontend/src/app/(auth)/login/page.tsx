"use client"

import { motion } from "framer-motion";
import { Activity, ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7485";

    const handleLogin = () => {
        window.location.href = `${publicApiUrl}/auth/login/google`;
    }

    const handleGuest = () => {
        router.push("/map");
    }

    return (
      <div className="relative w-full h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0f] to-[#0a0a0f] z-0" />
      <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-6 rotate-3">
          <MapPin className="text-white w-10 h-10 absolute -ml-2 -mt-2" />
          <Activity className="text-white/80 w-8 h-8 absolute ml-2 mt-2" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          SportMap
        </h1>
        <p className="text-gray-400 text-center mb-10 text-lg">
          Discover sports places. <br /> Share your journey.
        </p>
        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98] flex items-center justify-center group"
        >
          Sign In With Google
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={handleGuest}
            className="text-gray-500 text-xs hover:text-gray-400 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  )
}
