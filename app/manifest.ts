import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0B1220",
    theme_color: "#0B1220",
    icons: [
      {
        src: "/icons/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
