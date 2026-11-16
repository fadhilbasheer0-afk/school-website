import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", hoverEffect = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 ${
          hoverEffect
            ? "hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700"
            : "shadow-md"
        } shadow-slate-100/50 dark:shadow-none ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
CardHeader.displayName = "CardHeader";

export const CardTitle = ({
  children,
  className = "",
  tag: Tag = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { tag?: "h1" | "h2" | "h3" | "h4" }) => {
  return (
    <Tag
      className={`text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};
CardTitle.displayName = "CardTitle";

export const CardDescription = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};
CardDescription.displayName = "CardDescription";

export const CardContent = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};
CardContent.displayName = "CardContent";

export const CardFooter = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`p-6 pt-0 border-t border-slate-50 dark:border-slate-800/50 mt-4 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
CardFooter.displayName = "CardFooter";
