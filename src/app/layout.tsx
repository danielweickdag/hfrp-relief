/* biome-disable no-dangerously-set-inner-html */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
// import { Navbar } from "@/app/_components/Navbar";
// import Footer from "@/app/_components/Footer";

// Temporary placeholder components
function Navbar() {
  return (
    <nav className="bg-red-600 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold">Haitian Family Relief Project</h1>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; 2024 Haitian Family Relief Project. All rights reserved.</p>
    </footer>
  );
}
// import GoogleAnalytics from "@/app/_components/GoogleAnalytics";
// import { AnalyticsProvider } from "@/app/_components/AnalyticsProvider";
// import { ErrorBoundary } from "@/app/_components/ErrorBoundary";
// import ErrorMonitor from "@/app/_components/ErrorMonitor";

// Temporary placeholder components
function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return null;
}

function AnalyticsProvider({ children, measurementId }: { children: React.ReactNode; measurementId: string }) {
  return <>{children}</>;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ErrorMonitor() {
  return null;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.familyreliefproject.org"
  ),
  title: "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
  description:
    "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
  keywords:
    "Haiti, orphans, charity, donation, relief, hunger, children, nonprofit, giving, hope, daily giving, Haitian Family Relief Project",
  authors: [{ name: "Haitian Family Relief Project" }],
  creator: "Haitian Family Relief Project",
  publisher: "Haitian Family Relief Project",
  robots: "index, follow",
  openGraph: {
    title: "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
    description:
      "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
    url: "https://www.familyreliefproject.org",
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
    description:
      "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
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
        <link rel="canonical" href="https://www.familyreliefproject.org" />
        <meta name="theme-color" content="#dc2626" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Haitian Family Relief Project",
            description:
              "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving.",
            url: "https://www.familyreliefproject.org",
            logo: "https://www.familyreliefproject.org/hfrp-logo.png",
            sameAs: [
              "https://facebook.com/familyreliefproject",
        "https://instagram.com/familyreliefproject",
        "https://twitter.com/familyreliefproject",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "donations",
              url: "https://www.familyreliefproject.org/donate",
            },
            foundingDate: "2020",
            location: {
              "@type": "Place",
              name: "Haiti",
            },
          })}
        </script>
        {/* Stripe.js Script - Load early for better performance */}
        <script src="https://js.stripe.com/basil/stripe.js" async />
        
        {/*
          Google Analytics Script - Only load if valid measurement ID is provided
        */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && 
         process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== "" && 
         process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen text-zinc-900 antialiased">
        <ErrorBoundary>
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && 
           process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== "" && 
           process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" ? (
            <AnalyticsProvider
              measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            >
              <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
              <ClientBody>
                <Navbar />
                <main>{children}</main>
                <Footer />
              </ClientBody>
              <ErrorMonitor />
            </AnalyticsProvider>
          ) : (
            <>
              <ClientBody>
                <Navbar />
                <main>{children}</main>
                <Footer />
              </ClientBody>
              <ErrorMonitor />
            </>
          )}
        </ErrorBoundary>
      </body>
    </html>
  );
}
