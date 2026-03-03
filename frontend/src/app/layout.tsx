import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Dhimahi Finserve & Investment Hub - CRM",
  description: "Financial Services CRM for managing investments, insurance, loans, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#7C3AED', secondary: '#fff' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
