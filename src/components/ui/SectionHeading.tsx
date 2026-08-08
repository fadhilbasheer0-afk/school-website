import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "left" | "center" | "right";
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  align = "center",
  as: Tag = "h2",
  className = "",
}) => {
  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const lineAlignmentClass = {
    left: "self-start",
    center: "mx-auto",
    right: "self-end",
  };

  return (
    <div className={`flex flex-col mb-12 md:mb-16 max-w-3xl ${alignmentClass[align]} ${className}`}>
      {badge && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 uppercase mb-3">
          {badge}
        </span>
      )}
      <Tag className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
        {title}
      </Tag>
      <div className={`h-1.5 w-20 bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full mt-4 mb-5 ${lineAlignmentClass[align]}`} />
      {subtitle && (
        <p className="text-base md:text-lg text-slate-500 dark:text-slate-405 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
