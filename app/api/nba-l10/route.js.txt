export async function GET() {
  try {
    const API_KEY = process.env.BALLDONTLIE_API_KEY
    const headers = {
      Authorization: `Bearer ${API_KEY}`
    }

    const season = 2024

    // 1️⃣ Get players (first 100 players for now to keep it simple)
    const playersRes = await fetch(
      `https://api.balldontlie.io/v1/players?per_page=100`,
      { headers }
    )

    const playersData = await playersRes.json()

    if (!playersData.data) {
      return Response.json([])
    }

    const playerIds = playersData.data.map(p => p.id)

    // 2️⃣ Get season averages for those players
    const averagesRes = await fetch(
      `https://api.balldontlie.io/v1/season_averages?season=${season}&player_ids[]=${playerIds.join("&player_ids[]=")}`,
      { headers }
    )

    const averagesData = await averagesRes.json()

    if (!averagesData.data) {
      return Response.json([])
    }

    // 3️⃣ Compute fantasy points
    const players = averagesData.data.map(player => {
      const fantasyPoints =
        player.pts +
        1.25 * player.reb +
        1.5 * player.ast +
        2 * player.stl +
        2 * player.blk +
        0.5 * player.fg3m

      return {
        playerName: player.player_id,
        pts: player.pts,
        reb: player.reb,
        ast: player.ast,
        stl: player.stl,
        blk: player.blk,
        threePM: player.fg3m,
        min: player.min,
        fantasyPoints: Number(fantasyPoints.toFixed(2))
      }
    })

    // 4️⃣ Sort
    players.sort((a, b) => b.fantasyPoints - a.fantasyPoints)

    const ranked = players.map((player, index) => ({
      rank: index + 1,
      ...player
    }))

    return Response.json(ranked)

  } catch (error) {
    console.error("SEASON ERROR:", error)
    return Response.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}