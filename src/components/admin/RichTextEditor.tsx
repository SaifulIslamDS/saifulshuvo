"use client";

import { useMemo, useState } from "react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  initialHtml?: string;
  initialJson?: Record<string, unknown>;
};

type ToolButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolButton({ label, title, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({ initialHtml = "", initialJson = {} }: Props) {
  const hasJson = Object.keys(initialJson).length > 0;
  const [html, setHtml] = useState(initialHtml);
  const [json, setJson] = useState(() => JSON.stringify(initialJson));

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
    }),
    Image.configure({ allowBase64: false, inline: false }),
    Placeholder.configure({ placeholder: "Write a useful, evidence-based article…" }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ], []);

  const editor = useEditor({
    extensions,
    content: hasJson ? initialJson : initialHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content",
        spellcheck: "true",
        "aria-label": "Article content editor",
      },
    },
    onCreate: ({ editor: instance }: { editor: any }) => {
      setHtml(instance.getHTML());
      setJson(JSON.stringify(instance.getJSON()));
    },
    onUpdate: ({ editor: instance }: { editor: any }) => {
      setHtml(instance.getHTML());
      setJson(JSON.stringify(instance.getJSON()));
    },
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", previous ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  function addImage() {
    if (!editor) return;
    const src = window.prompt("Public image URL", "https://");
    if (!src?.trim()) return;
    const alt = window.prompt("Accessible alt text", "") ?? "";
    editor.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
  }

  return (
    <div className="rich-editor-shell">
      <input type="hidden" name="content_html" value={html} />
      <input type="hidden" name="content_json" value={json} />
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Article formatting">
        <ToolButton label="B" title="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolButton label="I" title="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolButton label="U" title="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <ToolButton label="S" title="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <span className="toolbar-divider" />
        <ToolButton label="H2" title="Heading 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="H3" title="Heading 3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolButton label="¶" title="Paragraph" active={editor?.isActive("paragraph")} onClick={() => editor?.chain().focus().setParagraph().run()} />
        <span className="toolbar-divider" />
        <ToolButton label="•" title="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolButton label="1." title="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="❝" title="Blockquote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <ToolButton label="</>" title="Code block" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
        <span className="toolbar-divider" />
        <ToolButton label="↗" title="Add or edit link" active={editor?.isActive("link")} onClick={setLink} />
        <ToolButton label="IMG" title="Insert image by URL" onClick={addImage} />
        <ToolButton label="—" title="Horizontal divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
        <span className="toolbar-divider" />
        <ToolButton label="L" title="Align left" active={editor?.isActive({ textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()} />
        <ToolButton label="C" title="Align centre" active={editor?.isActive({ textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()} />
        <ToolButton label="R" title="Align right" active={editor?.isActive({ textAlign: "right" })} onClick={() => editor?.chain().focus().setTextAlign("right").run()} />
        <span className="toolbar-divider" />
        <ToolButton label="↶" title="Undo" disabled={!editor?.can().chain().focus().undo().run()} onClick={() => editor?.chain().focus().undo().run()} />
        <ToolButton label="↷" title="Redo" disabled={!editor?.can().chain().focus().redo().run()} onClick={() => editor?.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} />
      <div className="rich-editor-foot">
        <span>{html.replace(/<[^>]+>/g, "").length} characters</span>
        <span>Images use public URLs until Media Library v0.6.0</span>
      </div>
    </div>
  );
}
