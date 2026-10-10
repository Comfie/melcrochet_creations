"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { btnPrimary, inputClass, FormError } from "@/components/admin/form";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Phones like to add a trailing space after autocomplete.
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Login failed");
        return;
      }

      // replace, so "back" from the dashboard doesn't land on the login form.
      router.replace("/admin");
    } catch {
      setError("Couldn’t reach the server — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo variant="stacked" className="h-28 w-auto" preload />
          <p className="label mt-6 text-gold-deep">Studio</p>
          <h1 className="mt-2 font-display text-[2rem] font-medium leading-tight text-ink">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/10">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-ink">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${inputClass} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 min-h-10 -translate-y-1/2 rounded-full px-3 text-sm font-semibold text-brown hover:bg-sand"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <FormError message={error} />

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brown/80">You’ll stay signed in on this device for 7 days.</p>
      </div>
    </div>
  );
}
