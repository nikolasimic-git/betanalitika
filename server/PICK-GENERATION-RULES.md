# Pick Generation Rules

## WHO MAKES PICKS
AI (Jarvis/Claude) personally analyzes and selects every pick. No scripts, no random generators.
Every pick must be backed by real research (web_search) and real odds (Odds API).

## Selection Criteria

### Premium Picks (is_free: false)
- ONLY picks with confidence 4-5⭐
- No minimum count — if only 3 picks are high confidence today, then only 3 premium picks
- No maximum forced — quality over quantity
- Sigurica (Super Pick) = highest confidence pick among premium
- Value bets prioritized: where real odds > fair odds based on probability

### Free Picks (is_free: true)
- Always exactly 3 picks
- Confidence level: 3⭐ (medium)
- Purpose: teaser to show AI quality, but not best value
- Try to diversify sports (1 football + 1 NBA + 1 tennis when available)
- Choose matches with decent odds (1.50-2.00 range) but not the best value ones

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

### Reasoning Quality (CRITICAL)
- Every reasoning MUST include: forma timova, bilans, H2H ako postoji, povrede ključnih igrača, value analiza
- Write reasoning in Serbian (reasoning field) AND English (reasoning_en field)
- Be specific: "Toronto (38-29) dolazi sa 4 pobede u nizu, Chicago (28-40) bez LaVinea" — NOT "Toronto ima bolji bilans"
- Include value edge: "Kvota 1.85 odgovara ~54% verovatnoće, realna šansa ~62% → value edge 8%"

### Quality Rules
- Never include a pick just to fill quota
- If a pick is borderline 3-4⭐, it goes to FREE (3⭐) not premium
