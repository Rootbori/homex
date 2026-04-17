export type SignupAccountType = "user" | "staff";
export type SignupProvider = "line" | "google";

export type SignupOption = {
  id: string;
  label: string;
  description: string;
  user_type?: string;
  next_path?: string;
  accent?: string;
};

export type SignupOptionsResponse = {
  title: string;
  subtitle: string;
  defaults: {
    account_type: SignupAccountType;
    provider: SignupProvider;
  };
  account_types: SignupOption[];
  providers: SignupOption[];
};

export type SignupPayload = {
  full_name: string;
  phone: string;
  email?: string;
  store_name?: string;
  account_type: SignupAccountType;
  provider: SignupProvider;
  accept_terms: boolean;
};

export type SignupResponse = {
  id: string | number;
  status: string;
  message: string;
  signup_token?: string;
  user?: {
    id: number;
    type: string;
    full_name: string;
    phone?: string;
    email?: string;
    avatar_url?: string;
  };
  store?: {
    id: number;
    name: string;
  };
  membership?: {
    id: number;
    role: string;
    label?: string;
  };
  profile: {
    full_name: string;
    phone: string;
    email?: string;
    store_name?: string;
    account_type: SignupAccountType;
    user_type?: string;
    provider: SignupProvider;
    default_role?: string;
  };
  next: {
    action?: string;
    provider: SignupProvider;
    provider_ui: string;
    next_path: string;
    hint: string;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? "request failed");
  }

  return payload;
}

export async function getSignupOptions() {
  const response = await fetch("/api/public/auth/signup-options", {
    method: "GET",
    cache: "no-store",
  });

  return readJson<SignupOptionsResponse>(response);
}

export async function submitSignup(payload: SignupPayload) {
  const response = await fetch("/api/public/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readJson<SignupResponse>(response);
}
