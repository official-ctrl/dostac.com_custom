import { useEffect } from "react";

const SITE_NAME = "Dostac";
const BASE_URL = "https://dostac.com";
const DEFAULT_IMAGE = `${BASE_URL}/opengraph.png`;

interface PageMetaOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function usePageMeta({ title, description, path = "", image, type = "website" }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc = description ?? `Dostac — Korean OEM/ODM cosmetics manufacturer. ${title}`;
    const url = `${BASE_URL}${path}`;
    const img = image ?? DEFAULT_IMAGE;

    document.title = fullTitle;

    setMeta("description", desc);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", type, "property");
    setMeta("og:image", img, "property");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", img);
  }, [title, description, path, image, type]);
}
