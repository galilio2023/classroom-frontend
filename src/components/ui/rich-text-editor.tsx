import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code, 
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Strikethrough,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { useMemo } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EditorButton = ({ 
  onClick, 
  isActive, 
  icon: Icon, 
  label 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  icon: any; 
  label: string 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          onClick={onClick}
          className={cn("h-8 w-8 p-0", isActive && "bg-muted text-foreground")}
          type="button"
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const { t } = useTranslation();
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt(t("common.editor.urlPrompt"));
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(t("common.editor.urlPrompt"), previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 border-b rounded-t-xl">
      <EditorButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={Bold}
        label={t("common.editor.bold")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={Italic}
        label={t("common.editor.italic")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        icon={Strikethrough}
        label={t("common.editor.strike")}
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <EditorButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon={Heading1}
        label={t("common.editor.h1")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={Heading2}
        label={t("common.editor.h2")}
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <EditorButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={List}
        label={t("common.editor.bulletList")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={ListOrdered}
        label={t("common.editor.orderedList")}
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <EditorButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={Quote}
        label={t("common.editor.quote")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={Code}
        label={t("common.editor.code")}
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <EditorButton
        onClick={addImage}
        icon={ImageIcon}
        label={t("common.editor.image")}
      />
      <EditorButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        icon={LinkIcon}
        label={t("common.editor.link")}
      />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <EditorButton
        onClick={() => editor.chain().focus().undo().run()}
        icon={Undo}
        label={t("common.editor.undo")}
      />
      <EditorButton
        onClick={() => editor.chain().focus().redo().run()}
        icon={Redo}
        label={t("common.editor.redo")}
      />
    </div>
  );
};

export const RichTextEditor = ({ value, onChange, className }: RichTextEditorProps) => {
  // Memoize extensions to prevent duplicate registration on re-renders
  const extensions = useMemo(() => [
    StarterKit.configure({
      // Some versions include these by default, causing duplicates if manually added
      // We'll keep them enabled here but ensure they aren't added again manually
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg border shadow-sm max-w-full h-auto",
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: "text-primary underline underline-offset-4 font-medium",
      },
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[150px] p-4 focus:outline-none",
          className
        ),
      },
    },
  }, []); // Static dependency array

  return (
    <div className="flex flex-col w-full border rounded-xl bg-background focus-within:ring-1 focus-within:ring-primary/30 transition-all">
      {editor && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};
