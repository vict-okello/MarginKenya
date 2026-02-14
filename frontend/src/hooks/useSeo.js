import { useEffect } from "react";

function upsertMeta(attr, key, content = "") {
  if (typeof document === "undefined") return;
  let node = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", String(content || ""));
}

function upsertCanonical(url = "") {
  if (typeof document === "undefined") return;
  let node = document.head.querySelector('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  node.setAttribute("href", String(url || ""));
}

export default function useSeo({
  title,
  description,
  url,
  image,
  type = "article",
  siteName = "MarginKenya",
}) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();
    const cleanUrl = String(url || "").trim();
    const cleanImage = String(image || "").trim();

    if (cleanTitle) {
      document.title = cleanTitle.includes("MarginKenya")
        ? cleanTitle
        : `${cleanTitle} | MarginKenya`;
    }

    upsertMeta("name", "description", cleanDescription);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("property", "og:title", cleanTitle);
    upsertMeta("property", "og:description", cleanDescription);
    upsertMeta("property", "og:url", cleanUrl);
    upsertMeta("property", "og:image", cleanImage);
    upsertMeta("name", "twitter:card", cleanImage ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", cleanTitle);
    upsertMeta("name", "twitter:description", cleanDescription);
    upsertMeta("name", "twitter:image", cleanImage);
    upsertCanonical(cleanUrl);
  }, [title, description, url, image, type, siteName]);
}

