import { WebBundlr } from "@bundlr-network/client"
import { ethers } from "ethers"

// Interface for chat message
interface Message {
  id: string
  role: "user" | "bot"
  content: string
  timestamp?: number
}

// Interface for chat
interface Chat {
  id: string
  title: string
  createdAt: number
  messages?: Message[]
}

// Initialize Bundlr with Ethereum provider
let bundlr: WebBundlr | null = null

export async function initBundlr() {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      console.error("Ethereum provider not available")
      return null
    }

    // Create Ethereum provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Initialize Bundlr with Ethereum
    bundlr = new WebBundlr("https://node1.bundlr.network", "ethereum", provider, {
      providerUrl: "https://ethereum-goerli.publicnode.com", // Using Goerli testnet
    })

    await bundlr.ready()
    console.log("Bundlr initialized successfully")

    return bundlr
  } catch (error) {
    console.error("Failed to initialize Bundlr:", error)
    return null
  }
}

// Get Bundlr instance or initialize if not already done
export async function getBundlr() {
  if (!bundlr) {
    return await initBundlr()
  }
  return bundlr
}

// Upload chat data to Arweave via Bundlr
export async function uploadToArweave(did: string, data: any, tags: { name: string; value: string }[] = []) {
  try {
    const bundlrInstance = await getBundlr()
    if (!bundlrInstance) {
      throw new Error("Bundlr not initialized")
    }

    // Add DID tag to identify the owner
    const allTags = [{ name: "Application", value: "FinGenie" }, { name: "DID", value: did }, ...tags]

    // Convert data to JSON string
    const jsonData = JSON.stringify(data)

    // Create transaction
    const tx = bundlrInstance.createTransaction(jsonData, { tags: allTags })

    // Sign and upload transaction
    await tx.sign()
    const result = await tx.upload()

    console.log(`Data uploaded to Arweave with ID: ${result.id}`)
    return result.id
  } catch (error) {
    console.error("Failed to upload to Arweave:", error)
    return null
  }
}

// Save chat to Arweave
export async function saveChatToArweave(did: string, chat: Chat) {
  try {
    // Add chat-specific tags
    const tags = [
      { name: "Content-Type", value: "application/json" },
      { name: "Type", value: "chat" },
      { name: "ChatId", value: chat.id },
    ]

    // Upload chat data
    const txId = await uploadToArweave(did, chat, tags)

    if (txId) {
      // Store the transaction ID in local storage for reference
      const arweaveRefs = JSON.parse(localStorage.getItem(`fingenie_${did}_arweave_refs`) || "{}")
      arweaveRefs[chat.id] = txId
      localStorage.setItem(`fingenie_${did}_arweave_refs`, JSON.stringify(arweaveRefs))
    }

    return txId
  } catch (error) {
    console.error("Failed to save chat to Arweave:", error)
    return null
  }
}

// Save message to Arweave
export async function saveMessageToArweave(did: string, chatId: string, message: Message) {
  try {
    // Add message-specific tags
    const tags = [
      { name: "Content-Type", value: "application/json" },
      { name: "Type", value: "message" },
      { name: "ChatId", value: chatId },
      { name: "MessageId", value: message.id },
    ]

    // Upload message data
    const txId = await uploadToArweave(did, message, tags)

    if (txId) {
      // Store the transaction ID in local storage for reference
      const arweaveRefs = JSON.parse(localStorage.getItem(`fingenie_${did}_arweave_message_refs`) || "{}")
      if (!arweaveRefs[chatId]) {
        arweaveRefs[chatId] = {}
      }
      arweaveRefs[chatId][message.id] = txId
      localStorage.setItem(`fingenie_${did}_arweave_message_refs`, JSON.stringify(arweaveRefs))
    }

    return txId
  } catch (error) {
    console.error("Failed to save message to Arweave:", error)
    return null
  }
}

// Query Arweave for chat history (this would typically use a GraphQL query to Arweave)
// For simplicity, we'll use the transaction IDs stored in local storage
export async function getChatHistoryFromArweave(did: string) {
  try {
    // In a real implementation, you would query Arweave GraphQL API
    // For now, we'll just return the references stored locally
    const arweaveRefs = JSON.parse(localStorage.getItem(`fingenie_${did}_arweave_refs`) || "{}")
    return Object.keys(arweaveRefs).map((chatId) => ({
      id: chatId,
      arweaveId: arweaveRefs[chatId],
    }))
  } catch (error) {
    console.error("Failed to get chat history from Arweave:", error)
    return []
  }
}

// Get chat status - whether it's saved to Arweave or not
export function getChatArweaveStatus(did: string, chatId: string) {
  try {
    const arweaveRefs = JSON.parse(localStorage.getItem(`fingenie_${did}_arweave_refs`) || "{}")
    return {
      isSaved: !!arweaveRefs[chatId],
      arweaveId: arweaveRefs[chatId] || null,
    }
  } catch (error) {
    console.error("Failed to get chat Arweave status:", error)
    return { isSaved: false, arweaveId: null }
  }
}

// Get message status - whether it's saved to Arweave or not
export function getMessageArweaveStatus(did: string, chatId: string, messageId: string) {
  try {
    const arweaveRefs = JSON.parse(localStorage.getItem(`fingenie_${did}_arweave_message_refs`) || "{}")
    return {
      isSaved: !!(arweaveRefs[chatId] && arweaveRefs[chatId][messageId]),
      arweaveId: arweaveRefs[chatId] && arweaveRefs[chatId][messageId] ? arweaveRefs[chatId][messageId] : null,
    }
  } catch (error) {
    console.error("Failed to get message Arweave status:", error)
    return { isSaved: false, arweaveId: null }
  }
}

// Function to check Bundlr balance
export async function getBundlrBalance() {
  try {
    const bundlrInstance = await getBundlr()
    if (!bundlrInstance) {
      throw new Error("Bundlr not initialized")
    }

    const balance = await bundlrInstance.getLoadedBalance()
    return {
      balance: balance,
      formatted: bundlrInstance.utils.unitConverter(balance),
    }
  } catch (error) {
    console.error("Failed to get Bundlr balance:", error)
    return { balance: 0, formatted: "0" }
  }
}

// Function to fund Bundlr with a small amount for testing
export async function fundBundlr(amount: string) {
  try {
    const bundlrInstance = await getBundlr()
    if (!bundlrInstance) {
      throw new Error("Bundlr not initialized")
    }

    // Convert amount to atomic units
    const atomicAmount = bundlrInstance.utils.toAtomic(amount)

    // Fund the node
    const response = await bundlrInstance.fund(atomicAmount)
    return response
  } catch (error) {
    console.error("Failed to fund Bundlr:", error)
    throw error
  }
}

