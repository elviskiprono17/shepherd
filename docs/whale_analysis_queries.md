# 🐋 Weekly Whale Wallet Analysis Queries

> All queries run in **Supabase SQL Editor** → https://supabase.com/dashboard/project/kpnljxoajcbpcfidziff/sql/new

---

## 1. Wallet Ranking (Scored by Coin Performance Tags)

Scoring: 🌙 Moonbag = +10 | 🎯 TP1 = +5 | ✅ Breakeven = +2 | ❌ Loss = -3 | 🚪 Exited = -1

Grades: **A** (10+) | **B** (5-9) | **C** (1-4) | **D** (0) | **F** (negative)

```sql
SELECT
    wallet_grade,
    wallet_score,
    wallet_address,
    total_signals,
    coins_hit_moonbag,
    coins_hit_tp1,
    coins_hit_breakeven,
    coins_loss,
    coins_exited,
    win_rate_pct,
    best_peak_multiple,
    avg_buy_usd,
    first_seen,
    last_seen
FROM whale_wallet_performance
ORDER BY wallet_score DESC, win_rate_pct DESC NULLS LAST;
```

---

## 2. Which Wallet Called Which Signal (Full Breakdown with Performance)

```sql
SELECT
    ws.wallet_address,
    c.symbol,
    c.name,
    c.tier,
    c.performance_status,
    c.current_multiple,
    c.peak_multiple,
    ws.buy_amount_usd,
    ws.is_first_discoverer,
    c.hit_breakeven,
    c.hit_tp1,
    c.hit_moonbag,
    ws.created_at AS signal_date
FROM whale_signals ws
JOIN coins c ON c.id = ws.coin_id
ORDER BY ws.created_at DESC;
```

---

## 3. Coin Performance Summary (All Milestones)

```sql
SELECT
    symbol,  name,  tier,
    performance_status,
    discovered_at_price,
    price AS current_price,
    current_multiple || 'x' AS current_x,
    peak_multiple || 'x' AS peak_x,
    hit_breakeven,  hit_breakeven_at,
    hit_tp1,  hit_tp1_at,
    hit_moonbag,  hit_moonbag_at,
    whale_sold_pct,
    first_whale_wallet,
    created_at AS discovered_at
FROM coins
ORDER BY created_at DESC;
```

---

## 4. Last 7 Days Activity

```sql
SELECT
    ws.wallet_address,
    COUNT(*) AS signals_this_week,
    COUNT(DISTINCT ws.coin_id) AS coins_this_week,
    ROUND(SUM(ws.buy_amount_usd), 2) AS total_bought_usd
FROM whale_signals ws
WHERE ws.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ws.wallet_address
ORDER BY signals_this_week DESC;
```

---

## 5. Inactive Wallets (Candidates for Removal)

```sql
SELECT
    wallet_address,
    total_signals,
    last_seen,
    EXTRACT(DAY FROM NOW() - last_seen) AS days_inactive
FROM whale_wallet_performance
WHERE last_seen < NOW() - INTERVAL '14 days'
ORDER BY days_inactive DESC;
```

---

## 6. Best Wallets (Grade A & B — Keep These)

```sql
SELECT
    wallet_grade,
    wallet_score,
    wallet_address,
    total_signals,
    coins_hit_moonbag,
    coins_hit_tp1,
    coins_hit_breakeven,
    coins_loss,
    win_rate_pct,
    best_peak_multiple
FROM whale_wallet_performance
WHERE wallet_grade IN ('A', 'B')
ORDER BY wallet_score DESC;
```

---

## 7. Worst Wallets (Grade D & F — Remove Candidates)

```sql
SELECT
    wallet_grade,
    wallet_score,
    wallet_address,
    total_signals,
    coins_loss,
    coins_hit_breakeven,
    win_rate_pct
FROM whale_wallet_performance
WHERE wallet_grade IN ('D', 'F')
ORDER BY wallet_score ASC;
```

---

## 8. Signals Per Tier with Performance

```sql
SELECT
    ws.wallet_address,
    c.tier,
    COUNT(*) AS signals,
    COUNT(*) FILTER (WHERE c.hit_breakeven = true) AS breakevens,
    COUNT(*) FILTER (WHERE c.hit_tp1 = true) AS tp1s,
    COUNT(*) FILTER (WHERE c.performance_status = 'loss') AS losses,
    ROUND(AVG(ws.buy_amount_usd), 2) AS avg_buy
FROM whale_signals ws
JOIN coins c ON c.id = ws.coin_id
GROUP BY ws.wallet_address, c.tier
ORDER BY ws.wallet_address, c.tier;
```

---

## 9. Single Wallet Deep Dive

Replace `'PASTE_WALLET_ADDRESS_HERE'`:

```sql
SELECT
    c.symbol,  c.name,  c.tier,
    c.performance_status,
    ws.buy_amount_usd,
    c.discovered_at_price,
    c.price AS current_price,
    c.current_multiple || 'x' AS current_x,
    c.peak_multiple || 'x' AS peak_x,
    c.hit_breakeven,  c.hit_tp1,  c.hit_moonbag,
    ws.is_first_discoverer,
    ws.created_at AS signal_date
FROM whale_signals ws
JOIN coins c ON c.id = ws.coin_id
WHERE ws.wallet_address = 'PASTE_WALLET_ADDRESS_HERE'
ORDER BY ws.created_at DESC;
```

---

## 10. Moonbag Hall of Fame 🌙

```sql
SELECT
    symbol, name, tier,
    discovered_at_price,
    peak_price,
    peak_multiple || 'x' AS peak_x,
    first_whale_wallet,
    hit_moonbag_at,
    created_at AS discovered_at
FROM coins
WHERE hit_moonbag = true
ORDER BY peak_multiple DESC;
```

---

## Quick Links

- **Inspect wallet on Solscan**: `https://solscan.io/account/WALLET_ADDRESS`
- **Inspect transaction**: `https://solscan.io/tx/TX_SIGNATURE`
