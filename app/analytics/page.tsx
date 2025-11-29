"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { mockCostData, mockCostBreakdown } from "@/lib/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingDown, Download, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function AnalyticsPage() {
  const totalCost = mockCostBreakdown.reduce((sum, item) => sum + item.cost, 0);
  const weeklyChange = -5.2;

  return (
    <>
      <Header 
        actionButton={
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-50">Cost Analytics</h1>
              <p className="mt-1 text-sm text-stone-400">
                Track and optimize your infrastructure costs
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-stone-700 text-stone-300">
              <Calendar className="mr-2 h-4 w-4" />
              Last 7 Days
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-300">Total Cost</p>
                    <p className="mt-2 text-3xl font-bold text-stone-50">
                      {formatCurrency(totalCost)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-green-600">
                      <TrendingDown className="inline h-4 w-4 mr-1" />
                      {Math.abs(weeklyChange)}% from last week
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-stone-300">
                  Cost per Execution
                </p>
                <p className="mt-2 text-3xl font-bold text-stone-50">$0.052</p>
                <p className="mt-2 text-sm text-stone-400">Average across all agents</p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <p className="text-sm font-medium text-stone-300">Projected Monthly</p>
                <p className="mt-2 text-3xl font-bold text-stone-50">
                  {formatCurrency(totalCost * 4.3)}
                </p>
                <p className="mt-2 text-sm text-stone-400">Based on current usage</p>
              </div>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f5f5f4",
                      }}
                      formatter={(value: number) => [`$${value}`, "Cost"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Executions Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f5f5f4",
                      }}
                    />
                    <Bar dataKey="executions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockCostBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="cost"
                      label
                    >
                      {mockCostBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f5f5f4",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-50">
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold text-stone-50">
                            {formatCurrency(item.cost)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex-1 bg-stone-800 rounded-full h-2 mr-3">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs text-stone-400">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-stone-50">
                      Total
                    </span>
                    <span className="text-lg font-bold text-stone-50">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
