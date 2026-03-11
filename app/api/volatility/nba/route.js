export async function GET() {

  try {

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    const today = new Date().toISOString().split("T")[0]

    // -------------------------
    // GET TODAY GAMES
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
    // GET PLAYERS FROM TEAMS
    // -------------------------

    let players = []

    for (const team of teamsPlaying) {

      const rosterRes = await fetch(
        `https://v2.nba.api-sports.io/players?team=${team}&season=2025`,
        { headers }
      )

      const roster = await rosterRes.json()

      if (!roster.response) continue

      roster.response.forEach(p => {

        const stats = p.statistics?.[0]

        if (!stats) return

        const pts = stats.points || 0
        const reb = stats.totReb || 0
        const ast = stats.assists || 0
        const min = stats.min || 0

        const production = pts + reb + ast

        if (production < 8) return

        const volatility =
          production === 0 ? 0 :
          Math.min(10, Math.round((pts * 2 + ast + reb) / production))

        const spikeRate = Math.round((pts / production) * 100)

        players.push({

          playerName: p.firstname + " " + p.lastname,
          team: p.team.code,

          avgFP: Number(production.toFixed(1)),

          maxFP: Number((pts * 1.8).toFixed(1)),

          spikeRate: spikeRate,

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