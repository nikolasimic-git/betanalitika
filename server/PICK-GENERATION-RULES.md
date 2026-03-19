# Pick Generation Rules

## WHO MAKES PICKS
AI (Jarvis/Claude) personally analyzes and selects every pick. No scripts, no random generators.
Every pick must be backed by real research (web_search) and real odds (Odds API).
TI biraš pikove — ne skripta, ne formula, ne kvota. Tvoj mozak, tvoja analiza.

## MARKET SELECTION — ANALYZE ALL OPTIONS

### Available Markets (Odds API)
- **h2h** — Moneyline / 1X2 (ko pobeđuje)
- **spreads** — Hendikep (-1.5, -3.5, +2.5...)
- **totals** — Over/Under (ukupno golova/poena)

### Additional Markets (via web_search reasoning)
- **BTTS** — Oba tima daju gol (fudbal)
- **Draw No Bet** — Nerešeno = refund
- **Half-time result** — Rezultat na poluvremenu

### HOW TO CHOOSE THE BEST MARKET
Za SVAKI meč, analiziraj SVE opcije pre nego što izabereš:

1. **Moneyline @1.25** → Preniska kvota? Pogledaj hendikep
2. **Hendikep -1.5 @1.75** → Tim dominira? Bolja kvota, slična verovatnoća
3. **Over/Under** → Oba tima napadaju ali ne znaš ko pobeđuje? Over je bolji izbor
4. **BTTS** → Oba tima imaju slabu odbranu? BTTS Yes može biti bolji value
5. **Draw No Bet** → Tim favorit ali rizik od remija? DNB je sigurnije

### GOLDEN RULE
Nikad ne biraj market samo zato što je "najlakši". Biraj market koji daje **NAJBOLJI VALUE** — 
gde je razlika između realne verovatnoće i implicirane kvote NAJVEĆA.

## PICK COUNT — FLEKSIBILNO, QUALITY FIRST

### NEMA MINIMALNOG BROJA PO SPORTU
- Ne moraš imati 2 NBA, 2 fudbala itd.
- Ako danas ima 5 dobrih fudbal pikova i 0 NBA — onda 5 fudbal i 0 NBA
- Ako ima samo tenis i košarka — OK
- Sport je nebitan. VALUE JE BITAN.

### Target: ~10 pikova ukupno (3 free + ~7 premium)
- Ali NIKAD ne forsiraj broj!
- Ako imaš samo 3 dobra premium pika — stavi 3
- Ako imaš 12 dobrih — stavi 12
- Raspon: 5-15 pikova ukupno je OK

### Premium Picks (is_free: false)
- ONLY picks with confidence 4-5⭐
- DINAMIČAN BROJ — koliko god ima dobrih, toliko ide
- Sigurica (Super Pick) = highest confidence pick
- **MIX MARKETS**: Hendikep, Over/Under, BTTS su podjednako validni kao ML

### Free Picks (is_free: true)
- Tačno 3 pika, 3⭐ confidence
- Teaser — pokažu kvalitet ali ne najbolji value
- Bilo koji sport, bilo koji market

### Odds Rules
- Minimum odds: 1.20 (no lower)
- No upper limit
- All odds must be REAL from Odds API (never generated/estimated)
- **Fetch h2h + spreads + totals for EVERY match**

### Reasoning Quality (CRITICAL)
- Forma timova, bilans, H2H, povrede, value analiza
- **EXPLAIN WHY THIS MARKET** — zašto hendikep a ne ML, zašto Over a ne pobednik
- reasoning (srpski) + reasoning_en (engleski)
- Value edge: "Kvota 1.85 = ~54% implicirano, realna šansa ~62% → edge 8%"

### prediction_type Values
- `Pobednik` — Moneyline (1X2)
- `Hendikep` — Spread/Asian Handicap
- `Over/Under` — Totals
- `BTTS` — Oba tima daju gol
- `Draw No Bet` — Nerešeno = void

### Quality Rules
- NIKAD ne ubacuj pick samo da popuniš kvotu
- Ako je borderline 3-4⭐ → FREE (3⭐), ne premium
- **BEST VALUE MARKET WINS** — don't default to ML
- Pregledaj SVE mečeve, SVE markete, pa tek onda biraj top pikove
