"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Download } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For individuals and small projects",
    features: [
      "1,000 executions/month",
      "5,000 API calls/month",
      "3 team members",
      "5 agents",
      "Email support",
    ],
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing teams and businesses",
    features: [
      "10,000 executions/month",
      "50,000 API calls/month",
      "10 team members",
      "Unlimited agents",
      "Priority support",
      "Advanced analytics",
    ],
    current: true,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited executions",
      "Unlimited API calls",
      "Unlimited team members",
      "Unlimited agents",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    current: false,
  },
];

const usageData = [
  { label: "Executions", current: 5972, max: 10000 },
  { label: "API Calls", current: 28915, max: 50000 },
  { label: "Team Members", current: 4, max: 10 },
];

const billingHistory = [
  { date: "Dec 1, 2024", amount: "$99.00", status: "Paid", invoice: "INV-2024-012" },
  { date: "Nov 1, 2024", amount: "$99.00", status: "Paid", invoice: "INV-2024-011" },
  { date: "Oct 1, 2024", amount: "$99.00", status: "Paid", invoice: "INV-2024-010" },
];

export function BillingTab() {
  return (
    <div className="space-y-8">
      {/* Plans */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Plans</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-card border relative ${
                plan.current ? "ring-2 ring-amber-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-600 text-white border-0">Most Popular</Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-card text-amber-400 border-amber-600">
                    Current
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-amber-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.current 
                      ? "bg-accent text-muted-foreground cursor-default hover:bg-accent" 
                      : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage & Payment in two columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Usage This Month */}
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-base">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.current.toLocaleString()} / {item.max.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full">
                  <div 
                    className="h-2 bg-amber-600 rounded-full" 
                    style={{ width: `${(item.current / item.max) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-18 bg-accent rounded-lg flex items-center justify-center px-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-xs text-foreground0">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border text-muted-foreground">
                Update
              </Button>
            </div>
            <div className="mt-4 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="text-foreground">Jan 1, 2025</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground">$99.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="bg-card border">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-base">Billing History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {billingHistory.map((invoice, index) => (
                <tr key={index} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.invoice}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-amber-950/50 text-amber-400 border-amber-800/50">
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
