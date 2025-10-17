export const metadata = {
  title: 'EFO Label Generator',
  description: 'Sistema de generación e impresión masiva de etiquetas para la fábrica EFO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}