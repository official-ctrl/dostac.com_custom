import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/dostac/i18n";
import { useGoogleAnalytics } from "@/hooks/use-google-analytics";
import "@/components/dostac/dostac.css";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Production from "@/pages/Production";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Notice from "@/pages/Notice";
import NoticeDetail from "@/pages/NoticeDetail";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function LowercaseRedirect() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    const lower = location.toLowerCase();
    if (lower !== location) {
      navigate(lower, { replace: true });
    }
  }, [location, navigate]);
  return null;
}

function Router() {
  useGoogleAnalytics();
  return (
    <>
      <LowercaseRedirect />
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/production" component={Production} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/insights" component={Notice} />
      <Route path="/insights/:slug" component={NoticeDetail} />
      <Route path="/notice">{() => <Redirect to="/insights" />}</Route>
      <Route path="/notice/:slug">{({ slug }: { slug: string }) => <Redirect to={`/insights/${slug}`} />}</Route>
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
