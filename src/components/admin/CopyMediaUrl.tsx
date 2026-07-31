"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

export function CopyMediaUrl({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" className="media-copy-button" onClick={copy}><Icon name="copy" size={15}/>{copied ? "Copied" : "Copy URL"}</button>;
}
