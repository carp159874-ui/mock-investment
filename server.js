const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const FINNHUB_KEY = process.env.FINNHUB_KEY || "";

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

function toKrxCode(symbol) {
  return symbol.replace(".KS", "").replace(".KQ", "");
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = symbols.split(",").filter(Boolean);
  const krSymbols = symbolList.filter(s => !isUSStock(s));
  const usSymbols = symbolList.filter(isUSStock);
  const results = {};

  // ── 한국 주식: 네이버 증권 API ──────────────────────────────────
  const krChunkSize = 20;
  for (let i = 0; i < krSymbols.length; i += krChunkSize) {
    const chunk = krSymbols.slice(i, i + krChunkSize);
    await Promise.all(chunk.map(async (symbol) => {
      const code = toKrxCode(symbol);
      try {
        // 네이버 증권 시세 API (더 안정적인 엔드포인트)
        const r = await fetch(
          `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": "https://finance.naver.com/",
              "Accept": "application/json",
            }
          }
        );
        if (!r.ok) {
          // 폴백: 기본 시세 API
          const r2 = await fetch(
            `https://m.stock.naver.com/api/stock/${code}/basic`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://m.stock.naver.com/",
              }
            }
          );
          if (!r2.ok) return;
          const d = await r2.json();
          const price = parseFloat((d.closePrice || d.stockItemTotalInfos?.find(x => x.key === "현재가")?.value || "0").replace(/,/g, ""));
          const prevClose = parseFloat((d.compareToPreviousClosePrice || "0").replace(/,/g, ""));
          if (price > 0) {
            const change = parseFloat(d.fluctuationsRatio || "0");
            const prev = change !== 0 ? Math.round(price / (1 + change / 100)) : price - prevClose;
            results[symbol] = { price, prevClose: prev, high: parseFloat((d.highPrice || price).toString().replace(/,/g, "")), low: parseFloat((d.lowPrice || price).toString().replace(/,/g, "")), volume: parseInt((d.accumulatedTradingVolume || "0").replace(/,/g, "")), currency: "KRW" };
          }
          return;
        }
        const data = await r.json();
        const item = data?.result?.areas?.[0]?.datas?.[0] || data?.result;
        if (!item) return;
        const price = item.nv || item.closePrice || item.last;
        const prevClose = item.cv || item.prevClosePrice || item.previousClose;
        if (price && price > 0) {
          results[symbol] = {
            price: parseFloat(price),
            prevClose: parseFloat(prevClose || price),
            high: parseFloat(item.hv || item.highPrice || price),
            low: parseFloat(item.lv || item.lowPrice || price),
            volume: parseInt(item.tv || item.accumulatedTradingVolume || 0),
            currency: "KRW",
          };
        }
      } catch (e) {
        console.error(`KR error ${symbol}:`, e.message);
      }
    }));
    if (i + krChunkSize < krSymbols.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ── 미국 주식: Finnhub ──────────────────────────────────────────
  if (usSymbols.length > 0 && FINNHUB_KEY) {
    const usChunkSize = 10;
    for (let i = 0; i < usSymbols.length; i += usChunkSize) {
      const chunk = usSymbols.slice(i, i + usChunkSize);
      await Promise.all(chunk.map(async (symbol) => {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (!r.ok) return;
          const q = await r.json();
          if (q.c && q.c > 0) {
            results[symbol] = { price: q.c, prevClose: q.pc, high: q.h, low: q.l, volume: null, currency: "USD" };
          }
        } catch (e) {
          console.error(`US error ${symbol}:`, e.message);
        }
      }));
      if (i + usChunkSize < usSymbols.length) {
        await new Promise(r => setTimeout(r, 1100));
      }
    }
  }

  res.json(results);
});

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
