"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IncomeSectionProps {
  data: {
    salary: number
    business: number
    capital_gains: number
    interest: number
    dividends: number
    rental: number
    other: number
  }
  onChange: (field: string, value: string) => void
  filingStatus: string
  onFilingStatusChange: (value: string) => void
  taxYear: number
  onTaxYearChange: (value: number) => void
  country: string
  onCountryChange: (value: string) => void
  state: string
  onStateChange: (value: string) => void
  dependents: number
  onDependentsChange: (value: number) => void
}

export default function IncomeSection({
  data,
  onChange,
  filingStatus,
  onFilingStatusChange,
  taxYear,
  onTaxYearChange,
  country,
  onCountryChange,
  state,
  onStateChange,
  dependents,
  onDependentsChange,
}: IncomeSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filing Information</CardTitle>
          <CardDescription>Enter your basic tax filing information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="filing-status">Filing Status</Label>
            <Select value={filingStatus} onValueChange={onFilingStatusChange}>
              <SelectTrigger id="filing-status">
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                <SelectItem value="head_household">Head of Household</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-year">Tax Year</Label>
            <Select value={taxYear.toString()} onValueChange={(value) => onTaxYearChange(Number.parseInt(value))}>
              <SelectTrigger id="tax-year">
                <SelectValue placeholder="Select tax year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              value={dependents}
              onChange={(e) => onDependentsChange(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="IN">India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={state} onValueChange={onStateChange}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>Enter all your income sources for the tax year</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="salary" className="mr-2">
                Salary & Wages
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Include all W-2 income, bonuses, tips, and commissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="salary"
              type="number"
              min="0"
              value={data.salary || ""}
              onChange={(e) => onChange("salary", e.target.value)}
              placeholder="0"
              className="text-right"
              prefix="$"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="business" className="mr-2">
                Business Income
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Net income from self-employment or business activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="business"
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
              <Label htmlFor="capital-gains" className="mr-2">
                Capital Gains
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Net gains from selling investments, property, or other assets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="capital-gains"
              type="number"
              min="0"
              value={data.capital_gains || ""}
              onChange={(e) => onChange("capital_gains", e.target.value)}
              placeholder="0"
              className="text-right"
              prefix="$"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="interest" className="mr-2">
                Interest Income
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Interest from bank accounts, CDs, bonds, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="interest"
              type="number"
              min="0"
              value={data.interest || ""}
              onChange={(e) => onChange("interest", e.target.value)}
              placeholder="0"
              className="text-right"
              prefix="$"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="dividends" className="mr-2">
                Dividend Income
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Dividends from stocks and mutual funds</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="dividends"
              type="number"
              min="0"
              value={data.dividends || ""}
              onChange={(e) => onChange("dividends", e.target.value)}
              placeholder="0"
              className="text-right"
              prefix="$"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="rental" className="mr-2">
                Rental Income
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Net income from rental properties</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="rental"
              type="number"
              min="0"
              value={data.rental || ""}
              onChange={(e) => onChange("rental", e.target.value)}
              placeholder="0"
              className="text-right"
              prefix="$"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="other-income" className="mr-2">
                Other Income
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Unemployment, Social Security, gambling winnings, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="other-income"
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
    </div>
  )
}

