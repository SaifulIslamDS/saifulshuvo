import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saiful Islam Portfolio",
    short_name: "Saiful Portfolio",
    description: "Data analytics, modern web applications and practical AI-assisted solutions.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#0ea5e9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
