const express = require("express");
const path = require("path");
const yahooFinance = require("yahoo-finance2").default;

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
  const chunkSize = 20;

  for (let i = 0; i < symbolList.length; i += chunkSize) {
    const chunk = symbolList.slice(i, i + chunkSize);

    await Promise.all(chunk.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol, {}, { validateResult: false });
        if (quote && quote.regularMarketPrice) {
          results[symbol] = {
            price: quote.regularMarketPrice,
            prevClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
            high: quote.regularMarketDayHigh || quote.regularMarketPrice,
            low: quote.regularMarketDayLow || quote.regularMarketPrice,
            volume: quote.regularMarketVolume || null,
            currency: quote.currency || (isUSStock(symbol) ? "USD" : "KRW"),
          };
        }
      } catch (e) {
        console.error(`Error ${symbol}:`, e.message);
      }
    }));

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
