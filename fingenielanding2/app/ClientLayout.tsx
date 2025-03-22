"use client"

import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { useEffect } from "react"
import { db } from "@/lib/firebase"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Verify Firebase initialization
    if (db) {
      console.log("Firebase initialized successfully in layout")
    } else {
      console.error("Firebase initialization failed in layout")
    }
  }, [])

  return (
    <html lang="en">
      <head>
        {/* Add PDF.js script for document text extraction */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js" async></script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

