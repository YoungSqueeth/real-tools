import fs from "fs"

export async function updateNBA() {

  const response = await fetch(
    "https://v2.nba.api-sports.io/players/statistics?season=2026",
    {
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY
      }
    }
  )

  const data = await response.json()

  const players = data.response

  const results = players.map(p => {

    const games = p.games

    const avg = p.points / games

    return {
      playerName: p.player.firstname + " " + p.player.lastname,
      team: p.team.code,
      avgFP: avg,
      volatilityScore: Math.random() * 10
    }

  })

  fs.writeFileSync(
    "./data/nba-volatility.json",
    JSON.stringify(results)
  )
}