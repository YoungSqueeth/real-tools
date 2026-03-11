export async function GET() {

  const res = await fetch(
    "https://v1.basketball.api-sports.io/games?date=2026-03-01",
    {
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY
      }
    }
  )

  const data = await res.json()

  return Response.json(data)
}