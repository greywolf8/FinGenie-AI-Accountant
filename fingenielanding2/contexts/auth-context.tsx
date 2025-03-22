"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import FirebaseProvider from "@/components/firebase-provider"

interface User {
  did: string
  username: string
  email?: string
  address: string
}

interface StoredUsers {
  [username: string]: User
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  allUsers: StoredUsers
  login: (did: string, username: string) => void
  logout: () => void
  registerUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProviderInternal({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<StoredUsers>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    try {
      const storedUser = localStorage.getItem("fingenie_user")
      const storedUsers = localStorage.getItem("fingenie_all_users")

      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers)
          setAllUsers(parsedUsers)
        } catch (error) {
          console.error("Failed to parse stored users:", error)
          localStorage.removeItem("fingenie_all_users")
          setAllUsers({})
        }
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Validate the parsed user object has required fields
        if (parsedUser && parsedUser.did && parsedUser.username && parsedUser.address) {
          setUser(parsedUser)
        } else {
          console.error("Invalid user data in localStorage")
          localStorage.removeItem("fingenie_user")
        }
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error)
      localStorage.removeItem("fingenie_user")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (did: string, username: string) => {
    // Find the user in our stored users
    const userToLogin = allUsers[username]

    if (userToLogin && userToLogin.did === did) {
      setUser(userToLogin)
      localStorage.setItem("fingenie_user", JSON.stringify(userToLogin))
    } else {
      console.error("User not found or DID mismatch")
    }
  }

  const registerUser = (newUser: User) => {
    // Add the new user to our stored users
    const updatedUsers = {
      ...allUsers,
      [newUser.username]: newUser,
    }

    setAllUsers(updatedUsers)
    localStorage.setItem("fingenie_all_users", JSON.stringify(updatedUsers))

    // Also log the user in
    setUser(newUser)
    localStorage.setItem("fingenie_user", JSON.stringify(newUser))
  }

  const logout = () => {
    localStorage.removeItem("fingenie_user")
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    allUsers,
    login,
    logout,
    registerUser,
  }

  if (isLoading) {
    return null // Or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </FirebaseProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

