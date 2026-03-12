"use client"

import { useEffect, useState } from "react"

type Player = {
  playerName: string
  sport: string
  realRating: number
  overallRank?: number
  sportRank?: number
  cardScores: {
    common: number
    uncommon: number
    rare: number
    epic: number
    legendary: number
    mystic: number
    iconic: number
  }
}

export default function OTDValuePage() {

  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState("")
  const [selectedSport, setSelectedSport] = useState("ALL")
  const [selectedYear, setSelectedYear] = useState("24-25")
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/otd?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => setPlayers(data))
  }, [selectedYear])

  const overallRanked = [...players]
    .sort((a, b) => b.cardScores.iconic - a.cardScores.iconic)
    .map((player, index) => ({
      ...player,
      overallRank: index + 1
    }))

  const sportRankMap: Record<string, Player[]> = {}

  players.forEach(player => {
    if (!sportRankMap[player.sport]) {
      sportRankMap[player.sport] = []
    }
    sportRankMap[player.sport].push(player)
  })

  Object.keys(sportRankMap).forEach(sport => {
    sportRankMap[sport] = sportRankMap[sport]
      .sort((a, b) => b.cardScores.iconic - a.cardScores.iconic)
      .map((player, index) => ({
        ...player,
        sportRank: index + 1
      }))
  })

  const fullyRanked = overallRanked.map(player => {
    const sportList = sportRankMap[player.sport]
    const sportVersion = sportList.find(
      p => p.playerName === player.playerName
    )

    return {
      ...player,
      sportRank: sportVersion?.sportRank
    }
  })

  const filteredPlayers = fullyRanked.filter(player => {
    const matchesSearch =
      player.playerName.toLowerCase().includes(search.toLowerCase())

    const matchesSport =
      selectedSport === "ALL" || player.sport === selectedSport

    return matchesSearch && matchesSport
  })

  const sportOrder = ["ALL","MLB","NFL","CFB","NBA","CBB","WNBA","NHL","GOLF"]
  const availableSports = Array.from(new Set(players.map(p => p.sport)))

  const sports = sportOrder.filter(
    sport => sport === "ALL" || availableSports.includes(sport)
  )

  return (

    <main style={styles.main}>

      <style jsx>{`
        .hover-row:hover {
          background-color: #111827;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
      `}</style>

      <div style={styles.container}>

        <h1 style={styles.title}>On This Day Chart</h1>

        {/* YEAR SELECT */}

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={styles.dropdown}
        >
          <option value="25-26">25-26</option>
          <option value="24-25">24-25</option>
          <option value="23-24">23-24</option>
        </select>

        {/* CONTROLS */}

        <div style={styles.controls}>

          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.search}
          />

          {/* SPORT TABS */}

          <div style={styles.tabs}>
            {sports.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                style={{
                  ...styles.tab,
                  backgroundColor:
                    selectedSport === sport ? "#38bdf8" : "#1e293b"
                }}
              >
                {sport}
              </button>
            ))}
          </div>

        </div>

        {/* TABLE */}

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>
              <tr style={styles.headerRow}>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th style={styles.commonHeader}>Common</th>
                <th style={styles.uncommonHeader}>Uncommon</th>
                <th style={styles.rareHeader}>Rare</th>
                <th style={styles.epicHeader}>Epic</th>
                <th style={styles.legendaryHeader}>Legendary</th>
                <th style={styles.mysticHeader}>Mystic</th>
                <th style={styles.iconicHeader}>Iconic</th>
              </tr>
            </thead>

            <tbody>

              {filteredPlayers.map((p, i) => (

                <tr
                  key={i}
                  onClick={() =>
                    setSelectedPlayer(
                      selectedPlayer === p.playerName ? null : p.playerName
                    )
                  }
                  style={{
                    ...styles.row,
                    backgroundColor:
                      selectedPlayer === p.playerName
                        ? "#1f2937"
                        : undefined,
                    borderLeft:
                      selectedPlayer === p.playerName
                        ? "4px solid #38bdf8"
                        : "4px solid transparent"
                  }}
                  className="hover-row"
                >

                  <td style={styles.rank}>
                    {selectedSport === "ALL"
                      ? `${p.overallRank}`
                      : `${p.sportRank}`}
                  </td>

                  <td>{p.playerName}</td>
                  <td>{Math.round(p.realRating)}</td>

                  <td style={styles.common}>{Math.round(p.cardScores.common)}</td>
                  <td style={styles.uncommon}>{Math.round(p.cardScores.uncommon)}</td>
                  <td style={styles.rare}>{Math.round(p.cardScores.rare)}</td>
                  <td style={styles.epic}>{Math.round(p.cardScores.epic)}</td>
                  <td style={styles.legendary}>{Math.round(p.cardScores.legendary)}</td>
                  <td style={styles.mystic}>{Math.round(p.cardScores.mystic)}</td>
                  <td style={styles.iconic}>{Math.round(p.cardScores.iconic)}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>

  )

}

const styles = {

  main: {
    minHeight: "100vh",
    background: "black",
    color: "#E5E4BA",
    padding: "20px 0",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 clamp(16px,4vw,40px)",
  },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
    marginBottom: "20px",
  },

  controls: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px"
  },

  search: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "white",
    width: "100%",
    maxWidth: "300px"
  },

  tabs: {
    display: "flex",
    gap: "10px",
    overflowX: "auto" as const,
    paddingBottom: "5px"
  },

  tab: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    cursor: "pointer",
    whiteSpace: "nowrap" as const
  },

  tableWrapper: {
    border: "1px solid #334155",
    borderRadius: "6px",
    overflowX: "auto" as const
  },

  table: {
    width: "100%",
    minWidth: "750px",
    borderCollapse: "collapse" as const,
  },

  headerRow: {
    backgroundColor: "#1e293b",
    fontWeight: 700,
    textAlign: "left" as const,
  },

  row: {
    borderTop: "1px solid #334155",
  },

  rank: {
    fontWeight: 800,
    color: "#d4d4d4",
  },

  dropdown: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "white",
    marginBottom: "15px",
    width: "150px"
  },

  commonHeader: { color: "#3b82f6" },
  uncommonHeader: { color: "#22c55e" },
  rareHeader: { color: "#f59e0b" },
  epicHeader: { color: "#ef4444" },
  legendaryHeader: { color: "#a855f7" },
  mysticHeader: { color: "#facc15" },
  iconicHeader: { color: "#f4a8ff" },

  common: { color: "#3b82f6" },
  uncommon: { color: "#22c55e", fontWeight: 600 },
  rare: { color: "#f59e0b", fontWeight: 600 },
  epic: { color: "#ef4444", fontWeight: 600 },
  legendary: { color: "#a855f7", fontWeight: 700 },
  mystic: { color: "#facc15", fontWeight: 700 },
  iconic: { color: "#f4a8ff", fontWeight: 800 },

}