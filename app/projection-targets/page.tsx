"use client";

import { useEffect, useState } from "react";

type Game = {
  league: string;
  gameTime: string;
  homeTeam: string;
  awayTeam: string;
  homeNoVig: number;
  awayNoVig: number;
  homeTarget: number;
  awayTarget: number;
};

/* ---------------------------
TEAM LOGO MAPS
--------------------------- */

const NHL_LOGOS: Record<string,string> = {
"Anaheim Ducks":"ana","Boston Bruins":"bos","Buffalo Sabres":"buf",
"Calgary Flames":"cgy","Carolina Hurricanes":"car","Chicago Blackhawks":"chi",
"Colorado Avalanche":"col","Columbus Blue Jackets":"cbj","Dallas Stars":"dal",
"Detroit Red Wings":"det","Edmonton Oilers":"edm","Florida Panthers":"fla",
"Los Angeles Kings":"la","Minnesota Wild":"min","Montreal Canadiens":"mtl",
"Nashville Predators":"nsh","New Jersey Devils":"nj","New York Islanders":"nyi",
"New York Rangers":"nyr","Ottawa Senators":"ott","Philadelphia Flyers":"phi",
"Pittsburgh Penguins":"pit","San Jose Sharks":"sj","Seattle Kraken":"sea",
"St Louis Blues":"stl","Tampa Bay Lightning":"tb","Toronto Maple Leafs":"tor",
"Vancouver Canucks":"van","Vegas Golden Knights":"vgk","Washington Capitals":"wsh",
"Winnipeg Jets":"wpg"
};

const NBA_LOGOS: Record<string,string> = {
"Atlanta Hawks":"atl","Boston Celtics":"bos","Brooklyn Nets":"bkn",
"Charlotte Hornets":"cha","Chicago Bulls":"chi","Cleveland Cavaliers":"cle",
"Dallas Mavericks":"dal","Denver Nuggets":"den","Detroit Pistons":"det",
"Golden State Warriors":"gs","Houston Rockets":"hou","Indiana Pacers":"ind",
"LA Clippers":"lac","Los Angeles Lakers":"lal","Memphis Grizzlies":"mem",
"Miami Heat":"mia","Milwaukee Bucks":"mil","Minnesota Timberwolves":"min",
"New Orleans Pelicans":"no","New York Knicks":"ny","Oklahoma City Thunder":"okc",
"Orlando Magic":"orl","Philadelphia 76ers":"phi","Phoenix Suns":"phx",
"Portland Trail Blazers":"por","Sacramento Kings":"sac","San Antonio Spurs":"sa",
"Toronto Raptors":"tor","Utah Jazz":"uta","Washington Wizards":"wsh"
};

const MLB_LOGOS: Record<string,string> = {
"Arizona Diamondbacks":"ari","Atlanta Braves":"atl","Baltimore Orioles":"bal",
"Boston Red Sox":"bos","Chicago Cubs":"chc","Chicago White Sox":"chw",
"Cincinnati Reds":"cin","Cleveland Guardians":"cle","Colorado Rockies":"col",
"Detroit Tigers":"det","Houston Astros":"hou","Kansas City Royals":"kc",
"Los Angeles Angels":"laa","Los Angeles Dodgers":"lad","Miami Marlins":"mia",
"Milwaukee Brewers":"mil","Minnesota Twins":"min","New York Mets":"nym",
"New York Yankees":"nyy","Oakland Athletics":"oak","Philadelphia Phillies":"phi",
"Pittsburgh Pirates":"pit","San Diego Padres":"sd","San Francisco Giants":"sf",
"Seattle Mariners":"sea","St Louis Cardinals":"stl","Tampa Bay Rays":"tb",
"Texas Rangers":"tex","Toronto Blue Jays":"tor","Washington Nationals":"wsh"
};

function getLogo(team:string, league:string){
 if(league==="NHL"){
  const code=NHL_LOGOS[team];
  if(code) return `https://a.espncdn.com/i/teamlogos/nhl/500/${code}.png`
 }

 if(league==="NBA"){
  const code=NBA_LOGOS[team];
  if(code) return `https://a.espncdn.com/i/teamlogos/nba/500/${code}.png`
 }

 if(league==="MLB"){
  const code=MLB_LOGOS[team];
  if(code) return `https://a.espncdn.com/i/teamlogos/mlb/500/${code}.png`
 }

 return ""
}

export default function Home() {

const [games,setGames]=useState<Game[]>([])
const [loading,setLoading]=useState(true)
const [selectedLeague,setSelectedLeague]=useState("ALL")
const [unitSize,setUnitSize]=useState(100)
const [realProbs,setRealProbs]=useState<Record<string,number>>({})

useEffect(()=>{

fetch("/api/odds")
.then(res=>res.json())
.then(data=>{
const sorted=data.sort(
(a:Game,b:Game)=>new Date(a.gameTime).getTime()-new Date(b.gameTime).getTime()
)
setGames(sorted)
setLoading(false)
})

},[])

const leaguesToday=["ALL",...Array.from(new Set(games.map(g=>g.league)))]

const filteredGames=
selectedLeague==="ALL"?games:games.filter(g=>g.league===selectedLeague)

function calcEdge(real:number|undefined,market:number){
 if(!real) return 0
 return (market-real)*100
}

function calcBet(real:number|undefined,market:number){

 if(!real) return 0
 const edge=market-real
 if(edge<=0) return 0

 let mult=0

 if(edge<0.06) mult=1
 else if(edge<0.65) mult=1.25
 else if(edge<0.7) mult=1.5
 else if(edge<0.75) mult=1.75
 else if(edge<0.8) mult=2
 else if(edge<0.85) mult=2.25
 else if(edge<0.9) mult=2.5
 else if(edge<0.95) mult=2.75
 else mult=3

 return (unitSize*mult).toFixed(0)
}

function edgeColor(edge:number){
 if(edge>=6) return "text-green-400"
 if(edge>0) return "text-yellow-400"
 return "text-red-400"
}

if(loading){
return(
<main className="p-6 md:p-10 text-white bg-black min-h-screen">
<h1 className="text-2xl md:text-3xl font-bold">Loading Value Board...</h1>
</main>
)
}

return(

<main className="px-4 md:px-10 py-6 bg-black min-h-screen text-white">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

<h1 className="text-3xl md:text-4xl font-bold">Real Value Board</h1>

<div className="flex items-center gap-3">
<label className="text-gray-400">Unit Size</label>

<input
type="number"
value={unitSize}
onChange={(e)=>setUnitSize(Number(e.target.value))}
className="bg-[#1a1a1a] border border-gray-700 px-3 py-1 rounded w-24"
/>
</div>

<div className="flex gap-3 overflow-x-auto pb-2">

{leaguesToday.map(league=>(
<button
key={league}
onClick={()=>setSelectedLeague(league)}
className={`px-4 py-2 rounded-lg border whitespace-nowrap ${
selectedLeague===league
?"bg-white text-black"
:"border-gray-600 text-gray-300"
}`}
>
{league}
</button>
))}

</div>

</div>

<div className="space-y-6">

{filteredGames.map((game,index)=>{

const homeReal=realProbs[`${index}-home`]
const awayReal=realProbs[`${index}-away`]

const homeEdge=calcEdge(homeReal,game.homeNoVig)
const awayEdge=calcEdge(awayReal,game.awayNoVig)

const homeBet=calcBet(homeReal,game.homeNoVig)
const awayBet=calcBet(awayReal,game.awayNoVig)

const time=new Date(game.gameTime).toLocaleString()

return(

<div key={index} className="border border-gray-800 p-4 md:p-6 rounded-2xl bg-[#262626]">

<div className="flex flex-col md:flex-row md:justify-between gap-2 mb-6">

<h2 className="text-lg md:text-xl font-semibold">
{game.awayTeam} @ {game.homeTeam}
</h2>

<p className="text-gray-400 text-sm md:text-base">{time}</p>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

{/* HOME */}

<div>

<div className="flex items-center gap-3 mb-2">

{getLogo(game.homeTeam, game.league) && (
<img
src={getLogo(game.homeTeam, game.league)}
className="w-10 h-10 md:w-14 md:h-14"
alt=""
/>
)}

<p className="text-lg font-medium">{game.homeTeam}</p>

</div>

<p className="text-gray-400">Market {(game.homeNoVig*100).toFixed(0)}%</p>
<p className="text-green-400">Target {(game.homeTarget*100).toFixed(0)}%</p>

<input
type="number"
placeholder="REAL %"
className="mt-2 bg-black border border-gray-700 px-2 py-1 rounded w-24"
onChange={(e)=>setRealProbs({
...realProbs,
[`${index}-home`]:Number(e.target.value)/100
})}
/>

<p className={`mt-2 font-semibold ${edgeColor(homeEdge)}`}>
Edge {homeEdge.toFixed(1)}%
</p>

<p className="text-yellow-400 font-bold">
Bet ${homeBet} {homeEdge>=6 && "🔥"}
</p>

</div>

{/* AWAY */}

<div>

<div className="flex items-center gap-3 mb-2">

{getLogo(game.awayTeam, game.league) && (
<img
src={getLogo(game.awayTeam, game.league)}
className="w-10 h-10 md:w-14 md:h-14"
alt=""
/>
)}

<p className="text-lg font-medium">{game.awayTeam}</p>

</div>

<p className="text-gray-400">Market {(game.awayNoVig*100).toFixed(0)}%</p>
<p className="text-green-400">Target {(game.awayTarget*100).toFixed(0)}%</p>

<input
type="number"
placeholder="REAL %"
className="mt-2 bg-black border border-gray-700 px-2 py-1 rounded w-24"
onChange={(e)=>setRealProbs({
...realProbs,
[`${index}-away`]:Number(e.target.value)/100
})}
/>

<p className={`mt-2 font-semibold ${edgeColor(awayEdge)}`}>
Edge {awayEdge.toFixed(1)}%
</p>

<p className="text-yellow-400 font-bold">
Bet ${awayBet} {awayEdge>=6 && "🔥"}
</p>

</div>

</div>

</div>

)

})}

</div>

</main>

)

}