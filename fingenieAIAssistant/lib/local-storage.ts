// Local storage utility functions for chat data

interface Message {
  id: string
  role: "user" | "bot"
  content: string
  timestamp?: number
}

interface Chat {
  id: string
  title: string
  createdAt: number
}

// Helper function to get a storage key for a specific user
const getUserStorageKey = (did: string, type: string) => `fingenie_${did}_${type}`

// Create a new chat
export async function createNewChat(did: string, title = "New Chat"): Promise<string | null> {
  try {
    const chatId = Date.now().toString()
    const chat: Chat = {
      id: chatId,
      title,
      createdAt: Date.now(),
    }

    // Get existing chats
    const chats = await getUserChats(did)

    // Add new chat
    chats.push(chat)

    // Save updated chats
    localStorage.setItem(getUserStorageKey(did, "chats"), JSON.stringify(chats))

    return chatId
  } catch (error) {
    console.error("Error creating new chat:", error)
    return null
  }
}

// Update chat title
export async function updateChatTitle(did: string, chatId: string, title: string): Promise<boolean> {
  try {
    const chats = await getUserChats(did)
    const chatIndex = chats.findIndex((chat) => chat.id === chatId)

    if (chatIndex !== -1) {
      chats[chatIndex].title = title
      localStorage.setItem(getUserStorageKey(did, "chats"), JSON.stringify(chats))
      return true
    }

    return false
  } catch (error) {
    console.error("Error updating chat title:", error)
    return false
  }
}

// Save chat message
export async function saveChatMessage(
  did: string,
  message: { id: string; role: string; content: string },
  chatId?: string,
): Promise<boolean> {
  try {
    if (chatId) {
      // Get existing messages for this chat
      const messages = await getChatMessages(did, chatId)

      // Add new message with timestamp
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now(),
      }

      messages.push(messageWithTimestamp)

      // Save updated messages
      localStorage.setItem(getUserStorageKey(did, `chat_${chatId}`), JSON.stringify(messages))

      // If this is a user message and might be the first message, update the chat title
      if (message.role === "user" && messages.length <= 2) {
        // Use the user's message as the chat title (truncate if too long)
        let title = message.content
        if (title.length > 50) {
          title = title.substring(0, 47) + "..."
        }
        await updateChatTitle(did, chatId, title)
      }
    } else {
      // Backward compatibility: save to general messages
      const messages = await getChatHistory(did)

      // Add new message with timestamp
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now(),
      }

      messages.push(messageWithTimestamp)

      // Save updated messages
      localStorage.setItem(getUserStorageKey(did, "messages"), JSON.stringify(messages))
    }

    return true
  } catch (error) {
    console.error("Error saving chat message:", error)
    return false
  }
}

// Get messages for a specific chat
export async function getChatMessages(did: string, chatId: string): Promise<Message[]> {
  try {
    const messagesJson = localStorage.getItem(getUserStorageKey(did, `chat_${chatId}`))
    if (messagesJson) {
      const messages = JSON.parse(messagesJson)
      // Sort by timestamp if available
      return messages.sort((a: Message, b: Message) => {
        return (a.timestamp || 0) - (b.timestamp || 0)
      })
    }
    return []
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return []
  }
}

// Get general chat history
export async function getChatHistory(did: string): Promise<Message[]> {
  try {
    const messagesJson = localStorage.getItem(getUserStorageKey(did, "messages"))
    if (messagesJson) {
      const messages = JSON.parse(messagesJson)
      // Sort by timestamp if available
      return messages.sort((a: Message, b: Message) => {
        return (a.timestamp || 0) - (b.timestamp || 0)
      })
    }
    return []
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return []
  }
}

// Get all chats for a user
export async function getUserChats(did: string): Promise<Chat[]> {
  try {
    const chatsJson = localStorage.getItem(getUserStorageKey(did, "chats"))
    if (chatsJson) {
      const chats = JSON.parse(chatsJson)
      // Sort by createdAt in descending order (newest first)
      return chats.sort((a: Chat, b: Chat) => b.createdAt - a.createdAt)
    }
    return []
  } catch (error) {
    console.error("Error fetching user chats:", error)
    return []
  }
}

// Delete a chat
export async function deleteChat(did: string, chatId: string): Promise<boolean> {
  try {
    // Delete chat from chats list
    const chats = await getUserChats(did)
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    localStorage.setItem(getUserStorageKey(did, "chats"), JSON.stringify(updatedChats))

    // Delete chat messages
    localStorage.removeItem(getUserStorageKey(did, `chat_${chatId}`))

    return true
  } catch (error) {
    console.error("Error deleting chat:", error)
    return false
  }
}

// Export chat history as JSON
export async function exportChatHistoryAsJson(did: string): Promise<string | null> {
  try {
    const chats = await getUserChats(did)
    const exportData: any = { chats: [] }

    // For each chat, get all messages
    for (const chat of chats) {
      const messages = await getChatMessages(did, chat.id)
      exportData.chats.push({
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.createdAt).toISOString(),
        messages: messages,
      })
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("Error exporting chat history:", error)
    return null
  }
}

// Import chat history from JSON
export async function importChatHistoryFromJson(did: string, jsonData: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonData)

    // Process each chat
    for (const chat of data.chats) {
      // Create the chat
      const chatObj: Chat = {
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.createdAt).getTime(),
      }

      // Get existing chats
      const chats = await getUserChats(did)

      // Check if chat already exists
      const existingChatIndex = chats.findIndex((c) => c.id === chat.id)
      if (existingChatIndex !== -1) {
        chats[existingChatIndex] = chatObj
      } else {
        chats.push(chatObj)
      }

      // Save updated chats
      localStorage.setItem(getUserStorageKey(did, "chats"), JSON.stringify(chats))

      // Add all messages
      localStorage.setItem(getUserStorageKey(did, `chat_${chat.id}`), JSON.stringify(chat.messages))
    }

    return true
  } catch (error) {
    console.error("Error importing chat history:", error)
    return false
  }
}

