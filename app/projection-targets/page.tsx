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
  const [unitSize, setUnitSize] = useState(100);
  const [realProbs, setRealProbs] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/odds")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(
          (a: Game, b: Game) =>
            new Date(a.gameTime).getTime() -
            new Date(b.gameTime).getTime()
        );

        setGames(sorted);
        setLoading(false);
      });
  }, []);

  /* ------------------ LEAGUES TODAY ------------------ */

  const leaguesToday = [
    "ALL",
    ...Array.from(new Set(games.map(g => g.league)))
  ];

  const filteredGames =
    selectedLeague === "ALL"
      ? games
      : games.filter(g => g.league === selectedLeague);

  /* ------------------ EDGE CALCULATION ------------------ */

  function calculateEdge(real: number | undefined, market: number) {
    if (!real) return 0;
    return (market - real) * 100;
  }

  /* ------------------ BET SIZE ------------------ */

  function calculateBet(real: number | undefined, market: number) {
    if (!real) return 0;

    const edge = market - real;

    if (edge <= 0) return 0;

    let multiplier = 0;

    if (edge < 0.06) multiplier = 1;
    else if (edge < 0.08) multiplier = 1.5;
    else if (edge < 0.1) multiplier = 2;
    else multiplier = 3;

    return (unitSize * multiplier).toFixed(0);
  }

  /* ------------------ EDGE COLOR ------------------ */

  function getEdgeColor(edge: number) {
    if (edge >= 6) return "text-green-400";
    if (edge > 0) return "text-yellow-400";
    return "text-red-400";
  }

  /* ------------------ TEAM LOGOS ------------------ */

  const getLogo = (team: string) => {
    const clean = team.toLowerCase().replace(/\s/g, "");
    return `https://a.espncdn.com/i/teamlogos/${clean}.png`;
  };

  if (loading) {
    return (
      <main className="p-10 text-white bg-black min-h-screen">
        <h1 className="text-3xl font-bold">Loading Value Board...</h1>
      </main>
    );
  }

  return (
    <main className="p-10 bg-black min-h-screen text-white">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10 flex-wrap gap-6">

        <h1 className="text-4xl font-bold">Real Value Board</h1>

        <div className="flex items-center gap-3">
          <label className="text-gray-400">Unit Size</label>

          <input
            type="number"
            value={unitSize}
            onChange={(e) => setUnitSize(Number(e.target.value))}
            className="bg-[#1a1a1a] border border-gray-700 px-3 py-1 rounded w-24"
          />
        </div>

        {/* LEAGUES */}

        <div className="space-x-3">
          {leaguesToday.map(league => (
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

      {/* GAME LIST */}

      <div className="space-y-6">

        {filteredGames.map((game, index) => {

          const localTime = new Date(game.gameTime).toLocaleString();

          const homeReal = realProbs[`${index}-home`];
          const awayReal = realProbs[`${index}-away`];

          const homeEdge = calculateEdge(homeReal, game.homeNoVig);
          const awayEdge = calculateEdge(awayReal, game.awayNoVig);

          const homeBet = calculateBet(homeReal, game.homeNoVig);
          const awayBet = calculateBet(awayReal, game.awayNoVig);

          return (
            <div
              key={index}
              className="border border-gray-800 p-6 rounded-2xl bg-[#1b1b1b]"
            >

              {/* GAME HEADER */}

              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {game.awayTeam} @ {game.homeTeam}
                </h2>

                <p className="text-gray-400">{localTime}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">

                {/* HOME */}

                <div>

                  <div className="flex items-center gap-3 mb-2">
                    <img src={getLogo(game.homeTeam)} className="w-8 h-8" />
                    <p className="text-lg font-medium">{game.homeTeam}</p>
                  </div>

                  <p className="text-gray-400">
                    Market: {(game.homeNoVig * 100).toFixed(0)}%
                  </p>

                  <p className="text-green-400">
                    Target: {(game.homeTarget * 100).toFixed(0)}%
                  </p>

                  <input
                    type="number"
                    placeholder="REAL %"
                    className="mt-2 bg-black border border-gray-700 px-2 py-1 rounded w-24"
                    onChange={(e) =>
                      setRealProbs({
                        ...realProbs,
                        [`${index}-home`]:
                          Number(e.target.value) / 100
                      })
                    }
                  />

                  <p className={`mt-2 font-semibold ${getEdgeColor(homeEdge)}`}>
                    Edge: {homeEdge.toFixed(1)}%
                  </p>

                  <p className="text-yellow-400 font-bold">
                    Bet: ${homeBet}
                    {homeEdge >= 6 && " 🔥"}
                  </p>

                </div>

                {/* AWAY */}

                <div>

                  <div className="flex items-center gap-3 mb-2">
                    <img src={getLogo(game.awayTeam)} className="w-8 h-8" />
                    <p className="text-lg font-medium">{game.awayTeam}</p>
                  </div>

                  <p className="text-gray-400">
                    Market: {(game.awayNoVig * 100).toFixed(0)}%
                  </p>

                  <p className="text-green-400">
                    Target: {(game.awayTarget * 100).toFixed(0)}%
                  </p>

                  <input
                    type="number"
                    placeholder="REAL %"
                    className="mt-2 bg-black border border-gray-700 px-2 py-1 rounded w-24"
                    onChange={(e) =>
                      setRealProbs({
                        ...realProbs,
                        [`${index}-away`]:
                          Number(e.target.value) / 100
                      })
                    }
                  />

                  <p className={`mt-2 font-semibold ${getEdgeColor(awayEdge)}`}>
                    Edge: {awayEdge.toFixed(1)}%
                  </p>

                  <p className="text-yellow-400 font-bold">
                    Bet: ${awayBet}
                    {awayEdge >= 6 && " 🔥"}
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