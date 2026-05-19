import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/dostac/i18n";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/production" component={Production} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/notice" component={Notice} />
      <Route path="/notice/:slug" component={NoticeDetail} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
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
