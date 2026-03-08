export async function GET() {
  try {

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://www.nba.com/",
      "Origin": "https://www.nba.com",
      "Accept": "application/json, text/plain, */*"
    }

    const today = new Date()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    const yyyy = today.getFullYear()
    const formattedDate = `${mm}/${dd}/${yyyy}`

    // ---------------------------
    // GET TODAY'S GAMES
    // ---------------------------

    const scoreboardRes = await fetch(
      `https://stats.nba.com/stats/scoreboardv2?GameDate=${formattedDate}&LeagueID=00&DayOffset=0`,
      { headers }
    )

    if (!scoreboardRes.ok) {
      console.error("Scoreboard fetch failed")
      return Response.json([])
    }

    const scoreboardData = await scoreboardRes.json()

    const gameHeader = scoreboardData?.resultSets?.find(
      set => set.name === "GameHeader"
    )

    if (!gameHeader || gameHeader.rowSet.length === 0) {
      return Response.json([])
    }

    const teamsPlaying = new Set()

    gameHeader.rowSet.forEach(game => {
      teamsPlaying.add(game[6])
      teamsPlaying.add(game[7])
    })

    // ---------------------------
    // GET PLAYER GAME LOGS
    // ---------------------------

    const response = await fetch(
      "https://stats.nba.com/stats/leaguegamelog?Season=2025-26&SeasonType=Regular+Season&PlayerOrTeam=P",
      { headers }
    )

    if (!response.ok) {
      console.error("Game log fetch failed")
      return Response.json([])
    }

    const data = await response.json()

    const headersRow = data?.resultSets?.[0]?.headers
    const rows = data?.resultSets?.[0]?.rowSet

    if (!headersRow || !rows) {
      return Response.json([])
    }

    const games = rows.map(row => {
      const obj = {}
      headersRow.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })

    const playerMap = {}

    games.forEach(game => {

      if (!teamsPlaying.has(game.TEAM_ID)) return

      const id = game.PLAYER_ID

      if (!playerMap[id]) {
        playerMap[id] = {
          playerName: game.PLAYER_NAME,
          team: game.TEAM_ABBREVIATION,
          games: []
        }
      }

      playerMap[id].games.push(game)

    })

    const players = []

    Object.values(playerMap).forEach(player => {

      const sorted = player.games.sort(
        (a, b) => new Date(b.GAME_DATE) - new Date(a.GAME_DATE)
      )

      const last10 = sorted.slice(0, 10)

      if (last10.length < 5) return

      const fpArray = last10.map(g =>
        g.PTS +
        1.25 * g.REB +
        1.5 * g.AST +
        2 * g.STL +
        2 * g.BLK +
        0.5 * g.FG3M -
        g.TOV
      )

      const minutesAvg =
        last10.reduce((sum, g) => sum + g.MIN, 0) / last10.length

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

    players.sort(
      (a, b) => b.volatilityScore - a.volatilityScore
    )

    return Response.json(players)

  } catch (error) {

    console.error("VOL ERROR:", error)

    return Response.json([])

  }
}