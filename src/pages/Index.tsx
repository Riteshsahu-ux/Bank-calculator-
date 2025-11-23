import { InterestCalculator } from "@/components/InterestCalculator";
import { MonthlyIncomeCalculator } from "@/components/MonthlyIncomeCalculator";
import { TimePeriodCalculator } from "@/components/TimePeriodCalculator";
import { RatesTable } from "@/components/RatesTable";
import { SchemeEligibilityCalculator } from "@/components/SchemeEligibilityCalculator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Calculator, FileText, TrendingUp, Calendar, Clock, Menu, UserCheck, Receipt } from "lucide-react";
import { useState, useRef } from "react";
import ChargesCalculator from "@/components/ChargesCalculator";

const Index = () => {
  const [mainTab, setMainTab] = useState("fd-calculator");
  const [fdTab, setFdTab] = useState("calculator");
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleFdTabChange = (tab: string) => {
    setFdTab(tab);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getMainTabLabel = (tab: string) => {
    switch (tab) {
      case "fd-calculator": return "FD Calculator";
      case "scheme-eligibility": return "Scheme Eligibility";
      case "charges": return "Charges Calculator";
      default: return tab;
    }
  };

  const getFdTabLabel = (tab: string) => {
    switch (tab) {
      case "calculator": return "Interest Calculator";
      case "monthly-income": return "Monthly Income";
      case "time-period": return "Time Period";
      case "rates": return "Interest Rates";
      default: return tab;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Mobile-First Navigation */}
      <nav className="mobile-nav sticky top-0 z-50">
        <div className="max-w-sm md:max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 primary-card rounded-xl flex items-center justify-center">
                <img src="/lovable-uploads/df14f527-99f2-439b-880a-fc3ce60fdfbc.png" alt="OGB Logo" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <div className="text-title">OGB Calculator</div>
                <div className="text-xs text-muted-foreground">Fixed Deposits</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="max-w-sm md:max-w-6xl mx-auto px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => setMainTab("fd-calculator")} 
                className="cursor-pointer"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {mainTab === "fd-calculator" ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink className="cursor-pointer">
                    {getMainTabLabel(mainTab)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getFdTabLabel(fdTab)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{getMainTabLabel(mainTab)}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Dashboard Header */}
      <div className="max-w-sm md:max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="space-y-6">
          {/* Welcome Section - Conditional based on main tab */}
          {mainTab === "fd-calculator" && (
            <>
              <div>
                <h1 className="text-display">Calculate Returns</h1>
                <p className="text-body text-muted-foreground mt-1">
                  Professional FD calculator with real-time rates
                </p>
              </div>
            </>
          )}
          
          {mainTab === "charges" && (
            <>
              <div>
                <h1 className="text-display">Transaction Charges</h1>
                <p className="text-body text-muted-foreground mt-1">
                  Calculate NEFT, IMPS, and RTGS charges instantly
                </p>
              </div>
            </>
          )}
          
          {mainTab === "scheme-eligibility" && (
            <>
              <div>
                <h1 className="text-display">Scheme Eligibility</h1>
                <p className="text-body text-muted-foreground mt-1">
                  Check eligibility for PMSBY, PMJJBY, and APY schemes
                </p>
              </div>
            </>
          )}

          {/* Quick Stats Cards - Show based on main tab */}
          {mainTab === "fd-calculator" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="primary-card finance-card p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label text-primary-foreground/80">Best Rate</div>
                    <div className="stat-value text-primary-foreground">7.55%</div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-primary-foreground/80" />
                </div>
              </div>
              
              <div className="accent-card finance-card p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label text-accent-foreground/80">Compounding</div>
                    <div className="stat-value text-accent-foreground">Quarterly</div>
                  </div>
                  <Calculator className="w-6 h-6 text-accent-foreground/80" />
                </div>
              </div>
            </div>
          )}

          {mainTab === "charges" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="primary-card finance-card p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label text-primary-foreground/80">NEFT Charge</div>
                    <div className="stat-value text-primary-foreground">From ₹2.36</div>
                  </div>
                  <Receipt className="w-6 h-6 text-primary-foreground/80" />
                </div>
              </div>
              
              <div className="accent-card finance-card p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-label text-accent-foreground/80">IMPS Charge</div>
                    <div className="stat-value text-accent-foreground">From ₹5.90</div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-accent-foreground/80" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Access Cards - Only show for FD Calculator */}
          {mainTab === "fd-calculator" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setMainTab("scheme-eligibility")}
              className="accent-card finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-accent/30 animate-fade-in relative"
              style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="text-title text-sm text-accent-foreground">Scheme Eligibility</div>
                    <div className="text-xs text-accent-foreground/80">PMSBY, PMJJBY, APY</div>
                  </div>
                </div>
                <div className="text-accent-foreground/60">→</div>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => handleFdTabChange("monthly-income")}
              className="primary-card finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-primary/30 animate-fade-in relative"
              style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="text-title text-sm text-primary-foreground">Monthly Income</div>
                    <div className="text-xs text-primary-foreground/80">Calculate monthly returns</div>
                  </div>
                </div>
                <div className="text-primary-foreground/60">→</div>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => handleFdTabChange("time-period")}
              className="finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-border bg-card animate-fade-in relative"
              style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-title text-sm text-foreground">Time Period</div>
                    <div className="text-xs text-muted-foreground">Plan your investment</div>
                  </div>
                </div>
                <div className="text-muted-foreground">→</div>
              </div>
            </button>

            <button 
              type="button"
              onClick={() => setMainTab("charges")}
              className="finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 animate-fade-in relative"
              style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-title text-sm text-foreground">Transaction Charges</div>
                    <div className="text-xs text-muted-foreground">NEFT, IMPS calculator</div>
                  </div>
                </div>
                <div className="text-muted-foreground">→</div>
              </div>
            </button>
            </div>
          )}

          {/* Feature Cards for Charges Calculator */}
          {mainTab === "charges" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="primary-card finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-primary/30 animate-fade-in"
                style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-title text-sm text-primary-foreground">NEFT Transfers</div>
                    <div className="text-xs text-primary-foreground/80">₹2.36 to ₹23.60</div>
                  </div>
                </div>
              </div>

              <div className="accent-card finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-accent/30 animate-fade-in"
                style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-title text-sm text-accent-foreground">IMPS Transfers</div>
                    <div className="text-xs text-accent-foreground/80">₹5.90 to ₹17.70</div>
                  </div>
                </div>
              </div>

              <div className="finance-card p-4 rounded-xl hover-scale cursor-pointer border-2 border-border bg-card animate-fade-in"
                style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-title text-sm text-foreground">Instant Calculation</div>
                    <div className="text-xs text-muted-foreground">GST included</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Cards - Only show for FD Calculator */}
          {mainTab === "fd-calculator" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="finance-card p-4 rounded-xl animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-title text-sm">Live Rates</div>
                  <div className="text-xs text-muted-foreground">Updated daily</div>
                </div>
              </div>
            </div>
            
            <div className="finance-card p-4 rounded-xl animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-title text-sm">Export Data</div>
                  <div className="text-xs text-muted-foreground">PDF & Excel</div>
                </div>
              </div>
            </div>
            
            <div className="finance-card p-4 rounded-xl animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-title text-sm">Instant Results</div>
                  <div className="text-xs text-muted-foreground">Real-time</div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div ref={tabsRef} className="max-w-sm md:max-w-6xl mx-auto px-4 pb-8">
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <div className="finance-card rounded-2xl p-4">
            <TabsList className="grid w-full grid-cols-3 gap-4 h-auto bg-transparent p-0">
              <TabsTrigger 
                value="fd-calculator" 
                className="flex flex-col items-center justify-center gap-2 h-24 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
              >
                <Calculator className="h-6 w-6" />
                <span>FD Calculator</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheme-eligibility" 
                className="flex flex-col items-center justify-center gap-2 h-24 text-sm font-medium rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all border-2 border-transparent data-[state=active]:border-accent/20 data-[state=active]:shadow-lg"
              >
                <UserCheck className="h-6 w-6" />
                <span>Scheme Eligibility</span>
              </TabsTrigger>
              <TabsTrigger 
                value="charges" 
                className="flex flex-col items-center justify-center gap-2 h-24 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
              >
                <Receipt className="h-6 w-6" />
                <span>Charges Calculator</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fd-calculator">
            <Tabs value={fdTab} onValueChange={setFdTab} className="space-y-6">
              <div className="finance-card rounded-2xl p-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-3 h-auto bg-transparent p-0">
                  <TabsTrigger 
                    value="calculator" 
                    className="flex flex-col items-center justify-center gap-2 h-20 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
                  >
                    <Calculator className="h-5 w-5" />
                    <span>Interest Calculator</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="monthly-income" 
                    className="flex flex-col items-center justify-center gap-2 h-20 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Monthly Income</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="time-period" 
                    className="flex flex-col items-center justify-center gap-2 h-20 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
                  >
                    <Clock className="h-5 w-5" />
                    <span>Time Period</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rates" 
                    className="flex flex-col items-center justify-center gap-2 h-20 text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all col-span-2 md:col-span-1 border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:shadow-lg"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Interest Rates</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="calculator">
                <InterestCalculator />
              </TabsContent>

              <TabsContent value="monthly-income">
                <MonthlyIncomeCalculator />
              </TabsContent>

              <TabsContent value="time-period">
                <TimePeriodCalculator />
              </TabsContent>

              <TabsContent value="rates">
                <RatesTable />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="scheme-eligibility">
            <SchemeEligibilityCalculator />
          </TabsContent>

          <TabsContent value="charges">
            <ChargesCalculator />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modern Footer */}
      <footer className="max-w-sm md:max-w-6xl mx-auto px-4 pb-8 pt-16">
        <div className="finance-card rounded-2xl p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="w-12 h-12 primary-card rounded-xl flex items-center justify-center">
                <img src="/lovable-uploads/df14f527-99f2-439b-880a-fc3ce60fdfbc.png" alt="OGB Logo" className="h-6 w-6 object-contain" />
              </div>
              <div className="text-left">
                <div className="text-title">Odisha Grameen Bank</div>
                <div className="text-xs text-muted-foreground">Official Calculator</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-sm font-medium text-foreground">
                  📊 Rates effective from 01/08/2025 as per circular TRANS/FI/2025
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This calculator is for indicative purposes only. Please verify rates with the bank before making deposits.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;