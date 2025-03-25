"use client"

import { useState, useEffect } from "react"
import { Database, Check, Clock, ExternalLink, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getChatArweaveStatus, getBundlr } from "@/lib/arweave-storage"

interface BlockchainStatusProps {
  chatId: string | null
}

export default function BlockchainStatus({ chatId }: BlockchainStatusProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<{ isSaved: boolean; arweaveId: string | null }>({
    isSaved: false,
    arweaveId: null,
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [bundlrError, setBundlrError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.did && chatId) {
      // Check if Bundlr is initialized
      getBundlr()
        .then((bundlr) => {
          if (!bundlr) {
            setBundlrError("Blockchain storage not available. Your data is saved locally.")
          } else {
            setBundlrError(null)
          }
        })
        .catch((err) => {
          setBundlrError("Error connecting to blockchain storage: " + err.message)
        })

      const chatStatus = getChatArweaveStatus(user.did, chatId)
      setStatus(chatStatus)

      // Check status every 10 seconds
      const interval = setInterval(() => {
        const updatedStatus = getChatArweaveStatus(user.did, chatId)
        setStatus(updatedStatus)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [user?.did, chatId])

  if (!user?.did || !chatId) {
    return null
  }

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Database className="h-4 w-4 text-blue-500" />
          <span>Blockchain Storage:</span>
          {bundlrError ? (
            <span className="flex items-center text-yellow-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Local Only</span>
            </span>
          ) : status.isSaved ? (
            <span className="flex items-center text-green-500">
              <Check className="h-4 w-4 mr-1" />
              <span>Saved</span>
            </span>
          ) : (
            <span className="flex items-center text-yellow-500">
              <Clock className="h-4 w-4 mr-1 animate-pulse" />
              <span>Syncing</span>
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-blue-500" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
          {bundlrError ? (
            <div className="text-yellow-600 dark:text-yellow-400">
              <p>{bundlrError}</p>
              <p className="mt-1">Your chat data is still securely stored in your browser's local storage.</p>
            </div>
          ) : (
            <>
              <p className="mb-1 text-gray-700 dark:text-gray-300">
                Your chat data is securely stored on the Arweave blockchain using Bundlr technology.
              </p>
              {status.arweaveId && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded font-mono text-xs">
                    {status.arweaveId.substring(0, 12)}...{status.arweaveId.substring(status.arweaveId.length - 12)}
                  </code>
                  <a
                    href={`https://viewblock.io/arweave/tx/${status.arweaveId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 inline-flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Blockchain storage ensures your data is permanent, immutable, and owned by you.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

