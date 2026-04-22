const express = require("express");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

function isUSStock(symbol) {
  return !symbol.endsWith(".KS") && !symbol.endsWith(".KQ");
}

// https 모듈로 직접 요청 (fetch 차단 우회)
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      // gzip 처리
      let stream = res;
      if (res.headers["content-encoding"] === "gzip") {
        const zlib = require("zlib");
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers["content-encoding"] === "br") {
        const zlib = require("zlib");
        stream = res.pipe(zlib.createBrotliDecompress());
      } else if (res.headers["content-encoding"] === "deflate") {
        const zlib = require("zlib");
        stream = res.pipe(zlib.createInflate());
      }
      stream.on("data", chunk => chunks.push(chunk));
      stream.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({ status: res.statusCode, body });
        } catch (e) {
          reject(e);
        }
      });
      stream.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").filter(Boolean))];
  const results = {};
  const chunkSize = 20;

  for (let i = 0; i < symbolList.length; i += chunkSize) {
    const chunk = symbolList.slice(i, i + chunkSize);
    const symbolStr = chunk.join(",");

    try {
      // Yahoo Finance v7 quote API
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,currency`;
      const { status, body } = await httpsGet(url);

      if (status === 200) {
        const data = JSON.parse(body);
        const quotes = data?.quoteResponse?.result || [];
        quotes.forEach(q => {
          if (q.regularMarketPrice && q.regularMarketPrice > 0) {
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
      } else {
        console.error(`Yahoo v7 status ${status} for chunk ${i}`);
      }
    } catch (e) {
      console.error(`Error chunk ${i}:`, e.message);
    }

    if (i + chunkSize < symbolList.length) {
      await new Promise(r => setTimeout(r, 300));
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
