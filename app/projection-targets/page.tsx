"use client";

import { useEffect, useState } from "react";

type Game = {
  league: string;
  gameTime: string;
  homeTeam: string;
  awayTeam: string;
  homeNoVig: number;
  awayNoVig: number;
  homeTarget: number;
  awayTarget: number;
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("ALL");

  useEffect(() => {
    fetch("/api/odds")
      .then(res => res.json())
      .then(data => {
        // Sort by earliest game time
        const sorted = data.sort(
          (a: Game, b: Game) =>
            new Date(a.gameTime).getTime() -
            new Date(b.gameTime).getTime()
        );
        setGames(sorted);
        setLoading(false);
      });
  }, []);

  const filteredGames =
    selectedLeague === "ALL"
      ? games
      : games.filter(g => g.league === selectedLeague);

  if (loading) {
    return (
      <main className="p-10 text-white bg-black min-h-screen">
        <h1 className="text-3xl font-bold">Loading Value Board...</h1>
      </main>
    );
  }

  return (
    <main className="p-10 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Real Value Board</h1>

        <div className="space-x-3">
          {["ALL", "NBA", "NHL", "MLB", "NFL"].map(league => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2 rounded-lg border ${
                selectedLeague === league
                  ? "bg-white text-black"
                  : "border-gray-600 text-gray-300"
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredGames.map((game, index) => {
          const localTime = new Date(game.gameTime).toLocaleString();

          return (
            <div
              key={index}
              className="border border-gray-100 p-6 rounded-2xl bg-[#262626] text-[#E5E4BA]"
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {game.awayTeam} @ {game.homeTeam}
                </h2>
                <p className="text-[#E5E4BA]">{localTime}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-lg font-medium mb-2">
                    {game.homeTeam}
                  </p>
                  <p className="text-gray-300">
                    Market: {(game.homeNoVig * 100).toFixed(0)}%
                  </p>
                  <p className="text-green-400 font-semibold">
                    Target: {(game.homeTarget * 100).toFixed(0)}%
                  </p>
                </div>

                <div>
                  <p className="text-lg font-medium mb-2">
                    {game.awayTeam}
                  </p>
                  <p className="text-gray-400">
                    Market: {(game.awayNoVig * 100).toFixed(0)}%
                  </p>
                  <p className="text-green-400 font-semibold">
                    Target: {(game.awayTarget * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
