"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DeductionsSectionProps {
  data: {
    retirement: number
    health_insurance: number
    mortgage_interest: number
    charitable: number
    education: number
    medical: number
    state_local_tax: number
    other: number
  }
  onChange: (field: string, value: string) => void
}

export default function DeductionsSection({ data, onChange }: DeductionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Deductions</CardTitle>
        <CardDescription>Enter your eligible tax deductions</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="retirement" className="mr-2">
              Retirement Contributions
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">401(k), IRA, and other retirement account contributions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="retirement"
            type="number"
            min="0"
            value={data.retirement || ""}
            onChange={(e) => onChange("retirement", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="health-insurance" className="mr-2">
              Health Insurance & HSA
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Health Savings Account contributions and health insurance premiums</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="health-insurance"
            type="number"
            min="0"
            value={data.health_insurance || ""}
            onChange={(e) => onChange("health_insurance", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="mortgage-interest" className="mr-2">
              Mortgage Interest
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Interest paid on home mortgages (Form 1098)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="mortgage-interest"
            type="number"
            min="0"
            value={data.mortgage_interest || ""}
            onChange={(e) => onChange("mortgage_interest", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="charitable" className="mr-2">
              Charitable Donations
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Donations to qualified charitable organizations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="charitable"
            type="number"
            min="0"
            value={data.charitable || ""}
            onChange={(e) => onChange("charitable", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="education" className="mr-2">
              Education Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Tuition, student loan interest, and education-related expenses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="education"
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
            <Label htmlFor="medical" className="mr-2">
              Medical Expenses
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Out-of-pocket medical expenses (only amounts exceeding 7.5% of AGI are deductible)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="medical"
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
            <Label htmlFor="state-local-tax" className="mr-2">
              State & Local Taxes
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">State and local income or sales taxes paid (limited to $10,000)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="state-local-tax"
            type="number"
            min="0"
            value={data.state_local_tax || ""}
            onChange={(e) => onChange("state_local_tax", e.target.value)}
            placeholder="0"
            className="text-right"
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="other-deductions" className="mr-2">
              Other Deductions
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Other eligible deductions not listed above</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="other-deductions"
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

