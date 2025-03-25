"use client"

import { Database, Check, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BlockchainStatusProps {
  isSaving: boolean
  isSaved: boolean
}

export default function BlockchainStatus({ isSaving, isSaved }: BlockchainStatusProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1 text-xs">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving to Blockchain...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="h-3 w-3 text-green-400" />
                <span>Saved to Blockchain</span>
              </>
            ) : (
              <>
                <Database className="h-3 w-3" />
                <span>Not Saved</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isSaving ? (
            <p className="max-w-xs">Securely saving your tax data to Arweave + Bundlr blockchain storage</p>
          ) : isSaved ? (
            <p className="max-w-xs">Your tax data is securely stored on the blockchain with your DID</p>
          ) : (
            <p className="max-w-xs">Changes not yet saved to blockchain storage</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

