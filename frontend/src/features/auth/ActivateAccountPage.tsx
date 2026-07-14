import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MailQuestion,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/common/Loader";
import {
  setPasswordSchema,
  resendActivationSchema,
  type SetPasswordFormValues,
  type ResendActivationFormValues,
} from "@/schemas/onboarding.schema";
import {
  useVerifyActivationToken,
  useActivateAccount,
  useResendActivation,
} from "./onboardingApi";

const PASSWORD_CHECKS: { label: string; test: (v: string) => boolean }[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  {
    label: "Uppercase & lowercase",
    test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function BrandPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
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
            Welcome to the team.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Set a password to finish activating your account and get into your
            profile.
          </p>
        </div>
        <div />
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function ResendActivationForm({ prefillEmail }: { prefillEmail?: string }) {
  const [sent, setSent] = useState(false);
  const resendMutation = useResendActivation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendActivationFormValues>({
    resolver: zodResolver(resendActivationSchema),
    defaultValues: { email: prefillEmail ?? "" },
  });

  if (sent) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-success/10 px-3 py-2.5 text-sm text-success">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          If that email has a pending invite, a new activation link is on its
          way.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        resendMutation.mutate(values, { onSuccess: () => setSent(true) }),
      )}
      className="space-y-3"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="resend-email">Work email</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="you@company.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={resendMutation.isPending}
      >
        {resendMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Send a new link
      </Button>
    </form>
  );
}

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: verification,
    isLoading: isVerifying,
    isError: verifyFailed,
  } = useVerifyActivationToken(token);
  const activateMutation = useActivateAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = (values: SetPasswordFormValues) => {
    if (!token) return;
    activateMutation.mutate(
      { token, password: values.password },
      { onSuccess: () => navigate("/dashboard", { replace: true }) },
    );
  };

  if (!token) {
    return (
      <BrandPanel>
        <div className="flex flex-col items-center gap-3 text-center">
          <MailQuestion className="h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Missing activation link
          </h2>
          <p className="text-sm text-muted-foreground">
            This page needs the link from your invitation email. If you've lost
            it, request a new one below.
          </p>
        </div>
        <div className="mt-6">
          <ResendActivationForm />
        </div>
      </BrandPanel>
    );
  }

  if (isVerifying) {
    return (
      <BrandPanel>
        <Loader label="Checking your invitation…" />
      </BrandPanel>
    );
  }

  if (verifyFailed || !verification?.valid) {
    return (
      <BrandPanel>
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            This link has expired
          </h2>
          <p className="text-sm text-muted-foreground">
            Activation links are only valid for a limited time. Enter your email
            and we'll send a fresh one.
          </p>
        </div>
        <div className="mt-6">
          <ResendActivationForm />
        </div>
      </BrandPanel>
    );
  }

  return (
    <BrandPanel>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Set your password
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {verification.full_name
          ? `Hi ${verification.full_name.split(" ")[0]}, choose`
          : "Choose"}{" "}
        a password for {verification.email ?? "your account"}.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {PASSWORD_CHECKS.map((check) => {
              const passed = check.test(passwordValue);
              return (
                <li
                  key={check.label}
                  className={`flex items-center gap-1.5 text-xs ${
                    passed ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                      passed ? "bg-success text-success-foreground" : "bg-muted"
                    }`}
                  >
                    {passed && <Check className="h-2.5 w-2.5" />}
                  </span>
                  {check.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {activateMutation.isError && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {(activateMutation.error as any)?.response?.data?.message ??
                "Couldn't activate your account. Try again."}
            </span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={activateMutation.isPending}
        >
          {activateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating…
            </>
          ) : (
            "Activate account"
          )}
        </Button>
      </form>
    </BrandPanel>
  );
}
