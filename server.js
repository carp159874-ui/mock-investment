const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").filter(Boolean))];
  const results = {};

  // Yahoo Finance v8 API - 20개씩 청크 처리
  const chunkSize = 20;
  for (let i = 0; i < symbolList.length; i += chunkSize) {
    const chunk = symbolList.slice(i, i + chunkSize);
    const symbolStr = chunk.join(",");

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(symbolStr)}&range=1d&interval=1d`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sparkData = data?.spark?.result || [];
        sparkData.forEach(item => {
          if (!item?.symbol || !item?.response?.[0]) return;
          const r = item.response[0];
          const meta = r.meta;
          if (meta?.regularMarketPrice) {
            results[item.symbol] = {
              price: meta.regularMarketPrice,
              prevClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice,
              high: meta.regularMarketDayHigh || meta.regularMarketPrice,
              low: meta.regularMarketDayLow || meta.regularMarketPrice,
              volume: meta.regularMarketVolume || null,
              currency: meta.currency || (isUSStock(item.symbol) ? "USD" : "KRW"),
            };
          }
        });
      }
    } catch (e) {
      console.error(`Spark API error chunk ${i}:`, e.message);
    }

    // 실패한 종목은 v7 quote API로 폴백
    const failed = chunk.filter(s => !results[s]);
    if (failed.length > 0) {
      try {
        const r2 = await fetch(
          `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(failed.join(","))}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,currency`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Accept": "application/json",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
            },
          }
        );
        if (r2.ok) {
          const d2 = await r2.json();
          const quotes = d2?.quoteResponse?.result || [];
          quotes.forEach(q => {
            if (q.regularMarketPrice) {
              results[q.symbol] = {
                price: q.regularMarketPrice,
                prevClose: q.regularMarketPreviousClose || q.regularMarketPrice,
                high: q.regularMarketDayHigh || q.regularMarketPrice,
                low: q.regularMarketDayLow || q.regularMarketPrice,
                volume: q.regularMarketVolume || null,
                currency: q.currency || (isUSStock(q.symbol) ? "USD" : "KRW"),
              };
            }
          });
        }
      } catch (e2) {
        console.error(`Quote API fallback error:`, e2.message);
      }
    }

    if (i + chunkSize < symbolList.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`Fetched ${Object.keys(results).length}/${symbolList.length} symbols`);
  res.json(results);
});

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
