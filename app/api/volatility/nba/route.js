export async function GET() {

  try {

    const today = new Date().toISOString().split("T")[0]

    const gamesRes = await fetch(
      `https://api.balldontlie.io/v1/games?dates[]=${today}`
    )

    const gamesData = await gamesRes.json()

    const gameIds = gamesData.data.map(g => g.id)

    let players = []

    for (const gameId of gameIds) {

      const statsRes = await fetch(
        `https://api.balldontlie.io/v1/stats?game_ids[]=${gameId}`
      )

      const statsData = await statsRes.json()

      statsData.data.forEach(p => {

        const pts = p.pts || 0
        const reb = p.reb || 0
        const ast = p.ast || 0
        const min = p.min ? parseInt(p.min) : 0

        if (min < 15) return

        const production = pts + reb + ast

        const volatility =
          production === 0
            ? 0
            : Math.min(10, Math.round((pts * 2 + ast + reb) / production))

        players.push({

          playerName: p.player.first_name + " " + p.player.last_name,
          team: p.team.abbreviation,
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

    console.error(error)

    return Response.json([])

  }

}