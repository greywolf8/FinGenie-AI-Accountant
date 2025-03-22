"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send } from "lucide-react"

interface TaxResult {
  grossIncome: number
  taxableIncome: number
  baseTax: number
  surcharge: number
  cess: number
  finalTax: number
}

interface TaxCalculatorProps {
  onSendToChat: () => void
}

const API_URL = "https://fin-backend-cbtl.onrender.com/chat"

export default function TaxCalculator({ onSendToChat }: TaxCalculatorProps) {
  const [regime, setRegime] = useState("old")
  const [income, setIncome] = useState("")
  const [sec80c, setSec80c] = useState("")
  const [sec80d, setSec80d] = useState("")
  const [hra, setHra] = useState("")
  const [homeLoan, setHomeLoan] = useState("")
  const [otherExemptions, setOtherExemptions] = useState("")
  const [nps, setNps] = useState("")
  const [result, setResult] = useState<TaxResult | null>(null)
  const [isSending, setIsSending] = useState(false)

  const calculateTax = () => {
    const incomeValue = Number.parseFloat(income) || 0
    const sec80cValue = Number.parseFloat(sec80c) || 0
    const sec80dValue = Number.parseFloat(sec80d) || 0
    const hraValue = Number.parseFloat(hra) || 0
    const homeLoanValue = Number.parseFloat(homeLoan) || 0
    const otherExemptionsValue = Number.parseFloat(otherExemptions) || 0
    const npsValue = Number.parseFloat(nps) || 0

    let taxableIncome = incomeValue
    let tax = 0

    if (regime === "old") {
      // Calculate total deductions for old regime
      const totalDeductions =
        Math.min(sec80cValue, 150000) + // 80C limit
        Math.min(sec80dValue, 25000) + // 80D limit (self)
        hraValue +
        Math.min(homeLoanValue, 200000) + // Home loan interest limit
        otherExemptionsValue +
        Math.min(npsValue, 50000) // Additional NPS limit

      taxableIncome = Math.max(0, incomeValue - totalDeductions)

      // Old Regime Tax Calculation
      if (taxableIncome <= 250000) {
        tax = 0
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.2
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.3
      }

      // Section 87A Rebate (for taxable income up to 5L)
      if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500)
      }
    } else {
      // New Regime Tax Calculation (FY 2023-24)
      if (taxableIncome <= 300000) {
        tax = 0
      } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.1
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.2
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.3
      }

      // Section 87A Rebate (for taxable income up to 7L in new regime)
      if (taxableIncome <= 700000) {
        tax = Math.max(0, tax - 25000)
      }
    }

    // Calculate surcharge if applicable
    let surcharge = 0
    if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
      surcharge = tax * 0.1
    } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
      surcharge = tax * 0.15
    } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
      surcharge = tax * 0.25
    } else if (taxableIncome > 50000000) {
      surcharge = tax * 0.37
    }

    // Calculate cess
    const cess = (tax + surcharge) * 0.04

    // Calculate final tax
    const finalTax = tax + surcharge + cess

    setResult({
      grossIncome: incomeValue,
      taxableIncome,
      baseTax: tax,
      surcharge,
      cess,
      finalTax,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const sendToChat = async () => {
    if (!result) return

    setIsSending(true)

    try {
      // Format the tax calculation data
      const message =
        `Here are my tax calculation results:\n` +
        `- Regime: ${regime}\n` +
        `- Gross Income: ${formatCurrency(result.grossIncome)}\n` +
        `- Taxable Income: ${formatCurrency(result.taxableIncome)}\n` +
        `- Tax Before Cess: ${formatCurrency(result.baseTax)}\n` +
        `- Health & Education Cess: ${formatCurrency(result.cess)}\n` +
        `- Final Tax Payable: ${formatCurrency(result.finalTax)}`

      // Store the message to be sent after switching to chat
      localStorage.setItem("taxCalculatorMessage", message)

      // Close calculator and show chat
      onSendToChat()
    } catch (error) {
      console.error("Error preparing tax data:", error)
      alert("There was an error preparing your tax data. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Personal Tax Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax-regime">Tax Regime</Label>
            <Select value={regime} onValueChange={setRegime}>
              <SelectTrigger id="tax-regime">
                <SelectValue placeholder="Select tax regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="old">Old Regime</SelectItem>
                <SelectItem value="new">New Regime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income">Annual Income (₹)</Label>
            <Input
              id="income"
              type="number"
              placeholder="Enter your total annual income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>

          {regime === "old" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sec-80c">Section 80C Investments (₹)</Label>
                <Input
                  id="sec-80c"
                  type="number"
                  placeholder="PF, ELSS, PPF, etc."
                  value={sec80c}
                  onChange={(e) => setSec80c(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sec-80d">Section 80D (Health Insurance) (₹)</Label>
                <Input
                  id="sec-80d"
                  type="number"
                  placeholder="Health Insurance Premium"
                  value={sec80d}
                  onChange={(e) => setSec80d(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {regime === "old" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hra">HRA Exemption (₹)</Label>
                <Input
                  id="hra"
                  type="number"
                  placeholder="House Rent Allowance"
                  value={hra}
                  onChange={(e) => setHra(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="home-loan">Home Loan Interest (₹)</Label>
                <Input
                  id="home-loan"
                  type="number"
                  placeholder="Section 24B Interest"
                  value={homeLoan}
                  onChange={(e) => setHomeLoan(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-exemptions">LTA & Other Exemptions (₹)</Label>
                <Input
                  id="other-exemptions"
                  type="number"
                  placeholder="Leave Travel, etc."
                  value={otherExemptions}
                  onChange={(e) => setOtherExemptions(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nps">NPS Investment (₹)</Label>
                <Input
                  id="nps"
                  type="number"
                  placeholder="Section 80CCD(1B)"
                  value={nps}
                  onChange={(e) => setNps(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={calculateTax}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 h-auto text-lg font-medium"
      >
        Calculate Tax
      </Button>

      {result && (
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Tax Calculation Results</h3>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-white/20">
              <span>Gross Income:</span>
              <span className="font-medium">{formatCurrency(result.grossIncome)}</span>
            </div>

            {regime === "old" && (
              <div className="flex justify-between py-2 border-b border-white/20">
                <span>Total Deductions:</span>
                <span className="font-medium">{formatCurrency(result.grossIncome - result.taxableIncome)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-white/20">
              <span>Taxable Income:</span>
              <span className="font-medium">{formatCurrency(result.taxableIncome)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/20">
              <span>Base Tax:</span>
              <span className="font-medium">{formatCurrency(result.baseTax)}</span>
            </div>

            {result.surcharge > 0 && (
              <div className="flex justify-between py-2 border-b border-white/20">
                <span>Surcharge:</span>
                <span className="font-medium">{formatCurrency(result.surcharge)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-white/20">
              <span>Health & Education Cess:</span>
              <span className="font-medium">{formatCurrency(result.cess)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/20 text-lg font-bold">
              <span>Final Tax Payable:</span>
              <span>{formatCurrency(result.finalTax)}</span>
            </div>

            <div className="flex justify-between py-2 text-sm opacity-80">
              <span>Monthly Tax:</span>
              <span>{formatCurrency(Math.round(result.finalTax / 12))}</span>
            </div>
          </div>

          <Button
            onClick={sendToChat}
            disabled={isSending}
            className="w-full mt-6 bg-white text-pink-500 hover:bg-gray-100 flex items-center justify-center gap-2 py-4 h-auto"
          >
            {isSending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send to FinGenie</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

