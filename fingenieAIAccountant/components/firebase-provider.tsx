"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { db } from "@/lib/firebase"

// Create a context to track Firebase initialization status
interface FirebaseContextType {
  isFirebaseInitialized: boolean
}

const FirebaseContext = createContext<FirebaseContextType>({
  isFirebaseInitialized: false,
})

export const useFirebase = () => useContext(FirebaseContext)

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)

  useEffect(() => {
    // Check if Firestore is initialized
    if (db) {
      console.log("Firebase is initialized in provider")
      setIsFirebaseInitialized(true)
    } else {
      console.error("Firebase is not properly initialized in provider")
    }
  }, [])

  return <FirebaseContext.Provider value={{ isFirebaseInitialized }}>{children}</FirebaseContext.Provider>
}

