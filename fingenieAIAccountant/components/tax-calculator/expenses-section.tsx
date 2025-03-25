"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ExpensesSectionProps {
  data: {
    business: number
    medical: number
    education: number
    home_office: number
    travel: number
    other: number
  }
  onChange: (field: string, value: string) => void
}

export default function ExpensesSection({ data, onChange }: ExpensesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business & Eligible Expenses</CardTitle>
        <CardDescription>Enter your business and other eligible expenses</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="business-expenses" className="mr-2">
              Business Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Expenses related to self-employment or business activities</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="business-expenses"
            type="number"
            min="0"
            value={data.business || ""}
            onChange={(e) => onChange("business", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="medical-expenses" className="mr-2">
              Medical Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Unreimbursed medical expenses for business owners</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="medical-expenses"
            type="number"
            min="0"
            value={data.medical || ""}
            onChange={(e) => onChange("medical", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="education-expenses" className="mr-2">
              Education Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Business-related education and professional development</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="education-expenses"
            type="number"
            min="0"
            value={data.education || ""}
            onChange={(e) => onChange("education", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="home-office" className="mr-2">
              Home Office
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Home office expenses for self-employed individuals</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="home-office"
            type="number"
            min="0"
            value={data.home_office || ""}
            onChange={(e) => onChange("home_office", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="travel-expenses" className="mr-2">
              Travel & Transportation
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Business-related travel, mileage, and transportation expenses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="travel-expenses"
            type="number"
            min="0"
            value={data.travel || ""}
            onChange={(e) => onChange("travel", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="other-expenses" className="mr-2">
              Other Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Other eligible business expenses not listed above</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="other-expenses"
            type="number"
            min="0"
            value={data.other || ""}
            onChange={(e) => onChange("other", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>
      </CardContent>
    </Card>
  )
}

