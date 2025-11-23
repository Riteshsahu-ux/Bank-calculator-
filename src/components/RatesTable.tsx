import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Users } from "lucide-react";

const ratesData = [
  { period: "7-14 days", general: "2.65", senior: "2.65", superSenior: "2.65", highlight: false },
  { period: "15-29 days", general: "2.75", senior: "2.75", superSenior: "2.75", highlight: false },
  { period: "30-45 days", general: "2.75", senior: "2.75", superSenior: "2.75", highlight: false },
  { period: "46-60 days", general: "2.75", senior: "2.75", superSenior: "2.75", highlight: false },
  { period: "61-90 days", general: "2.75", senior: "2.75", superSenior: "2.75", highlight: false },
  { period: "91-120 days", general: "3.75", senior: "3.75", superSenior: "3.75", highlight: false },
  { period: "121-150 days", general: "4.00", senior: "4.00", superSenior: "4.00", highlight: false },
  { period: "151-179 days", general: "4.00", senior: "4.00", superSenior: "4.00", highlight: false },
  { period: "180-210 days", general: "4.50", senior: "5.00", superSenior: "5.25", highlight: true },
  { period: "211-270 days", general: "4.50", senior: "5.00", superSenior: "5.25", highlight: true },
  { period: "271 days to < 1 year", general: "4.75", senior: "5.25", superSenior: "5.50", highlight: true },
  { period: "One year only", general: "6.05", senior: "6.55", superSenior: "6.80", highlight: true },
  { period: "1-2 years", general: "6.00", senior: "6.50", superSenior: "6.75", highlight: true },
  { period: "2-3 years", general: "5.90", senior: "6.40", superSenior: "6.65", highlight: true },
  { period: "3-5 years", general: "5.95", senior: "6.45", superSenior: "6.70", highlight: true },
  { period: "5-8 years", general: "5.85", senior: "6.35", superSenior: "6.60", highlight: true },
  { period: "8+ years (up to 10)", general: "5.75", senior: "6.25", superSenior: "6.50", highlight: true },
  { period: "Tax Saver Deposit", general: "5.85", senior: "5.85", superSenior: "5.85", highlight: false }
];

export const RatesTable = () => {
  const bestRates = [
    { category: "General Public", rate: "6.05", period: "One year only", icon: Users },
    { category: "Senior Citizens", rate: "6.55", period: "One year only", icon: TrendingUp },
    { category: "Super Senior Citizens", rate: "6.80", period: "One year only", icon: TrendingUp },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Best Rates Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bestRates.map((item, index) => (
          <Card key={index} className="border-0 bg-gradient-to-br from-primary/10 to-accent/10 shadow-[var(--shadow-card)]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <item.icon className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-success/20 text-success font-mono">
                  Best Rate
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {item.category}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">{item.rate}</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <FileText className="h-6 w-6" />
            Current Interest Rates
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-financial-light text-financial">
              <TrendingUp className="mr-1 h-3 w-3" />
              Effective: 01/08/2025
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              <Users className="mr-1 h-3 w-3" />
              Odisha Grameen Bank
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold text-foreground min-w-[200px]">
                    Deposit Period
                  </TableHead>
                  <TableHead className="font-semibold text-center text-foreground min-w-[120px]">
                    General Public
                  </TableHead>
                  <TableHead className="font-semibold text-center text-foreground min-w-[120px]">
                    Senior Citizens
                  </TableHead>
                  <TableHead className="font-semibold text-center text-foreground min-w-[130px]">
                    Super Senior Citizens
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratesData.map((rate, index) => (
                  <TableRow 
                    key={index} 
                    className={`border-border/30 hover:bg-muted/30 transition-colors ${
                      rate.highlight ? 'bg-financial-light/10' : ''
                    }`}
                  >
                    <TableCell className="font-medium text-foreground py-4">
                      {rate.period}
                      {rate.period === "Tax Saver Deposit" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          5 years lock-in period
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge 
                        variant="secondary" 
                        className={`font-mono ${rate.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                      >
                        {rate.general}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge 
                        variant="secondary" 
                        className={`font-mono ${rate.highlight ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}
                      >
                        {rate.senior}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge 
                        variant="secondary" 
                        className={`font-mono ${rate.highlight ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}
                      >
                        {rate.superSenior}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm text-foreground mb-2">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• For 7 to 14 days deposits, minimum amount shall be ₹1.00 lac</li>
              <li>• Savings Deposit rate: 2.40% (irrespective of amount)</li>
              <li>• Rates are per annum and subject to change</li>
              <li>• Senior Citizens: 60 years and above</li>
              <li>• Super Senior Citizens: 80 years and above</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};