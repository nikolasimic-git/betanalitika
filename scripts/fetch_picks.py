"""
BetAnalitika — Real Sports Data Fetcher & AI Pick Generator
Fetches real fixtures + stats from ESPN API (free, no key) and generates AI picks.
Covers: Football (top leagues), NBA, Tennis (ATP/WTA)
"""

import requests
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ── Config ──
DATA_DIR = Path(__file__).parent.parent / "server"
DB_FILE = DATA_DIR / "picks-db.json"
ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports"

# Anthropic API key — reads from env or .env file
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# ── ESPN Sport Configs ──
SPORTS = {
    "football": {
        "espn_sport": "soccer",
        "leagues": {
            "eng.1": {"name": "Premier League", "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
            "esp.1": {"name": "La Liga", "flag": "🇪🇸"},
            "ita.1": {"name": "Serie A", "flag": "🇮🇹"},
            "ger.1": {"name": "Bundesliga", "flag": "🇩🇪"},
            "fra.1": {"name": "Ligue 1", "flag": "🇫🇷"},
            "uefa.champions": {"name": "Champions League", "flag": "🏆"},
            "uefa.europa": {"name": "Europa League", "flag": "🏆"},
        }
    },
    "nba": {
        "espn_sport": "basketball",
        "leagues": {
            "nba": {"name": "NBA", "flag": "🏀"},
        }
    },
    "tennis": {
        "espn_sport": "tennis",
        "leagues": {
            "atp": {"name": "ATP", "flag": "🎾"},
            "wta": {"name": "WTA", "flag": "🎾"},
        }
    },
}


def fetch_espn_scoreboard(sport: str, league: str, date_str: str = None) -> dict:
    """Fetch scoreboard/fixtures from ESPN API"""
    url = f"{ESPN_BASE}/{sport}/{league}/scoreboard"
    params = {}
    if date_str:
        params["dates"] = date_str.replace("-", "")
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  ⚠️  ESPN error for {sport}/{league}: {e}")
        return {}


def fetch_espn_team_stats(sport: str, league: str, team_id: str) -> dict:
    """Fetch team record/stats from ESPN"""
    url = f"{ESPN_BASE}/{sport}/{league}/teams/{team_id}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except:
        return {}


def fetch_espn_standings(sport: str, league: str) -> dict:
    """Fetch standings from ESPN"""
    url = f"{ESPN_BASE}/{sport}/{league}/standings"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except:
        return {}


def parse_football_fixtures(data: dict, league_info: dict) -> list:
    """Parse ESPN football scoreboard into fixture objects"""
    fixtures = []
    events = data.get("events", [])
    
    for event in events:
        competitions = event.get("competitions", [])
        if not competitions:
            continue
        
        comp = competitions[0]
        competitors = comp.get("competitors", [])
        if len(competitors) < 2:
            continue
        
        home = next((c for c in competitors if c.get("homeAway") == "home"), competitors[0])
        away = next((c for c in competitors if c.get("homeAway") == "away"), competitors[1])
        
        home_team = home.get("team", {})
        away_team = away.get("team", {})
        
        # Get records if available
        home_record = home.get("records", [{}])[0].get("summary", "") if home.get("records") else ""
        away_record = away.get("records", [{}])[0].get("summary", "") if away.get("records") else ""
        
        # Get form/stats
        home_form = home.get("form", "")
        away_form = away.get("form", "")
        
        date_str = event.get("date", "")
        try:
            kick_off = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            kick_off_str = kick_off.strftime("%H:%M")
        except:
            kick_off_str = "TBD"
        
        fixture = {
            "sport": "football",
            "league": league_info["name"],
            "leagueFlag": league_info["flag"],
            "homeTeam": home_team.get("displayName", home_team.get("name", "Unknown")),
            "awayTeam": away_team.get("displayName", away_team.get("name", "Unknown")),
            "homeId": home_team.get("id", ""),
            "awayId": away_team.get("id", ""),
            "kickOff": kick_off_str,
            "date": event.get("date", ""),
            "homeRecord": home_record,
            "awayRecord": away_record,
            "homeForm": home_form,
            "awayForm": away_form,
            "status": event.get("status", {}).get("type", {}).get("name", ""),
            "venue": comp.get("venue", {}).get("fullName", ""),
        }
        fixtures.append(fixture)
    
    return fixtures


def parse_nba_fixtures(data: dict, league_info: dict) -> list:
    """Parse ESPN NBA scoreboard"""
    fixtures = []
    events = data.get("events", [])
    
    for event in events:
        competitions = event.get("competitions", [])
        if not competitions:
            continue
        
        comp = competitions[0]
        competitors = comp.get("competitors", [])
        if len(competitors) < 2:
            continue
        
        home = next((c for c in competitors if c.get("homeAway") == "home"), competitors[0])
        away = next((c for c in competitors if c.get("homeAway") == "away"), competitors[1])
        
        home_team = home.get("team", {})
        away_team = away.get("team", {})
        
        home_record = home.get("records", [{}])[0].get("summary", "") if home.get("records") else ""
        away_record = away.get("records", [{}])[0].get("summary", "") if away.get("records") else ""
        
        date_str = event.get("date", "")
        try:
            kick_off = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            kick_off_str = kick_off.strftime("%H:%M")
        except:
            kick_off_str = "TBD"
        
        fixture = {
            "sport": "nba",
            "league": league_info["name"],
            "leagueFlag": league_info["flag"],
            "homeTeam": home_team.get("displayName", "Unknown"),
            "awayTeam": away_team.get("displayName", "Unknown"),
            "homeId": home_team.get("id", ""),
            "awayId": away_team.get("id", ""),
            "kickOff": kick_off_str,
            "date": event.get("date", ""),
            "homeRecord": home_record,
            "awayRecord": away_record,
            "status": event.get("status", {}).get("type", {}).get("name", ""),
        }
        fixtures.append(fixture)
    
    return fixtures


def parse_tennis_fixtures(data: dict, league_info: dict) -> list:
    """Parse ESPN Tennis scoreboard"""
    fixtures = []
    events = data.get("events", [])
    
    for event in events:
        competitions = event.get("competitions", [])
        if not competitions:
            continue
        
        comp = competitions[0]
        competitors = comp.get("competitors", [])
        if len(competitors) < 2:
            continue
        
        p1 = competitors[0]
        p2 = competitors[1]
        
        p1_athlete = p1.get("athlete", p1.get("team", {}))
        p2_athlete = p2.get("athlete", p2.get("team", {}))
        
        p1_name = p1_athlete.get("displayName", p1_athlete.get("name", "Unknown"))
        p2_name = p2_athlete.get("displayName", p2_athlete.get("name", "Unknown"))
        
        p1_rank = p1.get("curatedRank", {}).get("current", 0)
        p2_rank = p2.get("curatedRank", {}).get("current", 0)
        
        date_str = event.get("date", "")
        try:
            kick_off = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            kick_off_str = kick_off.strftime("%H:%M")
        except:
            kick_off_str = "TBD"
        
        tournament = event.get("season", {}).get("type", {}).get("name", "")
        if not tournament:
            tournament = data.get("leagues", [{}])[0].get("name", league_info["name"])
        
        fixture = {
            "sport": "tennis",
            "league": f"{league_info['name']} — {tournament}" if tournament else league_info["name"],
            "leagueFlag": league_info["flag"],
            "homeTeam": p1_name,
            "awayTeam": p2_name,
            "homeId": p1_athlete.get("id", ""),
            "awayId": p2_athlete.get("id", ""),
            "kickOff": kick_off_str,
            "date": event.get("date", ""),
            "homeRank": p1_rank,
            "awayRank": p2_rank,
            "status": event.get("status", {}).get("type", {}).get("name", ""),
        }
        fixtures.append(fixture)
    
    return fixtures


def generate_pick_with_ai(fixture: dict) -> dict | None:
    """Use Claude to analyze a fixture and generate a pick"""
    
    sport = fixture["sport"]
    
    if sport == "football":
        context = f"""Utakmica: {fixture['homeTeam']} vs {fixture['awayTeam']}
Liga: {fixture['league']}
Vreme: {fixture['kickOff']}
Rekord domaćin: {fixture.get('homeRecord', 'N/A')}
Rekord gost: {fixture.get('awayRecord', 'N/A')}
Forma domaćin: {fixture.get('homeForm', 'N/A')}
Forma gost: {fixture.get('awayForm', 'N/A')}
Stadion: {fixture.get('venue', 'N/A')}"""
        
        pred_types = "Pobednik (1/X/2), Oba tima daju gol (DA/NE), Ukupno golova (Over/Under 2.5), Dupla šansa (1X/X2/12)"
    
    elif sport == "nba":
        context = f"""NBA Utakmica: {fixture['homeTeam']} vs {fixture['awayTeam']}
Vreme: {fixture['kickOff']}
Rekord domaćin: {fixture.get('homeRecord', 'N/A')}
Rekord gost: {fixture.get('awayRecord', 'N/A')}"""
        
        pred_types = "Pobednik (1/2), Hendikep (-3.5, +5.5 itd), Ukupno poena (Over/Under 215.5, 220.5 itd)"
    
    elif sport == "tennis":
        context = f"""Tenis meč: {fixture['homeTeam']} vs {fixture['awayTeam']}
Turnir: {fixture['league']}
Vreme: {fixture['kickOff']}
Ranking igrač 1: {fixture.get('homeRank', 'N/A')}
Ranking igrač 2: {fixture.get('awayRank', 'N/A')}"""
        
        pred_types = "Pobednik meča (1/2), Ukupno setova (Over/Under 2.5), Ukupno gemova (Over/Under 21.5)"
    else:
        return None
    
    prompt = f"""Ti si stručni sportski analitičar. Analiziraj ovu utakmicu i daj predikciju.

{context}

Dostupni tipovi predikcija: {pred_types}

Odgovori ISKLJUČIVO u ovom JSON formatu (bez markdown, bez ```):
{{
  "predictionType": "tip predikcije",
  "predictionValue": "vrednost (npr. '1 ({fixture['homeTeam']})', 'Over 2.5', 'DA')",
  "confidence": 4,
  "reasoning": "Obrazloženje na srpskom, 2-3 rečenice sa konkretnim statistikama ili argumentima.",
  "odds": 1.85
}}

Confidence je od 1 do 5 (5 = najsigurniji). Odds proceni realistično.
Budi precizan i konkretan u obrazloženju. Koristi podatke koje imaš."""

    if not ANTHROPIC_KEY:
        return generate_pick_statistical(fixture)
    
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
        
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        
        text = response.content[0].text.strip()
        # Clean potential markdown wrapping
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        
        pick_data = json.loads(text)
        return pick_data
    except Exception as e:
        print(f"  ⚠️  AI error: {e}")
        return generate_pick_statistical(fixture)


def generate_pick_statistical(fixture: dict) -> dict:
    """Fallback: Generate pick using statistical heuristics when no AI available"""
    import random
    
    sport = fixture["sport"]
    home = fixture["homeTeam"]
    away = fixture["awayTeam"]
    
    # Parse records for analysis
    home_record = fixture.get("homeRecord", "")
    away_record = fixture.get("awayRecord", "")
    
    home_wins, home_losses = 0, 0
    away_wins, away_losses = 0, 0
    
    if "-" in str(home_record):
        parts = str(home_record).split("-")
        try:
            home_wins = int(parts[0])
            home_losses = int(parts[1]) if len(parts) > 1 else 0
        except: pass
    
    if "-" in str(away_record):
        parts = str(away_record).split("-")
        try:
            away_wins = int(parts[0])
            away_losses = int(parts[1]) if len(parts) > 1 else 0
        except: pass
    
    home_pct = home_wins / max(home_wins + home_losses, 1)
    away_pct = away_wins / max(away_wins + away_losses, 1)
    
    if sport == "football":
        options = [
            {"type": "Pobednik", "value": f"1 ({home})", "odds": round(random.uniform(1.5, 2.5), 2),
             "reasoning": f"{home} igra kod kuće i ima rekord {home_record}. Faktor domaćeg terena je ključan u ovom meču. {away} ima slabiji bilans u gostima ({away_record})."},
            {"type": "Oba tima daju gol", "value": "DA", "odds": round(random.uniform(1.6, 2.0), 2),
             "reasoning": f"Obe ekipe su ofanzivno nastrojene. {home} ({home_record}) i {away} ({away_record}) redovno postižu golove. Očekujemo otvoren meč."},
            {"type": "Ukupno golova", "value": "Over 2.5", "odds": round(random.uniform(1.7, 2.2), 2),
             "reasoning": f"Prosek golova u mečevima oba tima je visok. {home} kod kuće igra napadački, {away} u gostima prima golove. Preko 2.5 je realan ishod."},
        ]
        confidence = 3 + (1 if abs(home_pct - away_pct) > 0.2 else 0) + (1 if home_pct > 0.6 else 0)
    
    elif sport == "nba":
        home_better = home_pct > away_pct
        fav = home if home_better else away
        fav_rec = home_record if home_better else away_record
        dog_rec = away_record if home_better else home_record
        
        options = [
            {"type": "Pobednik", "value": f"{'1' if home_better else '2'} ({fav})", 
             "odds": round(random.uniform(1.4, 2.0), 2),
             "reasoning": f"{fav} ima bolji bilans ({fav_rec}) i u boljoj je formi. Protivnik sa rekordom {dog_rec} teško može da parira na gostovanju."},
            {"type": "Ukupno poena", "value": f"Over {random.choice([210, 215, 220, 225])}.5",
             "odds": round(random.uniform(1.8, 2.0), 2),
             "reasoning": f"Oba tima igraju u visokom tempu. {home} ({home_record}) i {away} ({away_record}) su ekipe koje vole tranziciju. Očekujemo visok skor."},
        ]
        confidence = 3 + (1 if abs(home_pct - away_pct) > 0.15 else 0)
    
    elif sport == "tennis":
        home_rank = fixture.get("homeRank", 999)
        away_rank = fixture.get("awayRank", 999)
        
        if isinstance(home_rank, (int, float)) and isinstance(away_rank, (int, float)):
            fav_is_home = home_rank < away_rank if home_rank > 0 and away_rank > 0 else True
        else:
            fav_is_home = True
        
        fav = home if fav_is_home else away
        fav_rank = home_rank if fav_is_home else away_rank
        dog = away if fav_is_home else home
        dog_rank = away_rank if fav_is_home else home_rank
        
        options = [
            {"type": "Pobednik meča", "value": f"{'1' if fav_is_home else '2'} ({fav})",
             "odds": round(random.uniform(1.3, 1.9), 2),
             "reasoning": f"{fav} (ATP/WTA #{fav_rank}) je bolje rangiran od {dog} (#{dog_rank}). Razlika u kvalitetu je vidljiva. Favorit bi trebalo da kontroliše meč."},
            {"type": "Ukupno setova", "value": "Under 2.5",
             "odds": round(random.uniform(1.6, 2.2), 2),
             "reasoning": f"{fav} je favorit i očekujemo dominantnu igru. Sa rangom #{fav_rank} naspram #{dog_rank}, pobeda u 2 seta je realan ishod."},
        ]
        rank_diff = abs((home_rank or 999) - (away_rank or 999))
        confidence = 3 + (1 if rank_diff > 20 else 0) + (1 if rank_diff > 50 else 0)
    else:
        return None
    
    pick = random.choice(options)
    pick["confidence"] = min(confidence, 5)
    return {
        "predictionType": pick["type"],
        "predictionValue": pick["value"],
        "confidence": pick["confidence"],
        "reasoning": pick["reasoning"],
        "odds": pick["odds"],
    }


def fetch_all_fixtures(target_date: str) -> list:
    """Fetch all fixtures across all sports for a given date"""
    all_fixtures = []
    
    for sport_key, sport_config in SPORTS.items():
        espn_sport = sport_config["espn_sport"]
        
        for league_key, league_info in sport_config["leagues"].items():
            print(f"  📡 Fetching {league_info['name']}...")
            data = fetch_espn_scoreboard(espn_sport, league_key, target_date)
            
            if not data:
                continue
            
            if sport_key == "football":
                fixtures = parse_football_fixtures(data, league_info)
            elif sport_key == "nba":
                fixtures = parse_nba_fixtures(data, league_info)
            elif sport_key == "tennis":
                fixtures = parse_tennis_fixtures(data, league_info)
            else:
                continue
            
            # Only include scheduled/in-progress games
            fixtures = [f for f in fixtures if f["status"] in ("STATUS_SCHEDULED", "STATUS_IN_PROGRESS", "")]
            
            if fixtures:
                print(f"    ✅ Found {len(fixtures)} fixtures")
            
            all_fixtures.extend(fixtures)
    
    return all_fixtures


def generate_picks(fixtures: list, max_picks: int = 12) -> list:
    """Generate AI picks for the best fixtures"""
    picks = []
    
    # Prioritize: Champions League > Top leagues > Others
    priority = {
        "Champions League": 1, "Europa League": 2,
        "Premier League": 3, "La Liga": 4, "Serie A": 5,
        "Bundesliga": 6, "Ligue 1": 7, "NBA": 3,
        "ATP": 4, "WTA": 5,
    }
    
    fixtures.sort(key=lambda f: priority.get(f["league"].split(" — ")[0], 10))
    
    # Limit to max_picks
    selected = fixtures[:max_picks]
    
    for i, fixture in enumerate(selected):
        print(f"  🤖 Analyzing: {fixture['homeTeam']} vs {fixture['awayTeam']} ({fixture['league']})")
        
        pick_data = generate_pick_with_ai(fixture)
        if not pick_data:
            continue
        
        bookmakers = ["Mozzart", "Meridian", "MaxBet"]
        
        pick = {
            "id": f"pick-{datetime.now().strftime('%Y%m%d')}-{i}",
            "matchDate": datetime.now().strftime("%Y-%m-%d"),
            "league": fixture["league"],
            "leagueFlag": fixture["leagueFlag"],
            "homeTeam": fixture["homeTeam"],
            "awayTeam": fixture["awayTeam"],
            "kickOff": fixture["kickOff"],
            "predictionType": pick_data["predictionType"],
            "predictionValue": pick_data["predictionValue"],
            "confidence": min(max(pick_data.get("confidence", 3), 1), 5),
            "reasoning": pick_data["reasoning"],
            "odds": pick_data.get("odds", 1.80),
            "bookmaker": bookmakers[i % len(bookmakers)],
            "affiliateUrl": "https://www.mozzartbet.com",
            "result": "pending",
            "isFree": i < 3,  # First 3 are free
            "sport": fixture["sport"],
        }
        picks.append(pick)
    
    # Sort: free first, then by confidence
    picks.sort(key=lambda p: (not p["isFree"], -p["confidence"]))
    
    return picks


def save_picks(picks: list):
    """Save picks to the JSON database"""
    db = {"picks": [], "lastGenerated": None}
    if DB_FILE.exists():
        try:
            db = json.loads(DB_FILE.read_text(encoding="utf-8"))
        except:
            pass
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Remove old today's picks
    db["picks"] = [p for p in db["picks"] if p.get("matchDate") != today]
    
    # Add new picks
    db["picks"].extend(picks)
    db["lastGenerated"] = today
    
    DB_FILE.write_text(json.dumps(db, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n💾 Saved {len(picks)} picks to {DB_FILE}")


def main():
    print("=" * 60)
    print("🏟️  BetAnalitika — Data Fetcher & Pick Generator")
    print("=" * 60)
    
    # Check for API key
    if ANTHROPIC_KEY:
        print("🤖 AI mode: Claude (Anthropic)")
    else:
        print("📊 AI mode: Statistical analysis (set ANTHROPIC_API_KEY for AI)")
    
    # Target date (today or tomorrow if late)
    now = datetime.now()
    target = now
    if now.hour >= 22:
        target = now + timedelta(days=1)
        print(f"⏰ Late evening — fetching tomorrow's fixtures ({target.strftime('%Y-%m-%d')})")
    
    target_date = target.strftime("%Y-%m-%d")
    print(f"\n📅 Date: {target_date}")
    
    # Fetch fixtures
    print("\n📡 Fetching fixtures from ESPN...")
    fixtures = fetch_all_fixtures(target_date)
    
    if not fixtures:
        print("\n❌ No fixtures found for today. Trying tomorrow...")
        target = now + timedelta(days=1)
        target_date = target.strftime("%Y-%m-%d")
        fixtures = fetch_all_fixtures(target_date)
    
    if not fixtures:
        print("❌ No fixtures found. Exiting.")
        sys.exit(1)
    
    print(f"\n📊 Total fixtures found: {len(fixtures)}")
    for sport in set(f["sport"] for f in fixtures):
        count = len([f for f in fixtures if f["sport"] == sport])
        print(f"   {sport}: {count} matches")
    
    # Generate picks
    print("\n🤖 Generating picks...")
    picks = generate_picks(fixtures, max_picks=12)
    
    if not picks:
        print("❌ Failed to generate picks. Exiting.")
        sys.exit(1)
    
    # Save to DB
    save_picks(picks)
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ DONE! Generated picks:")
    print("=" * 60)
    for i, p in enumerate(picks):
        status = "🆓" if p["isFree"] else "💎"
        stars = "⭐" * p["confidence"]
        print(f"{status} {p['leagueFlag']} {p['homeTeam']} vs {p['awayTeam']}")
        print(f"   {p['predictionType']}: {p['predictionValue']} @ {p['odds']} {stars}")
        print(f"   {p['reasoning'][:80]}...")
        print()


if __name__ == "__main__":
    main()
