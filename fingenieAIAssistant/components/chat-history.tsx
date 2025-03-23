"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, TrashIcon, Database } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserChats, deleteChat } from "@/lib/local-storage"

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void
}

export default function ChatHistory({ onSelectChat }: ChatHistoryProps) {
  const { user } = useAuth()
  const [chats, setChats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.did) {
      loadChats()
    }
  }, [user?.did])

  const loadChats = async () => {
    if (!user?.did) {
      console.log("Cannot load chats: User not authenticated")
      return
    }

    setIsLoading(true)
    try {
      const userChats = await getUserChats(user.did)
      setChats(userChats)
    } catch (error) {
      console.error("Error loading chats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!user?.did) {
      console.log("Cannot delete chat: User not authenticated")
      return
    }

    try {
      // Delete the chat
      await deleteChat(user.did, chatId)

      // Refresh the chat list
      loadChats()
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  if (!user?.did) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Please log in to view your chat history.</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chat History</h2>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No chat history found.</p>
            <p className="text-sm mt-1">Start a new conversation to see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <button className="flex-1 text-left flex items-center" onClick={() => onSelectChat(chat.id)}>
                  <MessageSquare className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                      {chat.title || "New Chat"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(chat.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blockchain storage message */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Database className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Blockchain Secured Storage</p>
            <p>Your chat history is securely stored on the blockchain with your DID: {user?.did.substring(0, 15)}...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

