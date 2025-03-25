"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Calculator, Download, Send, Shield, Database } from "lucide-react"
import IncomeSection from "./income-section"
import DeductionsSection from "./deductions-section"
import ExpensesSection from "./expenses-section"
import TaxBracketSection from "./tax-bracket-section"
import TaxSimulationSection from "./tax-simulation-section"
import TaxReportSection from "./tax-report-section"
import TaxSavingTips from "./tax-saving-tips"
import BlockchainStatus from "./blockchain-status"

interface TaxCalculatorProps {
  onClose: () => void
  onSendToChat: (message: string) => void
}

export default function TaxCalculator({ onClose, onSendToChat }: TaxCalculatorProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("income")
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBlockchainSaved, setIsBlockchainSaved] = useState(false)
  const [taxData, setTaxData] = useState({
    income: {
      salary: 0,
      business: 0,
      capital_gains: 0,
      interest: 0,
      dividends: 0,
      rental: 0,
      other: 0,
    },
    deductions: {
      retirement: 0,
      health_insurance: 0,
      mortgage_interest: 0,
      charitable: 0,
      education: 0,
      medical: 0,
      state_local_tax: 0,
      other: 0,
    },
    expenses: {
      business: 0,
      medical: 0,
      education: 0,
      home_office: 0,
      travel: 0,
      other: 0,
    },
    taxYear: new Date().getFullYear(),
    filingStatus: "single",
    dependents: 0,
    country: "US",
    state: "CA",
  })

  const [taxResults, setTaxResults] = useState({
    totalIncome: 0,
    totalDeductions: 0,
    totalExpenses: 0,
    taxableIncome: 0,
    federalTax: 0,
    stateTax: 0,
    medicareTax: 0,
    socialSecurityTax: 0,
    totalTax: 0,
    effectiveTaxRate: 0,
    marginalTaxRate: 0,
    taxBracket: "",
    nextBracketThreshold: 0,
    potentialSavings: 0,
    suggestedDeductions: [],
    taxCredits: 0,
  })

  // Load saved tax data from blockchain storage
  useEffect(() => {
    if (user?.did) {
      loadTaxData()
    }
  }, [user?.did])

  const loadTaxData = async () => {
    try {
      // In a real implementation, this would fetch data from blockchain storage
      // For now, we'll simulate loading with a timeout
      setIsCalculating(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate loaded data (in a real app, this would come from blockchain storage)
      // For demo purposes, we'll just keep the default state

      setIsCalculating(false)
      setIsBlockchainSaved(true)
    } catch (error) {
      console.error("Error loading tax data:", error)
      setIsCalculating(false)
    }
  }

  const calculateTax = async () => {
    setIsCalculating(true)

    try {
      // Calculate total income
      const totalIncome = Object.values(taxData.income).reduce((sum, val) => sum + val, 0)

      // Calculate total deductions
      const totalDeductions = Object.values(taxData.deductions).reduce((sum, val) => sum + val, 0)

      // Calculate total expenses
      const totalExpenses = Object.values(taxData.expenses).reduce((sum, val) => sum + val, 0)

      // Calculate taxable income
      const taxableIncome = Math.max(0, totalIncome - totalDeductions - totalExpenses)

      // Calculate federal tax (simplified for demo)
      let federalTax = 0
      let taxBracket = ""
      let marginalTaxRate = 0
      let nextBracketThreshold = 0

      // Simplified US federal tax calculation for single filers (2023)
      if (taxableIncome <= 11000) {
        federalTax = taxableIncome * 0.1
        taxBracket = "10%"
        marginalTaxRate = 0.1
        nextBracketThreshold = 11000
      } else if (taxableIncome <= 44725) {
        federalTax = 1100 + (taxableIncome - 11000) * 0.12
        taxBracket = "12%"
        marginalTaxRate = 0.12
        nextBracketThreshold = 44725
      } else if (taxableIncome <= 95375) {
        federalTax = 5147 + (taxableIncome - 44725) * 0.22
        taxBracket = "22%"
        marginalTaxRate = 0.22
        nextBracketThreshold = 95375
      } else if (taxableIncome <= 182100) {
        federalTax = 16290 + (taxableIncome - 95375) * 0.24
        taxBracket = "24%"
        marginalTaxRate = 0.24
        nextBracketThreshold = 182100
      } else if (taxableIncome <= 231250) {
        federalTax = 37104 + (taxableIncome - 182100) * 0.32
        taxBracket = "32%"
        marginalTaxRate = 0.32
        nextBracketThreshold = 231250
      } else if (taxableIncome <= 578125) {
        federalTax = 52832 + (taxableIncome - 231250) * 0.35
        taxBracket = "35%"
        marginalTaxRate = 0.35
        nextBracketThreshold = 578125
      } else {
        federalTax = 174238.25 + (taxableIncome - 578125) * 0.37
        taxBracket = "37%"
        marginalTaxRate = 0.37
        nextBracketThreshold = Number.POSITIVE_INFINITY
      }

      // Simplified state tax calculation (using CA as example)
      const stateTax = taxableIncome * 0.093 // Simplified CA tax rate

      // Calculate Medicare and Social Security taxes
      const medicareTax = totalIncome * 0.0145
      const socialSecurityTax = Math.min(totalIncome, 160200) * 0.062 // 2023 SS wage base

      // Calculate total tax
      const totalTax = federalTax + stateTax + medicareTax + socialSecurityTax

      // Calculate effective tax rate
      const effectiveTaxRate = totalIncome > 0 ? totalTax / totalIncome : 0

      // Calculate potential tax savings
      const potentialSavings = calculatePotentialSavings(taxData, taxableIncome, marginalTaxRate)

      // Generate suggested deductions
      const suggestedDeductions = generateSuggestedDeductions(taxData, taxableIncome)

      // Calculate tax credits (simplified)
      const taxCredits = taxData.dependents * 2000 // Child tax credit

      // Set tax results
      setTaxResults({
        totalIncome,
        totalDeductions,
        totalExpenses,
        taxableIncome,
        federalTax,
        stateTax,
        medicareTax,
        socialSecurityTax,
        totalTax,
        effectiveTaxRate,
        marginalTaxRate,
        taxBracket,
        nextBracketThreshold,
        potentialSavings,
        suggestedDeductions,
        taxCredits,
      })

      // Simulate saving to blockchain
      await saveTaxDataToBlockchain()
    } catch (error) {
      console.error("Error calculating tax:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const saveTaxDataToBlockchain = async () => {
    setIsSaving(true)

    try {
      // In a real implementation, this would save data to blockchain storage
      // For now, we'll simulate saving with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsBlockchainSaved(true)
    } catch (error) {
      console.error("Error saving tax data to blockchain:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const calculatePotentialSavings = (data, taxableIncome, marginalRate) => {
    // Calculate potential savings based on unused deduction opportunities
    let potentialSavings = 0

    // Check for retirement contribution potential
    const maxRetirement = 22500 // 401k limit for 2023
    const unusedRetirement = Math.max(0, maxRetirement - data.deductions.retirement)
    potentialSavings += unusedRetirement * marginalRate

    // Check for HSA contribution potential if applicable
    const maxHSA = 3850 // Self-only HSA limit for 2023
    const unusedHSA = Math.max(0, maxHSA - data.deductions.health_insurance)
    potentialSavings += unusedHSA * marginalRate

    // Check for charitable contribution potential
    const charitablePotential = taxableIncome * 0.1 // Suggest donating up to 10% of taxable income
    potentialSavings += charitablePotential * marginalRate

    return potentialSavings
  }

  const generateSuggestedDeductions = (data, taxableIncome) => {
    const suggestions = []

    // Retirement contribution suggestion
    const maxRetirement = 22500 // 401k limit for 2023
    if (data.deductions.retirement < maxRetirement) {
      suggestions.push({
        type: "retirement",
        description: "Increase retirement contributions",
        current: data.deductions.retirement,
        suggested: maxRetirement,
        potential: maxRetirement - data.deductions.retirement,
      })
    }

    // HSA contribution suggestion
    const maxHSA = 3850 // Self-only HSA limit for 2023
    if (data.deductions.health_insurance < maxHSA) {
      suggestions.push({
        type: "hsa",
        description: "Contribute to Health Savings Account (HSA)",
        current: data.deductions.health_insurance,
        suggested: maxHSA,
        potential: maxHSA - data.deductions.health_insurance,
      })
    }

    // Charitable contribution suggestion
    const charitablePotential = Math.round(taxableIncome * 0.1) // Suggest donating up to 10% of taxable income
    if (data.deductions.charitable < charitablePotential) {
      suggestions.push({
        type: "charitable",
        description: "Consider charitable donations",
        current: data.deductions.charitable,
        suggested: charitablePotential,
        potential: charitablePotential - data.deductions.charitable,
      })
    }

    return suggestions
  }

  const handleInputChange = (section, field, value) => {
    setTaxData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Number.parseFloat(value) || 0,
      },
    }))

    // Mark as not saved when data changes
    setIsBlockchainSaved(false)
  }

  const handleSelectChange = (field, value) => {
    setTaxData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Mark as not saved when data changes
    setIsBlockchainSaved(false)
  }

  const handleSendToChat = () => {
    // Format tax calculation results for chat
    const message = formatTaxResultsForChat()
    onSendToChat(message)
  }

  const formatTaxResultsForChat = () => {
    return `
Here are my tax calculation results:

Filing Status: ${taxData.filingStatus}
Tax Year: ${taxData.taxYear}
Country: ${taxData.country}
State: ${taxData.state}

Income Summary:
- Total Income: $${taxResults.totalIncome.toLocaleString()}
- Total Deductions: $${taxResults.totalDeductions.toLocaleString()}
- Total Expenses: $${taxResults.totalExpenses.toLocaleString()}
- Taxable Income: $${taxResults.taxableIncome.toLocaleString()}

Tax Breakdown:
- Federal Tax: $${taxResults.federalTax.toLocaleString()}
- State Tax: $${taxResults.stateTax.toLocaleString()}
- Medicare Tax: $${taxResults.medicareTax.toLocaleString()}
- Social Security Tax: $${taxResults.socialSecurityTax.toLocaleString()}
- Tax Credits: $${taxResults.taxCredits.toLocaleString()}
- Total Tax: $${taxResults.totalTax.toLocaleString()}

Tax Rates:
- Marginal Tax Bracket: ${taxResults.taxBracket}
- Effective Tax Rate: ${(taxResults.effectiveTaxRate * 100).toFixed(2)}%

Potential Tax Savings: $${taxResults.potentialSavings.toLocaleString()}

Can you analyze these results and suggest any tax optimization strategies?
`
  }

  const downloadTaxReport = () => {
    // In a real implementation, this would generate a PDF report
    // For now, we'll just download a JSON file with the tax data
    const reportData = {
      user: {
        name: user?.username || "User",
        did: user?.did || "",
      },
      taxData,
      taxResults,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fingenie-tax-report-${taxData.taxYear}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 mr-1"
            aria-label="Back to chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Calculator className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">FinGenie Tax Calculator</h3>
          <div className="ml-2 flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-xs">
            <Database className="h-3 w-3" />
            <span>Blockchain Secured</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BlockchainStatus isSaving={isSaving} isSaved={isBlockchainSaved} />
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={downloadTaxReport}
            disabled={!taxResults.totalTax}
          >
            <Download className="h-4 w-4 mr-1" />
            Download Report
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleSendToChat}
            disabled={!taxResults.totalTax}
          >
            <Send className="h-4 w-4 mr-1" />
            Send to Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advanced Tax Calculator</span>
                <div className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
                  <Shield className="h-4 w-4 mr-1 text-orange-500" />
                  <span>Secured with Blockchain Storage</span>
                </div>
              </CardTitle>
              <CardDescription>
                Calculate your tax liability, explore deductions, and discover tax-saving opportunities
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="deductions">Deductions</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  <TabsTrigger value="brackets">Tax Brackets</TabsTrigger>
                  <TabsTrigger value="simulation">Simulation</TabsTrigger>
                  <TabsTrigger value="report">Report</TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="mt-0">
                  <IncomeSection
                    data={taxData.income}
                    onChange={(field, value) => handleInputChange("income", field, value)}
                    filingStatus={taxData.filingStatus}
                    onFilingStatusChange={(value) => handleSelectChange("filingStatus", value)}
                    taxYear={taxData.taxYear}
                    onTaxYearChange={(value) => handleSelectChange("taxYear", value)}
                    country={taxData.country}
                    onCountryChange={(value) => handleSelectChange("country", value)}
                    state={taxData.state}
                    onStateChange={(value) => handleSelectChange("state", value)}
                    dependents={taxData.dependents}
                    onDependentsChange={(value) => handleSelectChange("dependents", value)}
                  />
                </TabsContent>

                <TabsContent value="deductions" className="mt-0">
                  <DeductionsSection
                    data={taxData.deductions}
                    onChange={(field, value) => handleInputChange("deductions", field, value)}
                  />
                </TabsContent>

                <TabsContent value="expenses" className="mt-0">
                  <ExpensesSection
                    data={taxData.expenses}
                    onChange={(field, value) => handleInputChange("expenses", field, value)}
                  />
                </TabsContent>

                <TabsContent value="brackets" className="mt-0">
                  <TaxBracketSection
                    taxableIncome={taxResults.taxableIncome}
                    taxBracket={taxResults.taxBracket}
                    marginalRate={taxResults.marginalTaxRate}
                    effectiveRate={taxResults.effectiveTaxRate}
                    nextBracketThreshold={taxResults.nextBracketThreshold}
                    filingStatus={taxData.filingStatus}
                    taxYear={taxData.taxYear}
                  />
                </TabsContent>

                <TabsContent value="simulation" className="mt-0">
                  <TaxSimulationSection
                    taxData={taxData}
                    taxResults={taxResults}
                    suggestedDeductions={taxResults.suggestedDeductions}
                  />
                </TabsContent>

                <TabsContent value="report" className="mt-0">
                  <TaxReportSection taxData={taxData} taxResults={taxResults} onDownload={downloadTaxReport} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Income:</span>
                      <span className="font-medium">${taxResults.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Deductions:</span>
                      <span className="font-medium">${taxResults.totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Expenses:</span>
                      <span className="font-medium">${taxResults.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Taxable Income:</span>
                      <span className="font-medium">${taxResults.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Federal Tax:</span>
                      <span className="font-medium">${taxResults.federalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">State Tax:</span>
                      <span className="font-medium">${taxResults.stateTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Medicare Tax:</span>
                      <span className="font-medium">${taxResults.medicareTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Social Security Tax:</span>
                      <span className="font-medium">${taxResults.socialSecurityTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tax Credits:</span>
                      <span className="font-medium">${taxResults.taxCredits.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                    <div className="flex justify-between font-medium">
                      <span>Total Tax:</span>
                      <span className="text-lg">${taxResults.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Effective Tax Rate:</span>
                      <span className="font-medium">{(taxResults.effectiveTaxRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Marginal Tax Rate:</span>
                      <span className="font-medium">{(taxResults.marginalTaxRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={calculateTax}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Calculating...
                      </span>
                    ) : (
                      "Calculate Tax"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6">
                <TaxSavingTips
                  suggestedDeductions={taxResults.suggestedDeductions}
                  potentialSavings={taxResults.potentialSavings}
                  marginalRate={taxResults.marginalTaxRate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

