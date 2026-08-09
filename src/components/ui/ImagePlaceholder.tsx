import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { isImageUrl } from "@/lib/image";

interface ImagePlaceholderProps {
  /**
   * Fallback text shown inside the placeholder box. When `src` is a real
   * image URL, `label` is used as the accessible alt text unless `alt` is
   * provided.
   */
  label: string;
  /** Alt text for the rendered <img>. Defaults to `label`. */
  alt?: string;
  /** Absolute image URL. When present (and a valid http(s) URL) a real
   * <img> is rendered instead of the placeholder. */
  src?: string | null;
  aspectRatio?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  label,
  alt,
  src,
  aspectRatio = "aspect-video",
  icon = <ImageIcon className="w-8 h-8 opacity-40" />,
  className = "",
}) => {
  if (isImageUrl(src)) {
    return (
      <div
        className={`w-full ${aspectRatio} overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS uploads use plain <img> */}
        <img
          src={src}
          alt={alt ?? label}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full ${aspectRatio} bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
    >
      <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2">
        {icon}
        <span className="text-xs font-semibold tracking-wider uppercase opacity-60">
          Image Placeholder
        </span>
        <span className="text-[11px] font-medium text-slate-500 max-w-[200px] leading-tight">
          {label}
        </span>
      </div>
    </div>
  );
};
