"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Home() {
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/odds")
      .then(res => res.json())
      .then(data => setGames(data))
  }, [])

  const groupedGames = games.reduce((acc: any, game: any) => {
    if (!acc[game.league]) acc[game.league] = []
    acc[game.league].push(game)
    return acc
  }, {})

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.title}>Real Tools Dashboard</h1>
          <p style={styles.subtitle}>
            Created by @Dart
          </p>
        </div>

        {/* Feature Cards */}
        <div style={styles.grid}>
          <Link href="/projection-targets" style={styles.card}>
            <h2>Projection Targets</h2>
            <p>Identify top value opportunities based on projected output vs pricing</p>
          </Link>

          <Link href="/stats" style={styles.card}>
            <h2>Lineup</h2>
            <p>Optimize daily lineups using high spike rate players</p>
          </Link>

          <Link href="/on-this-day" style={styles.card}>
            <h2>On This Day</h2>
            <p>Track historical Rax opportunities and performance</p>
          </Link>
        </div>

        {/* Today's Games Section */}
        <div style={styles.gamesSection}>
          <h2 style={styles.sectionTitle}>Today’s Games</h2>

          {Object.keys(groupedGames).map((league) => (
            <div key={league} style={styles.leagueBlock}>
              <h3 style={styles.leagueTitle}>{league}</h3>

              {groupedGames[league]
                .sort((a: any, b: any) => 
                  new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime()
                )
                .map((game: any, index: number) => (
                  <div key={index} style={styles.gameRow}>
  		    <span style={styles.matchup}>
    		      {game.awayTeam} vs {game.homeTeam}
  		  </span>

  		  <span style={styles.time}>
    		    {new Date(game.gameTime).toLocaleTimeString("en-US", {
      		      hour: "numeric",
          		minute: "2-digit",
    		    })}
  		  </span>
		</div>
                ))}
            </div>
          ))}
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
    fontFamily: "Inter, sans-serif",
    paddingBottom: "60px"
  },
  matchup: {
    fontWeight: 500,
    fontSize: "16px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px",
  },
  hero: {
    textAlign: "center" as const,
    marginBottom: "60px",
  },
  title: {
    fontSize: "48px",
    fontWeight: 700,
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "24px",
    color: "white",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "80px",
  },
  card: {
    backgroundColor: "#262626",
    padding: "30px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#E5E4BA",
    border: "1px solid #334155",
  },
  gamesSection: {
    marginTop: "40px",
  },
  sectionTitle: {
    fontSize: "28px",
    marginBottom: "30px",
  },
  leagueBlock: {
    marginBottom: "40px",
  },
  leagueTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "#94a3b8",
  },
  gameRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #334155",
    color: "#E3E3E3",
  },
}
