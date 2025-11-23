import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, IndianRupee, TrendingUp, Download, FileText, Share, Calendar } from "lucide-react";
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
  { period: "One year only", generalPublic: 6.05, staff: 7.05, staffSeniorCitizens: 7.55, seniorCitizens: 6.55, superSeniorCitizens: 6.80, days: 365 },
  { period: "More than 1 year to less than 2 years", generalPublic: 6.00, staff: 7.00, staffSeniorCitizens: 7.50, seniorCitizens: 6.50, superSeniorCitizens: 6.75, days: 730 },
  { period: "2 years to less than 3 years", generalPublic: 5.90, staff: 6.90, staffSeniorCitizens: 7.40, seniorCitizens: 6.40, superSeniorCitizens: 6.65, days: 1095 },
  { period: "3 years to less than 5 years", generalPublic: 5.95, staff: 6.95, staffSeniorCitizens: 7.45, seniorCitizens: 6.45, superSeniorCitizens: 6.70, days: 1825 },
  { period: "5 years to less than 8 years", generalPublic: 5.85, staff: 6.85, staffSeniorCitizens: 7.35, seniorCitizens: 6.35, superSeniorCitizens: 6.60, days: 2920 },
  { period: "8 years & above (upto 10 years)", generalPublic: 5.75, staff: 6.75, staffSeniorCitizens: 7.25, seniorCitizens: 6.25, superSeniorCitizens: 6.50, days: 3650 },
];

export const MonthlyIncomeCalculator = () => {
  const [principal, setPrincipal] = useState<string>("");
  const [customerType, setCustomerType] = useState<string>("generalPublic");
  const [customMonths, setCustomMonths] = useState<string>("");
  const [customYears, setCustomYears] = useState<string>("");
  const [result, setResult] = useState<{
    monthlyIncome: number;
    totalIncome: number;
    rate: number;
    months: number;
  } | null>(null);
  const { toast } = useToast();

  const calculateMonthlyIncome = () => {
    if (!principal) return;
    
    // Check validation for manual period input
    if (!customMonths && !customYears) {
      toast({
        variant: "destructive",
        title: "Missing Period",
        description: "Please enter at least one period value (months or years)",
      });
      return;
    }

    const principalAmount = parseFloat(principal);
    
    // Validation for period inputs
    const monthsVal = parseFloat(customMonths) || 0;
    const yearsVal = parseFloat(customYears) || 0;
    
    if (monthsVal < 0 || yearsVal < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Period",
        description: "Period values cannot be negative",
      });
      return;
    }

    let totalDays: number;
    let interestRate: number;
    
    // Calculate total days from years and months
    totalDays = (monthsVal * 30) + (yearsVal * 365);
    
    // Find appropriate rate based on total days range
    if (totalDays <= 365) {
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

    // Monthly Income = (Principal × Interest Rate) / 12
    const monthlyIncome = (principalAmount * interestRate) / (12 * 100);
    const months = Math.floor(totalDays / 30);
    const totalIncome = monthlyIncome * months;

    setResult({
      monthlyIncome,
      totalIncome,
      rate: interestRate,
      months
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

    const data = [
      ['Odisha Grameen Bank'],
      ['Monthly Income Scheme Report'],
      [''],
      ['Scheme Details'],
      ['Principal Amount (₹)', parseFloat(principal).toLocaleString('en-IN')],
      ['Scheme Period', (() => {
        const monthsVal = parseFloat(customMonths) || 0;
        const yearsVal = parseFloat(customYears) || 0;
        const totalDays = (monthsVal * 30) + (yearsVal * 365);
        
        const periodParts = [];
        if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
        if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
        
        return periodParts.length > 0 
          ? `${periodParts.join(', ')} (${totalDays} days total)` 
          : `${totalDays} days`;
      })()],
      ['Customer Type', getCustomerTypeLabel(customerType)],
      ['Interest Rate (%)', result.rate.toString()],
      ['Scheme Duration (Months)', result.months.toString()],
      [''],
      ['Income Details'],
      ['Monthly Income (₹)', result.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })],
      ['Total Income (₹)', result.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })],
      ['Principal Returned (₹)', parseFloat(principal).toLocaleString('en-IN')],
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
    ws['A2'] = { v: 'Monthly Income Scheme Report', t: 's', s: { font: { bold: true, sz: 14 } } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Income Scheme');
    XLSX.writeFile(wb, 'OGB_Monthly_Income_Scheme.xlsx');

    toast({
      title: "Excel Exported",
      description: "Monthly income scheme data exported successfully!",
    });
  };

  const exportToPDF = () => {
    if (!result || !principal) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Odisha Grameen Bank', 20, 30);
    doc.setFontSize(16);
    doc.text('Monthly Income Scheme Report', 20, 45);
    
    // Line separator
    doc.line(20, 55, 190, 55);
    
    // Scheme Details
    doc.setFontSize(14);
    doc.text('Scheme Details:', 20, 70);
    
    doc.setFontSize(11);
    doc.text(`Principal Amount: ₹${parseFloat(principal).toLocaleString('en-IN')}`, 25, 85);
    doc.text(`Scheme Period: ${(() => {
      const monthsVal = parseFloat(customMonths) || 0;
      const yearsVal = parseFloat(customYears) || 0;
      const totalDays = (monthsVal * 30) + (yearsVal * 365);
      
      const periodParts = [];
      if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
      if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
      
      return periodParts.length > 0 
        ? `${periodParts.join(', ')} (${totalDays} days total)` 
        : `${totalDays} days`;
    })()}`, 25, 95);
    doc.text(`Customer Type: ${getCustomerTypeLabel(customerType)}`, 25, 105);
    doc.text(`Interest Rate: ${result.rate}% per annum`, 25, 115);
    doc.text(`Scheme Duration: ${result.months} months`, 25, 125);
    
    // Income Details
    doc.setFontSize(14);
    doc.text('Income Details:', 20, 145);
    
    doc.setFontSize(11);
    doc.text(`Monthly Income: ₹${result.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 25, 160);
    doc.text(`Total Income: ₹${result.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 25, 170);
    doc.text(`Principal Returned: ₹${parseFloat(principal).toLocaleString('en-IN')}`, 25, 180);
    
    // Footer
    doc.line(20, 195, 190, 195);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 205);
    doc.text('This is a computer-generated document from OGB Monthly Income Calculator', 20, 215);
    
    doc.save('OGB_Monthly_Income_Scheme.pdf');

    toast({
      title: "PDF Exported",
      description: "Monthly income scheme report exported successfully!",
    });
  };

  const shareToWhatsApp = () => {
    if (!result || !principal) return;

    const message = `*Odisha Grameen Bank - Monthly Income Scheme*

*Scheme Details:*
Principal Amount: ₹${parseFloat(principal).toLocaleString('en-IN')}
Scheme Period: ${(() => {
  const monthsVal = parseFloat(customMonths) || 0;
  const yearsVal = parseFloat(customYears) || 0;
  const totalDays = (monthsVal * 30) + (yearsVal * 365);
  
  const periodParts = [];
  if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
  if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
  
  return periodParts.length > 0 
    ? `${periodParts.join(', ')} (${totalDays} days total)` 
    : `${totalDays} days`;
})()}
Customer Type: ${getCustomerTypeLabel(customerType)}
Interest Rate: ${result.rate}% per annum
Scheme Duration: ${result.months} months

*Income Details:*
Monthly Income: ₹${result.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
Total Income: ₹${result.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
Principal Returned: ₹${parseFloat(principal).toLocaleString('en-IN')}

Generated from OGB Monthly Income Calculator
${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Shared to WhatsApp",
      description: "Monthly income scheme details shared successfully!",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Calendar className="h-6 w-6" />
            Monthly Income Scheme Calculator
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
                placeholder="Enter investment amount"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerType" className="text-base font-medium">
                Customer Type
              </Label>
              <Select value={customerType} onValueChange={setCustomerType}>
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

          {/* Period Entry */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-1">
              <Label className="text-base font-medium">Scheme Period</Label>
              <p className="text-sm text-muted-foreground">
                Enter the scheme period in years and/or months
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              {(customYears || customMonths) && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border">
                  <strong>Total Period: </strong>
                  {((parseFloat(customYears) || 0) * 365 + (parseFloat(customMonths) || 0) * 30)} days
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={calculateMonthlyIncome} 
            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-[var(--shadow-elegant)] transition-all duration-300"
            disabled={!principal || (!customMonths && !customYears)}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Calculate Monthly Income
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Results Card */}
          <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-success-light/20 to-financial-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-success">
                <IndianRupee className="h-5 w-5" />
                Monthly Income Results
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
                  <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-accent">₹{result.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">for {result.months} months</p>
                </div>
                
                <div className="bg-card/80 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-success">₹{result.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">+ Principal Return</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Calculation Sheet */}
          <Card className="shadow-[var(--shadow-card)] border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-primary">
                <FileText className="h-5 w-5" />
                Detailed Scheme Sheet
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
                    <TableCell className="font-medium">Scheme Period</TableCell>
                    <TableCell>
                      {(() => {
                        const monthsVal = parseFloat(customMonths) || 0;
                        const yearsVal = parseFloat(customYears) || 0;
                        const totalDays = (monthsVal * 30) + (yearsVal * 365);
                        
                        const periodParts = [];
                        if (yearsVal > 0) periodParts.push(`${yearsVal} year${yearsVal !== 1 ? 's' : ''}`);
                        if (monthsVal > 0) periodParts.push(`${monthsVal} month${monthsVal !== 1 ? 's' : ''}`);
                        
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
                    <TableCell className="font-medium">Scheme Duration</TableCell>
                    <TableCell>{result.months} months</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Monthly Income</TableCell>
                    <TableCell className="font-bold text-accent">₹{result.monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Total Income Received</TableCell>
                    <TableCell className="font-bold text-success">₹{result.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Principal Returned at Maturity</TableCell>
                    <TableCell className="font-bold text-primary">₹{parseFloat(principal).toLocaleString('en-IN')}</TableCell>
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
