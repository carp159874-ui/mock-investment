import { useState, useEffect, useCallback } from "react";

// ── 상수 ──────────────────────────────────────────────────────────────
const INITIAL_CASH = 10_000_000;
const TEACHER_CODE = "TEACHER2024";

const STOCKS = [
  // KOSPI
  { code: "005930", name: "삼성전자", market: "KOSPI", basePrice: 78000 },
  { code: "000660", name: "SK하이닉스", market: "KOSPI", basePrice: 195000 },
  { code: "005490", name: "POSCO홀딩스", market: "KOSPI", basePrice: 415000 },
  { code: "035420", name: "NAVER", market: "KOSPI", basePrice: 185000 },
  { code: "005380", name: "현대차", market: "KOSPI", basePrice: 243000 },
  { code: "051910", name: "LG화학", market: "KOSPI", basePrice: 310000 },
  { code: "006400", name: "삼성SDI", market: "KOSPI", basePrice: 280000 },
  { code: "035720", name: "카카오", market: "KOSPI", basePrice: 42000 },
  { code: "003550", name: "LG", market: "KOSPI", basePrice: 84000 },
  { code: "096770", name: "SK이노베이션", market: "KOSPI", basePrice: 98000 },
  // KOSDAQ
  { code: "247540", name: "에코프로비엠", market: "KOSDAQ", basePrice: 210000 },
  { code: "086520", name: "에코프로", market: "KOSDAQ", basePrice: 90000 },
  { code: "373220", name: "LG에너지솔루션", market: "KOSDAQ", basePrice: 380000 },
  { code: "196170", name: "알테오젠", market: "KOSDAQ", basePrice: 320000 },
  { code: "214150", name: "클래시스", market: "KOSDAQ", basePrice: 55000 },
  { code: "091990", name: "셀트리온헬스케어", market: "KOSDAQ", basePrice: 68000 },
  { code: "145020", name: "휴젤", market: "KOSDAQ", basePrice: 250000 },
  { code: "263750", name: "펄어비스", market: "KOSDAQ", basePrice: 43000 },
  { code: "293490", name: "카카오게임즈", market: "KOSDAQ", basePrice: 21000 },
  { code: "112040", name: "위메이드", market: "KOSDAQ", basePrice: 35000 },
];

// ── 유틸리티 ────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("ko-KR") ?? "-";
const fmtRate = (r) => {
  if (r == null) return "-";
  const sign = r >= 0 ? "+" : "";
  return `${sign}${r.toFixed(2)}%`;
};

function generatePrices(stocks) {
  return stocks.reduce((acc, s) => {
    const change = (Math.random() - 0.5) * 0.06;
    const price = Math.round(s.basePrice * (1 + change) / 100) * 100 || s.basePrice;
    const prevChange = (Math.random() - 0.5) * 0.04;
    const prevClose = Math.round(s.basePrice * (1 + prevChange) / 100) * 100 || s.basePrice;
    acc[s.code] = { price, prevClose, high: Math.round(price * 1.03), low: Math.round(price * 0.97), volume: Math.floor(Math.random() * 5000000) + 100000 };
    return acc;
  }, {});
}

// ── localStorage helpers ────────────────────────────────────────────────
const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── 전역 상태 초기화 ──────────────────────────────────────────────────
function initState() {
  return {
    users: load("mi_users", {}),
    teams: load("mi_teams", []),
    currentUser: load("mi_currentUser", null),
  };
}

// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [state, setState] = useState(initState);
  const [prices, setPrices] = useState(() => generatePrices(STOCKS));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [market, setMarket] = useState("KOSPI");
  const [searchQ, setSearchQ] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [qty, setQty] = useState(1);
  const [tradeMode, setTradeMode] = useState("buy");
  const [toast, setToast] = useState(null);
  const [loginForm, setLoginForm] = useState({ id: "", pw: "" });
  const [regForm, setRegForm] = useState({ id: "", email: "", pw: "", team: "", isTeacher: false, teacherCode: "" });
  const [authTab, setAuthTab] = useState("login");
  const [nicknameInput, setNicknameInput] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [rankTab, setRankTab] = useState("student");

  // 주가 변동 (30초마다)
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        STOCKS.forEach(s => {
          const cur = prev[s.code];
          const delta = (Math.random() - 0.5) * 0.02;
          const newPrice = Math.max(100, Math.round(cur.price * (1 + delta) / 10) * 10);
          next[s.code] = { ...cur, price: newPrice };
        });
        return next;
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const persist = useCallback((newState) => {
    setState(newState);
    save("mi_users", newState.users);
    save("mi_teams", newState.teams);
    save("mi_currentUser", newState.currentUser);
  }, []);

  // ── 인증 ──────────────────────────────────────────────────────────
  function handleLogin(e) {
    e.preventDefault();
    const u = state.users[loginForm.id];
    if (!u || u.pw !== loginForm.pw) { showToast("아이디 또는 비밀번호가 틀렸습니다.", "error"); return; }
    persist({ ...state, currentUser: loginForm.id });
    setActiveTab("dashboard");
    showToast(`환영합니다, ${u.nickname}님!`);
  }

  function handleRegister(e) {
    e.preventDefault();
    if (state.users[regForm.id]) { showToast("이미 사용 중인 아이디입니다.", "error"); return; }
    if (regForm.isTeacher && regForm.teacherCode !== TEACHER_CODE) { showToast("선생님 코드가 올바르지 않습니다.", "error"); return; }
    const newUser = {
      id: regForm.id, pw: regForm.pw, email: regForm.email,
      nickname: regForm.id, isTeacher: regForm.isTeacher,
      cash: INITIAL_CASH, holdings: {}, trades: [], team: regForm.team || null,
      joinedAt: Date.now(),
    };
    const newUsers = { ...state.users, [regForm.id]: newUser };
    persist({ ...state, users: newUsers, currentUser: regForm.id });
    setActiveTab("dashboard");
    showToast("회원가입 완료! 1,000만원이 지급되었습니다. 🎉");
  }

  function handleLogout() {
    persist({ ...state, currentUser: null });
    setActiveTab("dashboard");
    showToast("로그아웃 되었습니다.");
  }

  // ── 거래 ──────────────────────────────────────────────────────────
  function executeTrade() {
    if (!selectedStock || qty < 1) return;
    const user = state.users[state.currentUser];
    const price = prices[selectedStock.code]?.price ?? selectedStock.basePrice;
    const total = price * qty;
    let updatedUser = { ...user, holdings: { ...user.holdings }, trades: [...user.trades] };

    if (tradeMode === "buy") {
      if (user.cash < total) { showToast("잔액이 부족합니다.", "error"); return; }
      updatedUser.cash -= total;
      const prev = updatedUser.holdings[selectedStock.code];
      if (prev) {
        updatedUser.holdings[selectedStock.code] = {
          ...prev, qty: prev.qty + qty,
          avgPrice: Math.round((prev.avgPrice * prev.qty + price * qty) / (prev.qty + qty)),
        };
      } else {
        updatedUser.holdings[selectedStock.code] = { code: selectedStock.code, name: selectedStock.name, qty, avgPrice: price };
      }
      updatedUser.trades.push({ type: "buy", code: selectedStock.code, name: selectedStock.name, qty, price, total, date: Date.now() });
      showToast(`${selectedStock.name} ${qty}주 매수 완료! (-${fmt(total)}원)`);
    } else {
      const h = updatedUser.holdings[selectedStock.code];
      if (!h || h.qty < qty) { showToast("보유 주식이 부족합니다.", "error"); return; }
      updatedUser.cash += total;
      if (h.qty === qty) delete updatedUser.holdings[selectedStock.code];
      else updatedUser.holdings[selectedStock.code] = { ...h, qty: h.qty - qty };
      updatedUser.trades.push({ type: "sell", code: selectedStock.code, name: selectedStock.name, qty, price, total, date: Date.now() });
      showToast(`${selectedStock.name} ${qty}주 매도 완료! (+${fmt(total)}원)`);
    }
    persist({ ...state, users: { ...state.users, [state.currentUser]: updatedUser } });
    setQty(1);
  }

  // ── 포트폴리오 계산 ────────────────────────────────────────────────
  function calcPortfolio(user) {
    if (!user) return { cash: 0, stockVal: 0, total: 0, rate: 0 };
    const stockVal = Object.values(user.holdings).reduce((sum, h) => {
      const p = prices[h.code]?.price ?? h.avgPrice;
      return sum + p * h.qty;
    }, 0);
    const total = user.cash + stockVal;
    const rate = ((total - INITIAL_CASH) / INITIAL_CASH) * 100;
    return { cash: user.cash, stockVal, total, rate };
  }

  // ── 랭킹 ──────────────────────────────────────────────────────────
  function getRankings() {
    return Object.values(state.users)
      .filter(u => !u.isTeacher)
      .map(u => ({ ...u, ...calcPortfolio(u) }))
      .sort((a, b) => b.rate - a.rate);
  }

  function getTeamRankings() {
    const teamMap = {};
    getRankings().forEach(u => {
      if (!u.team) return;
      if (!teamMap[u.team]) teamMap[u.team] = { name: u.team, rates: [], total: 0 };
      teamMap[u.team].rates.push(u.rate);
    });
    return Object.values(teamMap)
      .map(t => ({ ...t, avgRate: t.rates.reduce((a, b) => a + b, 0) / t.rates.length }))
      .sort((a, b) => b.avgRate - a.avgRate);
  }

  // ── 관리자: 팀 생성 ─────────────────────────────────────────────────
  function createTeam() {
    if (!newTeamName.trim()) return;
    if (state.teams.includes(newTeamName)) { showToast("이미 있는 팀입니다.", "error"); return; }
    const newTeams = [...state.teams, newTeamName];
    persist({ ...state, teams: newTeams });
    setNewTeamName("");
    showToast(`${newTeamName} 팀 생성 완료!`);
  }

  function deleteTeam(name) {
    const newTeams = state.teams.filter(t => t !== name);
    persist({ ...state, teams: newTeams });
    showToast(`${name} 팀 삭제 완료.`);
  }

  function resetUser(id) {
    const u = state.users[id];
    if (!u) return;
    const reset = { ...u, cash: INITIAL_CASH, holdings: {}, trades: [] };
    persist({ ...state, users: { ...state.users, [id]: reset } });
    showToast(`${u.nickname} 초기화 완료.`);
  }

  function saveNickname() {
    if (!nicknameInput.trim() || !state.currentUser) return;
    const u = state.users[state.currentUser];
    const updated = { ...u, nickname: nicknameInput.trim() };
    persist({ ...state, users: { ...state.users, [state.currentUser]: updated } });
    showToast("닉네임이 변경되었습니다.");
    setNicknameInput("");
  }

  // ── 파생 변수 ──────────────────────────────────────────────────────
  const user = state.currentUser ? state.users[state.currentUser] : null;
  const pf = calcPortfolio(user);
  const filteredStocks = STOCKS.filter(s =>
    s.market === market && (s.name.includes(searchQ) || s.code.includes(searchQ))
  );

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={styles.root}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>📈 모의투자</div>
        {[
          ["dashboard", "🏠", "대시보드"],
          ["trade", "💹", "주식 거래"],
          ["history", "📋", "거래 내역"],
          ["stocks", "📊", "종목 목록"],
          ["ranking", "🏆", "랭킹"],
          ...(user?.isTeacher ? [["admin", "⚙️", "관리자"]] : []),
          ["mypage", "👤", "마이페이지"],
        ].map(([tab, icon, label]) => (
          <button key={tab} style={{ ...styles.navBtn, ...(activeTab === tab ? styles.navBtnActive : {}) }}
            onClick={() => setActiveTab(tab)}>
            <span>{icon}</span> {label}
          </button>
        ))}
        {user && (
          <button style={{ ...styles.navBtn, marginTop: "auto" }} onClick={handleLogout}>
            🚪 로그아웃
          </button>
        )}
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* ── 비로그인 ── */}
        {!user && (
          <div style={styles.authWrap}>
            <h1 style={styles.authTitle}>📈 주식 모의투자</h1>
            <p style={styles.authSub}>실전처럼 배우는 한국 주식 투자 시뮬레이터</p>
            <div style={styles.badges}>
              <span style={styles.badge}>💰 초기 자금 1,000만원</span>
              <span style={styles.badge}>📊 실시간 주가 연동</span>
              <span style={styles.badge}>🏆 수익률 경쟁</span>
            </div>
            <div style={styles.authTabs}>
              {["login", "register"].map(t => (
                <button key={t} style={{ ...styles.authTabBtn, ...(authTab === t ? styles.authTabBtnActive : {}) }}
                  onClick={() => setAuthTab(t)}>
                  {t === "login" ? "로그인" : "회원가입"}
                </button>
              ))}
            </div>
            {authTab === "login" ? (
              <form onSubmit={handleLogin} style={styles.form}>
                <input style={styles.input} placeholder="아이디" value={loginForm.id}
                  onChange={e => setLoginForm({ ...loginForm, id: e.target.value })} />
                <input style={styles.input} placeholder="비밀번호" type="password" value={loginForm.pw}
                  onChange={e => setLoginForm({ ...loginForm, pw: e.target.value })} />
                <button style={styles.btnPrimary} type="submit">로그인</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={styles.form}>
                <input style={styles.input} placeholder="아이디" required value={regForm.id}
                  onChange={e => setRegForm({ ...regForm, id: e.target.value })} />
                <input style={styles.input} placeholder="이메일" type="email" value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                <input style={styles.input} placeholder="비밀번호" type="password" required value={regForm.pw}
                  onChange={e => setRegForm({ ...regForm, pw: e.target.value })} />
                <select style={styles.input} value={regForm.team}
                  onChange={e => setRegForm({ ...regForm, team: e.target.value })}>
                  <option value="">팀 선택 (선택사항)</option>
                  {state.teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label style={styles.checkRow}>
                  <input type="checkbox" checked={regForm.isTeacher}
                    onChange={e => setRegForm({ ...regForm, isTeacher: e.target.checked })} />
                  선생님 계정으로 가입
                </label>
                {regForm.isTeacher && (
                  <input style={styles.input} placeholder="선생님 코드" value={regForm.teacherCode}
                    onChange={e => setRegForm({ ...regForm, teacherCode: e.target.value })} />
                )}
                <button style={styles.btnPrimary} type="submit">회원가입 (초기 자금 1,000만원 지급)</button>
              </form>
            )}
          </div>
        )}

        {/* ── 대시보드 ── */}
        {user && activeTab === "dashboard" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>내 포트폴리오</h2>
            <div style={styles.pfGrid}>
              {[
                ["보유 현금", fmt(pf.cash) + "원"],
                ["주식 평가액", fmt(pf.stockVal) + "원"],
                ["총 자산", fmt(pf.total) + "원"],
                ["총 수익률", fmtRate(pf.rate)],
              ].map(([label, val], i) => (
                <div key={i} style={styles.pfCard}>
                  <div style={styles.pfLabel}>{label}</div>
                  <div style={{ ...styles.pfVal, color: i === 3 ? (pf.rate >= 0 ? "#10b981" : "#ef4444") : "#fff" }}>{val}</div>
                </div>
              ))}
            </div>
            <h3 style={styles.sectionTitle}>보유 종목</h3>
            {Object.keys(user.holdings).length === 0 ? (
              <p style={styles.empty}>보유 종목이 없습니다.</p>
            ) : (
              <table style={styles.table}>
                <thead><tr>{["종목", "보유수량", "평균단가", "현재가", "평가손익", "수익률"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {Object.values(user.holdings).map(h => {
                    const cur = prices[h.code]?.price ?? h.avgPrice;
                    const pnl = (cur - h.avgPrice) * h.qty;
                    const rate = ((cur - h.avgPrice) / h.avgPrice) * 100;
                    return (
                      <tr key={h.code}>
                        <td style={styles.td}>{h.name}</td>
                        <td style={styles.td}>{fmt(h.qty)}주</td>
                        <td style={styles.td}>{fmt(h.avgPrice)}원</td>
                        <td style={styles.td}>{fmt(cur)}원</td>
                        <td style={{ ...styles.td, color: pnl >= 0 ? "#10b981" : "#ef4444" }}>{fmt(Math.round(pnl))}원</td>
                        <td style={{ ...styles.td, color: rate >= 0 ? "#10b981" : "#ef4444" }}>{fmtRate(rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── 주식 거래 ── */}
        {user && activeTab === "trade" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>주식 거래</h2>
            <div style={styles.tradeLayout}>
              {/* 종목 검색 */}
              <div style={styles.tradeLeft}>
                <input style={styles.input} placeholder="종목 검색" value={searchQ}
                  onChange={e => setSearchQ(e.target.value)} />
                <div style={styles.marketTabs}>
                  {["KOSPI", "KOSDAQ"].map(m => (
                    <button key={m} style={{ ...styles.mktBtn, ...(market === m ? styles.mktBtnActive : {}) }}
                      onClick={() => setMarket(m)}>{m}</button>
                  ))}
                </div>
                <div style={styles.stockList}>
                  {filteredStocks.map(s => {
                    const p = prices[s.code];
                    const chg = p ? ((p.price - p.prevClose) / p.prevClose * 100) : 0;
                    return (
                      <div key={s.code} style={{ ...styles.stockRow, ...(selectedStock?.code === s.code ? styles.stockRowSel : {}) }}
                        onClick={() => { setSelectedStock(s); setQty(1); }}>
                        <div>
                          <div style={styles.stockName}>{s.name}</div>
                          <div style={styles.stockCode}>{s.code}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={styles.stockPrice}>{fmt(p?.price)}원</div>
                          <div style={{ color: chg >= 0 ? "#10b981" : "#ef4444", fontSize: 12 }}>{fmtRate(chg)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 거래 패널 */}
              <div style={styles.tradeRight}>
                {selectedStock ? (
                  <>
                    <h3 style={{ color: "#fff", marginBottom: 16 }}>{selectedStock.name} ({selectedStock.code})</h3>
                    {(() => {
                      const p = prices[selectedStock.code];
                      const chg = p ? ((p.price - p.prevClose) / p.prevClose * 100) : 0;
                      return (
                        <div style={styles.priceDetail}>
                          <div style={styles.bigPrice}>{fmt(p?.price)}원</div>
                          <div style={{ color: chg >= 0 ? "#10b981" : "#ef4444" }}>{fmtRate(chg)}</div>
                          <div style={styles.priceRow}><span>전일종가</span><span>{fmt(p?.prevClose)}원</span></div>
                          <div style={styles.priceRow}><span>고가</span><span style={{ color: "#ef4444" }}>{fmt(p?.high)}원</span></div>
                          <div style={styles.priceRow}><span>저가</span><span style={{ color: "#3b82f6" }}>{fmt(p?.low)}원</span></div>
                          <div style={styles.priceRow}><span>거래량</span><span>{fmt(p?.volume)}</span></div>
                        </div>
                      );
                    })()}
                    <div style={styles.tradeModes}>
                      {["buy", "sell"].map(m => (
                        <button key={m} style={{ ...styles.tradeModeBtn, ...(tradeMode === m ? (m === "buy" ? styles.buyActive : styles.sellActive) : {}) }}
                          onClick={() => setTradeMode(m)}>
                          {m === "buy" ? "매수" : "매도"}
                        </button>
                      ))}
                    </div>
                    <div style={styles.qtyRow}>
                      {[-10, -1].map(d => <button key={d} style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q + d))}>{d}</button>)}
                      <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{qty}</span>
                      {[1, 10].map(d => <button key={d} style={styles.qtyBtn} onClick={() => setQty(q => q + d)}>+{d}</button>)}
                    </div>
                    <div style={styles.priceRow}><span style={{ color: "#9ca3af" }}>현재가</span><span style={{ color: "#fff" }}>{fmt(prices[selectedStock.code]?.price)}원</span></div>
                    <div style={styles.priceRow}><span style={{ color: "#9ca3af" }}>예상 금액</span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{fmt((prices[selectedStock.code]?.price ?? 0) * qty)}원</span></div>
                    <div style={styles.priceRow}><span style={{ color: "#9ca3af" }}>보유 수량</span><span style={{ color: "#fff" }}>{user.holdings[selectedStock.code]?.qty ?? 0}주</span></div>
                    <button style={{ ...styles.btnPrimary, background: tradeMode === "buy" ? "#ef4444" : "#3b82f6", marginTop: 16 }}
                      onClick={executeTrade}>
                      {tradeMode === "buy" ? "매수하기" : "매도하기"}
                    </button>
                  </>
                ) : (
                  <div style={styles.noSelect}>좌측에서 종목을 선택하세요</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 거래 내역 ── */}
        {user && activeTab === "history" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>거래 내역</h2>
            {user.trades.length === 0 ? <p style={styles.empty}>거래 내역이 없습니다.</p> : (
              <table style={styles.table}>
                <thead><tr>{["유형", "종목", "수량", "가격", "금액", "일시"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...user.trades].reverse().map((t, i) => (
                    <tr key={i}>
                      <td style={{ ...styles.td, color: t.type === "buy" ? "#ef4444" : "#3b82f6", fontWeight: 700 }}>{t.type === "buy" ? "매수" : "매도"}</td>
                      <td style={styles.td}>{t.name}</td>
                      <td style={styles.td}>{fmt(t.qty)}주</td>
                      <td style={styles.td}>{fmt(t.price)}원</td>
                      <td style={styles.td}>{fmt(t.total)}원</td>
                      <td style={styles.td}>{new Date(t.date).toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── 종목 목록 ── */}
        {user && activeTab === "stocks" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>전체 종목</h2>
            <div style={styles.marketTabs}>
              {["KOSPI", "KOSDAQ"].map(m => (
                <button key={m} style={{ ...styles.mktBtn, ...(market === m ? styles.mktBtnActive : {}) }}
                  onClick={() => setMarket(m)}>{m}</button>
              ))}
            </div>
            <table style={styles.table}>
              <thead><tr>{["종목명", "코드", "현재가", "전일비", "등락률", "거래량"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {STOCKS.filter(s => s.market === market).map(s => {
                  const p = prices[s.code];
                  const diff = p ? p.price - p.prevClose : 0;
                  const rate = p ? (diff / p.prevClose * 100) : 0;
                  return (
                    <tr key={s.code} style={{ cursor: "pointer" }}
                      onClick={() => { setSelectedStock(s); setActiveTab("trade"); }}>
                      <td style={styles.td}>{s.name}</td>
                      <td style={styles.td}>{s.code}</td>
                      <td style={styles.td}>{fmt(p?.price)}원</td>
                      <td style={{ ...styles.td, color: diff >= 0 ? "#ef4444" : "#3b82f6" }}>{diff >= 0 ? "▲" : "▼"} {fmt(Math.abs(diff))}</td>
                      <td style={{ ...styles.td, color: rate >= 0 ? "#ef4444" : "#3b82f6" }}>{fmtRate(rate)}</td>
                      <td style={styles.td}>{fmt(p?.volume)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 랭킹 ── */}
        {user && activeTab === "ranking" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>🏆 랭킹</h2>
            <div style={styles.marketTabs}>
              {[["student", "학생 랭킹"], ["team", "팀 랭킹"]].map(([t, l]) => (
                <button key={t} style={{ ...styles.mktBtn, ...(rankTab === t ? styles.mktBtnActive : {}) }}
                  onClick={() => setRankTab(t)}>{l}</button>
              ))}
            </div>
            {rankTab === "student" ? (
              <table style={styles.table}>
                <thead><tr>{["순위", "닉네임", "팀", "총 자산", "수익률"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {getRankings().map((u, i) => (
                    <tr key={u.id} style={{ background: u.id === state.currentUser ? "rgba(99,102,241,0.15)" : "" }}>
                      <td style={styles.td}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                      <td style={styles.td}>{u.nickname}</td>
                      <td style={styles.td}>{u.team || "-"}</td>
                      <td style={styles.td}>{fmt(Math.round(u.total))}원</td>
                      <td style={{ ...styles.td, color: u.rate >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{fmtRate(u.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={styles.table}>
                <thead><tr>{["순위", "팀명", "평균 수익률", "팀원 수"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {getTeamRankings().map((t, i) => (
                    <tr key={t.name}>
                      <td style={styles.td}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                      <td style={styles.td}>{t.name}</td>
                      <td style={{ ...styles.td, color: t.avgRate >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{fmtRate(t.avgRate)}</td>
                      <td style={styles.td}>{t.rates.length}명</td>
                    </tr>
                  ))}
                  {getTeamRankings().length === 0 && <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "#6b7280" }}>팀 데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── 관리자 ── */}
        {user?.isTeacher && activeTab === "admin" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>⚙️ 관리자 패널</h2>
            <h3 style={styles.sectionTitle}>팀 관리</h3>
            <div style={styles.flexRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="새 팀 이름" value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)} />
              <button style={{ ...styles.btnPrimary, width: "auto", padding: "10px 20px" }} onClick={createTeam}>팀 만들기</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {state.teams.map(t => (
                <div key={t} style={styles.teamChip}>
                  {t}
                  <button style={styles.chipDel} onClick={() => deleteTeam(t)}>✕</button>
                </div>
              ))}
            </div>
            <h3 style={{ ...styles.sectionTitle, marginTop: 32 }}>학생 관리</h3>
            <table style={styles.table}>
              <thead><tr>{["아이디", "닉네임", "팀", "총 자산", "수익률", "초기화"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {Object.values(state.users).filter(u => !u.isTeacher).map(u => {
                  const p = calcPortfolio(u);
                  return (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.id}</td>
                      <td style={styles.td}>{u.nickname}</td>
                      <td style={styles.td}>{u.team || "-"}</td>
                      <td style={styles.td}>{fmt(Math.round(p.total))}원</td>
                      <td style={{ ...styles.td, color: p.rate >= 0 ? "#10b981" : "#ef4444" }}>{fmtRate(p.rate)}</td>
                      <td style={styles.td}>
                        <button style={{ ...styles.btnPrimary, width: "auto", padding: "4px 12px", fontSize: 12, background: "#6b7280" }}
                          onClick={() => resetUser(u.id)}>초기화</button>
                      </td>
                    </tr>
                  );
                })}
                {Object.values(state.users).filter(u => !u.isTeacher).length === 0 && (
                  <tr><td colSpan={6} style={{ ...styles.td, textAlign: "center", color: "#6b7280" }}>등록된 학생이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 마이페이지 ── */}
        {user && activeTab === "mypage" && (
          <div style={styles.page}>
            <h2 style={styles.pageTitle}>👤 마이페이지</h2>
            <div style={styles.pfCard}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 8 }}>👤</div>
              <div style={{ textAlign: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>{user.nickname}</div>
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14 }}>{user.id}</div>
              {user.isTeacher && <div style={{ textAlign: "center", color: "#f59e0b", marginTop: 4 }}>👩‍🏫 선생님</div>}
            </div>
            <h3 style={styles.sectionTitle}>닉네임 변경</h3>
            <p style={{ color: "#9ca3af", marginBottom: 12, fontSize: 14 }}>랭킹과 화면에 표시되는 이름을 변경할 수 있습니다.</p>
            <p style={{ color: "#d1d5db", marginBottom: 8 }}>현재 닉네임: <strong style={{ color: "#fff" }}>{user.nickname}</strong></p>
            <div style={styles.flexRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="새 닉네임 (최대 20자)" maxLength={20}
                value={nicknameInput} onChange={e => setNicknameInput(e.target.value)} />
              <button style={{ ...styles.btnPrimary, width: "auto", padding: "10px 20px" }} onClick={saveNickname}>저장</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── 스타일 ──────────────────────────────────────────────────────────────
const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", color: "#e2e8f0" },
  sidebar: { width: 200, background: "#1e293b", display: "flex", flexDirection: "column", padding: "20px 12px", gap: 4, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { fontSize: 20, fontWeight: 800, color: "#fff", padding: "8px 12px", marginBottom: 16 },
  navBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: 500, textAlign: "left", transition: "all .15s" },
  navBtnActive: { background: "#334155", color: "#fff" },
  main: { flex: 1, padding: "32px 40px", overflowY: "auto" },
  page: { maxWidth: 900, margin: "0 auto" },
  pageTitle: { fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 },
  pfGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 },
  pfCard: { background: "#1e293b", borderRadius: 12, padding: 20 },
  pfLabel: { fontSize: 13, color: "#9ca3af", marginBottom: 6 },
  pfVal: { fontSize: 20, fontWeight: 700 },
  table: { width: "100%", borderCollapse: "collapse", background: "#1e293b", borderRadius: 12, overflow: "hidden" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 13, color: "#9ca3af", borderBottom: "1px solid #334155", background: "#162032" },
  td: { padding: "12px 16px", fontSize: 14, color: "#d1d5db", borderBottom: "1px solid #1e293b" },
  empty: { color: "#6b7280", textAlign: "center", padding: "40px 0" },
  // auth
  authWrap: { maxWidth: 480, margin: "60px auto", padding: "0 16px" },
  authTitle: { fontSize: 32, fontWeight: 900, color: "#fff", textAlign: "center" },
  authSub: { color: "#9ca3af", textAlign: "center", marginBottom: 20 },
  badges: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" },
  badge: { background: "#334155", color: "#e2e8f0", padding: "6px 14px", borderRadius: 20, fontSize: 13 },
  authTabs: { display: "flex", gap: 0, marginBottom: 20, background: "#1e293b", borderRadius: 10, padding: 4 },
  authTabBtn: { flex: 1, padding: "10px", border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", borderRadius: 8, fontSize: 14, fontWeight: 600 },
  authTabBtnActive: { background: "#334155", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  checkRow: { display: "flex", alignItems: "center", gap: 8, color: "#d1d5db", cursor: "pointer" },
  btnPrimary: { padding: "12px 0", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" },
  // trade
  tradeLayout: { display: "flex", gap: 20 },
  tradeLeft: { width: 280, flexShrink: 0 },
  tradeRight: { flex: 1, background: "#1e293b", borderRadius: 12, padding: 24, minHeight: 400 },
  marketTabs: { display: "flex", gap: 8, marginBottom: 12, marginTop: 8 },
  mktBtn: { padding: "6px 16px", border: "1px solid #334155", borderRadius: 6, background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 13 },
  mktBtnActive: { background: "#334155", color: "#fff", borderColor: "#6366f1" },
  stockList: { display: "flex", flexDirection: "column", gap: 2, maxHeight: "60vh", overflowY: "auto" },
  stockRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, cursor: "pointer", background: "#1e293b" },
  stockRowSel: { background: "#334155", outline: "1px solid #6366f1" },
  stockName: { fontSize: 14, fontWeight: 600, color: "#fff" },
  stockCode: { fontSize: 12, color: "#6b7280" },
  stockPrice: { fontSize: 14, fontWeight: 600, color: "#fff" },
  bigPrice: { fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 4 },
  priceDetail: { background: "#162032", borderRadius: 10, padding: 16, marginBottom: 16 },
  priceRow: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14, color: "#9ca3af", borderBottom: "1px solid #1e293b" },
  tradeModes: { display: "flex", gap: 8, marginBottom: 16 },
  tradeModeBtn: { flex: 1, padding: "10px", border: "1px solid #334155", borderRadius: 8, background: "transparent", color: "#9ca3af", cursor: "pointer", fontWeight: 700, fontSize: 15 },
  buyActive: { background: "#ef444420", color: "#ef4444", borderColor: "#ef4444" },
  sellActive: { background: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" },
  qtyRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, justifyContent: "center" },
  qtyBtn: { padding: "6px 14px", background: "#334155", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  noSelect: { color: "#6b7280", textAlign: "center", paddingTop: 80 },
  // admin
  flexRow: { display: "flex", gap: 12, alignItems: "center" },
  teamChip: { display: "flex", alignItems: "center", gap: 6, background: "#334155", color: "#e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 14 },
  chipDel: { background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14, lineHeight: 1 },
  // toast
  toast: { position: "fixed", top: 24, right: 24, padding: "14px 24px", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.4)" },
};
