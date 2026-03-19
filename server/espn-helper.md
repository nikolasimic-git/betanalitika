# ESPN Free API Endpoints — Helper za Cron Pick Generator

Koristi ove endpointe za bolji reasoning pri generisanju pikova. Svi su besplatni, bez API ključa.

## 🏀 NBA (Basketball)

| Podatak | Endpoint |
|---------|----------|
| Injuries | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries` |
| News | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news` |
| Teams | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams` |
| Team Roster | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{id}/roster` |
| Standings | `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings` |
| Scoreboard | `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD` |

## ⚽ Football (Soccer)

| Liga | Endpoint |
|------|----------|
| EPL (English Premier League) | `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard` |
| Champions League | `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard` |
| Europa League | `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard` |
| La Liga | `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard` |
| Serie A | `https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard` |
| Bundesliga | `https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard` |
| Ligue 1 | `https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard` |

## 📋 Kako koristiti u cron pick generatoru

### Pre generisanja pikova:
1. **Proveri injuries** — Fetch NBA injuries endpoint, filtriraj za timove koji igraju danas
2. **Proveri scoreboard** — Fetch scoreboard sa današnjim datumom za raspored mečeva
3. **Proveri standings** — Za kontekst forme timova

### Primer workflow-a za NBA pik:
```
1. Fetch scoreboard za danas → lista mečeva
2. Fetch injuries → ko nedostaje
3. Fetch standings → pozicije timova
4. Kombinuj sa odds podacima (Odds API / api-sports)
5. Generiši pik sa bogatijim kontekstom
```

### Primer workflow-a za fudbal:
```
1. Fetch EPL/CL/EL scoreboard → današnji mečevi
2. Kombinuj sa api-football predictions
3. Generiši pik
```

## ⚠️ Napomene
- Svi endpointi su **besplatni** i ne zahtevaju autentikaciju
- Rate limit nije dokumentovan ali budi razuman (~1 req/sec)
- Scoreboard endpoint prima `?dates=YYYYMMDD` za specifičan datum
- Team ID-ovi za roster endpoint se mogu naći u teams endpoint response-u
- Injuries endpoint vraća listu igrača sa statusom (Out, Day-to-Day, itd.)
