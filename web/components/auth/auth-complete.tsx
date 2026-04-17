"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, LogOut, RefreshCcw, ShieldCheck, Snowflake, TriangleAlert } from "lucide-react";
import { signOutAction } from "@/app/login/actions";

type AuthCompleteViewProps = {
  fallbackPath: string;
};

type SyncPayload = {
  status?: string;
  message?: string;
  error?: string;
  next?: {
    next_path?: string;
  };
};

export function AuthCompleteView({ fallbackPath }: Readonly<AuthCompleteViewProps>) {
  const [state, setState] = useState<{
    status: "loading" | "error";
    message?: string;
    error?: string;
  }>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function completeLogin() {
      try {
        const response = await fetch("/api/public/auth/oauth-sync", {
          method: "POST",
        });
        const payload = (await response.json()) as SyncPayload;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setState({
            status: "error",
            message: payload.message ?? "ยังไม่สามารถเชื่อมบัญชีเข้าระบบได้",
            error: payload.error,
          });
          return;
        }

        const nextPath = payload.next?.next_path ?? fallbackPath;
        globalThis.location.replace(nextPath);
      } catch {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          message: "ยังไม่สามารถเชื่อมต่อระบบเพื่อยืนยันบัญชีได้",
          error: "network_error",
        });
      }
    }

    completeLogin();

    return () => {
      active = false;
    };
  }, [fallbackPath]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Gradient background matching login */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-300 opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-300 opacity-15 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-[22rem] animate-in">
          <div className="rounded-3xl bg-white/70 p-8 text-center shadow-xl shadow-black/[0.03] ring-1 ring-white/80 backdrop-blur-xl">
            {state.status === "loading" ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <Snowflake className="h-8 w-8 animate-spin-slow text-white" />
                  </div>
                </div>
                
                <h1 className="headline-font mb-2 text-2xl font-extrabold tracking-tight text-on-surface">
                  กำลังยืนยันตัวตน
                </h1>
                <p className="text-sm leading-relaxed text-on-surface-variant/60">
                  ระบบกำลังเชื่อม LINE หรือ Gmail<br />เข้ากับบัญชี Homex ของคุณ
                </p>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/30">
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  <span>โปรดรอสักครู่</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-500/25">
                  <TriangleAlert className="h-8 w-8 text-white" />
                </div>

                <h1 className="headline-font mb-2 text-2xl font-extrabold tracking-tight text-on-surface">
                  พบข้อผิดพลาด
                </h1>
                <p className="mb-6 text-sm leading-relaxed text-on-surface-variant/60">
                  {state.message ?? "ยังไม่สามารถเชื่อมบัญชีเข้าระบบได้"}
                </p>

                <div className="grid w-full gap-2">
                  <button
                    type="button"
                    onClick={() => globalThis.location.reload()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    ลองอีกครั้ง
                  </button>

                  <Link
                    href="/login"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-on-surface ring-1 ring-black/[0.05] transition-all hover:bg-surface-container-low active:scale-[0.97]"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    กลับไปหน้า Login
                  </Link>
                  
                  <form action={signOutAction} className="mt-2">
                    <input name="redirectTo" type="hidden" value="/login" />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface-variant"
                    >
                      <LogOut className="h-3 w-3" />
                      เปลี่ยนบัญชีใหม่
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
