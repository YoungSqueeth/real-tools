import fs from "fs"
import path from "path"

export async function GET() {

  try {

    const cachePath = path.join(process.cwd(), "data", "nba-volatility.json")
    const today = new Date().toISOString().split("T")[0]

    // -------------------------
    // RETURN CACHE IF SAME DAY
    // -------------------------

    if (fs.existsSync(cachePath)) {

      const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"))

      if (cache.date === today) {
        return Response.json(cache.players)
      }

    }

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    // -------------------------
    // GET TODAY'S GAMES
    // -------------------------

    const gamesRes = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      { headers }
    )

    if (!gamesRes.ok) {
      console.error("Game fetch failed")
      return Response.json([])
    }

    const gamesData = await gamesRes.json()

    if (!gamesData.response || gamesData.response.length === 0) {
      return Response.json([])
    }

    const teamsPlaying = new Set()

    gamesData.response.forEach(game => {
      teamsPlaying.add(game.teams.home.id)
      teamsPlaying.add(game.teams.visitors.id)
    })

    // -------------------------
    // GET PLAYER GAME STATS
    // -------------------------

    let allStats = []

    for (const teamId of teamsPlaying) {

      const statsRes = await fetch(
        `https://v2.nba.api-sports.io/players/statistics?team=${teamId}&season=2025`,
        { headers }
      )

      if (!statsRes.ok) continue

      const statsData = await statsRes.json()

      if (statsData.response) {
        allStats = allStats.concat(statsData.response)
      }

    }

    const playerMap = {}

    allStats.forEach(game => {

      const id = game.player.id

      if (!playerMap[id]) {

        playerMap[id] = {
          playerName:
            game.player.firstname + " " + game.player.lastname,
          team: game.team.code,
          games: []
        }

      }

      playerMap[id].games.push(game)

    })

    const players = []

    Object.values(playerMap).forEach(player => {

      const sorted = player.games.sort(
        (a, b) => new Date(b.game.date) - new Date(a.game.date)
      )

      const last10 = sorted.slice(0, 10)

      if (last10.length < 5) return

      const fpArray = last10.map(g =>
        g.points +
        1.25 * g.totReb +
        1.5 * g.assists +
        2 * g.steals +
        2 * g.blocks +
        0.5 * g.tpm -
        g.turnovers
      )

      const minutesAvg =
        last10.reduce((sum, g) => sum + Number(g.min || 0), 0) /
        last10.length

      if (minutesAvg < 20) return

      const mean =
        fpArray.reduce((a, b) => a + b, 0) / fpArray.length

      const variance =
        fpArray.reduce((sum, val) =>
          sum + Math.pow(val - mean, 2), 0) / fpArray.length

      const std = Math.sqrt(variance)

      const cv = mean !== 0 ? std / mean : 0

      const maxFP = Math.max(...fpArray)

      const spikeThreshold = mean * 1.8

      const spikeGames =
        fpArray.filter(fp => fp >= spikeThreshold).length

      const spikeRate = spikeGames / fpArray.length

      players.push({
        playerName: player.playerName,
        team: player.team,
        avgFP: Number(mean.toFixed(2)),
        maxFP: Number(maxFP.toFixed(2)),
        spikeRate: Number((spikeRate * 100).toFixed(1)),
        cv
      })

    })

    if (players.length === 0) {
      return Response.json([])
    }

    const minCV = Math.min(...players.map(p => p.cv))
    const maxCV = Math.max(...players.map(p => p.cv))

    players.forEach(p => {

      const score =
        maxCV === minCV
          ? 5
          : 1 + 9 * ((p.cv - minCV) / (maxCV - minCV))

      p.volatilityScore = Math.round(score)

      p.floorScore = Number(p.avgFP.toFixed(1))

    })

    players.sort((a, b) => b.volatilityScore - a.volatilityScore)

    // -------------------------
    // SAVE CACHE
    // -------------------------

    fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true })

    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        date: today,
        players
      })
    )

    return Response.json(players)

  } catch (error) {

    console.error("VOL ERROR:", error)

    return Response.json([])

  }

}