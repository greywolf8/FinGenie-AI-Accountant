import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  limit,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC19DB_phEP5A3VMWOqYewtw1H0BWEpYbo",
  authDomain: "fingenie-4b775.firebaseapp.com",
  projectId: "fingenie-4b775",
  storageBucket: "fingenie-4b775.appspot.com",
  messagingSenderId: "438681940907",
  appId: "1:438681940907:web:1560226c10b18182ca58ee",
  measurementId: "G-ZTH1B48KD7",
}

// Initialize Firebase - ensure it's only initialized once
let firebaseApp
let db
let auth

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log("Initializing Firebase for the first time")
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    console.log("Firebase already initialized, getting existing app")
    firebaseApp = getApp()
  }

  // Initialize Firestore with error handling
  try {
    db = getFirestore(firebaseApp)
    console.log("Firestore initialized successfully")
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    throw new Error("Failed to initialize Firestore")
  }

  // Initialize Auth with error handling
  try {
    auth = getAuth(firebaseApp)
    console.log("Auth initialized successfully")
  } catch (error) {
    console.error("Error initializing Auth:", error)
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// Update the createNewChat function to accept a title parameter
export async function createNewChat(did: string, title = "New Chat") {
  if (!db) {
    console.error("Firestore not initialized")
    return null
  }

  try {
    const chatId = Date.now().toString()
    const chatRef = doc(db, `users/${did}/chats`, chatId)

    await setDoc(chatRef, {
      id: chatId,
      createdAt: Timestamp.now(),
      title: title,
    })

    return chatId
  } catch (error) {
    console.error("Error creating new chat:", error)
    return null
  }
}

// Add a function to update chat title
export async function updateChatTitle(did: string, chatId: string, title: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return false
  }

  try {
    const chatRef = doc(db, `users/${did}/chats`, chatId)
    await setDoc(chatRef, { title }, { merge: true })
    return true
  } catch (error) {
    console.error("Error updating chat title:", error)
    return false
  }
}

// Update the saveChatMessage function to also update the chat title if it's the first message
export async function saveChatMessage(
  did: string,
  message: { id: string; role: string; content: string },
  chatId?: string,
) {
  if (!db) {
    console.error("Firestore not initialized")
    return false
  }

  try {
    // If chatId is provided, save the message to that chat
    if (chatId) {
      // Create a reference to the user's chat messages collection
      const messagesRef = collection(db, `users/${did}/chats/${chatId}/messages`)

      // Add the message with timestamp
      await addDoc(messagesRef, {
        ...message,
        timestamp: Timestamp.now(),
      })

      // If this is a user message and might be the first message, update the chat title
      if (message.role === "user") {
        // Get all messages in this chat
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(2))
        const snapshot = await getDocs(q)

        // If this is the first or second message (first could be system greeting)
        if (snapshot.size <= 2) {
          // Use the user's message as the chat title (truncate if too long)
          let title = message.content
          if (title.length > 50) {
            title = title.substring(0, 47) + "..."
          }
          await updateChatTitle(did, chatId, title)
        }
      }
    } else {
      // Backward compatibility: save to the general messages collection
      const chatRef = collection(db, `users/${did}/messages`)
      await addDoc(chatRef, {
        ...message,
        timestamp: Timestamp.now(),
      })
    }

    console.log("Chat message saved successfully!")
    return true
  } catch (error) {
    console.error("Error saving chat message:", error)
    return false
  }
}

// Add a function to get messages for a specific chat
export async function getChatMessages(did: string, chatId: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return []
  }

  try {
    const messagesRef = collection(db, `users/${did}/chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "asc"))
    const snapshot = await getDocs(q)

    const messages: any[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: data.id,
        role: data.role,
        content: data.content,
      })
    })

    return messages
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return []
  }
}

// Chat storage functions - with error handling
export async function getChatHistory(did: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return []
  }

  try {
    const messagesRef = collection(db, `users/${did}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "asc"))
    const snapshot = await getDocs(q)

    const messages: any[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: data.id,
        role: data.role,
        content: data.content,
      })
    })

    return messages
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return []
  }
}

export async function getUserChats(did: string) {
  if (!db) {
    console.error("Firestore not initialized")
    return []
  }

  try {
    const chatsRef = collection(db, `users/${did}/chats`)
    const q = query(chatsRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const chats: any[] = []
    snapshot.forEach((doc) => {
      chats.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return chats
  } catch (error) {
    console.error("Error fetching user chats:", error)
    return []
  }
}

// Export initialized services
export { db, auth }

