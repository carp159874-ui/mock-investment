const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const FINNHUB_KEY = process.env.FINNHUB_KEY || "d7k69jpr01qnk4odoasgd7k69jpr01qnk4odoat0";

app.use(express.json());

// Finnhub 심볼 변환
function toFinnhubSymbol(code) {
  if (code.endsWith(".KS")) return code; // 그대로
  if (code.endsWith(".KQ")) return code.replace(".KQ", ".KQ"); // 그대로
  return code; // 미국 주식
}

// 주가 조회 API
app.get("/api/prices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = symbols.split(",").filter(Boolean);
  const results = {};

  try {
    // Finnhub은 종목별로 개별 호출 필요 - 병렬로 처리
    const chunkSize = 10;
    for (let i = 0; i < symbolList.length; i += chunkSize) {
      const chunk = symbolList.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (symbol) => {
        try {
          const [quoteRes, prevRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`),
            fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`)
          ]);

          if (!quoteRes.ok) return;
          const q = await quoteRes.json();

          if (q.c && q.c > 0) {
            results[symbol] = {
              price: q.c,       // 현재가
              prevClose: q.pc,  // 전일 종가
              high: q.h,        // 고가
              low: q.l,         // 저가
              volume: null,     // Finnhub 무료플랜 거래량 미제공
            };
          }
        } catch (e) {
          console.error(`Error fetching ${symbol}:`, e.message);
        }
      }));

      // rate limit 방지 (분당 60회)
      if (i + chunkSize < symbolList.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Price fetch error:", err);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
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
