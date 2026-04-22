const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const FINNHUB_KEY = process.env.FINNHUB_KEY || "";

app.use(express.json());

// Finnhub 심볼 변환
function toFinnhubSymbol(symbol) {
  if (symbol.endsWith(".KS")) return "KS:" + symbol.replace(".KS", "");
  if (symbol.endsWith(".KQ")) return "KQ:" + symbol.replace(".KQ", "");
  return symbol; // 미국 주식은 그대로
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = symbols.split(",").filter(Boolean);
  const results = {};

  if (!FINNHUB_KEY) {
    return res.status(500).json({ error: "FINNHUB_KEY not set" });
  }

  // 10개씩 병렬 처리 (분당 60회 제한 준수)
  const chunkSize = 10;
  for (let i = 0; i < symbolList.length; i += chunkSize) {
    const chunk = symbolList.slice(i, i + chunkSize);

    await Promise.all(chunk.map(async (symbol) => {
      const finnhubSymbol = toFinnhubSymbol(symbol);
      const isKR = symbol.endsWith(".KS") || symbol.endsWith(".KQ");
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhubSymbol)}&token=${FINNHUB_KEY}`,
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
            currency: isKR ? "KRW" : "USD",
          };
        }
      } catch (e) {
        console.error(`Error ${symbol}:`, e.message);
      }
    }));

    // rate limit 방지: 10개 처리 후 1.1초 대기
    if (i + chunkSize < symbolList.length) {
      await new Promise(r => setTimeout(r, 1100));
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
