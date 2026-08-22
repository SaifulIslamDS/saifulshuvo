import { ImageResponse } from "next/og";
import { getHomepageContent } from "@/lib/wordpress/queries/profile";

export const alt = "Saiful Islam — Data Analyst and AI-Focused Software Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const profile = await getHomepageContent();
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", padding: 72, background: "linear-gradient(135deg,#06111f 0%,#0b2543 55%,#102a43 100%)", color: "white", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: 999, background: "rgba(14,165,233,.22)", filter: "blur(20px)", right: -80, top: -100 }}/>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 64, height: 64, borderRadius: 18, background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>SI</div><div style={{ fontSize: 24, color: "#7dd3fc", letterSpacing: 2 }}>PORTFOLIO · DATA · SOFTWARE · AI</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 940 }}><div style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 800 }}>{profile.ownerName}</div><div style={{ fontSize: 38, lineHeight: 1.2, color: "#bae6fd" }}>{profile.professionalTitle}</div><div style={{ fontSize: 24, lineHeight: 1.45, color: "#cbd5e1" }}>{profile.shortBio}</div></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#94a3b8" }}><span>saifulshuvo.com</span><span>{profile.location}</span></div>
      </div>
    </div>,
    size,
  );
}
