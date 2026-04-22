const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const FINNHUB_KEY = process.env.FINNHUB_KEY || "";

app.use(express.json());

// 한국 주식 심볼 변환 (005930.KS → 005930, 247540.KQ → 247540)
function toKrxCode(symbol) {
  return symbol.replace(".KS", "").replace(".KQ", "");
}

// 미국 주식인지 확인
function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

// 한국 주식인지 확인
function isKRStock(symbol) {
  return symbol.endsWith(".KS") || symbol.endsWith(".KQ");
}

// 주가 조회 API
app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = symbols.split(",").filter(Boolean);
  const krSymbols = symbolList.filter(isKRStock);
  const usSymbols = symbolList.filter(isUSStock);
  const results = {};

  // ── 미국 주식: Finnhub ──────────────────────────────────────────
  if (usSymbols.length > 0 && FINNHUB_KEY) {
    const chunkSize = 10;
    for (let i = 0; i < usSymbols.length; i += chunkSize) {
      const chunk = usSymbols.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (symbol) => {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (!r.ok) return;
          const q = await r.json();
          if (q.c && q.c > 0) {
            results[symbol] = {
              price: q.c,
              prevClose: q.pc,
              high: q.h,
              low: q.l,
              volume: null,
              currency: "USD",
            };
          }
        } catch (e) {
          console.error(`Finnhub error ${symbol}:`, e.message);
        }
      }));
      if (i + chunkSize < usSymbols.length) {
        await new Promise(r => setTimeout(r, 1100));
      }
    }
  }

  // ── 한국 주식: 네이버 금융 ──────────────────────────────────────
  if (krSymbols.length > 0) {
    const chunkSize = 20;
    for (let i = 0; i < krSymbols.length; i += chunkSize) {
      const chunk = krSymbols.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (symbol) => {
        const code = toKrxCode(symbol);
        try {
          const r = await fetch(
            `https://m.stock.naver.com/api/stock/${code}/basic`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://m.stock.naver.com/",
                "Accept": "application/json",
              }
            }
          );
          if (!r.ok) return;
          const data = await r.json();
          const price = parseFloat(data.closePrice?.replace(/,/g, "") || "0");
          const prevClose = parseFloat(data.compareToPreviousClosePrice?.replace(/,/g, "") || "0");
          const change = parseFloat(data.fluctuationsRatio || "0");
          if (price > 0) {
            const prevPrice = prevClose !== 0 ? price - prevClose : price / (1 + change / 100);
            results[symbol] = {
              price: price,
              prevClose: Math.round(prevPrice),
              high: parseFloat(data.highPrice?.replace(/,/g, "") || price),
              low: parseFloat(data.lowPrice?.replace(/,/g, "") || price),
              volume: parseInt(data.accumulatedTradingVolume?.replace(/,/g, "") || "0"),
              currency: "KRW",
            };
          }
        } catch (e) {
          console.error(`Naver error ${symbol}:`, e.message);
        }
      }));
      if (i + chunkSize < krSymbols.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  res.json(results);
});

// React 빌드 파일 서빙
app.use(express.static(path.join(__dirname, "build")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
