const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// React 빌드 파일 서빙
app.use(express.static(path.join(__dirname, "build")));

// Yahoo Finance 주가 조회 API
app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = symbols.split(",").filter(Boolean);

  try {
    // Yahoo Finance v8 API 사용
    const results = {};
    const chunkSize = 20;

    for (let i = 0; i < symbolList.length; i += chunkSize) {
      const chunk = symbolList.slice(i, i + chunkSize);
      const symbolStr = chunk.join(",");

      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,shortName,longName`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Yahoo Finance error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const quotes = data?.quoteResponse?.result || [];

      quotes.forEach((q) => {
        results[q.symbol] = {
          price: q.regularMarketPrice ?? null,
          prevClose: q.regularMarketPreviousClose ?? null,
          high: q.regularMarketDayHigh ?? null,
          low: q.regularMarketDayLow ?? null,
          volume: q.regularMarketVolume ?? null,
          name: q.shortName || q.longName || q.symbol,
        };
      });

      // rate limit 방지
      if (i + chunkSize < symbolList.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Price fetch error:", err);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
