import { getNBAandNHLOdds } from "@/lib/odds";
import cron from "node-cron";

let cachedData = [];
let initialized = false;

function startScheduler() {
  console.log("Scheduler started...");

  cron.schedule("0 7 * * *", async () => {
    console.log("Updating odds at 7AM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  cron.schedule("0 12 * * *", async () => {
    console.log("Updating odds at 12PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  cron.schedule("0 15 * * *", async () => {
    console.log("Updating odds at 3PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  cron.schedule("0 18 * * *", async () => {
    console.log("Updating odds at 6PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });
}

export async function GET() {
  if (!initialized) {
    startScheduler();
    initialized = true;
  }

  try {
    if (!cachedData || cachedData.length === 0) {
      cachedData = await getNBAandNHLOdds();
    }

    return Response.json(cachedData);
  } catch (error) {
    return Response.json({ error: "Failed to fetch odds" }, { status: 500 });
  }
}
