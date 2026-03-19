import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "GenStore | Advance Your Hardware",
  description: "The Ultimate Hub for IoT Projects, Sensor Modules, and Robotics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="noise-overlay"></div>
        {children}
      </body>
    </html>
  );
}
