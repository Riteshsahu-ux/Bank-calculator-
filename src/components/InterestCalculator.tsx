import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, IndianRupee, TrendingUp, Download, FileText, Share } from "lucide-react";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface InterestRate {
  period: string;
  generalPublic: number;
  staff: number;
  staffSeniorCitizens: number;
  seniorCitizens: number;
  superSeniorCitizens: number;
  days: number;
}

const interestRates: InterestRate[] = [
  { period: "7-14 days", generalPublic: 2.65, staff: 3.65, staffSeniorCitizens: 4.15, seniorCitizens: 2.65, superSeniorCitizens: 2.65, days: 14 },
  { period: "15-29 days", generalPublic: 2.75, staff: 3.75, staffSeniorCitizens: 4.25, seniorCitizens: 2.75, superSeniorCitizens: 2.75, days: 29 },
  { period: "30-45 days", generalPublic: 2.75, staff: 3.75, staffSeniorCitizens: 4.25, seniorCitizens: 2.75, superSeniorCitizens: 2.75, days: 45 },
  { period: "46-60 days", generalPublic: 2.75, staff: 3.75, staffSeniorCitizens: 4.25, seniorCitizens: 2.75, superSeniorCitizens: 2.75, days: 60 },
  { period: "61-90 days", generalPublic: 2.75, staff: 3.75, staffSeniorCitizens: 4.25, seniorCitizens: 2.75, superSeniorCitizens: 2.75, days: 90 },
  { period: "91-120 days", generalPublic: 3.75, staff: 4.75, staffSeniorCitizens: 5.25, seniorCitizens: 3.75, superSeniorCitizens: 3.75, days: 120 },
  { period: "121-150 days", generalPublic: 4.00, staff: 5.00, staffSeniorCitizens: 5.50, seniorCitizens: 4.00, superSeniorCitizens: 4.00, days: 150 },
  { period: "151-179 days", generalPublic: 4.00, staff: 5.00, staffSeniorCitizens: 5.50, seniorCitizens: 4.00, superSeniorCitizens: 4.00, days: 179 },
  { period: "180-210 days", generalPublic: 4.50, staff: 5.50, staffSeniorCitizens: 6.00, seniorCitizens: 5.00, superSeniorCitizens: 5.25, days: 210 },
  { period: "211-270 days", generalPublic: 4.50, staff: 5.50, staffSeniorCitizens: 6.00, seniorCitizens: 5.00, superSeniorCitizens: 5.25, days: 270 },
  { period: "271 days to less than 1 year", generalPublic: 4.75, staff: 5.75, staffSeniorCitizens: 6.25, seniorCitizens: 5.25, superSeniorCitizens: 5.50, days: 364 },
  { period: "One year only", generalPublic: 6.05, staff: 7.05, staffSeniorCitizens: 7.55, seniorCitizens: 6.55, superSeniorCitizens: 6.80, days: 365 },
  { period: "More than 1 year to less than 2 years", generalPublic: 6.00, staff: 7.00, staffSeniorCitizens: 7.50, seniorCitizens: 6.50, superSeniorCitizens: 6.75, days: 730 },
  { period: "2 years to less than 3 years", generalPublic: 5.90, staff: 6.90, staffSeniorCitizens: 7.40, seniorCitizens: 6.40, superSeniorCitizens: 6.65, days: 1095 },
  { period: "3 years to less than 5 years", generalPublic: 5.95, staff: 6.95, staffSeniorCitizens: 7.45, seniorCitizens: 6.45, superSeniorCitizens: 6.70, days: 1825 },
  { period: "5 years to less than 8 years", generalPublic: 5.85, staff: 6.85, staffSeniorCitizens: 7.35, seniorCitizens: 6.35, superSeniorCitizens: 6.60, days: 2920 },
  { period: "8 years & above (upto 10 years)", generalPublic: 5.75, staff: 6.75, staffSeniorCitizens: 7.25, seniorCitizens: 6.25, superSeniorCitizens: 6.50, days: 3650 },
  { period: "Tax Saver Deposit Scheme", generalPublic: 5.85, staff: 6.85, staffSeniorCitizens: 7.35, seniorCitizens: 5.85, superSeniorCitizens: 5.85, days: 1825 },
];

export const InterestCalculator = () => {
  const [principal, setPrincipal] = useState<string>("");
  const [customerType, setCustomerType] = useState<string>("generalPublic");
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<string>("");
  const [customDays, setCustomDays] = useState<string>("");
  const [customMonths, setCustomMonths] = useState<string>("");
  const [customYears, setCustomYears] = useState<string>("");
  const [result, setResult] = useState<{
    maturityAmount: number;
    interestEarned: number;
    rate: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateInterest = () => {
    if (!principal) return;
    
    // Check validation for manual period input
    if (!customDays && !customMonths && !customYears) {
      toast({
        variant: "destructive",
        title: "Missing Period",
        description: "Please enter at least one period value (days, months, or years)",
      });
      return;
    }

    const principalAmount = parseFloat(principal);
    
    // Validation checks
    if (principalAmount === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Amount can not zero",
      });
      return;
    }

    if (useCustomRate && (!customRate || parseFloat(customRate) <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid Interest Rate",
        description: "Please enter a valid interest rate",
      });
      return;
    }

    // Validation for period inputs
    const daysVal = parseFloat(customDays) || 0;
    const monthsVal = parseFloat(customMonths) || 0;
    const yearsVal = parseFloat(customYears) || 0;
    
    if (daysVal < 0 || monthsVal < 0 || yearsVal < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Period",
        description: "Period values cannot be negative",
      });
      return;
    }

    let totalDays: number;
    let interestRate: number;
    
    // Calculate total days from years, months, and days
    totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
    
    if (useCustomRate) {
      interestRate = parseFloat(customRate);
    } else {
      // Map to appropriate rate based on total days range
      if (totalDays <= 14) {
        const rate = interestRates.find(r => r.period === "7-14 days");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 2.80;
      } else if (totalDays <= 29) {
        const rate = interestRates.find(r => r.period === "15-29 days");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 2.80;
      } else if (totalDays <= 90) {
        const rate = interestRates.find(r => r.period === "61-90 days");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 3.00;
      } else if (totalDays <= 180) {
        const rate = interestRates.find(r => r.period === "151-179 days");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 4.00;
      } else if (totalDays <= 365) {
        const rate = interestRates.find(r => r.period === "One year only");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 6.25;
      } else if (totalDays <= 730) {
        const rate = interestRates.find(r => r.period === "More than 1 year to less than 2 years");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 6.20;
      } else if (totalDays <= 1095) {
        const rate = interestRates.find(r => r.period === "2 years to less than 3 years");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 6.10;
      } else if (totalDays <= 1825) {
        const rate = interestRates.find(r => r.period === "3 years to less than 5 years");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 6.05;
      } else if (totalDays <= 2920) {
        const rate = interestRates.find(r => r.period === "5 years to less than 8 years");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 6.00;
      } else {
        const rate = interestRates.find(r => r.period === "8 years & above (upto 10 years)");
        interestRate = rate ? rate[customerType as keyof InterestRate] as number : 5.90;
      }
    }

    // Compound Interest calculation (Quarterly): A = P(1 + r/n)^(nt)
    const timeInYears = totalDays / 365;
    const rateDecimal = interestRate / 100;
    const n = 4; // Quarterly compounding
    const maturityAmount = Math.round(principalAmount * Math.pow(1 + (rateDecimal / n), n * timeInYears));
    const compoundInterest = maturityAmount - principalAmount;

    setResult({
      maturityAmount,
      interestEarned: compoundInterest,
      rate: interestRate
    });
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case "staff": return "Staff";
      case "staffSeniorCitizens": return "Staff Senior Citizens";
      case "seniorCitizens": return "Senior Citizens";
      case "superSeniorCitizens": return "Super Senior Citizens";
      default: return "General Public";
    }
  };

  const exportToExcel = () => {
    if (!result || !principal) return;

    const daysVal = parseFloat(customDays) || 0;
    const monthsVal = parseFloat(customMonths) || 0;
    const yearsVal = parseFloat(customYears) || 0;
    const totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
    
    const periodParts = [];
    if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
    if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
    if (daysVal > 0) periodParts.push(`${daysVal} day${daysVal !== 1 ? 's' : ''}`);
    
    const periodText = periodParts.length > 0 
      ? `${periodParts.join(', ')} (${totalDays} days total)` 
      : `${totalDays} days`;
    
    const timeInYears = totalDays / 365;

    const data = [
      ['Odisha Grameen Bank'],
      ['Interest Calculation Report'],
      [''],
      ['Parameter', 'Value'],
      ['Principal Amount', `₹${parseFloat(principal).toLocaleString('en-IN')}`],
      ['Deposit Period', periodText],
      ['Customer Type', getCustomerTypeLabel(customerType)],
      ['Interest Rate', `${result.rate}% per annum`],
      ['Time Period (Years)', timeInYears.toFixed(4)],
      ['Time Period (Days)', totalDays.toString()],
      [''],
      ['Results'],
      ['Interest Earned', `₹${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
      ['Maturity Amount', `₹${result.maturityAmount.toLocaleString('en-IN')}`],
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
    ws['A2'] = { v: 'Interest Calculation Report', t: 's', s: { font: { bold: true, sz: 14 } } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Interest Calculation');
    XLSX.writeFile(wb, 'OGB_Interest_Calculation.xlsx');

    toast({
      title: "Excel Exported",
      description: "Interest calculation data exported successfully!",
    });
  };

  const exportToPDF = () => {
    if (!result || !principal) return;

    const daysVal = parseFloat(customDays) || 0;
    const monthsVal = parseFloat(customMonths) || 0;
    const yearsVal = parseFloat(customYears) || 0;
    const totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
    
    const periodParts = [];
    if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
    if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
    if (daysVal > 0) periodParts.push(`${daysVal} day${daysVal !== 1 ? 's' : ''}`);
    
    const periodText = periodParts.length > 0 
      ? `${periodParts.join(', ')} (${totalDays} days total)` 
      : `${totalDays} days`;
    
    const timeInYears = totalDays / 365;

    const doc = new jsPDF();
    
    // Set background color
    doc.setFillColor(245, 245, 245); // #F5F5F5
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    
    // Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text('Odisha Grameen Bank', 20, 30);
    doc.setFontSize(16);
    doc.text('Interest Calculation Report', 20, 45);
    
    // Line separator
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 55, 190, 55);
    
    // Calculation Details
    doc.setFontSize(14);
    doc.text('Calculation Details:', 20, 70);
    
    doc.setFontSize(11);
    doc.text(`Principal Amount: Rs.${parseFloat(principal).toLocaleString('en-IN')}`, 25, 85);
    doc.text(`Deposit Period: ${periodText}`, 25, 95);
    doc.text(`Customer Type: ${getCustomerTypeLabel(customerType)}`, 25, 105);
    doc.text(`Interest Rate: ${result.rate}% per annum`, 25, 115);
    doc.text(`Time Period: ${timeInYears.toFixed(4)} years`, 25, 125);
    
    // Results
    doc.setFontSize(14);
    doc.text('Results:', 20, 145);
    
    doc.setFontSize(11);
    doc.text(`Interest Earned: Rs.${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 25, 160);
    doc.text(`Maturity Amount: Rs.${result.maturityAmount.toLocaleString('en-IN')}`, 25, 170);
    
    // Footer
    doc.line(20, 185, 190, 185);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 195);
    doc.text('This is a computer-generated document from OGB Interest Calculator', 20, 205);
    
    doc.save('OGB_Interest_Calculation.pdf');

    toast({
      title: "PDF Exported",
      description: "Interest calculation report exported successfully!",
    });
  };

  const shareToWhatsApp = () => {
    if (!result || !principal) return;

    const daysVal = parseFloat(customDays) || 0;
    const monthsVal = parseFloat(customMonths) || 0;
    const yearsVal = parseFloat(customYears) || 0;
    const totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
    
    const periodParts = [];
    if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
    if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
    if (daysVal > 0) periodParts.push(`${daysVal} day${daysVal !== 1 ? 's' : ''}`);
    
    const periodText = periodParts.length > 0 
      ? `${periodParts.join(', ')} (${totalDays} days total)` 
      : `${totalDays} days`;
    
    const timeInYears = totalDays / 365;

    const message = `*Odisha Grameen Bank - Interest Calculation*

*Calculation Details:*
Principal Amount: ₹${parseFloat(principal).toLocaleString('en-IN')}
Deposit Period: ${periodText}
Customer Type: ${getCustomerTypeLabel(customerType)}
Interest Rate: ${result.rate}% per annum
Time Period: ${timeInYears.toFixed(4)} years

*Results:*
Interest Earned: ₹${result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
Maturity Amount: ₹${result.maturityAmount.toLocaleString('en-IN')}

Generated from OGB Interest Calculator
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
            <Calculator className="h-6 w-6" />
            Interest Calculator
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
                placeholder="Enter deposit amount"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerType" className="text-base font-medium">
                Customer Type
              </Label>
              <Select 
                value={customerType} 
                onValueChange={setCustomerType}
                disabled={useCustomRate}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="generalPublic">General Public</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="staffSeniorCitizens">Staff Senior Citizens</SelectItem>
                  <SelectItem value="seniorCitizens">Senior Citizens</SelectItem>
                  <SelectItem value="superSeniorCitizens">Super Senior Citizens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Interest Rate Toggle */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Use Custom Interest Rate</Label>
                <p className="text-sm text-muted-foreground">
                  Enable to input your own interest rate instead of preset rates
                </p>
              </div>
              <Switch
                checked={useCustomRate}
                onCheckedChange={setUseCustomRate}
                className="scale-110"
              />
            </div>
            
            {useCustomRate && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="customRate" className="text-base font-medium">
                  Interest Rate (% per annum)
                </Label>
                <Input
                  id="customRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  placeholder="Enter interest rate (e.g., 6.25)"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
            )}
          </div>

          {/* Period Entry */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-1">
              <Label className="text-base font-medium">Deposit Period</Label>
              <p className="text-sm text-muted-foreground">
                Enter the deposit period in years, months, and/or days
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customYears" className="text-base font-medium">
                    Years
                  </Label>
                  <Input
                    id="customYears"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={customYears}
                    onChange={(e) => setCustomYears(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customMonths" className="text-base font-medium">
                    Months
                  </Label>
                  <Input
                    id="customMonths"
                    type="number"
                    min="0"
                    max="11"
                    placeholder="0"
                    value={customMonths}
                    onChange={(e) => setCustomMonths(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customDays" className="text-base font-medium">
                    Days
                  </Label>
                  <Input
                    id="customDays"
                    type="number"
                    min="0"
                    max="365"
                    placeholder="0"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
              {(customYears || customMonths || customDays) && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border">
                  <strong>Total Period: </strong>
                  {((parseFloat(customYears) || 0) * 365 + (parseFloat(customMonths) || 0) * 30 + (parseFloat(customDays) || 0))} days
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={calculateInterest} 
            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300"
            disabled={!principal || (!customDays && !customMonths && !customYears) || (useCustomRate && !customRate)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-primary">{result.rate}%</p>
                  <p className="text-xs text-muted-foreground">per annum</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Interest Earned</p>
                  <p className="text-2xl font-bold text-accent">₹{result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                  <p className="text-2xl font-bold text-success">₹{result.maturityAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
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
                    <TableCell className="font-medium">Deposit Period</TableCell>
                    <TableCell>
                      {(() => {
                        const daysVal = parseFloat(customDays) || 0;
                        const monthsVal = parseFloat(customMonths) || 0;
                        const yearsVal = parseFloat(customYears) || 0;
                        const totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
                        
                        const periodParts = [];
                        if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
                        if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
                        if (daysVal > 0) periodParts.push(`${daysVal} day${daysVal !== 1 ? 's' : ''}`);
                        
                        return periodParts.length > 0 
                          ? `${periodParts.join(', ')} (${totalDays} days total)` 
                          : `${totalDays} days`;
                      })()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Customer Type</TableCell>
                    <TableCell>{getCustomerTypeLabel(customerType)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Interest Rate</TableCell>
                    <TableCell>{result.rate}% per annum</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Time Period</TableCell>
                    <TableCell>
                      {(() => {
                        const daysVal = parseFloat(customDays) || 0;
                        const monthsVal = parseFloat(customMonths) || 0;
                        const yearsVal = parseFloat(customYears) || 0;
                        const totalDays = daysVal + (monthsVal * 30) + (yearsVal * 365);
                        return (totalDays / 365).toFixed(4);
                      })()} years
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Time Period (Days)</TableCell>
                    <TableCell>
                      {(() => {
                        const daysVal = parseFloat(customDays) || 0;
                        const monthsVal = parseFloat(customMonths) || 0;
                        const yearsVal = parseFloat(customYears) || 0;
                        return daysVal + (monthsVal * 30) + (yearsVal * 365);
                      })()} days
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Interest Earned</TableCell>
                    <TableCell className="font-bold text-accent">₹{result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Maturity Amount</TableCell>
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