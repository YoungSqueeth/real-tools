export async function GET() {

  try {

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    const today = new Date().toISOString().split("T")[0]

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

    return Response.json({
      teamsPlaying: [...teamsPlaying]
    })

  } catch (error) {

    return Response.json({
      error: error.message
    })

  }

}