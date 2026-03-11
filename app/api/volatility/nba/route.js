export async function GET() {

  try {

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    const today = new Date().toISOString().split("T")[0]

    // GET TODAY GAMES

    const gamesRes = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      { headers }
    )

    const gamesData = await gamesRes.json()

    const teamsPlaying = new Set()

    gamesData.response.forEach(game => {
      teamsPlaying.add(game.teams.home.id)
      teamsPlaying.add(game.teams.visitors.id)
    })

    let samplePlayers = []

    for (const teamId of teamsPlaying) {

      const rosterRes = await fetch(
        `https://v2.nba.api-sports.io/players?team=${teamId}&season=2025`,
        { headers }
      )

      const rosterData = await rosterRes.json()

      if (!rosterData.response) continue

      samplePlayers = samplePlayers.concat(rosterData.response.slice(0,3))

    }

    return Response.json({
      teams: [...teamsPlaying],
      samplePlayers
    })

  } catch (error) {

    return Response.json({
      error: error.message
    })

  }

}