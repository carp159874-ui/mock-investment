const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

let yf = null;
let priceCache = {};
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분 캐시

async function initYahoo() {
  if (yf) return yf;
  const mod = await import("yahoo-finance2");
  const YahooFinance = mod.default;
  yf = new YahooFinance();
  return yf;
}

async function fetchAllPrices(symbolList) {
  const yahoo = await initYahoo();
  const results = {};

  // 한 번에 하나씩, 충분한 간격으로 요청
  for (const symbol of symbolList) {
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
    // 요청 간 500ms 대기
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").filter(Boolean))];
  const now = Date.now();

  // 캐시가 유효하면 캐시 반환
  if (now - lastFetch < CACHE_TTL && Object.keys(priceCache).length > 0) {
    const cached = {};
    symbolList.forEach(s => { if (priceCache[s]) cached[s] = priceCache[s]; });
    console.log(`Cache hit: ${Object.keys(cached).length}/${symbolList.length}`);
    return res.json(cached);
  }

  // 새로 fetch
  console.log(`Fetching ${symbolList.length} symbols...`);
  const results = await fetchAllPrices(symbolList);
  priceCache = { ...priceCache, ...results };
  lastFetch = now;

  console.log(`Fetched ${Object.keys(results).length}/${symbolList.length} symbols`);
  res.json(results);
});

app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  // 서버 시작 시 미리 주요 종목 데이터 로드
  initYahoo().then(() => {
    console.log("Yahoo Finance initialized!");
  }).catch(e => console.error("Init failed:", e.message));
});
