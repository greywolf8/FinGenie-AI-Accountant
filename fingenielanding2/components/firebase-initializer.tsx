"use client"

import { useEffect } from "react"
import { db } from "@/lib/firebase"

export default function FirebaseInitializer() {
  useEffect(() => {
    // Verify Firebase initialization
    if (db) {
      console.log("Firebase initialized successfully")
    } else {
      console.error("Firebase initialization failed")
    }
  }, [])

  return null // This component doesn't render anything
}

