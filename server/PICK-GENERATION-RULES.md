# Pick Generation Rules

## WHO MAKES PICKS
AI (Jarvis/Claude) personally analyzes and selects every pick. No scripts, no random generators.
Every pick must be backed by real research (web_search) and real odds (Odds API).

## MARKET SELECTION — ANALYZE ALL OPTIONS

### Available Markets (Odds API)
- **h2h** — Moneyline / 1X2 (ko pobeđuje)
- **spreads** — Hendikep (-1.5, -3.5, +2.5...)
- **totals** — Over/Under (ukupno golova/poena)

### Additional Markets (via web_search reasoning)
- **BTTS** — Oba tima daju gol (fudbal)
- **Draw No Bet** — Nerešeno = refund
- **Half-time result** — Rezultat na poluvremenu
- **Corners, cards** — Samo ako imaš jak reasoning

### HOW TO CHOOSE THE BEST MARKET
Za SVAKI meč, analiziraj SVE opcije pre nego što izabereš:

1. **Moneyline @1.25** → Preniska kvota? Pogledaj hendikep
2. **Hendikep -1.5 @1.75** → Tim dominira? Bolja kvota, slična verovatnoća
3. **Over/Under** → Oba tima napadaju ali ne znaš ko pobeđuje? Over je bolji izbor
4. **BTTS** → Oba tima imaju slabu odbranu? BTTS Yes može biti bolji value
5. **Draw No Bet** → Tim favorit ali rizik od remija? DNB je sigurnije

### DECISION MATRIX
| Situacija | Preferiran market | Zašto |
|-----------|------------------|-------|
| Jak favorit, ML < 1.30 | Hendikep -1.5/-2.5 | Bolja kvota, sličan confidence |
| Oba tima napadaju, nejasno ko pobeđuje | Over/Under | Ne moraš pogađati pobednika |
| Favorit ali derbi/kup | Draw No Bet | Zaštita od iznenađenja |
| Slabe odbrane oba tima | BTTS Yes | Value kad je kvota > 1.60 |
| Jasan favorit, dobra kvota | ML | Klasika kad je value dobar |
| Tim dominira kod kuće | Hendikep + Over combo reasoning | Objasni zašto oboje |

### GOLDEN RULE
Nikad ne biraj market samo zato što je "najlakši". Biraj market koji daje **NAJBOLJI VALUE** — 
gde je razlika između realne verovatnoće i implicirane kvote NAJVEĆA.

Primer: Ako procenjuješ da će Spurs pobediti sa 85% šanse:
- ML @1.28 implicira 78% → edge 7% ✅ ali niska kvota
- Hendikep -5.5 @1.85 implicira 54%, a procena je 60% → edge 6% i VEĆA kvota
- Hendikep -5.5 je bolji pick jer nudi 1.85 umesto 1.28 sa sličnim edge-om

## Selection Criteria

### Premium Picks (is_free: false)
- ONLY picks with confidence 4-5⭐
- No minimum count — if only 3 picks are high confidence today, then only 3 premium picks
- No maximum forced — quality over quantity
- Sigurica (Super Pick) = highest confidence pick among premium
- Value bets prioritized: where real odds > fair odds based on probability
- **MIX MARKETS**: Ne stavljaj samo ML! Hendikep, Over/Under, BTTS su podjednako validni

### Free Picks (is_free: true)
- Always exactly 3 picks
- Confidence level: 3⭐ (medium)
- Purpose: teaser to show AI quality, but not best value
- Try to diversify sports (1 football + 1 NBA + 1 tennis when available)
- Choose matches with decent odds (1.50-2.00 range) but not the best value ones
- **Free picks can be any market type** — Over/Under i hendikep su OK za free

### Total Picks Per Day
- Minimum: 5 (3 free + 2 premium minimum)
- Maximum: ~15 (3 free + up to 12 premium)
- Dynamic based on available high-confidence opportunities
- If very few matches today, reduce to 3 free + whatever premium qualifies

### Odds Rules
- Minimum odds: 1.20 (no lower)
- No upper limit on odds
- All odds must be REAL from Odds API (never generated/estimated)
- Always fetch latest odds at the moment of pick generation
- **Fetch h2h + spreads + totals for EVERY match** — compare all before choosing

### Reasoning Quality (CRITICAL)
- Every reasoning MUST include: forma timova, bilans, H2H ako postoji, povrede ključnih igrača, value analiza
- **EXPLAIN WHY THIS MARKET**: "Biramo hendikep -1.5 umesto ML jer ML @1.22 nema value, dok -1.5 @1.75 daje edge od 8%"
- Write reasoning in Serbian (reasoning field) AND English (reasoning_en field)
- Be specific: "Toronto (38-29) dolazi sa 4 pobede u nizu, Chicago (28-40) bez LaVinea" — NOT "Toronto ima bolji bilans"
- Include value edge: "Kvota 1.85 odgovara ~54% verovatnoće, realna šansa ~62% → value edge 8%"

### prediction_type Values
- `Pobednik` — Moneyline (1X2)
- `Hendikep` — Spread/Asian Handicap
- `Over/Under` — Totals
- `BTTS` — Oba tima daju gol
- `Draw No Bet` — Nerešeno = void
- `Poluvreme` — Half-time result

### prediction_value Examples
- `San Antonio Spurs ML` (moneyline)
- `San Antonio Spurs -5.5` (hendikep)
- `Over 215.5` ili `Under 2.5` (totals)
- `BTTS Yes` ili `BTTS No` (both teams to score)
- `Draw No Bet: Real Madrid` (DNB)

### Quality Rules
- Never include a pick just to fill quota
- If a pick is borderline 3-4⭐, it goes to FREE (3⭐) not premium
- **BEST VALUE MARKET WINS** — don't default to ML when another market is better
