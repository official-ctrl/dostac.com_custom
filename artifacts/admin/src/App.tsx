import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AdminLayout } from "@/components/AdminLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ProductEdit from "@/pages/ProductEdit";
import Notices from "@/pages/Notices";
import NoticeEdit from "@/pages/NoticeEdit";
import Inquiries from "@/pages/Inquiries";
import InquiryDetail from "@/pages/InquiryDetail";
import Banners from "@/pages/Banners";
import BannerEdit from "@/pages/BannerEdit";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/login">
          <Redirect to="/" />
        </Route>
        <Route path="/" component={Dashboard} />
        <Route path="/banners" component={Banners} />
        <Route path="/banners/new" component={BannerEdit} />
        <Route path="/banners/:id" component={BannerEdit} />
        <Route path="/products" component={Products} />
        <Route path="/products/new" component={ProductEdit} />
        <Route path="/products/:id" component={ProductEdit} />
        <Route path="/notices" component={Notices} />
        <Route path="/notices/new" component={NoticeEdit} />
        <Route path="/notices/:id" component={NoticeEdit} />
        <Route path="/inquiries" component={Inquiries} />
        <Route path="/inquiries/:id" component={InquiryDetail} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <ProtectedRoutes />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
