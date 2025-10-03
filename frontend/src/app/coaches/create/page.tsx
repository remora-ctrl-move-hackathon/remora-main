"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { aiCoachService, CreateCoachParams } from "@/services/ai-coach.service";
import { AVAILABLE_MODELS } from "@/services/ai-strategy.service";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptos } from "@/hooks/useAptos";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateCoachPage() {
  const router = useRouter();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const { aptos } = useAptos();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateCoachParams>({
    name: "",
    description: "",
    strategy_prompt: "",
    model_type: "gpt-4-turbo",
  });

  const handleCreate = async () => {
    if (!connected || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!form.name || !form.description || !form.strategy_prompt) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setCreating(true);

      // Build transaction
      const payload = await aiCoachService.createCoach(form);

      // Sign and submit
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: payload,
      });

      // Wait for confirmation
      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      toast.success("AI Coach created successfully!");
      router.push("/coaches");
    } catch (error: any) {
      console.error("Error creating coach:", error);
      toast.error(error.message || "Failed to create coach");
    } finally {
      setCreating(false);
    }
  };

  const examplePrompts = [
    {
      name: "Momentum Trader",
      prompt: "Trade based on RSI momentum. Enter long when RSI < 30 (oversold), short when RSI > 70 (overbought). Use 3x leverage. Set stop loss at 2% and take profit at 5%."
    },
    {
      name: "Mean Reversion",
      prompt: "Buy when price drops 10% below 50-day moving average. Sell when it returns to average. Conservative 2x leverage. Exit if loss exceeds 3%."
    },
    {
      name: "Breakout Hunter",
      prompt: "Identify consolidation periods, enter long on breakout above resistance with volume confirmation. 5x leverage. Trail stop loss at 8% below price."
    },
  ];

  const fillExample = (example: typeof examplePrompts[0]) => {
    setForm(prev => ({
      ...prev,
      name: example.name,
      strategy_prompt: example.prompt,
    }));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/coaches">
            <Button variant="ghost" className="gap-2 mb-4">
              <ChevronLeft className="h-4 w-4" />
              Back to Coaches
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Create AI Coach</h1>
              <p className="text-muted-foreground mt-1">
                Design your own AI-powered trading strategy
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Coach Details</CardTitle>
              <CardDescription>
                Configure your AI coach's trading strategy and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Coach Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Momentum Master"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Short description of your strategy"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* AI Model */}
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={form.model_type} onValueChange={(value) => setForm({ ...form, model_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Strategy Prompt */}
              <div className="space-y-2">
                <Label htmlFor="strategy">Trading Strategy Prompt</Label>
                <Textarea
                  id="strategy"
                  placeholder="Describe your trading strategy in detail. Be specific about entry/exit conditions, risk management, leverage, etc."
                  value={form.strategy_prompt}
                  onChange={(e) => setForm({ ...form, strategy_prompt: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {form.strategy_prompt.length} / 2000 characters
                </p>
              </div>

              {/* Create Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>Creation Fee: <span className="font-semibold">0.1 APT</span></p>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!connected || creating}
                  size="lg"
                  className="gap-2"
                >
                  {creating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Coach
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example Prompts */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Strategies</CardTitle>
                <CardDescription>Click to use as template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => fillExample(example)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <h4 className="font-semibold text-sm mb-1">{example.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {example.prompt}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be specific about entry and exit conditions</p>
                <p>• Define risk management rules clearly</p>
                <p>• Include leverage and position sizing</p>
                <p>• Specify timeframes and indicators</p>
                <p>• Test with small amounts first</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
