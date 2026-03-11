import fs from "fs"
import path from "path"

export async function GET() {

  try {

    const today = new Date().toISOString().split("T")[0]
    const cachePath = path.join(process.cwd(),"data","nba-volatility.json")

    if (fs.existsSync(cachePath)) {

      const cache = JSON.parse(fs.readFileSync(cachePath,"utf8"))

      if (cache.date === today) {
        return Response.json(cache.players)
      }

    }

    const headers = {
      "x-apisports-key": process.env.API_SPORTS_KEY
    }

    // GET TODAY GAMES

    const gamesRes = await fetch(
      `https://v2.nba.api-sports.io/games?date=${today}`,
      { headers }
    )

    const games = await gamesRes.json()

    const teams = new Set()

    games.response.forEach(g=>{
      teams.add(g.teams.home.id)
      teams.add(g.teams.visitors.id)
    })

    let players = []

    for (const team of teams){

      const rosterRes = await fetch(
        `https://v2.nba.api-sports.io/players?team=${team}&season=2025`,
        { headers }
      )

      const roster = await rosterRes.json()

      if (!roster.response) continue

      roster.response.forEach(p=>{

        const avg = p.statistics?.[0]?.points || 0
        const max = p.statistics?.[0]?.points || 0

        if (avg < 5) return

        const volatility = max === 0 ? 0 : (max - avg) / avg

        const score = Math.min(10, Math.round(volatility * 10))

        players.push({
          playerName: p.firstname + " " + p.lastname,
          team: p.team.code,
          avgFP: avg,
          maxFP: max,
          spikeRate: Math.round(volatility * 100),
          volatilityScore: score,
          floorScore: avg
        })

      })

    }

    players.sort((a,b)=>b.volatilityScore-a.volatilityScore)

    fs.mkdirSync(path.join(process.cwd(),"data"),{recursive:true})

    fs.writeFileSync(
      cachePath,
      JSON.stringify({date:today,players})
    )

    return Response.json(players)

  } catch(err){

    console.error(err)

    return Response.json([])

  }

}