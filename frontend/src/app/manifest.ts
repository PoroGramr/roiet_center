import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "로이엣 교육센터",
    short_name: "로이엣",
    description: "팀과 학생, 수업과 출석을 한곳에",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9f6",
    theme_color: "#356550",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
