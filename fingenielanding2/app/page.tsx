"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Calculator, MessageSquare, Mic, Moon, Sun, X, User, UserPlus, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatManager from "@/components/chat-manager"
import FeatureCard from "@/components/feature-card"
import TaxCalculator from "@/components/tax-calculator"
import AuthModal from "@/components/auth/auth-modal"
import UserMenu from "@/components/auth/user-menu"
import { useAuth } from "@/contexts/auth-context"

// Update the MetaMask type definition to be more specific
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (event: string, callback: (...args: any[]) => void) => void
      removeListener?: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const { user, isAuthenticated, login, logout } = useAuth()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleOpenChat = () => {
    if (isAuthenticated) {
      setChatOpen(true)
    } else {
      setAuthMode("login")
      setAuthModalOpen(true)
    }
  }

  const handleLogin = (did: string, username: string) => {
    login(did, username)
    setChatOpen(true)
  }

  const handleLogout = () => {
    logout()
    if (chatOpen) {
      setChatOpen(false)
    }
  }

  const openLoginModal = () => {
    setAuthMode("login")
    setAuthModalOpen(true)
  }

  const openRegisterModal = () => {
    setAuthMode("register")
    setAuthModalOpen(true)
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
        {/* Header */}
        <header className="container mx-auto py-6 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
              FinGenie
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <UserMenu username={user?.username || ""} did={user?.did || ""} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={openLoginModal} variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
                <Button onClick={openRegisterModal} variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Button>
              </div>
            )}

            <Button
              onClick={handleOpenChat}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              {isAuthenticated ? "Open FinGenie" : "Try FinGenie"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Rest of the landing page content... */}
        {/* ... */}
        {/* Hero Section */}
        <section className="container mx-auto py-16 px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                Your AI{" "}
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                  Financial Assistant
                </span>{" "}
                at Your Fingertips
              </h1>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                Get instant answers to all your accounting and tax questions. Calculate taxes, plan finances, and make
                smarter financial decisions with FinGenie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isAuthenticated ? (
                  <Button
                    onClick={() => setChatOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-8 py-6 h-auto"
                  >
                    Open FinGenie
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={openRegisterModal}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-8 py-6 h-auto"
                    >
                      Try FinGenie Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      onClick={openLoginModal}
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 h-auto border-orange-500 text-orange-500 dark:text-orange-400 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Secure Decentralized Login
                    </Button>
                  </>
                )}
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
                <h3 className="font-medium text-orange-800 dark:text-orange-300 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Blockchain-Powered Security
                </h3>
                <p className="text-orange-700 dark:text-orange-300 mt-1 text-sm">
                  Your data is secured with Ethereum blockchain technology. No passwords to remember or reset.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                    <h3 className="font-semibold">FinGenie Assistant</h3>
                  </div>
                  <Calculator className="h-5 w-5" />
                </div>
                <div className="p-4 h-[300px] overflow-y-auto">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                      👋 Hello! I'm FinGenie. Ask me anything about finance and accounting!
                    </div>
                  </div>
                  <div className="flex items-start justify-end mb-4">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-gray-800 dark:text-gray-200">
                      What is the difference between the old tax regime and the new tax regime in India?
                    </div>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                      The key differences between old and new tax regimes in India are:
                      <ul className="list-disc pl-5 mt-2">
                        <li>Old regime: Higher tax rates but allows for deductions and exemptions (80C, HRA, etc.)</li>
                        <li>New regime: Lower tax rates but most deductions and exemptions are not available</li>
                        <li>Old regime: Better for those with significant investments and deductions</li>
                        <li>New regime: Simpler and may benefit those with fewer deductions</li>
                      </ul>
                      Would you like me to calculate which regime would be better for your specific situation?
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Type your message...
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Powerful Features to Simplify Your{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
              Financial Life
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-orange-500" />}
              title="AI-Powered Conversations"
              description="Get instant, accurate answers to all your financial and tax-related questions with our advanced AI assistant."
            />
            <FeatureCard
              icon={<Calculator className="h-10 w-10 text-pink-500" />}
              title="Built-in Tax Calculator"
              description="Calculate your tax liability with our comprehensive tax calculator that supports both old and new tax regimes."
            />
            <FeatureCard
              icon={<Mic className="h-10 w-10 text-orange-500" />}
              title="Voice Interaction"
              description="Speak to FinGenie and listen to responses with our voice recognition and text-to-speech capabilities."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-pink-500" />}
              title="Blockchain Authentication"
              description="Secure your account with Ethereum-based decentralized identity (DID) for passwordless authentication."
            />
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Advanced{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Financial Tools
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Tax Regime Comparison</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Compare old and new tax regimes side-by-side to determine which one saves you more money based on your
                  financial situation.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Side-by-side comparison
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Personalized recommendations
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Detailed savings breakdown
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-pink-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Investment Advisor</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get personalized investment recommendations based on your financial goals, risk tolerance, and tax
                  situation.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-pink-500">✓</div>
                    Tax-efficient investments
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-pink-500">✓</div>
                    Risk assessment
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-pink-500">✓</div>
                    Goal-based planning
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Document Scanner</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upload and scan financial documents to automatically extract key information for tax filing and
                  financial planning.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Form 16 extraction
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Bank statement analysis
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-orange-500">✓</div>
                    Investment document parsing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Simplify Your{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                Financial Journey?
              </span>
            </h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Join thousands of users who are making smarter financial decisions with FinGenie.
            </p>
            <Button
              onClick={isAuthenticated ? () => setChatOpen(true) : openRegisterModal}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-8 py-6 h-auto animate-pulse"
            >
              {isAuthenticated ? "Open FinGenie" : "Try FinGenie Now"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                FinGenie
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} FinGenie AI. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Created by Arkaprava Panigrahi</p>
          </div>
        </footer>
      </div>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
          >
            {calculatorOpen ? (
              <>
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                    <h3 className="font-semibold">FinGenie Tax Calculator</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalculatorOpen(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setChatOpen(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <TaxCalculator
                  onSendToChat={() => {
                    setCalculatorOpen(false)
                    // Set a flag to indicate we're coming from tax calculator
                    localStorage.setItem("comingFromTaxCalculator", "true")
                  }}
                />
              </>
            ) : (
              <ChatManager onClose={() => setChatOpen(false)} />
            )}
          </motion.div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={handleAuthModalClose} onLogin={handleLogin} mode={authMode} />
    </div>
  )
}

