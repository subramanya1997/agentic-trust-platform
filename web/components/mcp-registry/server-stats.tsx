import { StatsCard } from "@/components/ui/stats-card";
import type { CustomMCPServer } from "@/lib/types";

interface ServerStatsProps {
  server: CustomMCPServer;
}

export function ServerStats({ server }: ServerStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatsCard
        title="Total Calls"
        value={server.stats.totalCalls.toLocaleString()}
        change="+12%"
        changeType="positive"
      />
      <StatsCard
        title="Success Rate"
        value={`${server.stats.successRate}%`}
        change="+0.3%"
        changeType="positive"
      />
      <StatsCard
        title="Avg Latency"
        value={`${server.stats.avgLatency}ms`}
        change="-8ms"
        changeType="positive"
      />
      <StatsCard
        title="Unique Clients"
        value={server.stats.uniqueClients}
        change="+3"
        changeType="positive"
      />
      <StatsCard title="Rate Limit" value={`${server.rateLimitPerMinute || 60}/min`} />
    </div>
  );
}
