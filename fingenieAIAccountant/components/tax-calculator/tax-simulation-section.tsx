"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface TaxSimulationSectionProps {
  taxData: any
  taxResults: any
  suggestedDeductions: any[]
}

export default function TaxSimulationSection({ taxData, taxResults, suggestedDeductions }: TaxSimulationSectionProps) {
  const [simulationParams, setSimulationParams] = useState({
    retirementIncrease: 0,
    charitableIncrease: 0,
    incomeIncrease: 0,
  })

  const [simulationResults, setSimulationResults] = useState<any>(null)

  const handleSliderChange = (field: string, value: number[]) => {
    setSimulationParams((prev) => ({
      ...prev,
      [field]: value[0],
    }))
  }

  const runSimulation = () => {
    // Calculate new taxable income based on simulation parameters
    const additionalDeductions = simulationParams.retirementIncrease + simulationParams.charitableIncrease
    const additionalIncome = simulationParams.incomeIncrease

    const newTaxableIncome = Math.max(0, taxResults.taxableIncome + additionalIncome - additionalDeductions)

    // Simplified tax calculation for simulation
    let newFederalTax = 0
    let newMarginalRate = 0

    // Simplified US federal tax calculation for single filers (2023)
    if (newTaxableIncome <= 11000) {
      newFederalTax = newTaxableIncome * 0.1
      newMarginalRate = 0.1
    } else if (newTaxableIncome <= 44725) {
      newFederalTax = 1100 + (newTaxableIncome - 11000) * 0.12
      newMarginalRate = 0.12
    } else if (newTaxableIncome <= 95375) {
      newFederalTax = 5147 + (newTaxableIncome - 44725) * 0.22
      newMarginalRate = 0.22
    } else if (newTaxableIncome <= 182100) {
      newFederalTax = 16290 + (newTaxableIncome - 95375) * 0.24
      newMarginalRate = 0.24
    } else if (newTaxableIncome <= 231250) {
      newFederalTax = 37104 + (newTaxableIncome - 182100) * 0.32
      newMarginalRate = 0.32
    } else if (newTaxableIncome <= 578125) {
      newFederalTax = 52832 + (newTaxableIncome - 231250) * 0.35
      newMarginalRate = 0.35
    } else {
      newFederalTax = 174238.25 + (newTaxableIncome - 578125) * 0.37
      newMarginalRate = 0.37
    }

    // Simplified state tax calculation (using CA as example)
    const newStateTax = newTaxableIncome * 0.093 // Simplified CA tax rate

    // Calculate new total income
    const newTotalIncome = taxResults.totalIncome + additionalIncome

    // Calculate Medicare and Social Security taxes
    const newMedicareTax = newTotalIncome * 0.0145
    const newSocialSecurityTax = Math.min(newTotalIncome, 160200) * 0.062 // 2023 SS wage base

    // Calculate new total tax
    const newTotalTax = newFederalTax + newStateTax + newMedicareTax + newSocialSecurityTax

    // Calculate new effective tax rate
    const newEffectiveRate = newTotalIncome > 0 ? newTotalTax / newTotalIncome : 0

    // Calculate tax savings
    const taxSavings = taxResults.federalTax + taxResults.stateTax - (newFederalTax + newStateTax)

    setSimulationResults({
      newTaxableIncome,
      newFederalTax,
      newStateTax,
      newMedicareTax,
      newSocialSecurityTax,
      newTotalTax,
      newEffectiveRate,
      newMarginalRate,
      taxSavings,
      additionalDeductions,
      additionalIncome,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Simulation</CardTitle>
          <CardDescription>
            Simulate changes to your income and deductions to see the impact on your taxes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Label>Additional Retirement Contributions</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[simulationParams.retirementIncrease]}
                  max={20000}
                  step={500}
                  onValueChange={(value) => handleSliderChange("retirementIncrease", value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={simulationParams.retirementIncrease}
                  onChange={(e) => handleSliderChange("retirementIncrease", [Number.parseInt(e.target.value) || 0])}
                  className="w-24 text-right"
                  prefix="$"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Additional Charitable Donations</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[simulationParams.charitableIncrease]}
                  max={10000}
                  step={100}
                  onValueChange={(value) => handleSliderChange("charitableIncrease", value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={simulationParams.charitableIncrease}
                  onChange={(e) => handleSliderChange("charitableIncrease", [Number.parseInt(e.target.value) || 0])}
                  className="w-24 text-right"
                  prefix="$"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Additional Income</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[simulationParams.incomeIncrease]}
                  max={50000}
                  step={1000}
                  onValueChange={(value) => handleSliderChange("incomeIncrease", value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={simulationParams.incomeIncrease}
                  onChange={(e) => handleSliderChange("incomeIncrease", [Number.parseInt(e.target.value) || 0])}
                  className="w-24 text-right"
                  prefix="$"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={runSimulation}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            Run Simulation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {simulationResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Simulation Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Current Scenario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Taxable Income:</span>
                      <span className="font-medium">${taxResults.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Federal Tax:</span>
                      <span className="font-medium">${taxResults.federalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">State Tax:</span>
                      <span className="font-medium">${taxResults.stateTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Tax:</span>
                      <span className="font-medium">${taxResults.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Effective Tax Rate:</span>
                      <span className="font-medium">{(taxResults.effectiveTaxRate * 100).toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Simulated Scenario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Taxable Income:</span>
                      <span className="font-medium">${simulationResults.newTaxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Federal Tax:</span>
                      <span className="font-medium">${simulationResults.newFederalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">State Tax:</span>
                      <span className="font-medium">${simulationResults.newStateTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Tax:</span>
                      <span className="font-medium">${simulationResults.newTotalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Effective Tax Rate:</span>
                      <span className="font-medium">{(simulationResults.newEffectiveRate * 100).toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card
                className={`${simulationResults.taxSavings > 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tax Impact</h4>
                    <p className="text-sm">
                      {simulationResults.taxSavings > 0
                        ? "Your tax liability would decrease by:"
                        : "Your tax liability would increase by:"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {simulationResults.taxSavings > 0 ? (
                      <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="text-xl font-bold">
                      ${Math.abs(simulationResults.taxSavings).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

