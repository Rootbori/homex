"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { signOutAction } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

export function AuthCompleteView({ fallbackPath }: AuthCompleteViewProps) {
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
        window.location.replace(nextPath);
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
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex min-h-screen max-w-sm items-center px-5 py-8 sm:max-w-md md:max-w-lg">
        <Card className="w-full rounded-[1.75rem] border border-border/20">
          <CardContent className="space-y-5 p-5">
            {state.status === "loading" ? (
              <>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </span>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Homex Auth
                  </p>
                  <h1 className="headline-font text-2xl font-bold text-on-surface">
                    กำลังยืนยันบัญชี
                  </h1>
                  <p className="text-sm leading-6 text-on-surface-variant">
                    ระบบกำลังเชื่อม LINE หรือ Gmail เข้ากับบัญชีในฐานข้อมูลของคุณ
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                  ใช้เวลาเพียงไม่กี่วินาที แล้วระบบจะพาเข้าสู่หน้าถัดไปให้อัตโนมัติ
                </div>
              </>
            ) : (
              <>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-error/10 text-error">
                  <TriangleAlert className="h-6 w-6" />
                </span>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-error">
                    Sync Error
                  </p>
                  <h1 className="headline-font text-2xl font-bold text-on-surface">
                    ยังเชื่อมบัญชีไม่สำเร็จ
                  </h1>
                  <p className="text-sm leading-6 text-on-surface-variant">
                    {state.message ?? "กรุณาลองใหม่อีกครั้ง"}
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                  หากเป็นการเข้าใช้ครั้งแรก ระบบจะพยายามสร้างบัญชีและผูกสิทธิ์ให้อัตโนมัติจากประเภทผู้ใช้ที่คุณเลือก
                </div>

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-[1.4rem]",
                    )}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    ลองอีกครั้ง
                  </button>

                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full rounded-[1.4rem]",
                    )}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    กลับไปหน้าเข้าสู่ระบบ
                  </Link>

                  <form action={signOutAction}>
                    <input name="redirectTo" type="hidden" value="/login" />
                    <Button type="submit" size="lg" variant="ghost" className="w-full rounded-[1.4rem]">
                      ออกจากระบบแล้วเปลี่ยนบัญชี
                    </Button>
                  </form>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
