"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, X, FileText, Loader2, Paperclip, History } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { saveChatMessage, getChatHistory, getChatMessages } from "@/lib/local-storage"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
}

interface Window {
  pdfjsLib: any
}

interface ChatWindowProps {
  chatId?: string | null
}

const SUGGESTIONS = [
  "What is the difference between the old tax regime and the new tax regime?",
  "How is taxable income calculated for an individual?",
  "What is Section 80C, and what deductions are available under it?",
  "How does HRA exemption work under Section 10(13A)?",
]

const API_URL = "https://fin-backend-cbtl.onrender.com/chat"

// Define the intro message as a constant so it's consistent
const INTRO_MESSAGE = "👋 Hello! I'm FinGenie. Ask me anything about finance and accounting!"

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: INTRO_MESSAGE,
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [attachedDocument, setAttachedDocument] = useState<{ name: string; content: string } | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const introMessageSavedRef = useRef<boolean>(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add useEffect to speak intro message when chat opens
  useEffect(() => {
    // Speak the intro message when the component mounts
    if (messages.length > 0 && messages[0].role === "bot") {
      speakText(messages[0].content)
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Load chat history if user is authenticated
  useEffect(() => {
    if (user?.did) {
      loadChatHistory()
    }
  }, [user?.did, chatId])

  // Check if we're coming from tax calculator
  useEffect(() => {
    const comingFromTaxCalculator = localStorage.getItem("comingFromTaxCalculator")
    const taxCalculatorMessage = localStorage.getItem("taxCalculatorMessage")

    if (comingFromTaxCalculator === "true" && taxCalculatorMessage) {
      // Clear the flag
      localStorage.removeItem("comingFromTaxCalculator")

      // Set the input to a user-friendly message
      setInput("Here are my tax calculation results. Can you analyze them?")

      // Use setTimeout to ensure the state has been updated
      setTimeout(() => {
        handleSendMessage()
      }, 300)
    }
  }, [])

  // Cleanup function for speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error("Error stopping recognition:", e)
        }
      }
    }
  }, [])

  const loadChatHistory = async () => {
    if (!user?.did) {
      console.log("Cannot load chat history: User not authenticated")
      return
    }

    setIsLoadingHistory(true)
    introMessageSavedRef.current = false

    try {
      if (chatId) {
        // Load messages for the specific chat
        const history = await getChatMessages(user.did, chatId)

        if (history && history.length > 0) {
          setMessages(history)
        } else {
          // If no messages, set the default greeting
          const introMessage = {
            id: Date.now().toString(),
            role: "bot",
            content: INTRO_MESSAGE,
          }
          setMessages([introMessage])

          // Save the intro message to storage for this chat
          if (chatId && user?.did) {
            await saveChatMessage(user.did, introMessage, chatId)
            introMessageSavedRef.current = true
          }
        }
      } else {
        // Fallback to the old method
        const history = await getChatHistory(user.did)
        if (history && history.length > 0) {
          setMessages(history)
        } else {
          // If no messages in general history, add the intro message
          const introMessage = {
            id: Date.now().toString(),
            role: "bot",
            content: INTRO_MESSAGE,
          }
          setMessages([introMessage])

          // Save to general history
          await saveChatMessage(user.did, introMessage)
          introMessageSavedRef.current = true
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const fileType = file.type
    if (
      !fileType.includes("pdf") &&
      !fileType.includes("word") &&
      !fileType.includes("document") &&
      !fileType.includes("text")
    ) {
      alert("Please upload a PDF or document file.")
      return
    }

    setIsProcessingFile(true)

    try {
      // Extract text from the document based on file type
      let extractedText = ""

      if (fileType.includes("pdf")) {
        // For PDF files
        extractedText = await extractTextFromPDF(file)
      } else if (fileType.includes("text")) {
        // For text files
        extractedText = await file.text()
      } else {
        // For other document types, try to read as text
        try {
          extractedText = await file.text()
        } catch (error) {
          console.error("Error reading file as text:", error)
          extractedText = `[Unable to extract text from ${file.name}]`
        }
      }

      // Limit text length if needed
      if (extractedText.length > 5000) {
        extractedText = extractedText.substring(0, 5000) + "... [content truncated due to length]"
      }

      // Store the document info in state
      setAttachedDocument({
        name: file.name,
        content: extractedText,
      })

      // Focus the input field
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } catch (error) {
      console.error("Error processing document:", error)
      alert("Error processing document. Please try again.")
    } finally {
      setIsTyping(false)
      setIsProcessingFile(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachedDocument = () => {
    setAttachedDocument(null)
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !attachedDocument) return

    let messageToSend = input.trim()
    let userDisplayMessage = input.trim()

    // If there's an attached document
    if (attachedDocument) {
      // If the user hasn't entered any text, use a default message
      if (!input.trim()) {
        userDisplayMessage = `I've uploaded "${attachedDocument.name}" for analysis.`
      }

      // Prepare the message with document content - format it clearly for the API
      messageToSend = `DOCUMENT_CONTENT_FOR_ANALYSIS

${userDisplayMessage}

Document: ${attachedDocument.name}

${attachedDocument.content}`
    }

    // Check if we have tax calculator data
    const taxCalculatorMessage = localStorage.getItem("taxCalculatorMessage")
    if (taxCalculatorMessage && input.includes("tax calculation")) {
      messageToSend = taxCalculatorMessage
      localStorage.removeItem("taxCalculatorMessage")
    }

    // Add user message with the display version
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userDisplayMessage,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachedDocument(null)
    setIsTyping(true)
    setShowSuggestions(false)

    // Save user message to local storage if user is authenticated
    if (user?.did) {
      saveChatMessage(user.did, userMessage, chatId || undefined)
    }

    try {
      // Call the API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Add bot response
      const botMessage: Message = {
        id: Date.now().toString(),
        role: "bot",
        content: data.reply || "I apologize, but I couldn't generate a response at this moment.",
      }

      setMessages((prev) => [...prev, botMessage])

      // Save bot message to local storage if user is authenticated
      if (user?.did) {
        saveChatMessage(user.did, botMessage, chatId || undefined)
      }

      // Speak the response
      speakText(botMessage.content)
    } catch (error) {
      console.error("Error calling API:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "bot",
        content: "⚠️ Sorry, I'm having trouble connecting to my brain. Please try again.",
      }

      setMessages((prev) => [...prev, errorMessage])

      // Save error message to local storage if user is authenticated
      if (user?.did) {
        saveChatMessage(user.did, errorMessage, chatId || undefined)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSendMessage()
  }

  // Voice recognition
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition. Try Chrome or Edge.")
      return
    }

    setIsRecording(true)
    setInput("") // Clear any existing input

    const SpeechRecognition = window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false

    // Set a silence timeout
    let silenceTimeout: NodeJS.Timeout
    let hasRecognizedSpeech = false

    recognition.onresult = (event) => {
      hasRecognizedSpeech = true
      const transcript = event.results[0][0].transcript
      setInput(transcript)

      // Clear any existing timeout
      if (silenceTimeout) clearTimeout(silenceTimeout)

      // Set a new timeout for silence detection
      silenceTimeout = setTimeout(() => {
        if (recognition) {
          try {
            recognition.stop() // This will trigger onend
          } catch (e) {
            console.error("Error stopping recognition:", e)
          }
        }
      }, 1500) // 1.5 seconds of silence will trigger send
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null

      // If we recognized speech, send the message
      if (hasRecognizedSpeech) {
        // Use setTimeout to ensure the state has been updated
        setTimeout(() => {
          if (input.trim()) {
            // Automatically click the send button
            handleSendMessage()
          }
        }, 100)
      }
    }

    try {
      recognition.start()
    } catch (e) {
      console.error("Error starting recognition:", e)
      setIsRecording(false)
    }
  }

  // Text to speech
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Your browser doesn't support speech synthesis")
      return
    }

    // If already speaking, stop it (toggle behavior)
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    // Clean up text for better speech
    const cleanText = text.replace(/[#*`]/g, "").replace(/<[^>]*>/g, "")

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = "en-US"
    utterance.rate = 1.0
    utterance.pitch = 1.0

    setIsSpeaking(true)

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // Document upload and processing
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // We need to use pdf.js for PDF text extraction
    // First, load the PDF.js library dynamically
    if (!window.pdfjsLib) {
      // Load PDF.js if not already loaded
      const pdfjsScript = document.createElement("script")
      pdfjsScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"
      document.head.appendChild(pdfjsScript)

      // Wait for the script to load
      await new Promise<void>((resolve) => {
        pdfjsScript.onload = () => resolve()
      })

      // Set worker source
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"
    }

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise

      let extractedText = ""

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        extractedText += pageText + "\n"
      }

      return extractedText
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      return `[Error extracting text from PDF: ${error.message}]`
    }
  }

  // Add a fix for the chat window header disappearing
  useEffect(() => {
    // Function to ensure the header is visible
    const fixHeader = () => {
      const header = document.querySelector(".bg-gradient-to-r.from-orange-500.to-pink-500.p-4.text-white")
      if (header) {
        header.classList.add("sticky", "top-0", "z-10")
      }
    }

    // Run on mount and whenever messages change
    fixHeader()

    // Also set an interval to check periodically
    const interval = setInterval(fixHeader, 1000)

    return () => clearInterval(interval)
  }, [messages])

  // Add this useEffect after the other useEffects
  useEffect(() => {
    // Ensure the chat container has the correct height
    const updateChatContainerHeight = () => {
      if (chatBoxRef.current) {
        const windowHeight = window.innerHeight
        const headerHeight = 64 // Approximate header height
        const inputAreaHeight = 80 // Approximate input area height
        const suggestionsHeight = showSuggestions ? 180 : 0 // Approximate suggestions height if shown

        const availableHeight = windowHeight - headerHeight - inputAreaHeight - suggestionsHeight
        chatBoxRef.current.style.height = `${availableHeight}px`
        chatBoxRef.current.style.maxHeight = `${availableHeight}px`
      }
    }

    updateChatContainerHeight()
    window.addEventListener("resize", updateChatContainerHeight)

    return () => {
      window.removeEventListener("resize", updateChatContainerHeight)
    }
  }, [showSuggestions])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {isLoadingHistory && (
          <div className="flex justify-center my-4">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading chat history...</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
            <div className="flex items-start gap-1">
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gray-200 dark:bg-gray-700 rounded-tr-none text-gray-800 dark:text-gray-200"
                    : "bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-tl-none"
                }`}
              >
                {message.content.split("\n").map((line, i) => (
                  <div key={i}>
                    {line}
                    {i < message.content.split("\n").length - 1 && <br />}
                  </div>
                ))}
              </div>

              {message.role === "bot" && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-white dark:bg-gray-800 shadow-md mt-1"
                  onClick={() => speakText(message.content)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-orange-500"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </Button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Suggested Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-2">
        {/* Document attachment indicator */}
        {attachedDocument && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
            <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{attachedDocument.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={removeAttachedDocument}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white animate-pulse"
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop()
                  } catch (e) {
                    console.error("Error stopping recognition:", e)
                    setIsRecording(false)
                  }
                } else {
                  setIsRecording(false)
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : isSpeaking ? (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:text-white"
              onClick={stopSpeaking}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="rounded-full" onClick={startRecording}>
              <Mic className="h-4 w-4" />
            </Button>
          )}

          {/* Document upload button */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={handleFileUploadClick}
            disabled={isProcessingFile || !!attachedDocument}
          >
            {isProcessingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          </Button>

          {/* Chat history button */}
          {user?.did && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={loadChatHistory}
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
            </Button>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={isProcessingFile}
          />

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isRecording ? "Listening..." : isProcessingFile ? "Processing document..." : "Type your message..."
            }
            className="flex-1 text-gray-800 dark:text-gray-200"
            disabled={isRecording || isProcessingFile}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !attachedDocument) || isProcessingFile}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {messages.length > 10 && (
        <button
          onClick={() => {
            chatBoxRef.current?.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }}
          className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md z-10 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-300"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  )
}

