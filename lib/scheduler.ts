import cron from "node-cron";
import { getNBAandNHLOdds } from "./odds";

let cachedData: any[] = [];

export function startScheduler() {
  console.log("Scheduler started...");

  // 7am EST
  cron.schedule("0 7 * * *", async () => {
    console.log("Updating odds at 7AM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  // 12pm EST
  cron.schedule("0 12 * * *", async () => {
    console.log("Updating odds at 12PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  // 3pm EST
  cron.schedule("0 15 * * *", async () => {
    console.log("Updating odds at 3PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });

  // 6pm EST
  cron.schedule("0 18 * * *", async () => {
    console.log("Updating odds at 6PM EST");
    cachedData = await getNBAandNHLOdds();
  }, { timezone: "America/New_York" });
}

export function getCachedOdds() {
  return cachedData;
}
