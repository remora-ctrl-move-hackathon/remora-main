import { NextResponse } from "next/server";

// In-memory state to keep track of the bot.
// For a real application, you would use a database or a more robust process manager.
let isBotRunning = false;
let botLogs: string[] = [];

/**
 * @swagger
 * /api/ai-trader/start:
 *   post:
 *     summary: Start the AI trading bot
 *     description: Initiates the server-side AI trading bot process.
 *     responses:
 *       200:
 *         description: Bot started successfully.
 *       500:
 *         description: Bot is already running or failed to start.
 */
export async function POST(request: Request) {
  const { action } = await request.json();

  if (action === "start") {
    if (isBotRunning) {
      return NextResponse.json({ message: "Bot is already running." }, { status: 400 });
    }
    isBotRunning = true;
    botLogs = ["Bot started at " + new Date().toLocaleTimeString()];
    console.log("Starting AI trading bot...");
    // In a real implementation, you would spawn a child process here
    // e.g., child_process.spawn('node', ['src/scripts/trading-bot.js']);
    return NextResponse.json({ message: "Bot started successfully." });
  }

  if (action === "stop") {
    if (!isBotRunning) {
      return NextResponse.json({ message: "Bot is not running." }, { status: 400 });
    }
    isBotRunning = false;
    botLogs.push("Bot stopped at " + new Date().toLocaleTimeString());
    console.log("Stopping AI trading bot...");
    // In a real implementation, you would kill the child process here.
    return NextResponse.json({ message: "Bot stopped successfully." });
  }

  return NextResponse.json({ message: "Invalid action." }, { status: 400 });
}

/**
 * @swagger
 * /api/ai-trader/status:
 *   get:
 *     summary: Get the status and logs of the AI trading bot
 *     description: Retrieves the current running state and logs of the bot.
 *     responses:
 *       200:
 *         description: Returns the bot's status and logs.
 */
export async function GET() {
  return NextResponse.json({
    isRunning: isBotRunning,
    logs: botLogs,
  });
}
