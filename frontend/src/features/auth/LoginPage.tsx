import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../../components/ui/label";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { useLoginMutation } from "./authApi";

const DEV_ACCOUNTS = [
  { label: "Super Admin", email: "admin@hrms.test" },
  { label: "Dept. Manager", email: "manager@hrms.test" },
  { label: "HR Manager", email: "hr@hrms.test" },
  { label: "Employee (Alex)", email: "employee1@hrms.test" },
  { label: "Employee (Jamie)", email: "employee2@hrms.test" },
];
const DEV_PASSWORD = "Test@1234";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectTo =
    (location.state as { from?: string })?.from ?? "/dashboard";

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => navigate(redirectTo, { replace: true }),
    });
  };

  const fillDevAccount = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEV_PASSWORD, { shouldValidate: true });
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-lg font-bold text-accent-foreground">
            H
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            HRMS
          </span>
        </div>

        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            Every review, every hour, every chain of command — one record.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Attendance, leave, goals, and performance reviews, tracked against a
            single source of truth for who reports to whom.
          </p>
        </div>

        <svg
          className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-primary-foreground/10"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="60" cy="30" r="6" fill="currentColor" />
          <circle cx="140" cy="30" r="6" fill="currentColor" />
          <circle cx="100" cy="90" r="6" fill="currentColor" />
          <circle cx="40" cy="150" r="6" fill="currentColor" />
          <circle cx="100" cy="150" r="6" fill="currentColor" />
          <circle cx="160" cy="150" r="6" fill="currentColor" />
          <path
            d="M60 30 L100 90 M140 30 L100 90 M100 90 L40 150 M100 90 L100 150 M100 90 L160 150"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
              H
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              HRMS
            </span>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Sign in
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your work email and password to continue.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginMutation.isError && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {(loginMutation.error as any)?.response?.data?.message ??
                    "Couldn't sign in. Check your email and password and try again."}
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8 rounded-lg border border-dashed border-border p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Quick sign-in — test accounts (dev only, password: Test@1234)
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {DEV_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDevAccount(acc.email)}
                    className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-muted"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
