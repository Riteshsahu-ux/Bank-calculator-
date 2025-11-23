import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, IndianRupee, Clock, Download, FileText, Share, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const TimePeriodCalculator = () => {
  const [principal, setPrincipal] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [maturityDate, setMaturityDate] = useState<string>("");
  const [isPrematureClosure, setIsPrematureClosure] = useState<boolean>(false);
  const [prematureClosureDate, setPrematureClosureDate] = useState<string>("");
  
  // New state for manual period input
  const [useManualPeriod, setUseManualPeriod] = useState<boolean>(false);
  const [manualYears, setManualYears] = useState<string>("");
  const [manualMonths, setManualMonths] = useState<string>("");
  const [manualDays, setManualDays] = useState<string>("");
  const [totalCalculatedDays, setTotalCalculatedDays] = useState<number>(0);
  const [result, setResult] = useState<{
    maturityAmount: number;
    interestEarned: number;
    days: number;
    years: number;
    penalty?: number;
    penaltyAmount?: number;
    actualInterest?: number;
    netAmount?: number;
  } | null>(null);
  const { toast } = useToast();

  // Calculate total days from manual input
  const calculateTotalDays = () => {
    const years = parseInt(manualYears) || 0;
    const months = parseInt(manualMonths) || 0;
    const days = parseInt(manualDays) || 0;
    
    const totalDays = (years * 365) + (months * 30) + days;
    setTotalCalculatedDays(totalDays);
  };

  const calculateInterest = () => {
    // Check validation based on mode
    if (useManualPeriod) {
      if (!principal || !interestRate || (!manualYears && !manualMonths && !manualDays)) return;
    } else {
      if (!principal || !interestRate || !startDate || !maturityDate) return;
      if (isPrematureClosure && !prematureClosureDate) return;
    }
    
    // Calculate total days first for manual period mode
    let calculatedTotalDays = 0;
    if (useManualPeriod) {
      const years = parseInt(manualYears) || 0;
      const months = parseInt(manualMonths) || 0;
      const days = parseInt(manualDays) || 0;
      
      calculatedTotalDays = (years * 365) + (months * 30) + days;
      setTotalCalculatedDays(calculatedTotalDays);
    }

    const principalAmount = parseFloat(principal);
    const rate = parseFloat(interestRate);
    
    // Validation checks
    if (principalAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Principal amount must be greater than zero",
      });
      return;
    }

    if (rate <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Interest Rate",
        description: "Interest rate must be greater than zero",
      });
      return;
    }

    // Only validate dates if not using manual period
    if (!useManualPeriod) {
      const start = new Date(startDate);
      const end = new Date(maturityDate);

      if (end <= start) {
        toast({
          variant: "destructive",
          title: "Invalid Date Range",
          description: "Maturity date must be after start date",
        });
        return;
      }

      // Validate premature closure date
      if (isPrematureClosure) {
        const closureDate = new Date(prematureClosureDate);
        if (closureDate <= start || closureDate >= end) {
          toast({
            variant: "destructive",
            title: "Invalid Closure Date",
            description: "Premature closure date must be between start and maturity dates",
          });
          return;
        }
      }
    }

    // Calculate actual period based on mode
    let actualDays: number;
    let actualYears: number;
    
    if (useManualPeriod) {
      actualDays = calculatedTotalDays;
      actualYears = actualDays / 365;
    } else {
      const start = new Date(startDate);
      const end = new Date(maturityDate);
      const actualEndDate = isPrematureClosure ? new Date(prematureClosureDate) : end;
      const actualTimeDifference = actualEndDate.getTime() - start.getTime();
      actualDays = Math.round(actualTimeDifference / (1000 * 3600 * 24));
      actualYears = actualDays / 365;
    }

    // Compound Interest calculation (Quarterly): A = P(1 + r/n)^(nt)
    const n = 4; // Quarterly compounding

    if (isPrematureClosure) {
      // Calculate with reduced rate (1% penalty on rate)
      const penaltyRate = 1; // 1% reduction in interest rate
      const reducedRate = Math.max(0, rate - penaltyRate); // Ensure rate doesn't go below 0
      const reducedRateDecimal = reducedRate / 100;
      const rateDecimal = rate / 100;
      
      // Calculate maturity amount with reduced rate
      const maturityAmountReduced = Math.round(principalAmount * Math.pow(1 + (reducedRateDecimal / n), n * actualYears));
      const actualInterest = maturityAmountReduced - principalAmount;
      
      // Calculate what the interest would have been with normal rate (for comparison)
      const maturityAmountNormal = Math.round(principalAmount * Math.pow(1 + (rateDecimal / n), n * actualYears));
      const normalInterest = maturityAmountNormal - principalAmount;
      
      // Penalty is the difference between normal and reduced rate interest
      const penaltyAmount = normalInterest - actualInterest;
      const netAmount = maturityAmountReduced;

      setResult({
        maturityAmount: netAmount,
        interestEarned: normalInterest, // Show what normal interest would have been
        actualInterest,
        penaltyAmount,
        penalty: penaltyRate,
        netAmount,
        days: actualDays,
        years: actualYears
      });
    } else {
      const rateDecimal = rate / 100;
      const maturityAmount = Math.round(principalAmount * Math.pow(1 + (rateDecimal / n), n * actualYears));
      const grossInterest = maturityAmount - principalAmount;

      setResult({
        maturityAmount,
        interestEarned: grossInterest,
        days: actualDays,
        years: actualYears
      });
    }
  };

  const exportToExcel = () => {
    if (!result || !principal || !interestRate) return;
    if (!useManualPeriod && (!startDate || !maturityDate)) return;

    const data = [
      ['Odisha Grameen Bank'],
      ['Time Period Interest Calculation Report'],
      [''],
      ['Parameter', 'Value'],
      ['Principal Amount', `₹${parseFloat(principal).toLocaleString('en-IN')}`],
      ['Interest Rate', `${interestRate}% per annum`],
      ...(useManualPeriod ? [
        ['Period (Manual)', `${manualYears || 0} years, ${manualMonths || 0} months, ${manualDays || 0} days`]
      ] : [
        ['Start Date', startDate],
        ['Maturity Date', maturityDate]
      ]),
      ...(isPrematureClosure ? [['Premature Closure Date', prematureClosureDate]] : []),
      ['Time Period (Days)', `${result.days} days ${isPrematureClosure ? '(Broken Period)' : ''}`],
      ['Time Period (Years)', result.years.toFixed(4)],
      [''],
      ['Results'],
      [isPrematureClosure ? 'Gross Interest' : 'Interest Earned', `₹${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
      ...(isPrematureClosure && result.penaltyAmount ? [
        ['Penalty Applied (1%)', `₹${result.penaltyAmount.toLocaleString('en-IN')}`],
        ['Net Interest', `₹${result.actualInterest?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`]
      ] : []),
      [isPrematureClosure ? 'Net Amount' : 'Maturity Amount', `₹${result.maturityAmount.toLocaleString('en-IN')}`],
      [''],
      ['Generated on', new Date().toLocaleDateString('en-IN')]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 },
      { width: 25 }
    ];

    // Style the header rows
    ws['A1'] = { v: 'Odisha Grameen Bank', t: 's', s: { font: { bold: true, sz: 16 } } };
    ws['A2'] = { v: 'Time Period Interest Calculation Report', t: 's', s: { font: { bold: true, sz: 14 } } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Time Period Calculation');
    XLSX.writeFile(wb, 'OGB_Time_Period_Interest_Calculation.xlsx');

    toast({
      title: "Excel Exported",
      description: "Time period interest calculation data exported successfully!",
    });
  };

  const exportToPDF = () => {
    if (!result || !principal || !interestRate) return;
    if (!useManualPeriod && (!startDate || !maturityDate)) return;

    const doc = new jsPDF();
    
    // Set background color
    doc.setFillColor(245, 245, 245); // #F5F5F5
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    
    // Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text('Odisha Grameen Bank', 20, 30);
    doc.setFontSize(16);
    doc.text('Time Period Interest Calculation Report', 20, 45);
    
    // Line separator
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 55, 190, 55);
    
    // Calculation Details
    doc.setFontSize(14);
    doc.text('Calculation Details:', 20, 70);
    
    doc.setFontSize(11);
    doc.text(`Principal Amount: Rs.${parseFloat(principal).toLocaleString('en-IN')}`, 25, 85);
    doc.text(`Interest Rate: ${interestRate}% per annum`, 25, 95);
    
    let yPosition = 105;
    if (useManualPeriod) {
      doc.text(`Period (Manual): ${manualYears || 0} years, ${manualMonths || 0} months, ${manualDays || 0} days`, 25, yPosition);
      yPosition += 10;
    } else {
      doc.text(`Start Date: ${startDate}`, 25, yPosition);
      yPosition += 10;
      doc.text(`Maturity Date: ${maturityDate}`, 25, yPosition);
      yPosition += 10;
    }
    
    if (isPrematureClosure && !useManualPeriod) {
      doc.text(`Premature Closure Date: ${prematureClosureDate}`, 25, yPosition);
      yPosition += 10;
    }
    
    doc.text(`Time Period: ${result.days} days (${result.years.toFixed(4)} years)${isPrematureClosure ? ' - Broken Period' : ''}`, 25, yPosition);
    yPosition += 20;
    
    // Results
    doc.setFontSize(14);
    doc.text('Results:', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(11);
    doc.text(`${isPrematureClosure ? 'Gross Interest' : 'Interest Earned'}: Rs.${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 25, yPosition);
    yPosition += 10;
    
    if (isPrematureClosure && result.penaltyAmount) {
      doc.text(`Penalty Applied (1%): Rs.${result.penaltyAmount.toLocaleString('en-IN')}`, 25, yPosition);
      yPosition += 10;
      doc.text(`Net Interest: Rs.${result.actualInterest?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 25, yPosition);
      yPosition += 10;
    }
    
    doc.text(`${isPrematureClosure ? 'Net Amount' : 'Maturity Amount'}: Rs.${result.maturityAmount.toLocaleString('en-IN')}`, 25, yPosition);
    
    // Footer
    doc.line(20, 185, 190, 185);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 195);
    doc.text('This is a computer-generated document from OGB Time Period Interest Calculator', 20, 205);
    
    doc.save('OGB_Time_Period_Interest_Calculation.pdf');

    toast({
      title: "PDF Exported",
      description: "Time period interest calculation report exported successfully!",
    });
  };

  const shareToWhatsApp = () => {
    if (!result || !principal || !interestRate) return;
    if (!useManualPeriod && (!startDate || !maturityDate)) return;

    const message = `*Odisha Grameen Bank - Time Period Interest Calculation*

*Calculation Details:*
Principal Amount: ₹${parseFloat(principal).toLocaleString('en-IN')}
Interest Rate: ${interestRate}% per annum${useManualPeriod ? `
Period (Manual): ${manualYears || 0} years, ${manualMonths || 0} months, ${manualDays || 0} days` : `
Start Date: ${startDate}
Maturity Date: ${maturityDate}${isPrematureClosure ? `
Premature Closure Date: ${prematureClosureDate}` : ''}`}
Time Period: ${result.days} days (${result.years.toFixed(4)} years)${isPrematureClosure ? ' - Broken Period' : ''}

*Results:*
${isPrematureClosure ? 'Gross Interest' : 'Interest Earned'}: ₹${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${isPrematureClosure && result.penaltyAmount ? `
Penalty Applied (1%): ₹${result.penaltyAmount.toLocaleString('en-IN')}
Net Interest: ₹${result.actualInterest?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : ''}
${isPrematureClosure ? 'Net Amount' : 'Maturity Amount'}: ₹${result.maturityAmount.toLocaleString('en-IN')}

Generated from OGB Time Period Interest Calculator
${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Shared to WhatsApp",
      description: "Calculation details shared successfully!",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Clock className="h-6 w-6" />
            Time Period Interest Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="principal" className="text-base font-medium">
                Principal Amount (₹)
              </Label>
              <Input
                id="principal"
                type="number"
                placeholder="Enter principal amount"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-base font-medium">
                Interest Rate (% per annum)
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="Enter interest rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          </div>

          {/* Period Selection Method */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox 
                id="useManualPeriod"
                checked={useManualPeriod}
                onCheckedChange={(checked) => {
                  setUseManualPeriod(checked as boolean);
                  if (checked) {
                    setStartDate("");
                    setMaturityDate("");
                    setIsPrematureClosure(false);
                    setPrematureClosureDate("");
                  } else {
                    setManualYears("");
                    setManualMonths("");
                    setManualDays("");
                    setTotalCalculatedDays(0);
                  }
                }}
              />
              <Label htmlFor="useManualPeriod" className="text-base font-medium">
                Enter period manually (Years, Months, Days)
              </Label>
            </div>

            {!useManualPeriod ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturityDate" className="text-base font-medium">
                    Maturity Date
                  </Label>
                  <Input
                    id="maturityDate"
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualYears" className="text-base font-medium">
                      Years
                    </Label>
                    <Input
                      id="manualYears"
                      type="number"
                      placeholder="0"
                      value={manualYears}
                      onChange={(e) => {
                        setManualYears(e.target.value);
                        setTimeout(calculateTotalDays, 0);
                      }}
                      className="h-12 text-lg"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manualMonths" className="text-base font-medium">
                      Months
                    </Label>
                    <Input
                      id="manualMonths"
                      type="number"
                      placeholder="0"
                      value={manualMonths}
                      onChange={(e) => {
                        setManualMonths(e.target.value);
                        setTimeout(calculateTotalDays, 0);
                      }}
                      className="h-12 text-lg"
                      min="0"
                      max="11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manualDays" className="text-base font-medium">
                      Days
                    </Label>
                    <Input
                      id="manualDays"
                      type="number"
                      placeholder="0"
                      value={manualDays}
                      onChange={(e) => {
                        setManualDays(e.target.value);
                        setTimeout(calculateTotalDays, 0);
                      }}
                      className="h-12 text-lg"
                      min="0"
                      max="29"
                    />
                  </div>
                </div>
                
                {totalCalculatedDays > 0 && (
                  <div className="bg-financial-light/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Calculated Period</p>
                    <p className="text-2xl font-bold text-financial">{totalCalculatedDays} days</p>
                    <p className="text-xs text-muted-foreground">
                      ({(totalCalculatedDays / 365).toFixed(4)} years)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Premature Closure Option */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox 
                id="prematureClosure"
                checked={isPrematureClosure}
                onCheckedChange={(checked) => {
                  setIsPrematureClosure(checked as boolean);
                  if (!checked) setPrematureClosureDate("");
                }}
              />
              <Label htmlFor="prematureClosure" className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Premature Closure (1% penalty)
              </Label>
            </div>

            {isPrematureClosure && (
              <div className="space-y-2">
                <Label htmlFor="prematureClosureDate" className="text-base font-medium">
                  Premature Closure Date
                </Label>
                <Input
                  id="prematureClosureDate"
                  type="date"
                  value={prematureClosureDate}
                  onChange={(e) => setPrematureClosureDate(e.target.value)}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Note: Interest rate will be reduced by 1% for premature closure calculation
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={calculateInterest} 
            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300"
            disabled={
              !principal || !interestRate || 
              (useManualPeriod ? (!manualYears && !manualMonths && !manualDays) : 
               (!startDate || !maturityDate || (isPrematureClosure && !prematureClosureDate)))
            }
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Interest
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-success-light/20 to-financial-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-success">
                <IndianRupee className="h-5 w-5" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-primary">{interestRate}%</p>
                  <p className="text-xs text-muted-foreground">per annum</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Time Period</p>
                  <p className="text-2xl font-bold text-financial">{result.days}</p>
                  <p className="text-xs text-muted-foreground">days {isPrematureClosure ? "(Premature)" : ""}</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{isPrematureClosure ? "Gross Interest" : "Interest Earned"}</p>
                  <p className="text-2xl font-bold text-accent">₹{result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{isPrematureClosure ? "Net Amount" : "Maturity Amount"}</p>
                  <p className="text-2xl font-bold text-success">₹{result.maturityAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              {/* Penalty Details for Premature Closure */}
              {isPrematureClosure && result.penaltyAmount && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-600 mb-1">Penalty Applied</p>
                    <p className="text-2xl font-bold text-red-700">₹{result.penaltyAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-red-600">{result.penalty}% rate reduction penalty</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 mb-1">Net Interest</p>
                    <p className="text-2xl font-bold text-green-700">₹{result.actualInterest?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-green-600">After penalty deduction</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Calculation Sheet */}
          <Card className="shadow-[var(--shadow-card)] border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <FileText className="h-5 w-5" />
                Detailed Calculation Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Parameter</TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Principal Amount</TableCell>
                    <TableCell>₹{parseFloat(principal).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Interest Rate</TableCell>
                    <TableCell>{interestRate}% per annum</TableCell>
                  </TableRow>
                   {useManualPeriod ? (
                     <TableRow>
                       <TableCell className="font-medium">Period (Manual)</TableCell>
                       <TableCell>{manualYears || 0} years, {manualMonths || 0} months, {manualDays || 0} days</TableCell>
                     </TableRow>
                   ) : (
                     <>
                       <TableRow>
                         <TableCell className="font-medium">Start Date</TableCell>
                         <TableCell>{startDate}</TableCell>
                       </TableRow>
                       <TableRow>
                         <TableCell className="font-medium">Maturity Date</TableCell>
                         <TableCell>{maturityDate}</TableCell>
                       </TableRow>
                       {isPrematureClosure && (
                         <TableRow>
                           <TableCell className="font-medium">Premature Closure Date</TableCell>
                           <TableCell>{prematureClosureDate}</TableCell>
                         </TableRow>
                       )}
                     </>
                   )}
                  <TableRow>
                    <TableCell className="font-medium">Time Period (Days)</TableCell>
                    <TableCell>{result.days} days {isPrematureClosure ? "(Broken Period)" : ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Time Period (Years)</TableCell>
                    <TableCell>{result.years.toFixed(4)} years</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">{isPrematureClosure ? "Gross Interest" : "Interest Earned"}</TableCell>
                    <TableCell className="font-bold text-accent">₹{result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  {isPrematureClosure && result.penaltyAmount && (
                    <>
                      <TableRow>
                        <TableCell className="font-medium text-red-600">Penalty Applied ({result.penalty}%)</TableCell>
                        <TableCell className="font-medium text-red-600">₹{result.penaltyAmount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-green-600">Net Interest</TableCell>
                        <TableCell className="font-bold text-green-600">₹{result.actualInterest?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell className="font-bold">{isPrematureClosure ? "Net Amount" : "Maturity Amount"}</TableCell>
                    <TableCell className="font-bold text-success">₹{result.maturityAmount.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="shadow-[var(--shadow-card)] border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <Download className="h-5 w-5" />
                Export & Share Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={exportToExcel}
                  variant="outline"
                  className="h-12 flex items-center gap-3 hover:bg-financial-light/20 hover:border-financial"
                >
                  <FileText className="h-5 w-5" />
                  Export to Excel
                </Button>
                
                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="h-12 flex items-center gap-3 hover:bg-accent/20 hover:border-accent"
                >
                  <Download className="h-5 w-5" />
                  Export to PDF
                </Button>
                
                <Button 
                  onClick={shareToWhatsApp}
                  variant="outline"
                  className="h-12 flex items-center gap-3 hover:bg-success-light/20 hover:border-success"
                >
                  <Share className="h-5 w-5" />
                  Share to WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};