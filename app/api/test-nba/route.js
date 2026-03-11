export async function GET() {

  try {

    const today = new Date().toISOString().split("T")[0]

    const response = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      {
        headers: {
          "x-apisports-key": process.env.API_SPORTS_KEY
        }
      }
    )

    const data = await response.json()

    return Response.json({
      success: true,
      gamesReturned: data.response?.length || 0,
      sample: data.response?.slice(0, 2) || []
    })

  } catch (error) {

    return Response.json({
      success: false,
      error: error.message
    })

  }

}