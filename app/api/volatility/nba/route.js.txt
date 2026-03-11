export async function GET() {

  try {

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    const today = new Date().toISOString().split("T")[0]

    // -------------------------
    // GET TODAY'S GAMES
    // -------------------------

    const gamesRes = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      { headers }
    )

    const gamesData = await gamesRes.json()

    if (!gamesData.response) {
      return Response.json([])
    }

    const teamsPlaying = new Set()

    gamesData.response.forEach(game => {
      teamsPlaying.add(game.teams.home.id)
      teamsPlaying.add(game.teams.visitors.id)
    })

    // -------------------------
    // GET PLAYER STATISTICS
    // -------------------------

    const statsRes = await fetch(
      `https://v2.nba.api-sports.io/players/statistics?season=2025`,
      { headers }
    )

    const statsData = await statsRes.json()

    if (!statsData.response) {
      return Response.json([])
    }

    const players = []

    statsData.response.forEach(stat => {

      if (!teamsPlaying.has(stat.team.id)) return

      const pts = stat.points || 0
      const reb = stat.totReb || 0
      const ast = stat.assists || 0
      const min = stat.min || 0

      if (min < 15) return

      const production = pts + reb + ast

      if (production < 8) return

      const volatility =
        production === 0
          ? 0
          : Math.min(10, Math.round((pts * 2 + ast + reb) / production))

      players.push({

        playerName:
          stat.player.firstname + " " + stat.player.lastname,

        team: stat.team.code,

        avgFP: Number(production.toFixed(1)),

        maxFP: Number((pts * 1.8).toFixed(1)),

        spikeRate: Math.round((pts / production) * 100),

        volatilityScore: volatility,

        floorScore: Number((production * 0.75).toFixed(1))

      })

    })

    players.sort((a,b)=>b.volatilityScore-a.volatilityScore)

    return Response.json(players)

  } catch (error) {

    console.error("VOL ERROR:", error)

    return Response.json([])

  }

}