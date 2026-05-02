import React from "react";
import { Layout } from "./_shared/Layout";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Contact() {
  const products = [
    "Pore Strips",
    "Micro Needle Patches",
    "Lip & Eye Remover Tissues",
    "Spot Patches",
    "Fruit Pads",
    "Oil Control Films",
    "Oral Cleansing Tissues",
    "Baby Wet Wipes",
    "Feminine Cleansing Tissues",
    "Deodorant Cooling Tissues",
    "Custom / Other"
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-contact.png" alt="Corporate Meeting Room" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bright-overlay"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
            Let's Build Your Next Best-Seller Together
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Ready to elevate your brand with premium OEM/ODM manufacturing? Contact our global business team today. Provide us with your project details, and our experts will guide you through customized formulations, pricing, and rapid sample development.
          </p>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* INQUIRY FORM */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-8 md:p-12">
              <h2 className="font-display text-3xl font-bold text-primary mb-8">Project Inquiry</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" placeholder="e.g. Acme Beauty Co." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email *</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" placeholder="e.g. United States" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Product Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oem">OEM (Original Equipment Manufacturer)</SelectItem>
                        <SelectItem value="odm">ODM (Original Design Manufacturer)</SelectItem>
                        <SelectItem value="private_label">Private Label</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moq">Estimated MOQ (Minimum Order Quantity)</Label>
                  <Input id="moq" placeholder="e.g. 10,000 units" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Project Description *</Label>
                  <Textarea id="desc" placeholder="Please provide details about your desired formulations, packaging concepts, target market, and timeline." className="min-h-[150px]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Attach Reference File (Optional)</Label>
                  <Input id="file" type="file" className="cursor-pointer file:cursor-pointer" />
                  <p className="text-xs text-muted-foreground">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <Button type="submit" size="lg" className="w-full sm:w-auto px-10 h-14 bg-accent hover:bg-accent/90 text-white font-medium">
                    <Send className="mr-2 h-5 w-5" /> Send Inquiry
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Your information is secure. Our global sales team aims to respond within 24-48 business hours.</span>
                  </div>
                </div>
              </form>
            </div>

            {/* CONTACT DETAILS */}
            <div className="space-y-8">
              <div className="bg-primary text-white rounded-xl shadow-lg p-8">
                <h3 className="font-display text-2xl font-bold mb-8">Contact Information</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Global Headquarters</h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        123 Digital-ro, Guro-gu,<br/>
                        Seoul, South Korea 08390
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Global Sales Team</h4>
                      <p className="text-white/80 text-sm">sales@dostac.example.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-white/80 text-sm">+82-2-1234-5678</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Business Hours</h4>
                      <p className="text-white/80 text-sm">Monday - Friday<br/>9:00 AM - 6:00 PM (KST)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAP PLACEHOLDER */}
              <div className="bg-muted rounded-xl overflow-hidden aspect-video border relative">
                <img src="/__mockup/images/dostac/hero-about.png" className="w-full h-full object-cover opacity-50 grayscale" alt="Map Area" />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-primary">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">Seoul HQ</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
