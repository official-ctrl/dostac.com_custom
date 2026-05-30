import { useEffect } from "react";
import { useLocation } from "wouter";

const CANONICAL_ORIGIN = "https://dostac.com";

export function useCanonical() {
  const [location] = useLocation();

  useEffect(() => {
    const lower = location.toLowerCase();
    const canonical = CANONICAL_ORIGIN + lower;

    let tag = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!tag) {
      tag = document.createElement("link");
      tag.rel = "canonical";
      document.head.appendChild(tag);
    }
    tag.href = canonical;
  }, [location]);
}
