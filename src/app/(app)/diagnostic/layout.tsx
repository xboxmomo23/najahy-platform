/** Diagnostic plein écran — sans shell sidebar */
export default function DiagnosticLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
