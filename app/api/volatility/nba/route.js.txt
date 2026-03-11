export async function GET() {

  try {

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    const today = new Date().toISOString().split("T")[0]

    // ----------------------
    // GET TODAY'S GAMES
    // ----------------------

    const gamesRes = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      { headers }
    )

    const gamesData = await gamesRes.json()

    if (!gamesData.response) return Response.json([])

    let players = []

    // ----------------------
    // GET PLAYER STATS FOR EACH GAME
    // ----------------------

    for (const game of gamesData.response) {

      const gameId = game.id

      const statsRes = await fetch(
        `https://v2.nba.api-sports.io/games/statistics/players?id=${gameId}`,
        { headers }
      )

      const statsData = await statsRes.json()

      if (!statsData.response) continue

      statsData.response.forEach(p => {

        const pts = p.points || 0
        const reb = p.totReb || 0
        const ast = p.assists || 0
        const min = p.minutes ? parseInt(p.minutes) : 0

        if (min < 10) return

        const production = pts + reb + ast

        const volatility =
          production === 0
            ? 0
            : Math.min(10, Math.round((pts * 2 + ast + reb) / production))

        players.push({

          playerName: p.player.name,

          team: p.team.code,

          avgFP: Number(production.toFixed(1)),

          maxFP: Number((pts * 1.8).toFixed(1)),

          spikeRate: Math.round((pts / production) * 100),

          volatilityScore: volatility,

          floorScore: Number((production * 0.75).toFixed(1))

        })

      })

    }

    players.sort((a,b)=>b.volatilityScore-a.volatilityScore)

    return Response.json(players)

  } catch (error) {

    console.error("VOL ERROR:", error)

    return Response.json([])

  }

}