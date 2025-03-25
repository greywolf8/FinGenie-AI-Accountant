"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

interface TaxReportSectionProps {
  taxData: any
  taxResults: any
  onDownload: () => void
}

export default function TaxReportSection({ taxData, taxResults, onDownload }: TaxReportSectionProps) {
  const printReport = () => {
    window.print()
  }

  // Format filing status for display
  const formatFilingStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Tax Report Summary</CardTitle>
          <CardDescription>Summary of your tax calculation for {taxData.taxYear}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium mb-4">Filing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Filing Status</p>
                <p className="font-medium">{formatFilingStatus(taxData.filingStatus)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tax Year</p>
                <p className="font-medium">{taxData.taxYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dependents</p>
                <p className="font-medium">{taxData.dependents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium">
                  {taxData.state}, {taxData.country}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium mb-4">Income Summary</h3>
            <div className="space-y-2">
              {Object.entries(taxData.income).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                  </span>
                  <span className="font-medium">${(value as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium">Total Income</span>
                <span className="font-medium">${taxResults.totalIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium mb-4">Deductions & Expenses</h3>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Deductions</h4>
              {Object.entries(taxData.deductions).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                  </span>
                  <span className="font-medium">${(value as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="font-medium">Total Deductions</span>
                <span className="font-medium">${taxResults.totalDeductions.toLocaleString()}</span>
              </div>

              <h4 className="text-sm font-medium mt-4">Expenses</h4>
              {Object.entries(taxData.expenses).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                  </span>
                  <span className="font-medium">${(value as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="font-medium">Total Expenses</span>
                <span className="font-medium">${taxResults.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium mb-4">Tax Calculation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Taxable Income</span>
                <span className="font-medium">${taxResults.taxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Federal Tax</span>
                <span className="font-medium">${taxResults.federalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">State Tax</span>
                <span className="font-medium">${taxResults.stateTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Medicare Tax</span>
                <span className="font-medium">${taxResults.medicareTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Social Security Tax</span>
                <span className="font-medium">${taxResults.socialSecurityTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tax Credits</span>
                <span className="font-medium">${taxResults.taxCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium">Total Tax</span>
                <span className="font-medium">${taxResults.totalTax.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Tax Rates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tax Bracket</span>
                <span className="font-medium">{taxResults.taxBracket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Marginal Tax Rate</span>
                <span className="font-medium">{(taxResults.marginalTaxRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Effective Tax Rate</span>
                <span className="font-medium">{(taxResults.effectiveTaxRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {taxResults.suggestedDeductions && taxResults.suggestedDeductions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-4">Tax Saving Opportunities</h3>
              <div className="space-y-4">
                {taxResults.suggestedDeductions.map((suggestion, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="font-medium">{suggestion.description}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current: ${suggestion.current.toLocaleString()} | Suggested: $
                      {suggestion.suggested.toLocaleString()} | Potential Savings: $
                      {suggestion.potential.toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="font-medium">
                    Total Potential Savings: ${taxResults.potentialSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between print:hidden">
          <Button variant="outline" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 print:hidden">
        <p>This tax report is for informational purposes only and should not be considered as tax advice.</p>
        <p>Please consult with a qualified tax professional for specific tax guidance.</p>
      </div>
    </div>
  )
}

