"use client"

import { useEffect, useState } from "react"

type Player = {
  playerName: string
  team: string
  avgFP: number
  maxFP: number
  spikeRate: number
  volatilityScore: number
  floorScore: number
}

export default function StatsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedSport, setSelectedSport] = useState("NBA")
  const [activeTab, setActiveTab] = useState<"volatility" | "floor">("volatility")

  const sports = ["NBA"]

  useEffect(() => {
    setLoading(true)

    fetch(`/api/volatility/${selectedSport.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlayers(data)
        } else {
          setPlayers([])
        }
        setLoading(false)
      })
      .catch(() => {
        setPlayers([])
        setLoading(false)
      })

  }, [selectedSport])

  const filteredPlayers = players.filter(player =>
    player.playerName.toLowerCase().includes(search.toLowerCase())
  )

  const volatilitySorted = [...filteredPlayers].sort(
    (a, b) => b.volatilityScore - a.volatilityScore
  )

  const floorSorted = [...filteredPlayers].sort(
    (a, b) => b.floorScore - a.floorScore
  )

  const displayedPlayers =
    activeTab === "volatility" ? volatilitySorted : floorSorted

  const getVolColor = (score: number) => {
    if (score >= 9) return "text-red-400"
    if (score >= 7) return "text-orange-400"
    if (score >= 5) return "text-yellow-400"
    if (score >= 3) return "text-green-400"
    return "text-blue-400"

  const getIndicator = (p) => {

  if (p.volatilityScore >= 8) return "🔥"

  if (p.spikeRate >= 30) return "⚡"

  if (p.volatilityScore <= 3) return "🧊"

  return ""

   }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-[#E5E4BA] p-10">
        <h1 className="text-3xl font-bold">Loading Players...</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-[#E5E4BA] px-8 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Lineup Targets
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
              Based on Last 10 Games
            </p>
          </div>

          {/* Sport Dropdown */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-700 px-4 py-2 rounded-lg"
          >
            {sports.map(sport => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("volatility")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "volatility"
                ? "bg-white text-black"
                : "bg-[#1a1a1a] text-gray-400 hover:text-white"
            }`}
          >
            Boom Targets
          </button>

          <button
            onClick={() => setActiveTab("floor")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "floor"
                ? "bg-white text-black"
                : "bg-[#1a1a1a] text-gray-400 hover:text-white"
            }`}
          >
            Safe Targets
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 mb-6 rounded-lg bg-[#1a1a1a] border border-gray-700 w-72"
        />

        {/* Table */}
        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-6 bg-[#111] px-6 py-4 font-semibold text-gray-400 text-sm">
            <span>Player</span>
            <span>Team</span>
            <span>Avg FP</span>
            <span>Max FP</span>
            <span>Spike %</span>
            <span>
              {activeTab === "volatility" ? "Score" : "Floor"}
            </span>
          </div>

          {displayedPlayers.map((player, index) => (
            <div
              key={index}
              className="grid grid-cols-6 px-6 py-4 border-t border-gray-800 hover:bg-[#141414] transition-all duration-150"
	      className="border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
	      
            >
              <span>{player.playerName}</span>
              <span className="text-gray-400">{player.team}</span>
              <span>{player.avgFP}</span>
              <span>{player.maxFP}</span>
              <span>{player.spikeRate}%</span>

              {activeTab === "volatility" ? (
                <span className={`font-bold ${getVolColor(player.volatilityScore)}`}>
                  {player.volatilityScore}
                </span>
              ) : (
                <span className="font-bold text-green-400">
                  {player.floorScore.toFixed(1)}
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}