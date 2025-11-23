import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee } from "lucide-react";

const ChargesCalculator = () => {
  const [neftAmount, setNeftAmount] = useState<string>("");
  const [impsAmount, setImpsAmount] = useState<string>("");
  const GST_RATE = 0.18;

  const calculateNEFTCharges = (transactionAmount: number) => {
    let baseCharge = 0;
    
    if (transactionAmount <= 10000) {
      baseCharge = 2.50;
    } else if (transactionAmount <= 100000) {
      baseCharge = 5.00;
    } else if (transactionAmount <= 200000) {
      baseCharge = 15.00;
    } else {
      baseCharge = 25.00;
    }
    
    const gstAmount = baseCharge * GST_RATE;
    const totalCharge = baseCharge + gstAmount;
    
    return { baseCharge, gstAmount, totalCharge };
  };

  const calculateIMPSCharges = (transactionAmount: number) => {
    let baseCharge = 0;
    
    if (transactionAmount <= 100000) {
      baseCharge = 5.00;
    } else if (transactionAmount <= 200000) {
      baseCharge = 15.00;
    }
    
    const gstAmount = baseCharge * GST_RATE;
    const totalCharge = baseCharge + gstAmount;
    
    return { baseCharge, gstAmount, totalCharge };
  };

  const neftAmountValue = parseFloat(neftAmount) || 0;
  const neftCharges = calculateNEFTCharges(neftAmountValue);
  
  const impsAmountValue = parseFloat(impsAmount) || 0;
  const impsCharges = calculateIMPSCharges(impsAmountValue);

  return (
    <div className="space-y-6">
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            NEFT Charges Calculator
          </CardTitle>
          <CardDescription>
            Calculate NEFT transaction charges at branch (outward)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="transaction-amount">Transaction Amount (₹)</Label>
            <Input
              id="transaction-amount"
              type="number"
              placeholder="Enter amount"
              value={neftAmount}
              onChange={(e) => setNeftAmount(e.target.value)}
              min="0"
            />
          </div>

          {neftAmountValue > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Base Charge</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{neftCharges.baseCharge.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">GST (18%)</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{neftCharges.gstAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Charges</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{neftCharges.totalCharge.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="text-lg">NEFT Charge Slabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Up to ₹10,000</span>
              <span className="text-sm font-bold">₹2.50 + GST</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">₹10,001 to ₹1,00,000</span>
              <span className="text-sm font-bold">₹5.00 + GST</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">₹1,00,001 to ₹2,00,000</span>
              <span className="text-sm font-bold">₹15.00 + GST</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Above ₹2,00,000</span>
              <span className="text-sm font-bold">₹25.00 + GST</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            IMPS Charges Calculator
          </CardTitle>
          <CardDescription>
            Calculate IMPS (Immediate Payment Service) transaction charges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="imps-amount">Transaction Amount (₹)</Label>
            <Input
              id="imps-amount"
              type="number"
              placeholder="Enter amount"
              value={impsAmount}
              onChange={(e) => setImpsAmount(e.target.value)}
              min="0"
            />
          </div>

          {impsAmountValue > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Base Charge</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{impsCharges.baseCharge.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">GST (18%)</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{impsCharges.gstAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Charges</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{impsCharges.totalCharge.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="text-lg">IMPS Charge Slabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Up to ₹1,00,000</span>
              <span className="text-sm font-bold">₹5 + GST</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">₹1,00,001 to ₹2,00,000</span>
              <span className="text-sm font-bold">₹15 + GST</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChargesCalculator;
