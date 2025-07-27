/* biome-disable no-dangerously-set-inner-html */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { Navbar } from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import GoogleAnalytics from "@/app/_components/GoogleAnalytics";
import { AnalyticsProvider } from "@/app/_components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
  description: "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
  keywords: "Haiti, orphans, charity, donation, relief, hunger, children, nonprofit, giving, hope, daily giving, Haitian Family Relief Project",
  authors: [{ name: "Haitian Family Relief Project" }],
  creator: "Haitian Family Relief Project",
  publisher: "Haitian Family Relief Project",
  robots: "index, follow",
  openGraph: {
    title: "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
    description: "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
    url: "https://haitianfamilyrelief.org",
    siteName: "Haitian Family Relief Project",
    images: [
      {
        url: "/hfrp-logo.png",
        width: 1200,
        height: 630,
        alt: "Haitian Family Relief Project Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
    description: "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
    creator: "@hfrproject",
    images: ["/hfrp-logo.png"],
  },
  icons: {
    icon: "/hfrp-logo.png",
    apple: "/hfrp-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="canonical" href="https://haitianfamilyrelief.org" />
        <meta name="theme-color" content="#dc2626" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Haitian Family Relief Project",
            "description": "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving.",
            "url": "https://haitianfamilyrelief.org",
            "logo": "https://haitianfamilyrelief.org/hfrp-logo.png",
            "sameAs": [
              "https://facebook.com/haitianfamilyreliefproject",
              "https://instagram.com/haitianfamilyreliefproject",
              "https://twitter.com/hfrproject"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "donations",
              "url": "https://haitianfamilyrelief.org/donate"
            },
            "foundingDate": "2020",
            "location": {
              "@type": "Place",
              "name": "Haiti"
            }
          })}
        </script>
        {/*
          Google Analytics Script - Using dangerouslySetInnerHTML is necessary here
          for proper initialization of Google Analytics. This is a standard implementation
          recommended by Google and is considered safe since we're only including the
          official Google Analytics code with our measurement ID.
        */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'}');
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-zinc-900 antialiased">
        <AnalyticsProvider measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}>
          <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
          <ClientBody>
            <Navbar />
            <main>
              {children}
            </main>
            <Footer />
          </ClientBody>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
