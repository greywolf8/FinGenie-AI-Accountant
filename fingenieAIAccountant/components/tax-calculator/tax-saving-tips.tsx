"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingDown, AlertTriangle, Info } from "lucide-react"

interface TaxSavingTipsProps {
  suggestedDeductions: any[]
  potentialSavings: number
  marginalRate: number
}

export default function TaxSavingTips({ suggestedDeductions, potentialSavings, marginalRate }: TaxSavingTipsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-green-500" />
          Tax Saving Opportunities
        </CardTitle>
        <CardDescription>Personalized recommendations to reduce your tax liability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {potentialSavings > 0 ? (
          <>
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <Info className="h-4 w-4 text-green-500" />
              <AlertTitle>Potential Tax Savings</AlertTitle>
              <AlertDescription>
                You could save up to <span className="font-bold">${potentialSavings.toLocaleString()}</span> in taxes by
                implementing the recommendations below.
              </AlertDescription>
            </Alert>

            {suggestedDeductions && suggestedDeductions.length > 0 ? (
              <div className="space-y-4">
                {suggestedDeductions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                  >
                    <h4 className="font-medium">{suggestion.description}</h4>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span>${suggestion.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suggested:</span>
                        <span>${suggestion.suggested.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                        <span>Tax Savings:</span>
                        <span>~${Math.round(suggestion.potential * marginalRate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Calculate your taxes to see personalized tax-saving recommendations.
              </p>
            )}
          </>
        ) : (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertTitle>No Recommendations Yet</AlertTitle>
            <AlertDescription>Calculate your taxes to see personalized tax-saving recommendations.</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400 pt-2">
          <h4 className="font-medium mb-2">General Tax Saving Tips:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maximize retirement account contributions (401(k), IRA)</li>
            <li>Consider Health Savings Account (HSA) contributions</li>
            <li>Bundle charitable donations in alternating years</li>
            <li>Track and deduct eligible business expenses</li>
            <li>Harvest investment losses to offset capital gains</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

