"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Download, Upload, Database } from "lucide-react"
import ChatWindow from "@/components/chat-window"
import ChatHistory from "@/components/chat-history"
import { useAuth } from "@/contexts/auth-context"
import { createNewChat, exportChatHistoryAsJson, importChatHistoryFromJson } from "@/lib/local-storage"

interface ChatManagerProps {
  onClose: () => void
}

export default function ChatManager({ onClose }: ChatManagerProps) {
  const { user } = useAuth()
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create a new chat when component mounts if user is authenticated
  useEffect(() => {
    if (user?.did && !activeChat) {
      handleNewChat()
    }
  }, [user?.did])

  const handleNewChat = async () => {
    if (!user?.did) {
      console.log("Cannot create new chat: User not authenticated")
      return
    }

    // Create a new chat with default title, it will be updated when the first message is sent
    const chatId = await createNewChat(user.did, "New Chat")
    if (chatId) {
      setActiveChat(chatId)
    }
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    setShowHistory(false)
  }

  const handleExportChats = async () => {
    if (!user?.did) return

    setIsExporting(true)
    try {
      const jsonData = await exportChatHistoryAsJson(user.did)
      if (jsonData) {
        // Create a blob and download link
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `fingenie-chats-${user.username}-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error exporting chats:", error)
      alert("Failed to export chats. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportChats = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.did) return

    try {
      const fileContent = await file.text()
      const success = await importChatHistoryFromJson(user.did, fileContent)

      if (success) {
        alert("Chat history imported successfully!")
        // Refresh the active chat if needed
        if (activeChat) {
          setActiveChat(null)
          setTimeout(() => handleNewChat(), 100)
        } else {
          handleNewChat()
        }
      } else {
        alert("Failed to import chat history. Please check the file format.")
      }
    } catch (error) {
      console.error("Error importing chat history:", error)
      alert("Error importing chat history. Please try again.")
    } finally {
      // Reset the file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 mr-1"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold">F</span>
          </div>
          <h3 className="font-semibold">FinGenie AI Assistant</h3>
          <div className="text-xs opacity-75">by Arkaprava Panigrahi</div>
          <div className="ml-2 flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-xs">
            <Database className="h-3 w-3" />
            <span>Blockchain Secured</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleExportChats}
            disabled={isExporting}
            title="Export Chats"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleImportClick}
            title="Import Chats"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportChats} />
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "Show History"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleNewChat}
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showHistory && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <ChatHistory onSelectChat={handleSelectChat} />
          </div>
        )}
        <div className="flex-1">
          <ChatWindow chatId={activeChat} />
        </div>
      </div>
    </div>
  )
}

