/** Plein écran post-inscription — masque la sidebar élève le temps de la bienvenue */
export default function BienvenueLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">{children}</div>
  );
}
