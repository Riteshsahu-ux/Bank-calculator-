import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, Calculator } from "lucide-react";
import { differenceInYears, parse, isValid } from "date-fns";

interface SchemeEligibility {
  pmsby: boolean;
  pmjjby: boolean;
  apy: boolean;
}

interface APYContribution {
  pension: number;
  monthly: number;
}

export const SchemeEligibilityCalculator = () => {
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [eligibility, setEligibility] = useState<SchemeEligibility | null>(null);
  const [apyContributions, setApyContributions] = useState<APYContribution[]>([]);

  const calculateAPYContribution = (age: number, pensionAmount: number): number => {
    // APY contribution matrix (monthly contribution based on age and pension amount)
    const contributionMatrix: { [key: number]: { [key: number]: number } } = {
      18: { 1000: 42, 2000: 84, 3000: 126, 4000: 168, 5000: 210 },
      20: { 1000: 50, 2000: 100, 3000: 150, 4000: 200, 5000: 250 },
      25: { 1000: 76, 2000: 151, 3000: 226, 4000: 301, 5000: 376 },
      30: { 1000: 116, 2000: 231, 3000: 347, 4000: 462, 5000: 577 },
      35: { 1000: 181, 2000: 362, 3000: 543, 4000: 724, 5000: 902 },
      40: { 1000: 291, 2000: 582, 3000: 873, 4000: 1164, 5000: 1454 },
    };

    // Find closest age in matrix
    const ages = Object.keys(contributionMatrix).map(Number).sort((a, b) => a - b);
    let closestAge = ages[0];
    for (const matrixAge of ages) {
      if (age >= matrixAge) {
        closestAge = matrixAge;
      } else {
        break;
      }
    }

    return contributionMatrix[closestAge]?.[pensionAmount] || 0;
  };

  const handleCalculate = () => {
    if (!dob) return;

    const parsedDate = parse(dob, "yyyy-MM-dd", new Date());
    
    if (!isValid(parsedDate)) {
      return;
    }

    const calculatedAge = differenceInYears(new Date(), parsedDate);
    setAge(calculatedAge);

    // Check eligibility
    const newEligibility: SchemeEligibility = {
      pmsby: calculatedAge >= 18 && calculatedAge <= 70,
      pmjjby: calculatedAge >= 18 && calculatedAge <= 50,
      apy: calculatedAge >= 18 && calculatedAge <= 40,
    };
    setEligibility(newEligibility);

    // Calculate APY contributions if eligible
    if (newEligibility.apy) {
      const contributions: APYContribution[] = [];
      for (let pension = 1000; pension <= 5000; pension += 1000) {
        contributions.push({
          pension,
          monthly: calculateAPYContribution(calculatedAge, pension),
        });
      }
      setApyContributions(contributions);
    } else {
      setApyContributions([]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)] border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Calendar className="h-6 w-6" />
            Scheme Eligibility Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Check your eligibility for PMSBY, PMJJBY, and APY schemes based on your age
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-base font-medium">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="text-base h-12"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleCalculate} 
                className="w-full h-12 text-base"
                disabled={!dob}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Eligibility
              </Button>
            </div>
          </div>

          {age !== null && eligibility && (
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-lg font-semibold text-foreground">
                  Your Age: <span className="text-primary">{age} years</span>
                </p>
              </div>

              {/* Scheme Eligibility Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* PMSBY Card */}
                <Card className={eligibility.pmsby ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {eligibility.pmsby ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <h3 className="font-semibold text-foreground">PMSBY</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pradhan Mantri Suraksha Bima Yojana
                    </p>
                    <Badge variant={eligibility.pmsby ? "default" : "secondary"} className="mb-2">
                      {eligibility.pmsby ? "Eligible" : "Not Eligible"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Age: 18-70 years
                    </p>
                    {eligibility.pmsby && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium text-foreground">Annual Premium</p>
                        <p className="text-2xl font-bold text-primary">₹20</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* PMJJBY Card */}
                <Card className={eligibility.pmjjby ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {eligibility.pmjjby ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <h3 className="font-semibold text-foreground">PMJJBY</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pradhan Mantri Jeevan Jyoti Bima Yojana
                    </p>
                    <Badge variant={eligibility.pmjjby ? "default" : "secondary"} className="mb-2">
                      {eligibility.pmjjby ? "Eligible" : "Not Eligible"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Age: 18-50 years
                    </p>
                     {eligibility.pmjjby && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">See premium table below</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* APY Card */}
                <Card className={eligibility.apy ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {eligibility.apy ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <h3 className="font-semibold text-foreground">APY</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Atal Pension Yojana
                    </p>
                    <Badge variant={eligibility.apy ? "default" : "secondary"} className="mb-2">
                      {eligibility.apy ? "Eligible" : "Not Eligible"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Age: 18-40 years
                    </p>
                    {eligibility.apy && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground">See contribution table below</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* PMJJBY Pro-Rata Premium Table */}
              {eligibility.pmjjby && (
                <Card className="border-0 bg-gradient-to-br from-primary/10 to-accent/10">
                  <CardHeader>
                    <CardTitle className="text-lg">PMJJBY Pro-Rata Premium</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Premium varies based on your enrollment period
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Period of Enrollment</th>
                            <th className="text-center py-3 px-4 font-semibold text-foreground">Coverage Period</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground">Premium Payable</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">June, July, August</td>
                            <td className="text-center py-3 px-4 text-muted-foreground text-sm">12 months (Full Year)</td>
                            <td className="text-right py-3 px-4">
                              <span className="text-primary font-bold text-lg">₹436</span>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">September, October, November</td>
                            <td className="text-center py-3 px-4 text-muted-foreground text-sm">9 months (3 quarters)</td>
                            <td className="text-right py-3 px-4">
                              <span className="text-primary font-bold text-lg">₹342</span>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">December, January, February</td>
                            <td className="text-center py-3 px-4 text-muted-foreground text-sm">6 months (2 quarters)</td>
                            <td className="text-right py-3 px-4">
                              <span className="text-primary font-bold text-lg">₹228</span>
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">March, April, May</td>
                            <td className="text-center py-3 px-4 text-muted-foreground text-sm">3 months (1 quarter)</td>
                            <td className="text-right py-3 px-4">
                              <span className="text-primary font-bold text-lg">₹114</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * Premium varies based on the enrollment period to provide coverage for the remaining months in the policy year
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* APY Contribution Table */}
              {eligibility.apy && apyContributions.length > 0 && (
                <Card className="border-0 bg-gradient-to-br from-primary/10 to-accent/10">
                  <CardHeader>
                    <CardTitle className="text-lg">APY Monthly Contribution (at age {age})</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Monthly contributions required for different pension amounts
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-foreground">Pension Amount</th>
                            <th className="text-right py-3 px-4 font-semibold text-foreground">Monthly Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apyContributions.map((item) => (
                            <tr key={item.pension} className="border-b border-border/50">
                              <td className="py-3 px-4 text-foreground font-medium">₹{item.pension.toLocaleString('en-IN')}/month</td>
                              <td className="text-right py-3 px-4">
                                <span className="text-primary font-bold text-lg">₹{item.monthly}</span>
                                <span className="text-muted-foreground text-sm">/month</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      * Contributions shown are approximate and based on current APY guidelines
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
