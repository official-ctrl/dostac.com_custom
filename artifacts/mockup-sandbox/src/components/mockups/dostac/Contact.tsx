import React from "react";
import { Layout } from "./_shared/Layout";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "./_shared/i18n";

function ContactContent() {
  const { t } = useT();
  const productList = t("contact.productList") as string[];
  const types = t("contact.projectTypes") as { oem: string; odm: string; privateLabel: string };

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-contact.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">{t("contact.heroTitle")}</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">{t("contact.heroBody")}</p>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* INQUIRY FORM */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-8 md:p-12">
              <h2 className="font-display text-3xl font-bold text-primary mb-8">{t("contact.formHeading")}</h2>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">{t("contact.company")}</Label>
                    <Input id="company" placeholder={t("contact.companyPh")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.name")}</Label>
                    <Input id="name" placeholder={t("contact.namePh")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.email")}</Label>
                    <Input id="email" type="email" placeholder={t("contact.emailPh")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("contact.country")}</Label>
                    <Input id="country" placeholder={t("contact.countryPh")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t("contact.productCategory")}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t("contact.productCategoryPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {productList.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("contact.projectType")}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t("contact.projectTypePh")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oem">{types.oem}</SelectItem>
                        <SelectItem value="odm">{types.odm}</SelectItem>
                        <SelectItem value="private_label">{types.privateLabel}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moq">{t("contact.moq")}</Label>
                  <Input id="moq" placeholder={t("contact.moqPh")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">{t("contact.desc")}</Label>
                  <Textarea id="desc" placeholder={t("contact.descPh")} className="min-h-[150px]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">{t("contact.file")}</Label>
                  <Input id="file" type="file" className="cursor-pointer file:cursor-pointer" />
                  <p className="text-xs text-muted-foreground">{t("contact.fileNote")}</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <Button type="submit" size="lg" className="w-full sm:w-auto px-10 h-14 bg-accent hover:bg-accent/90 text-white font-medium">
                    <Send className="mr-2 h-5 w-5" /> {t("contact.submit")}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>{t("contact.secure")}</span>
                  </div>
                </div>
              </form>
            </div>

            {/* CONTACT DETAILS */}
            <div className="space-y-8">
              <div className="bg-primary text-white rounded-xl shadow-lg p-8">
                <h3 className="font-display text-2xl font-bold mb-8">{t("contact.infoHeading")}</h3>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.hq")}</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{t("contact.hqAddr")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.sales")}</h4>
                      <p className="text-white/80 text-sm">sales@dostac.example.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.phone")}</h4>
                      <p className="text-white/80 text-sm">+82-2-1234-5678</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.hours")}</h4>
                      <p className="text-white/80 text-sm whitespace-pre-line">{t("contact.hoursValue")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAP PLACEHOLDER */}
              <div className="bg-muted rounded-xl overflow-hidden aspect-video border relative">
                <img src="/__mockup/images/dostac/hero-about.png" className="w-full h-full object-cover opacity-50 grayscale" alt="" />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-primary">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">{t("contact.seoulLabel")}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  return (
    <Layout>
      <ContactContent />
    </Layout>
  );
}
