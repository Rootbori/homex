import type { DefaultSession } from "next-auth";
import type { AuthAccountType, AppRole } from "@/lib/auth-flow";

declare module "next-auth" {
  interface Session {
    accountType?: AuthAccountType;
    appRole?: AppRole;
    provider?: string;
    redirectTo?: string;
    user?: DefaultSession["user"] & {
      id?: string;
      accountType?: AuthAccountType;
      appRole?: AppRole;
      provider?: string;
      providerAccountId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountType?: AuthAccountType;
    appRole?: AppRole;
    provider?: string;
    providerAccountId?: string;
    redirectTo?: string;
  }
}
