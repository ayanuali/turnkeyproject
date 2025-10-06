"use client";

import "./globals.css";
import { TurnkeyProvider } from "@turnkey/sdk-react";

const turnkeyConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_URL || "https://api.turnkey.com",
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORG_ID || "",
  rpId: process.env.NEXT_PUBLIC_RPID || "turnkeyproject.vercel.app",
  iframeUrl: "https://auth.turnkey.com",
  serverSignUrl: "/api/turnkey-sign", // optional backend endpoint
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TurnkeyProvider config={turnkeyConfig}>
          {children}
        </TurnkeyProvider>
      </body>
    </html>
  );
}
