"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, AlertCircle, Info, CheckCircle, Shield, User, Database } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (did: string, username: string) => void
  mode: "login" | "register"
}

export default function AuthModal({ isOpen, onClose, onLogin, mode }: AuthModalProps) {
  const { allUsers, registerUser } = useAuth()
  const [step, setStep] = useState<"initial" | "connect" | "profile" | "success">("initial")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [account, setAccount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState<string | null>(null)

  // Check if MetaMask is installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask === true

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep("initial")
      setUsername("")
      setEmail("")
      setAccount(null)
      setError(null)
      setDid(null)
    }
  }, [isOpen, mode])

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      })

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])

        if (mode === "login") {
          // For login, check if the username exists and if the wallet address matches
          const user = allUsers[username]

          if (user) {
            if (user.address.toLowerCase() === accounts[0].toLowerCase()) {
              // User found and wallet matches, show success message
              setDid(user.did)
              setStep("success")

              // Complete login after showing success message
              setTimeout(() => {
                onLogin(user.did, username)
                onClose()
              }, 2000)
            } else {
              setError("Wallet address doesn't match the one registered with this username.")
            }
          } else {
            setError("Username not found. Please register first.")
          }
        } else {
          // For registration, check if username already exists
          if (allUsers[username]) {
            setError("Username already exists. Please choose a different username.")
            setIsLoading(false)
            return
          }

          // Move to profile step
          setStep("profile")
        }
      } else {
        setError("No accounts found. Please create an account in MetaMask.")
      }
    } catch (err: any) {
      console.error("Error connecting to MetaMask:", err)
      // Handle specific MetaMask errors
      if (err.code === 4001) {
        // User rejected the request
        setError("Connection rejected. Please approve the MetaMask connection.")
      } else {
        setError(`Failed to connect to MetaMask: ${err.message || "Unknown error"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Generate a unique ID based on username
  const generateUniqueId = (username: string): string => {
    // Simple hash function for browser environment
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    // Convert to hex string and ensure positive
    const hexHash = Math.abs(hash).toString(16).padStart(8, "0")
    return hexHash.substring(0, 8)
  }

  // Generate DID
  const generateDID = (address: string, username: string): string => {
    const uniqueId = generateUniqueId(username)
    return `did:ethr:${address}:${uniqueId}`
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    if (step === "initial") {
      // For login, check if username exists before connecting wallet
      if (mode === "login") {
        if (!allUsers[username]) {
          setError("Username not found. Please register first.")
          return
        }
      }

      // Move to connect step after entering username
      setStep("connect")
      return
    }

    if (!account) {
      setError("Wallet not connected")
      return
    }

    setIsLoading(true)

    try {
      // Generate DID
      const generatedDid = generateDID(account, username)
      setDid(generatedDid)

      // Store user info
      const userInfo = {
        did: generatedDid,
        username,
        email: email || "",
        address: account,
      }

      // Register the new user
      registerUser(userInfo)

      // Show success message
      setStep("success")

      // Complete login after showing success message
      setTimeout(() => {
        onLogin(generatedDid, username)
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error during signup:", err)
      setError("Failed to complete signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                {mode === "login"
                  ? "Login to FinGenie"
                  : step === "initial"
                    ? "Create Account"
                    : step === "connect"
                      ? "Connect Wallet"
                      : step === "success"
                        ? "Authentication Successful"
                        : "Complete Your Profile"}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {step === "success" ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    Blockchain Authentication Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You've been securely authenticated using your Ethereum wallet.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Your Decentralized Identifier (DID) on the blockchain:
                    </p>
                    <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all text-gray-800 dark:text-gray-200">
                      {did}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 text-left">
                    <div className="flex items-start">
                      <Database className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Decentralized Storage Activated
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          Your DID is now linked to Arweave + Bundlr blockchain storage. All your chats and financial
                          data will be securely stored on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Redirecting you to FinGenie...</p>
                </div>
              ) : step === "initial" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-600 dark:text-blue-400 flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      {mode === "login"
                        ? "Please enter your username to continue."
                        : "Please enter your details to create a new account."}
                    </span>
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email (optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={!username.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 h-auto"
                    >
                      {mode === "login" ? "Continue to Login" : "Continue to Connect Wallet"}
                    </Button>
                  </div>
                </form>
              ) : step === "connect" ? (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {mode === "login"
                      ? `Connect your MetaMask wallet to sign in as "${username}".`
                      : "Connect your MetaMask wallet to complete your registration."}
                  </p>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md mb-4 flex items-start">
                    <Shield className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        Secure Blockchain Authentication
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                        Your wallet address will be used to create a unique decentralized identifier (DID) on the
                        blockchain for secure, passwordless login.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 flex items-start">
                    <Database className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Decentralized Storage with Arweave + Bundlr
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Your chat history and financial data will be securely stored on the blockchain, giving you
                        complete ownership and control of your information.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={connectWallet}
                    disabled={isLoading || !isMetaMaskInstalled}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 h-auto"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg
                          className="h-6 w-6 mr-2"
                          viewBox="0 0 35 33"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M32.9582 1L19.8241 10.7183L22.2665 5.09986L32.9582 1Z"
                            fill="#E17726"
                            stroke="#E17726"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2.04858 1L15.0707 10.809L12.7423 5.09986L2.04858 1Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M28.2292 23.5334L24.7797 28.8961L32.2767 30.9315L34.4172 23.6501L28.2292 23.5334Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M0.601562 23.6501L2.72999 30.9315L10.2161 28.8961L6.78069 23.5334L0.601562 23.6501Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.8465 14.802L7.73193 17.9397L15.1359 18.2952L14.8934 10.2627L9.8465 14.802Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M25.1611 14.802L20.0373 10.1719L19.8828 18.2952L27.2758 17.9397L25.1611 14.802Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.2161 28.8961L14.6568 26.7616L10.8509 23.7158L10.2161 28.8961Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20.3508 26.7616L24.7797 28.8961L24.1558 23.7158L20.3508 26.7616Z"
                            fill="#E27625"
                            stroke="#E27625"
                            strokeWidth="0.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Connect with MetaMask
                      </span>
                    )}
                  </Button>

                  {!isMetaMaskInstalled && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">MetaMask Not Detected</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                        To use FinGenie with MetaMask authentication, please install the MetaMask extension.
                      </p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                      >
                        Install MetaMask
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-address" className="text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </Label>
                    <Input
                      id="wallet-address"
                      value={account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  {mode === "register" && (
                    <>
                      <div>
                        <Label htmlFor="username-confirm" className="text-gray-700 dark:text-gray-300">
                          Username <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="username-confirm"
                          value={username}
                          disabled
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email-confirm" className="text-gray-700 dark:text-gray-300">
                          Email
                        </Label>
                        <Input
                          id="email-confirm"
                          value={email || "Not provided"}
                          disabled
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !username.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 h-auto"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Footer with mode switch */}
              {step !== "success" && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <Button
                      variant="link"
                      className="text-orange-500 hover:text-orange-600 p-0 h-auto ml-1"
                      onClick={() => {
                        onClose()
                        // We'll handle the mode switch in the parent component
                      }}
                    >
                      {mode === "login" ? "Register" : "Login"}
                    </Button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

