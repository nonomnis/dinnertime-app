export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-warm-50 via-warm-100 to-primary-50 flex items-center justify-center p-4 safe-top">
      {children}
    </div>
  );
}
