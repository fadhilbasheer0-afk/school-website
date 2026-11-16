export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center py-16 px-4 bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
