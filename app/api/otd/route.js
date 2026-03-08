import fs from "fs"
import path from "path"

const positionBoosts = {
  MLB: {
    batter: 1.5,
    pitcher: 2,
    relief: 4,
       },
  NBA: {
    nba: 1,
       },
 WNBA: {
    wnba: 2,
       },
  NFL: {
    nflo: 5,
    nfld: 7,
       },
  CFB: {
    cfbo: 4,
    cfbd: 7,
       },
  CBB: {
    cbb: 2,
       },
  NHL: {
    nhl: 1.2,
       },
 GOLF: {
    golf: 3
  }
}

const cardLevelBoosts = {
  common: 2,
  uncommon: 3,
  rare: 4,
  epic: 10,
  legendary: 25,
  mystic: 75,
  iconic: 150
}

export async function GET(request) {
  try {
    // ✅ Get year from query param
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || "24-25"

    const filePath = path.join(
      process.cwd(),
      "on-this-day",
      `${year}.csv`
    )

    // ✅ Check if file exists
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { error: `CSV for ${year} not found` },
        { status: 404 }
      )
    }

    const fileContents = fs.readFileSync(filePath, "utf-8")

    const lines = fileContents.trim().split("\n")
    lines.shift() // remove header row

    const players = lines.map(line => {
      const cols = line.split(",")

      const playerName = cols[0]
      const sport = cols[1]
      const position = cols[2].toLowerCase()
      const realRating = Number(cols[3])

      const positionBoost =
        positionBoosts[sport]?.[position] || 1

      const cardScores = {}

      Object.entries(cardLevelBoosts).forEach(
        ([level, multiplier]) => {
          cardScores[level] =
            realRating *
            positionBoost *
            multiplier
        }
      )

      return {
        playerName,
        sport,
        position,
        realRating,
        positionBoost,
        cardScores
      }
    })

    // ✅ Sort by highest Iconic score
    players.sort(
      (a, b) => b.cardScores.iconic - a.cardScores.iconic
    )

    return Response.json(players)

  } catch (error) {
    console.error("OTD ERROR:", error)
    return Response.json(
      { error: "Failed to load OTD data" },
      { status: 500 }
    )
  }
}