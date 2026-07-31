import { NextResponse } from "next/server";
import { getPublicSiteMedia } from "@/lib/media/queries";

export async function GET(request: Request) {
  const media = await getPublicSiteMedia();
  if (!media.activeCv) return NextResponse.redirect(new URL("/contact", request.url));
  return NextResponse.redirect(media.activeCv.media.publicUrl, 307);
}
