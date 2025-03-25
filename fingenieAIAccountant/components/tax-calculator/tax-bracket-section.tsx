"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface TaxBracketSectionProps {
  taxableIncome: number
  taxBracket: string
  marginalRate: number
  effectiveRate: number
  nextBracketThreshold: number
  filingStatus: string
  taxYear: number
}

export default function TaxBracketSection({
  taxableIncome,
  taxBracket,
  marginalRate,
  effectiveRate,
  nextBracketThreshold,
  filingStatus,
  taxYear,
}: TaxBracketSectionProps) {
  // Define tax brackets for 2023 (simplified)
  const brackets = {
    single: [
      { rate: "10%", min: 0, max: 11000 },
      { rate: "12%", min: 11001, max: 44725 },
      { rate: "22%", min: 44726, max: 95375 },
      { rate: "24%", min: 95376, max: 182100 },
      { rate: "32%", min: 182101, max: 231250 },
      { rate: "35%", min: 231251, max: 578125 },
      { rate: "37%", min: 578126, max: Number.POSITIVE_INFINITY },
    ],
    married_joint: [
      { rate: "10%", min: 0, max: 22000 },
      { rate: "12%", min: 22001, max: 89450 },
      { rate: "22%", min: 89451, max: 190750 },
      { rate: "24%", min: 190751, max: 364200 },
      { rate: "32%", min: 364201, max: 462500 },
      { rate: "35%", min: 462501, max: 693750 },
      { rate: "37%", min: 693751, max: Number.POSITIVE_INFINITY },
    ],
    married_separate: [
      { rate: "10%", min: 0, max: 11000 },
      { rate: "12%", min: 11001, max: 44725 },
      { rate: "22%", min: 44726, max: 95375 },
      { rate: "24%", min: 95376, max: 182100 },
      { rate: "32%", min: 182101, max: 231250 },
      { rate: "35%", min: 231251, max: 346875 },
      { rate: "37%", min: 346876, max: Number.POSITIVE_INFINITY },
    ],
    head_household: [
      { rate: "10%", min: 0, max: 15700 },
      { rate: "12%", min: 15701, max: 59850 },
      { rate: "22%", min: 59851, max: 95350 },
      { rate: "24%", min: 95351, max: 182100 },
      { rate: "32%", min: 182101, max: 231250 },
      { rate: "35%", min: 231251, max: 578100 },
      { rate: "37%", min: 578101, max: Number.POSITIVE_INFINITY },
    ],
  }

  // Get the appropriate brackets based on filing status
  const applicableBrackets = brackets[filingStatus] || brackets.single

  // Calculate the percentage of the current bracket filled
  const currentBracket = applicableBrackets.find((bracket) => bracket.rate === taxBracket)
  const bracketProgress = currentBracket
    ? Math.min(100, ((taxableIncome - currentBracket.min) / (currentBracket.max - currentBracket.min)) * 100)
    : 0

  // Calculate amount needed to reach next bracket
  const amountToNextBracket = nextBracketThreshold - taxableIncome

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Bracket Analysis</CardTitle>
          <CardDescription>Your current tax bracket and marginal tax rate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Tax Bracket</h3>
              <div className="text-3xl font-bold">{taxBracket}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Marginal Tax Rate: {(marginalRate * 100).toFixed(0)}%
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Effective Tax Rate</h3>
              <div className="text-3xl font-bold">{(effectiveRate * 100).toFixed(2)}%</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average rate across all income</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Bracket Progress</span>
              <span>{bracketProgress.toFixed(0)}%</span>
            </div>
            <Progress value={bracketProgress} className="h-2" />
            {nextBracketThreshold < Number.POSITIVE_INFINITY && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${amountToNextBracket.toLocaleString()} more income until next bracket (
                {nextBracketThreshold.toLocaleString()})
              </p>
            )}
          </div>

          {taxableIncome > 0 && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Tax Bracket Insight</AlertTitle>
              <AlertDescription>
                You are in the {taxBracket} tax bracket. This means you pay {(marginalRate * 100).toFixed(0)}% on each
                additional dollar earned. Your effective tax rate of {(effectiveRate * 100).toFixed(2)}% is the average
                rate you pay across all your income.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Federal Tax Brackets ({taxYear})</CardTitle>
          <CardDescription>Federal income tax brackets for {filingStatus.replace("_", " ")} filers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Tax Rate</th>
                  <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Taxable Income Range</th>
                </tr>
              </thead>
              <tbody>
                {applicableBrackets.map((bracket, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 dark:border-gray-700 ${bracket.rate === taxBracket ? "bg-orange-50 dark:bg-orange-900/20" : ""}`}
                  >
                    <td className="py-2 font-medium">{bracket.rate}</td>
                    <td className="py-2">
                      {bracket.min.toLocaleString()} -{" "}
                      {bracket.max === Number.POSITIVE_INFINITY ? "+" : bracket.max.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Note: Tax brackets are progressive, meaning you only pay the higher rate on income above each threshold.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

