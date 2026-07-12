import { useBootstrapAuth } from "@/features/auth/authApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import AppRouter from "@/routes/AppRouter";
import { Loader2 } from "lucide-react";


export default function App() {
  const { isLoading: isFetchingAuth } = useBootstrapAuth();
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing || isFetchingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AppRouter />;
}