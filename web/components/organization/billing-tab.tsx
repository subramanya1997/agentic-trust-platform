"use client";

import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CreditCard, Download } from "@/lib/icons";

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
        <h3 className="text-foreground mb-4 text-lg font-semibold">Plans</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-card relative border ${plan.current ? "ring-2 ring-amber-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    variant="outline"
                    className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="outline"
                    className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    Current
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <div className="mb-6 text-center">
                  <h4 className="text-foreground text-lg font-semibold">{plan.name}</h4>
                  <div className="mt-2">
                    <span className="text-foreground text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                </div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 shrink-0 text-amber-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.current
                      ? "bg-accent text-muted-foreground hover:bg-accent cursor-default"
                      : "bg-amber-600 text-white hover:bg-amber-500"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current
                    ? "Current Plan"
                    : plan.id === "enterprise"
                      ? "Contact Sales"
                      : "Upgrade"}
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
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <span className="text-muted-foreground text-sm">
                    {item.current.toLocaleString()} / {item.max.toLocaleString()}
                  </span>
                </div>
                <div className="bg-accent h-2 rounded-full">
                  <div
                    className="h-2 rounded-full bg-amber-600"
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
                <div className="bg-accent flex h-12 w-18 items-center justify-center rounded-lg px-3">
                  <CreditCard className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">•••• •••• •••• 4242</p>
                  <p className="text-foreground0 text-xs">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-muted-foreground border">
                Update
              </Button>
            </div>
            <div className="mt-4 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="text-foreground">Jan 1, 2025</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
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
          <DataTable
            headers={[
              { label: "Date", align: "left" },
              { label: "Invoice", align: "left" },
              { label: "Amount", align: "left" },
              { label: "Status", align: "left" },
              { label: "", align: "right" },
            ]}
          >
            {billingHistory.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell className="text-foreground px-4 py-3 text-sm">{invoice.date}</TableCell>
                <TableCell className="text-muted-foreground px-4 py-3 text-sm">
                  {invoice.invoice}
                </TableCell>
                <TableCell className="text-foreground px-4 py-3 text-sm">
                  {invoice.amount}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className="border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}

export function BillingTabSkeleton() {
  return (
    <div className="space-y-8">
      {/* Plans */}
      <div>
        <Skeleton className="h-6 w-16 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border">
              <CardContent className="p-6 pt-8">
                <div className="mb-6 text-center space-y-3">
                  <Skeleton className="h-5 w-20 mx-auto" />
                  <Skeleton className="h-9 w-32 mx-auto" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
                <div className="mb-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
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
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-card border">
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-18 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="bg-card border">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Date", align: "left" },
              { label: "Invoice", align: "left" },
              { label: "Amount", align: "left" },
              { label: "Status", align: "left" },
              { label: "", align: "right" },
            ]}
          >
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
