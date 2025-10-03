"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Bot, Trophy, Zap, Target, DollarSign } from "lucide-react";
import Link from "next/link";
import { aiCoachService, AICoach } from "@/services/ai-coach.service";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function CoachesPage() {
  const { connected } = useWallet();
  const [coaches, setCoaches] = useState<AICoach[]>([]);
  const [leaderboard, setLeaderboard] = useState<AICoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStaked, setTotalStaked] = useState(0);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const [allCoaches, topCoaches, staked] = await Promise.all([
        aiCoachService.getAllCoaches(),
        aiCoachService.getLeaderboard(10),
        aiCoachService.getTotalStaked(),
      ]);

      setCoaches(allCoaches);
      setLeaderboard(topCoaches);
      setTotalStaked(staked);
    } catch (error) {
      console.error("Error fetching coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAPT = (octas: number) => {
    return (octas / 100000000).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">AI Portfolio Coaches</h1>
              <p className="text-muted-foreground">
                Follow AI-powered trading strategies and compete on the leaderboard
              </p>
            </div>
            <Link href="/coaches/create">
              <Button size="lg" className="gap-2">
                <Bot className="h-5 w-5" />
                Create Coach
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coaches.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAPT(totalStaked)} APT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Weekly tournaments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Coaches</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="following">My Coaches</TabsTrigger>
          </TabsList>

          {/* All Coaches */}
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading coaches...</p>
              </div>
            ) : coaches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No AI Coaches Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to create an AI trading coach!
                  </p>
                  <Link href="/coaches/create">
                    <Button>Create First Coach</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coaches.map((coach) => (
                  <CoachCard key={coach.coach_id} coach={coach} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performing Coaches
                </CardTitle>
                <CardDescription>
                  Ranked by risk-adjusted returns and win rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((coach, index) => (
                    <div
                      key={coach.coach_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{coach.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{coach.win_rate.toFixed(1)}% Win Rate</Badge>
                            <Badge variant={coach.is_pnl_positive ? "default" : "destructive"}>
                              {coach.is_pnl_positive ? "+" : "-"}$
                              {(coach.total_pnl / 1000000).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/coaches/${coach.coach_id}`}>
                        <Button>View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Coaches */}
          <TabsContent value="following">
            <Card>
              <CardContent className="text-center py-12">
                {!connected ? (
                  <>
                    <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
                    <p className="text-muted-foreground">
                      Connect your wallet to see coaches you're following
                    </p>
                  </>
                ) : (
                  <>
                    <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Coaches Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start following AI coaches to see them here
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CoachCard({ coach }: { coach: AICoach }) {
  const formatAPT = (octas: number) => (octas / 100000000).toFixed(2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{coach.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Bot className="h-3 w-3" />
              Coach #{coach.coach_id}
            </CardDescription>
          </div>
          {coach.rank > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />#{coach.rank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-semibold">{coach.win_rate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Trades</p>
            <p className="font-semibold">{coach.total_trades}</p>
          </div>
          <div>
            <p className="text-muted-foreground">P&L</p>
            <p className={`font-semibold ${coach.is_pnl_positive ? "text-green-500" : "text-red-500"}`}>
              {coach.is_pnl_positive ? "+" : "-"}${(coach.total_pnl / 1000000).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Staked</p>
            <p className="font-semibold">{formatAPT(coach.total_staked)} APT</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/coaches/${coach.coach_id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          <Link href={`/coaches/${coach.coach_id}/stake`} className="flex-1">
            <Button className="w-full gap-2">
              <TrendingUp className="h-4 w-4" />
              Stake
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
