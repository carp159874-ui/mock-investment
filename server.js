const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

let yf = null;
async function initYahoo() {
  if (yf) return yf;
  const mod = await import("yahoo-finance2");
  console.log("mod keys:", Object.keys(mod));
  console.log("mod.default type:", typeof mod.default);
  console.log("mod.default keys:", mod.default ? Object.keys(mod.default) : "none");
  
  // mod.default.default 확인
  if (mod.default && mod.default.default) {
    console.log("mod.default.default keys:", Object.keys(mod.default.default));
    if (typeof mod.default.default.quote === "function") {
      yf = mod.default.default;
      console.log("Using mod.default.default");
      return yf;
    }
  }
  if (mod.default && typeof mod.default.quote === "function") {
    yf = mod.default;
    console.log("Using mod.default");
    return yf;
  }
  // 모든 키 탐색
  for (const key of Object.keys(mod)) {
    const val = mod[key];
    if (val && typeof val.quote === "function") {
      yf = val;
      console.log("Using mod." + key);
      return yf;
    }
  }
  throw new Error("Cannot find quote function in yahoo-finance2");
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").filter(Boolean))];
  const results = {};

  try {
    const yahoo = await initYahoo();
    const chunkSize = 20;

    for (let i = 0; i < symbolList.length; i += chunkSize) {
      const chunk = symbolList.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (symbol) => {
        try {
          const quote = await yahoo.quote(symbol, {}, { validateResult: false });
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
  } catch (e) {
    console.error("Yahoo error:", e.message);
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
  initYahoo().catch(e => console.error("Init failed:", e.message));
});
