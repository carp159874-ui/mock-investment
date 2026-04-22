const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

// yahoo-finance2 초기화
let yf = null;
async function initYahoo() {
  if (yf) return yf;
  const mod = await import("yahoo-finance2");
  // 여러 가지 export 형태 처리
  if (mod.default && typeof mod.default.quote === "function") {
    yf = mod.default;
  } else if (mod.quote && typeof mod.quote === "function") {
    yf = mod;
  } else {
    // 객체 전체를 확인
    console.log("yahoo-finance2 exports:", Object.keys(mod));
    yf = mod.default || mod;
  }
  return yf;
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").filter(Boolean))];
  const results = {};

  try {
    const yahoo = await initYahoo();
    console.log("Yahoo type:", typeof yahoo, "quote:", typeof yahoo.quote);
    
    const chunkSize = 20;
    for (let i = 0; i < symbolList.length; i += chunkSize) {
      const chunk = symbolList.slice(i, i + chunkSize);

      await Promise.all(chunk.map(async (symbol) => {
        try {
          let quote;
          if (typeof yahoo.quote === "function") {
            quote = await yahoo.quote(symbol, {}, { validateResult: false });
          } else if (typeof yahoo === "function") {
            quote = await yahoo(symbol);
          }
          
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
    console.error("Yahoo init error:", e.message);
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
  // 시작 시 yahoo-finance2 테스트
  initYahoo().then(y => {
    console.log("Yahoo loaded. Keys:", Object.keys(y).join(", "));
  }).catch(e => console.error("Yahoo load failed:", e.message));
});
