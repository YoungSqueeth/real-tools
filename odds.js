function americanToImplied(odds) {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

function devig(probA, probB) {
  const total = probA + probB;
  return [probA / total, probB / total];
}

export async function getNBAandNHLOdds() {
  const API_KEY = process.env.ODDS_API_KEY;

  const leagues = [
    { key: "basketball_nba", name: "NBA" },
    { key: "icehockey_nhl", name: "NHL" },
    { key: "baseball_mlb", name: "MLB" },
    { key: "americanfootball_nfl", name: "NFL" }
  ];

  let processedGames = [];

  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  for (const league of leagues) {
    const url =
      `https://api.the-odds-api.com/v4/sports/${league.key}/odds` +
      `?regions=us&markets=h2h&oddsFormat=american&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data) continue;

    data.forEach(game => {
      const home = game.home_team;
      const away = game.away_team;

      let homeProbs = [];
      let awayProbs = [];

      game.bookmakers.forEach(book => {
        const market = book.markets.find(m => m.key === "h2h");
        if (!market) return;

        const homeOutcome = market.outcomes.find(o => o.name === home);
        const awayOutcome = market.outcomes.find(o => o.name === away);

        if (!homeOutcome || !awayOutcome) return;

        const homeImp = americanToImplied(homeOutcome.price);
        const awayImp = americanToImplied(awayOutcome.price);

        const [homeNoVig, awayNoVig] = devig(homeImp, awayImp);

        homeProbs.push(homeNoVig);
        awayProbs.push(awayNoVig);
      });

      if (homeProbs.length === 0) return;

      const avgHome =
        homeProbs.reduce((a, b) => a + b, 0) / homeProbs.length;
      const avgAway =
        awayProbs.reduce((a, b) => a + b, 0) / awayProbs.length;

      processedGames.push({
        league: league.name,
	gameTime: game.commence_time,
        homeTeam: home,
        awayTeam: away,
        homeNoVig: avgHome,
        awayNoVig: avgAway,
        homeTarget: avgHome - 0.05,
        awayTarget: avgAway - 0.05
      });
    });
  }

  return processedGames;
}
