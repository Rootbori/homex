export type SignupAccountType = "job_seeker" | "job_receiver";
export type SignupProvider = "line" | "google";

export type SignupOption = {
  id: string;
  label: string;
  description: string;
  mapped_role?: string;
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
  id: string;
  status: string;
  message: string;
  profile: {
    full_name: string;
    phone: string;
    email?: string;
    store_name?: string;
    account_type: SignupAccountType;
    provider: SignupProvider;
    mapped_role: string;
  };
  next: {
    provider: SignupProvider;
    provider_ui: string;
    next_path: string;
    hint: string;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "request failed");
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
