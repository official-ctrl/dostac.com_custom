import React from "react";
import { ChevronRight, ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./_group.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <a href="/__mockup/preview/dostac/Home" className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl tracking-tighter text-primary">DOSTAC</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="/__mockup/preview/dostac/About" className="text-sm font-medium text-foreground hover:text-accent transition-colors">ABOUT DOSTAC</a>
            <a href="/__mockup/preview/dostac/Production" className="text-sm font-medium text-foreground hover:text-accent transition-colors">PRODUCTION</a>
            <a href="/__mockup/preview/dostac/Products" className="text-sm font-medium text-foreground hover:text-accent transition-colors">PRODUCT</a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">NOTICE</a>
            <a href="/__mockup/preview/dostac/Contact" className="text-sm font-medium text-foreground hover:text-accent transition-colors">CONTACT US</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href="/__mockup/preview/dostac/Contact" className="hidden md:inline-flex h-10 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Request a Quote
            </a>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground py-16 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="font-display font-bold text-3xl tracking-tighter block mb-4">DOSTAC</span>
            <p className="text-primary-foreground/80 mb-6 max-w-sm">
              A confident, trust-building global manufacturing partner. Your Premier OEM/ODM Partner for Beauty & Health Innovation.
            </p>
            <p className="text-sm font-medium text-accent">
              Your information is secure. Our global sales team aims to respond within 24-48 business hours.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/__mockup/preview/dostac/About" className="text-primary-foreground/80 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/__mockup/preview/dostac/Production" className="text-primary-foreground/80 hover:text-white transition-colors">Production Standards</a></li>
              <li><a href="/__mockup/preview/dostac/Products" className="text-primary-foreground/80 hover:text-white transition-colors">Product Categories</a></li>
              <li><a href="/__mockup/preview/dostac/Contact" className="text-primary-foreground/80 hover:text-white transition-colors">Contact Global Sales</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">Headquarters</h4>
            <address className="not-italic text-primary-foreground/80 space-y-2">
              <p>Seoul, South Korea</p>
              <p>Email: sales@dostac.example.com</p>
              <p>Phone: +82-2-1234-5678</p>
              <p>Hours: Mon-Fri, 9:00 AM - 6:00 PM KST</p>
            </address>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-primary-foreground/10 text-sm text-primary-foreground/60 text-center">
          © 2026 DIO STAC Co., Ltd. (dostac). All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
