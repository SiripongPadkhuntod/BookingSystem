import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RSU Booking System",
  description: "Room and seat booking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
