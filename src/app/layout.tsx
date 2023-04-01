import "./globals.css";

export const metadata = {
  title: "Footbot",
  description: "A chatbot excited to talk to you about football",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
