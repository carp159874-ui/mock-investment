import { useState, useEffect, useCallback, useRef } from "react";

const INITIAL_CASH = 10_000_000;
const TEACHER_CODE = "TEACHER2024";
const PRICE_REFRESH_INTERVAL = 60000;

const STOCKS = [
  // KOSPI 100
  { code: "005930.KS", name: "삼성전자", market: "KOSPI" },
  { code: "000660.KS", name: "SK하이닉스", market: "KOSPI" },
  { code: "207940.KS", name: "삼성바이오로직스", market: "KOSPI" },
  { code: "005380.KS", name: "현대차", market: "KOSPI" },
  { code: "373220.KS", name: "LG에너지솔루션", market: "KOSPI" },
  { code: "068270.KS", name: "셀트리온", market: "KOSPI" },
  { code: "035420.KS", name: "NAVER", market: "KOSPI" },
  { code: "051910.KS", name: "LG화학", market: "KOSPI" },
  { code: "006400.KS", name: "삼성SDI", market: "KOSPI" },
  { code: "035720.KS", name: "카카오", market: "KOSPI" },
  { code: "105560.KS", name: "KB금융", market: "KOSPI" },
  { code: "055550.KS", name: "신한지주", market: "KOSPI" },
  { code: "000270.KS", name: "기아", market: "KOSPI" },
  { code: "003550.KS", name: "LG", market: "KOSPI" },
  { code: "096770.KS", name: "SK이노베이션", market: "KOSPI" },
  { code: "032830.KS", name: "삼성생명", market: "KOSPI" },
  { code: "086790.KS", name: "하나금융지주", market: "KOSPI" },
  { code: "028260.KS", name: "삼성물산", market: "KOSPI" },
  { code: "034730.KS", name: "SK", market: "KOSPI" },
  { code: "066570.KS", name: "LG전자", market: "KOSPI" },
  { code: "015760.KS", name: "한국전력", market: "KOSPI" },
  { code: "017670.KS", name: "SK텔레콤", market: "KOSPI" },
  { code: "030200.KS", name: "KT", market: "KOSPI" },
  { code: "011200.KS", name: "HMM", market: "KOSPI" },
  { code: "009150.KS", name: "삼성전기", market: "KOSPI" },
  { code: "000810.KS", name: "삼성화재", market: "KOSPI" },
  { code: "018260.KS", name: "삼성에스디에스", market: "KOSPI" },
  { code: "010950.KS", name: "S-Oil", market: "KOSPI" },
  { code: "316140.KS", name: "우리금융지주", market: "KOSPI" },
  { code: "003490.KS", name: "대한항공", market: "KOSPI" },
  { code: "047050.KS", name: "포스코인터내셔널", market: "KOSPI" },
  { code: "138040.KS", name: "메리츠금융지주", market: "KOSPI" },
  { code: "010130.KS", name: "고려아연", market: "KOSPI" },
  { code: "036570.KS", name: "엔씨소프트", market: "KOSPI" },
  { code: "329180.KS", name: "HD현대중공업", market: "KOSPI" },
  { code: "009830.KS", name: "한화솔루션", market: "KOSPI" },
  { code: "042660.KS", name: "한화오션", market: "KOSPI" },
  { code: "000100.KS", name: "유한양행", market: "KOSPI" },
  { code: "024110.KS", name: "기업은행", market: "KOSPI" },
  { code: "005490.KS", name: "POSCO홀딩스", market: "KOSPI" },
  { code: "033780.KS", name: "KT&G", market: "KOSPI" },
  { code: "271560.KS", name: "오리온", market: "KOSPI" },
  { code: "006800.KS", name: "미래에셋증권", market: "KOSPI" },
  { code: "000720.KS", name: "현대건설", market: "KOSPI" },
  { code: "161390.KS", name: "한국타이어앤테크놀로지", market: "KOSPI" },
  { code: "090430.KS", name: "아모레퍼시픽", market: "KOSPI" },
  { code: "000080.KS", name: "하이트진로", market: "KOSPI" },
  { code: "097950.KS", name: "CJ제일제당", market: "KOSPI" },
  { code: "011070.KS", name: "LG이노텍", market: "KOSPI" },
  { code: "004020.KS", name: "현대제철", market: "KOSPI" },
  { code: "009540.KS", name: "HD한국조선해양", market: "KOSPI" },
  { code: "010620.KS", name: "HD현대미포", market: "KOSPI" },
  { code: "000880.KS", name: "한화", market: "KOSPI" },
  { code: "004170.KS", name: "신세계", market: "KOSPI" },
  { code: "069960.KS", name: "현대백화점", market: "KOSPI" },
  { code: "005830.KS", name: "DB손해보험", market: "KOSPI" },
  { code: "180640.KS", name: "한진칼", market: "KOSPI" },
  { code: "282330.KS", name: "BGF리테일", market: "KOSPI" },
  { code: "003230.KS", name: "삼양식품", market: "KOSPI" },
  { code: "005300.KS", name: "롯데칠성", market: "KOSPI" },
  { code: "071050.KS", name: "한국금융지주", market: "KOSPI" },
  { code: "016360.KS", name: "삼성증권", market: "KOSPI" },
  { code: "030000.KS", name: "제일기획", market: "KOSPI" },
  { code: "047810.KS", name: "한국항공우주", market: "KOSPI" },
  { code: "001450.KS", name: "현대해상", market: "KOSPI" },
  { code: "012330.KS", name: "현대모비스", market: "KOSPI" },
  { code: "064350.KS", name: "현대로템", market: "KOSPI" },
  { code: "000060.KS", name: "메리츠화재", market: "KOSPI" },
  { code: "007310.KS", name: "오뚜기", market: "KOSPI" },
  { code: "002380.KS", name: "KCC", market: "KOSPI" },
  { code: "010140.KS", name: "삼성중공업", market: "KOSPI" },
  { code: "014680.KS", name: "한솔케미칼", market: "KOSPI" },
  { code: "004800.KS", name: "효성", market: "KOSPI" },
  { code: "005940.KS", name: "NH투자증권", market: "KOSPI" },
  { code: "023530.KS", name: "롯데쇼핑", market: "KOSPI" },
  { code: "011780.KS", name: "금호석유", market: "KOSPI" },
  { code: "004000.KS", name: "롯데정밀화학", market: "KOSPI" },
  { code: "021240.KS", name: "코웨이", market: "KOSPI" },
  { code: "006360.KS", name: "GS건설", market: "KOSPI" },
  { code: "001040.KS", name: "CJ", market: "KOSPI" },
  { code: "007070.KS", name: "GS리테일", market: "KOSPI" },
  { code: "008770.KS", name: "호텔신라", market: "KOSPI" },
  { code: "002790.KS", name: "아모레G", market: "KOSPI" },
  { code: "010060.KS", name: "OCI홀딩스", market: "KOSPI" },
  { code: "011790.KS", name: "SKC", market: "KOSPI" },
  { code: "001800.KS", name: "오리온홀딩스", market: "KOSPI" },
  { code: "003410.KS", name: "쌍용C&E", market: "KOSPI" },
  { code: "006650.KS", name: "대한유화", market: "KOSPI" },
  { code: "001120.KS", name: "LX인터내셔널", market: "KOSPI" },
  { code: "008060.KS", name: "대덕전자", market: "KOSPI" },
  { code: "004170.KS", name: "신세계", market: "KOSPI" },
  { code: "009420.KS", name: "한올바이오파마", market: "KOSPI" },
  { code: "032640.KS", name: "LG유플러스", market: "KOSPI" },
  { code: "006090.KS", name: "사조씨푸드", market: "KOSPI" },
  { code: "047050.KS", name: "포스코인터내셔널", market: "KOSPI" },
  { code: "005940.KS", name: "NH투자증권", market: "KOSPI" },
  { code: "016880.KS", name: "웅진", market: "KOSPI" },
  { code: "000157.KS", name: "두산", market: "KOSPI" },
  { code: "025270.KS", name: "서한", market: "KOSPI" },

  // KOSDAQ 100
  { code: "247540.KQ", name: "에코프로비엠", market: "KOSDAQ" },
  { code: "086520.KQ", name: "에코프로", market: "KOSDAQ" },
  { code: "196170.KQ", name: "알테오젠", market: "KOSDAQ" },
  { code: "214150.KQ", name: "클래시스", market: "KOSDAQ" },
  { code: "145020.KQ", name: "휴젤", market: "KOSDAQ" },
  { code: "091990.KQ", name: "셀트리온헬스케어", market: "KOSDAQ" },
  { code: "263750.KQ", name: "펄어비스", market: "KOSDAQ" },
  { code: "293490.KQ", name: "카카오게임즈", market: "KOSDAQ" },
  { code: "112040.KQ", name: "위메이드", market: "KOSDAQ" },
  { code: "357780.KQ", name: "솔브레인", market: "KOSDAQ" },
  { code: "041510.KQ", name: "에스엠", market: "KOSDAQ" },
  { code: "035900.KQ", name: "JYP Ent.", market: "KOSDAQ" },
  { code: "122870.KQ", name: "와이지엔터테인먼트", market: "KOSDAQ" },
  { code: "053800.KQ", name: "안랩", market: "KOSDAQ" },
  { code: "096530.KQ", name: "씨젠", market: "KOSDAQ" },
  { code: "039030.KQ", name: "이오테크닉스", market: "KOSDAQ" },
  { code: "131290.KQ", name: "코스맥스", market: "KOSDAQ" },
  { code: "048260.KQ", name: "오스템임플란트", market: "KOSDAQ" },
  { code: "141080.KQ", name: "레고켐바이오", market: "KOSDAQ" },
  { code: "240810.KQ", name: "원익IPS", market: "KOSDAQ" },
  { code: "108320.KQ", name: "LX세미콘", market: "KOSDAQ" },
  { code: "068760.KQ", name: "셀트리온제약", market: "KOSDAQ" },
  { code: "067630.KQ", name: "HLB생명과학", market: "KOSDAQ" },
  { code: "028300.KQ", name: "HLB", market: "KOSDAQ" },
  { code: "403870.KQ", name: "HPSP", market: "KOSDAQ" },
  { code: "058470.KQ", name: "리노공업", market: "KOSDAQ" },
  { code: "064760.KQ", name: "티씨케이", market: "KOSDAQ" },
  { code: "084370.KQ", name: "유진테크", market: "KOSDAQ" },
  { code: "046890.KQ", name: "서울반도체", market: "KOSDAQ" },
  { code: "237690.KQ", name: "에스티팜", market: "KOSDAQ" },
  { code: "035760.KQ", name: "CJ ENM", market: "KOSDAQ" },
  { code: "251270.KQ", name: "넷마블", market: "KOSDAQ" },
  { code: "078600.KQ", name: "대주전자재료", market: "KOSDAQ" },
  { code: "036810.KQ", name: "에프에스티", market: "KOSDAQ" },
  { code: "100120.KQ", name: "뷰웍스", market: "KOSDAQ" },
  { code: "189300.KQ", name: "인터플렉스", market: "KOSDAQ" },
  { code: "036640.KQ", name: "파트론", market: "KOSDAQ" },
  { code: "060720.KQ", name: "KH바텍", market: "KOSDAQ" },
  { code: "025900.KQ", name: "동화기업", market: "KOSDAQ" },
  { code: "064290.KQ", name: "인텍플러스", market: "KOSDAQ" },
  { code: "033640.KQ", name: "네패스", market: "KOSDAQ" },
  { code: "054620.KQ", name: "APS홀딩스", market: "KOSDAQ" },
  { code: "078070.KQ", name: "유비쿼스홀딩스", market: "KOSDAQ" },
  { code: "039440.KQ", name: "에스티아이", market: "KOSDAQ" },
  { code: "080420.KQ", name: "모베이스", market: "KOSDAQ" },
  { code: "222080.KQ", name: "씨아이에스", market: "KOSDAQ" },
  { code: "137400.KQ", name: "피엔티", market: "KOSDAQ" },
  { code: "060370.KQ", name: "LS마린솔루션", market: "KOSDAQ" },
  { code: "950080.KQ", name: "에코마케팅", market: "KOSDAQ" },
  { code: "950070.KQ", name: "코나아이", market: "KOSDAQ" },
  { code: "101490.KQ", name: "에스앤에스텍", market: "KOSDAQ" },
  { code: "069510.KQ", name: "에스텍", market: "KOSDAQ" },
  { code: "036200.KQ", name: "유니셈", market: "KOSDAQ" },
  { code: "065680.KQ", name: "우주일렉트로", market: "KOSDAQ" },
  { code: "049520.KQ", name: "유아이디", market: "KOSDAQ" },
  { code: "119860.KQ", name: "다나와", market: "KOSDAQ" },
  { code: "089980.KQ", name: "성우하이텍", market: "KOSDAQ" },
  { code: "204210.KQ", name: "모트렉스", market: "KOSDAQ" },
  { code: "066670.KQ", name: "디스플레이텍", market: "KOSDAQ" },
  { code: "950160.KQ", name: "코오롱티슈진", market: "KOSDAQ" },
  { code: "140410.KQ", name: "메지온", market: "KOSDAQ" },
  { code: "950130.KQ", name: "엑세스바이오", market: "KOSDAQ" },
  { code: "263720.KQ", name: "디앤씨미디어", market: "KOSDAQ" },
  { code: "256840.KQ", name: "한국비엔씨", market: "KOSDAQ" },
  { code: "041020.KQ", name: "폴라리스오피스", market: "KOSDAQ" },
  { code: "067160.KQ", name: "JTC", market: "KOSDAQ" },
  { code: "003800.KQ", name: "에이스침대", market: "KOSDAQ" },
  { code: "347700.KQ", name: "스피어파워", market: "KOSDAQ" },
  { code: "950120.KQ", name: "나노신소재", market: "KOSDAQ" },
  { code: "078130.KQ", name: "국일신동", market: "KOSDAQ" },
  { code: "950030.KQ", name: "코이즈", market: "KOSDAQ" },
  { code: "950010.KQ", name: "에스엔피월드", market: "KOSDAQ" },
  { code: "950050.KQ", name: "마이크로컨텍솔", market: "KOSDAQ" },
  { code: "950060.KQ", name: "코텍", market: "KOSDAQ" },
  { code: "950090.KQ", name: "노바텍", market: "KOSDAQ" },
  { code: "950100.KQ", name: "에스에스알", market: "KOSDAQ" },
  { code: "950110.KQ", name: "SCI평가정보", market: "KOSDAQ" },
  { code: "950150.KQ", name: "푸드나무", market: "KOSDAQ" },
  { code: "950180.KQ", name: "한양디지텍", market: "KOSDAQ" },
  { code: "950210.KQ", name: "하나마이크론", market: "KOSDAQ" },
  { code: "950220.KQ", name: "에이플러스에셋", market: "KOSDAQ" },
  { code: "950230.KQ", name: "에스트래픽", market: "KOSDAQ" },
  { code: "950240.KQ", name: "청담러닝", market: "KOSDAQ" },
  { code: "950250.KQ", name: "화신", market: "KOSDAQ" },
  { code: "950260.KQ", name: "엠씨넥스", market: "KOSDAQ" },
  { code: "317530.KQ", name: "캐리소프트", market: "KOSDAQ" },
  { code: "012450.KQ", name: "한화에어로스페이스", market: "KOSDAQ" },
  { code: "060310.KQ", name: "3S", market: "KOSDAQ" },
  { code: "092040.KQ", name: "야나두", market: "KOSDAQ" },
  { code: "123040.KQ", name: "엠에스오토텍", market: "KOSDAQ" },
  { code: "950040.KQ", name: "국일제지", market: "KOSDAQ" },
  { code: "950170.KQ", name: "JTC", market: "KOSDAQ" },
  { code: "950190.KQ", name: "착한앤컴퍼니", market: "KOSDAQ" },
  { code: "950270.KQ", name: "지엔코", market: "KOSDAQ" },
  { code: "950280.KQ", name: "나우IB캐피탈", market: "KOSDAQ" },
  { code: "950290.KQ", name: "동아엘텍", market: "KOSDAQ" },
  { code: "950300.KQ", name: "선익시스템", market: "KOSDAQ" },
  { code: "950200.KQ", name: "파나진", market: "KOSDAQ" },

  // 미국 100
  { code: "AAPL", name: "Apple", market: "미국" },
  { code: "MSFT", name: "Microsoft", market: "미국" },
  { code: "NVDA", name: "NVIDIA", market: "미국" },
  { code: "AMZN", name: "Amazon", market: "미국" },
  { code: "GOOGL", name: "Alphabet(A)", market: "미국" },
  { code: "META", name: "Meta", market: "미국" },
  { code: "TSLA", name: "Tesla", market: "미국" },
  { code: "BRK-B", name: "Berkshire Hathaway", market: "미국" },
  { code: "AVGO", name: "Broadcom", market: "미국" },
  { code: "JPM", name: "JPMorgan Chase", market: "미국" },
  { code: "LLY", name: "Eli Lilly", market: "미국" },
  { code: "V", name: "Visa", market: "미국" },
  { code: "UNH", name: "UnitedHealth", market: "미국" },
  { code: "XOM", name: "ExxonMobil", market: "미국" },
  { code: "MA", name: "Mastercard", market: "미국" },
  { code: "COST", name: "Costco", market: "미국" },
  { code: "HD", name: "Home Depot", market: "미국" },
  { code: "PG", name: "Procter & Gamble", market: "미국" },
  { code: "JNJ", name: "Johnson & Johnson", market: "미국" },
  { code: "ABBV", name: "AbbVie", market: "미국" },
  { code: "WMT", name: "Walmart", market: "미국" },
  { code: "NFLX", name: "Netflix", market: "미국" },
  { code: "BAC", name: "Bank of America", market: "미국" },
  { code: "CRM", name: "Salesforce", market: "미국" },
  { code: "ORCL", name: "Oracle", market: "미국" },
  { code: "CVX", name: "Chevron", market: "미국" },
  { code: "MRK", name: "Merck", market: "미국" },
  { code: "AMD", name: "AMD", market: "미국" },
  { code: "PEP", name: "PepsiCo", market: "미국" },
  { code: "KO", name: "Coca-Cola", market: "미국" },
  { code: "ADBE", name: "Adobe", market: "미국" },
  { code: "TMO", name: "Thermo Fisher", market: "미국" },
  { code: "WFC", name: "Wells Fargo", market: "미국" },
  { code: "ACN", name: "Accenture", market: "미국" },
  { code: "MCD", name: "McDonald's", market: "미국" },
  { code: "LIN", name: "Linde", market: "미국" },
  { code: "CSCO", name: "Cisco", market: "미국" },
  { code: "ABT", name: "Abbott", market: "미국" },
  { code: "DIS", name: "Disney", market: "미국" },
  { code: "INTU", name: "Intuit", market: "미국" },
  { code: "IBM", name: "IBM", market: "미국" },
  { code: "GE", name: "GE Aerospace", market: "미국" },
  { code: "QCOM", name: "Qualcomm", market: "미국" },
  { code: "TXN", name: "Texas Instruments", market: "미국" },
  { code: "AMGN", name: "Amgen", market: "미국" },
  { code: "CAT", name: "Caterpillar", market: "미국" },
  { code: "GS", name: "Goldman Sachs", market: "미국" },
  { code: "SPGI", name: "S&P Global", market: "미국" },
  { code: "NOW", name: "ServiceNow", market: "미국" },
  { code: "ISRG", name: "Intuitive Surgical", market: "미국" },
  { code: "BKNG", name: "Booking Holdings", market: "미국" },
  { code: "HON", name: "Honeywell", market: "미국" },
  { code: "T", name: "AT&T", market: "미국" },
  { code: "RTX", name: "Raytheon", market: "미국" },
  { code: "PFE", name: "Pfizer", market: "미국" },
  { code: "UNP", name: "Union Pacific", market: "미국" },
  { code: "AXP", name: "American Express", market: "미국" },
  { code: "LOW", name: "Lowe's", market: "미국" },
  { code: "UBER", name: "Uber", market: "미국" },
  { code: "SYK", name: "Stryker", market: "미국" },
  { code: "BLK", name: "BlackRock", market: "미국" },
  { code: "VRTX", name: "Vertex Pharma", market: "미국" },
  { code: "C", name: "Citigroup", market: "미국" },
  { code: "PANW", name: "Palo Alto Networks", market: "미국" },
  { code: "DE", name: "Deere & Company", market: "미국" },
  { code: "ETN", name: "Eaton", market: "미국" },
  { code: "BSX", name: "Boston Scientific", market: "미국" },
  { code: "REGN", name: "Regeneron", market: "미국" },
  { code: "ADP", name: "ADP", market: "미국" },
  { code: "GILD", name: "Gilead Sciences", market: "미국" },
  { code: "BMY", name: "Bristol-Myers Squibb", market: "미국" },
  { code: "SCHW", name: "Charles Schwab", market: "미국" },
  { code: "MMC", name: "Marsh & McLennan", market: "미국" },
  { code: "CB", name: "Chubb", market: "미국" },
  { code: "MU", name: "Micron Technology", market: "미국" },
  { code: "SO", name: "Southern Company", market: "미국" },
  { code: "CI", name: "Cigna", market: "미국" },
  { code: "LRCX", name: "Lam Research", market: "미국" },
  { code: "PLD", name: "Prologis", market: "미국" },
  { code: "ZTS", name: "Zoetis", market: "미국" },
  { code: "TJX", name: "TJX Companies", market: "미국" },
  { code: "AON", name: "Aon", market: "미국" },
  { code: "ICE", name: "Intercontinental Exchange", market: "미국" },
  { code: "MDLZ", name: "Mondelez", market: "미국" },
  { code: "KLAC", name: "KLA Corp", market: "미국" },
  { code: "ANET", name: "Arista Networks", market: "미국" },
  { code: "SHW", name: "Sherwin-Williams", market: "미국" },
  { code: "CME", name: "CME Group", market: "미국" },
  { code: "MCO", name: "Moody's", market: "미국" },
  { code: "SNPS", name: "Synopsys", market: "미국" },
  { code: "CDNS", name: "Cadence Design", market: "미국" },
  { code: "DUK", name: "Duke Energy", market: "미국" },
  { code: "NOC", name: "Northrop Grumman", market: "미국" },
  { code: "CL", name: "Colgate-Palmolive", market: "미국" },
  { code: "FI", name: "Fiserv", market: "미국" },
  { code: "INTC", name: "Intel", market: "미국" },
  { code: "HCA", name: "HCA Healthcare", market: "미국" },
  { code: "PNC", name: "PNC Financial", market: "미국" },
  { code: "APH", name: "Amphenol", market: "미국" },
];

const fmt = (n) => n?.toLocaleString("ko-KR") ?? "-";
const fmtRate = (r) => { if (r == null) return "-"; const s = r >= 0 ? "+" : ""; return `${s}${r.toFixed(2)}%`; };
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const initState = () => ({ users: load("mi_users", {}), teams: load("mi_teams", []), currentUser: load("mi_currentUser", null) });

export default function App() {
  const [state, setState] = useState(initState);
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
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

  const fetchPrices = useCallback(async () => {
    try {
      const symbols = STOCKS.map(s => s.code).join(",");
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPrices(data);
    } catch (e) { console.error("주가 로드 실패:", e); }
    finally { setPriceLoading(false); }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, PRICE_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchPrices]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  const persist = useCallback((ns) => { setState(ns); save("mi_users", ns.users); save("mi_teams", ns.teams); save("mi_currentUser", ns.currentUser); }, []);
  const getPrice = (code) => prices[code] ?? null;
  const getCurrentPrice = (code) => getPrice(code)?.price ?? null;

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
    const newUser = { id: regForm.id, pw: regForm.pw, email: regForm.email, nickname: regForm.id, isTeacher: regForm.isTeacher, cash: INITIAL_CASH, holdings: {}, trades: [], team: regForm.team || null, joinedAt: Date.now() };
    persist({ ...state, users: { ...state.users, [regForm.id]: newUser }, currentUser: regForm.id });
    setActiveTab("dashboard");
    showToast("회원가입 완료! 1,000만원이 지급되었습니다. 🎉");
  }

  function handleLogout() { persist({ ...state, currentUser: null }); setActiveTab("dashboard"); showToast("로그아웃 되었습니다."); }

  function executeTrade() {
    if (!selectedStock || qty < 1) return;
    const user = state.users[state.currentUser];
    const price = getCurrentPrice(selectedStock.code);
    if (!price) { showToast("현재 주가를 불러오는 중입니다.", "error"); return; }
    const total = price * qty;
    let u = { ...user, holdings: { ...user.holdings }, trades: [...user.trades] };
    if (tradeMode === "buy") {
      if (user.cash < total) { showToast("잔액이 부족합니다.", "error"); return; }
      u.cash -= total;
      const prev = u.holdings[selectedStock.code];
      if (prev) u.holdings[selectedStock.code] = { ...prev, qty: prev.qty + qty, avgPrice: Math.round((prev.avgPrice * prev.qty + price * qty) / (prev.qty + qty)) };
      else u.holdings[selectedStock.code] = { code: selectedStock.code, name: selectedStock.name, qty, avgPrice: price };
      u.trades.push({ type: "buy", code: selectedStock.code, name: selectedStock.name, qty, price, total, date: Date.now() });
      showToast(`${selectedStock.name} ${qty}주 매수 완료!`);
    } else {
      const h = u.holdings[selectedStock.code];
      if (!h || h.qty < qty) { showToast("보유 주식이 부족합니다.", "error"); return; }
      u.cash += total;
      if (h.qty === qty) delete u.holdings[selectedStock.code];
      else u.holdings[selectedStock.code] = { ...h, qty: h.qty - qty };
      u.trades.push({ type: "sell", code: selectedStock.code, name: selectedStock.name, qty, price, total, date: Date.now() });
      showToast(`${selectedStock.name} ${qty}주 매도 완료!`);
    }
    persist({ ...state, users: { ...state.users, [state.currentUser]: u } });
    setQty(1);
  }

  function calcPortfolio(user) {
    if (!user) return { cash: 0, stockVal: 0, total: 0, rate: 0 };
    const stockVal = Object.values(user.holdings).reduce((sum, h) => sum + (getCurrentPrice(h.code) ?? h.avgPrice) * h.qty, 0);
    const total = user.cash + stockVal;
    return { cash: user.cash, stockVal, total, rate: ((total - INITIAL_CASH) / INITIAL_CASH) * 100 };
  }

  function getRankings() { return Object.values(state.users).filter(u => !u.isTeacher).map(u => ({ ...u, ...calcPortfolio(u) })).sort((a, b) => b.rate - a.rate); }
  function getTeamRankings() {
    const m = {};
    getRankings().forEach(u => { if (!u.team) return; if (!m[u.team]) m[u.team] = { name: u.team, rates: [] }; m[u.team].rates.push(u.rate); });
    return Object.values(m).map(t => ({ ...t, avgRate: t.rates.reduce((a, b) => a + b, 0) / t.rates.length })).sort((a, b) => b.avgRate - a.avgRate);
  }
  function createTeam() { if (!newTeamName.trim() || state.teams.includes(newTeamName)) return; persist({ ...state, teams: [...state.teams, newTeamName] }); setNewTeamName(""); showToast(`${newTeamName} 팀 생성!`); }
  function deleteTeam(name) { persist({ ...state, teams: state.teams.filter(t => t !== name) }); showToast(`${name} 팀 삭제.`); }
  function resetUser(id) { const u = state.users[id]; if (!u) return; persist({ ...state, users: { ...state.users, [id]: { ...u, cash: INITIAL_CASH, holdings: {}, trades: [] } } }); showToast(`${u.nickname} 초기화.`); }
  function saveNickname() { if (!nicknameInput.trim() || !state.currentUser) return; const u = state.users[state.currentUser]; persist({ ...state, users: { ...state.users, [state.currentUser]: { ...u, nickname: nicknameInput.trim() } } }); showToast("닉네임 변경 완료!"); setNicknameInput(""); }

  const user = state.currentUser ? state.users[state.currentUser] : null;
  const pf = calcPortfolio(user);
  const markets = ["KOSPI", "KOSDAQ", "미국"];
  const filteredStocks = STOCKS.filter(s => s.market === market && (s.name.includes(searchQ) || s.code.includes(searchQ)));

  return (
    <div style={S.root}>
      {toast && <div style={{ ...S.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>{toast.msg}</div>}
      <aside style={S.sidebar}>
        <div style={S.logo}>📈 모의투자</div>
        {[["dashboard","🏠","대시보드"],["trade","💹","주식 거래"],["history","📋","거래 내역"],["stocks","📊","종목 목록"],["ranking","🏆","랭킹"],...(user?.isTeacher?[["admin","⚙️","관리자"]]:[]),["mypage","👤","마이페이지"]].map(([tab,icon,label]) => (
          <button key={tab} style={{ ...S.navBtn, ...(activeTab===tab?S.navBtnActive:{}) }} onClick={() => setActiveTab(tab)}><span>{icon}</span> {label}</button>
        ))}
        {user && <button style={{ ...S.navBtn, marginTop: "auto" }} onClick={handleLogout}>🚪 로그아웃</button>}
      </aside>

      <main style={S.main}>
        {!user && (
          <div style={S.authWrap}>
            <h1 style={S.authTitle}>📈 주식 모의투자</h1>
            <p style={S.authSub}>KOSPI · KOSDAQ · 미국 주식 실시간 시뮬레이터</p>
            <div style={S.badges}>{["💰 초기 자금 1,000만원","📊 실시간 주가 연동","🌍 KOSPI·KOSDAQ·미국"].map(b => <span key={b} style={S.badge}>{b}</span>)}</div>
            <div style={S.authTabs}>{["login","register"].map(t => <button key={t} style={{ ...S.authTabBtn, ...(authTab===t?S.authTabBtnActive:{}) }} onClick={() => setAuthTab(t)}>{t==="login"?"로그인":"회원가입"}</button>)}</div>
            {authTab === "login" ? (
              <form onSubmit={handleLogin} style={S.form}>
                <input style={S.input} placeholder="아이디" value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} />
                <input style={S.input} placeholder="비밀번호" type="password" value={loginForm.pw} onChange={e => setLoginForm({...loginForm, pw: e.target.value})} />
                <button style={S.btnPrimary} type="submit">로그인</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={S.form}>
                <input style={S.input} placeholder="아이디" required value={regForm.id} onChange={e => setRegForm({...regForm, id: e.target.value})} />
                <input style={S.input} placeholder="이메일" type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                <input style={S.input} placeholder="비밀번호" type="password" required value={regForm.pw} onChange={e => setRegForm({...regForm, pw: e.target.value})} />
                <select style={S.input} value={regForm.team} onChange={e => setRegForm({...regForm, team: e.target.value})}>
                  <option value="">팀 선택 (선택사항)</option>
                  {state.teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label style={S.checkRow}><input type="checkbox" checked={regForm.isTeacher} onChange={e => setRegForm({...regForm, isTeacher: e.target.checked})} /> 선생님 계정으로 가입</label>
                {regForm.isTeacher && <input style={S.input} placeholder="선생님 코드" value={regForm.teacherCode} onChange={e => setRegForm({...regForm, teacherCode: e.target.value})} />}
                <button style={S.btnPrimary} type="submit">회원가입 (초기 자금 1,000만원 지급)</button>
              </form>
            )}
          </div>
        )}

        {user && activeTab === "dashboard" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>내 포트폴리오</h2>
            <div style={S.pfGrid}>
              {[["보유 현금", fmt(Math.round(pf.cash))+"원"],["주식 평가액", fmt(Math.round(pf.stockVal))+"원"],["총 자산", fmt(Math.round(pf.total))+"원"],["총 수익률", fmtRate(pf.rate)]].map(([label,val],i) => (
                <div key={i} style={S.pfCard}><div style={S.pfLabel}>{label}</div><div style={{ ...S.pfVal, color: i===3?(pf.rate>=0?"#10b981":"#ef4444"):"#1e293b" }}>{val}</div></div>
              ))}
            </div>
            <h3 style={S.sectionTitle}>보유 종목</h3>
            {Object.keys(user.holdings).length === 0 ? <p style={S.empty}>보유 종목이 없습니다.</p> : (
              <table style={S.table}>
                <thead><tr>{["종목","보유수량","평균단가","현재가","평가손익","수익률"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{Object.values(user.holdings).map(h => {
                  const cur = getCurrentPrice(h.code) ?? h.avgPrice;
                  const pnl = (cur - h.avgPrice) * h.qty;
                  const rate = ((cur - h.avgPrice) / h.avgPrice) * 100;
                  return <tr key={h.code}><td style={S.td}>{h.name}</td><td style={S.td}>{fmt(h.qty)}주</td><td style={S.td}>{fmt(Math.round(h.avgPrice))}원</td><td style={S.td}>{fmt(Math.round(cur))}원</td><td style={{ ...S.td, color: pnl>=0?"#10b981":"#ef4444" }}>{fmt(Math.round(pnl))}원</td><td style={{ ...S.td, color: rate>=0?"#10b981":"#ef4444" }}>{fmtRate(rate)}</td></tr>;
                })}</tbody>
              </table>
            )}
          </div>
        )}

        {user && activeTab === "trade" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>주식 거래</h2>
            <div style={S.tradeLayout}>
              <div style={S.tradeLeft}>
                <input style={S.input} placeholder="종목 검색" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                <div style={S.marketTabs}>{markets.map(m => <button key={m} style={{ ...S.mktBtn, ...(market===m?S.mktBtnActive:{}) }} onClick={() => setMarket(m)}>{m}</button>)}</div>
                <div style={S.stockList}>{filteredStocks.map(s => {
                  const p = getPrice(s.code);
                  const chg = p?.prevClose ? ((p.price - p.prevClose) / p.prevClose * 100) : 0;
                  return (
                    <div key={s.code} style={{ ...S.stockRow, ...(selectedStock?.code===s.code?S.stockRowSel:{}) }} onClick={() => { setSelectedStock(s); setQty(1); }}>
                      <div><div style={S.stockName}>{s.name}</div><div style={S.stockCode}>{s.code}</div></div>
                      <div style={{ textAlign:"right" }}><div style={S.stockPrice}>{p?.price?fmt(Math.round(p.price)):"-"}원</div><div style={{ color: chg>=0?"#ef4444":"#3b82f6", fontSize:12 }}>{p?fmtRate(chg):"-"}</div></div>
                    </div>
                  );
                })}</div>
              </div>
              <div style={S.tradeRight}>
                {priceLoading ? <div style={S.noSelect}>⏳ 주가 데이터 로딩 중...</div> : selectedStock ? (
                  <>
                    <h3 style={{ color:"#1e293b", marginBottom:16 }}>{selectedStock.name} ({selectedStock.code})</h3>
                    {(() => { const p = getPrice(selectedStock.code); const chg = p?.prevClose?((p.price-p.prevClose)/p.prevClose*100):0; return (
                      <div style={S.priceDetail}>
                        <div style={S.bigPrice}>{p?.price?fmt(Math.round(p.price)):"-"}원</div>
                        <div style={{ color: chg>=0?"#ef4444":"#3b82f6", marginBottom:8 }}>{p?fmtRate(chg):"-"}</div>
                        <div style={S.priceRow}><span>전일종가</span><span>{p?.prevClose?fmt(Math.round(p.prevClose)):"-"}원</span></div>
                        <div style={S.priceRow}><span>고가</span><span style={{ color:"#ef4444" }}>{p?.high?fmt(Math.round(p.high)):"-"}원</span></div>
                        <div style={S.priceRow}><span>저가</span><span style={{ color:"#3b82f6" }}>{p?.low?fmt(Math.round(p.low)):"-"}원</span></div>
                        <div style={S.priceRow}><span>거래량</span><span>{p?.volume?fmt(p.volume):"-"}</span></div>
                      </div>
                    ); })()}
                    <div style={S.tradeModes}>{["buy","sell"].map(m => <button key={m} style={{ ...S.tradeModeBtn, ...(tradeMode===m?(m==="buy"?S.buyActive:S.sellActive):{}) }} onClick={() => setTradeMode(m)}>{m==="buy"?"매수":"매도"}</button>)}</div>
                    <div style={S.qtyRow}>
                      {[-10,-1].map(d => <button key={d} style={S.qtyBtn} onClick={() => setQty(q => Math.max(1,q+d))}>{d}</button>)}
                      <span style={{ color:"#1e293b", fontSize:18, fontWeight:700 }}>{qty}</span>
                      {[1,10].map(d => <button key={d} style={S.qtyBtn} onClick={() => setQty(q => q+d)}>+{d}</button>)}
                    </div>
                    <div style={S.priceRow}><span style={{ color:"#64748b" }}>현재가</span><span style={{ color:"#1e293b" }}>{getCurrentPrice(selectedStock.code)?fmt(Math.round(getCurrentPrice(selectedStock.code))):"-"}원</span></div>
                    <div style={S.priceRow}><span style={{ color:"#64748b" }}>예상 금액</span><span style={{ color:"#f59e0b", fontWeight:700 }}>{getCurrentPrice(selectedStock.code)?fmt(Math.round(getCurrentPrice(selectedStock.code)*qty)):"-"}원</span></div>
                    <div style={S.priceRow}><span style={{ color:"#64748b" }}>보유 수량</span><span style={{ color:"#1e293b" }}>{user.holdings[selectedStock.code]?.qty??0}주</span></div>
                    <button style={{ ...S.btnPrimary, background: tradeMode==="buy"?"#ef4444":"#3b82f6", marginTop:16 }} onClick={executeTrade}>{tradeMode==="buy"?"매수하기":"매도하기"}</button>
                  </>
                ) : <div style={S.noSelect}>좌측에서 종목을 선택하세요</div>}
              </div>
            </div>
          </div>
        )}

        {user && activeTab === "history" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>거래 내역</h2>
            {user.trades.length === 0 ? <p style={S.empty}>거래 내역이 없습니다.</p> : (
              <table style={S.table}>
                <thead><tr>{["유형","종목","수량","가격","금액","일시"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{[...user.trades].reverse().map((t,i) => <tr key={i}><td style={{ ...S.td, color: t.type==="buy"?"#ef4444":"#3b82f6", fontWeight:700 }}>{t.type==="buy"?"매수":"매도"}</td><td style={S.td}>{t.name}</td><td style={S.td}>{fmt(t.qty)}주</td><td style={S.td}>{fmt(Math.round(t.price))}원</td><td style={S.td}>{fmt(Math.round(t.total))}원</td><td style={S.td}>{new Date(t.date).toLocaleString("ko-KR")}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}

        {user && activeTab === "stocks" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>전체 종목</h2>
            <div style={S.marketTabs}>{markets.map(m => <button key={m} style={{ ...S.mktBtn, ...(market===m?S.mktBtnActive:{}) }} onClick={() => setMarket(m)}>{m}</button>)}</div>
            {priceLoading ? <p style={S.empty}>⏳ 주가 데이터 로딩 중...</p> : (
              <table style={S.table}>
                <thead><tr>{["종목명","코드","현재가","전일비","등락률","거래량"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{STOCKS.filter(s => s.market===market).map(s => {
                  const p = getPrice(s.code);
                  const diff = p?.prevClose?p.price-p.prevClose:null;
                  const rate = p?.prevClose?(diff/p.prevClose*100):null;
                  return <tr key={s.code} style={{ cursor:"pointer" }} onClick={() => { setSelectedStock(s); setActiveTab("trade"); }}>
                    <td style={S.td}>{s.name}</td><td style={S.td}>{s.code}</td>
                    <td style={S.td}>{p?.price?fmt(Math.round(p.price)):"-"}원</td>
                    <td style={{ ...S.td, color: diff>=0?"#ef4444":"#3b82f6" }}>{diff!=null?`${diff>=0?"▲":"▼"} ${fmt(Math.abs(Math.round(diff)))}`:"-"}</td>
                    <td style={{ ...S.td, color: rate>=0?"#ef4444":"#3b82f6" }}>{rate!=null?fmtRate(rate):"-"}</td>
                    <td style={S.td}>{p?.volume?fmt(p.volume):"-"}</td>
                  </tr>;
                })}</tbody>
              </table>
            )}
          </div>
        )}

        {user && activeTab === "ranking" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>🏆 랭킹</h2>
            <div style={S.marketTabs}>{[["student","학생 랭킹"],["team","팀 랭킹"]].map(([t,l]) => <button key={t} style={{ ...S.mktBtn, ...(rankTab===t?S.mktBtnActive:{}) }} onClick={() => setRankTab(t)}>{l}</button>)}</div>
            {rankTab === "student" ? (
              <table style={S.table}>
                <thead><tr>{["순위","닉네임","팀","총 자산","수익률"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{getRankings().map((u,i) => <tr key={u.id} style={{ background: u.id===state.currentUser?"#ede9fe":"" }}><td style={S.td}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td><td style={S.td}>{u.nickname}</td><td style={S.td}>{u.team||"-"}</td><td style={S.td}>{fmt(Math.round(u.total))}원</td><td style={{ ...S.td, color: u.rate>=0?"#10b981":"#ef4444", fontWeight:700 }}>{fmtRate(u.rate)}</td></tr>)}</tbody>
              </table>
            ) : (
              <table style={S.table}>
                <thead><tr>{["순위","팀명","평균 수익률","팀원 수"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {getTeamRankings().map((t,i) => <tr key={t.name}><td style={S.td}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td><td style={S.td}>{t.name}</td><td style={{ ...S.td, color: t.avgRate>=0?"#10b981":"#ef4444", fontWeight:700 }}>{fmtRate(t.avgRate)}</td><td style={S.td}>{t.rates.length}명</td></tr>)}
                  {getTeamRankings().length===0 && <tr><td colSpan={4} style={{ ...S.td, textAlign:"center", color:"#94a3b8" }}>팀 데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {user?.isTeacher && activeTab === "admin" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>⚙️ 관리자 패널</h2>
            <h3 style={S.sectionTitle}>팀 관리</h3>
            <div style={S.flexRow}>
              <input style={{ ...S.input, flex:1 }} placeholder="새 팀 이름" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
              <button style={{ ...S.btnPrimary, width:"auto", padding:"10px 20px" }} onClick={createTeam}>팀 만들기</button>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>{state.teams.map(t => <div key={t} style={S.teamChip}>{t}<button style={S.chipDel} onClick={() => deleteTeam(t)}>✕</button></div>)}</div>
            <h3 style={{ ...S.sectionTitle, marginTop:32 }}>학생 관리</h3>
            <table style={S.table}>
              <thead><tr>{["아이디","닉네임","팀","총 자산","수익률","초기화"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {Object.values(state.users).filter(u => !u.isTeacher).map(u => { const p=calcPortfolio(u); return <tr key={u.id}><td style={S.td}>{u.id}</td><td style={S.td}>{u.nickname}</td><td style={S.td}>{u.team||"-"}</td><td style={S.td}>{fmt(Math.round(p.total))}원</td><td style={{ ...S.td, color: p.rate>=0?"#10b981":"#ef4444" }}>{fmtRate(p.rate)}</td><td style={S.td}><button style={{ ...S.btnPrimary, width:"auto", padding:"4px 12px", fontSize:12, background:"#94a3b8" }} onClick={() => resetUser(u.id)}>초기화</button></td></tr>; })}
                {Object.values(state.users).filter(u => !u.isTeacher).length===0 && <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", color:"#94a3b8" }}>등록된 학생이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {user && activeTab === "mypage" && (
          <div style={S.page}>
            <h2 style={S.pageTitle}>👤 마이페이지</h2>
            <div style={S.pfCard}>
              <div style={{ fontSize:48, textAlign:"center", marginBottom:8 }}>👤</div>
              <div style={{ textAlign:"center", color:"#1e293b", fontSize:20, fontWeight:700 }}>{user.nickname}</div>
              <div style={{ textAlign:"center", color:"#64748b", fontSize:14 }}>{user.id}</div>
              {user.isTeacher && <div style={{ textAlign:"center", color:"#f59e0b", marginTop:4 }}>👩‍🏫 선생님</div>}
            </div>
            <h3 style={S.sectionTitle}>닉네임 변경</h3>
            <div style={S.flexRow}>
              <input style={{ ...S.input, flex:1 }} placeholder="새 닉네임 (최대 20자)" maxLength={20} value={nicknameInput} onChange={e => setNicknameInput(e.target.value)} />
              <button style={{ ...S.btnPrimary, width:"auto", padding:"10px 20px" }} onClick={saveNickname}>저장</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const S = {
  root: { display:"flex", minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Pretendard','Apple SD Gothic Neo',sans-serif", color:"#1e293b" },
  sidebar: { width:200, background:"#fff", borderRight:"1px solid #e2e8f0", display:"flex", flexDirection:"column", padding:"20px 12px", gap:4, position:"sticky", top:0, height:"100vh", overflowY:"auto" },
  logo: { fontSize:20, fontWeight:800, color:"#6366f1", padding:"8px 12px", marginBottom:16 },
  navBtn: { display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:8, border:"none", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:14, fontWeight:500, textAlign:"left" },
  navBtnActive: { background:"#ede9fe", color:"#6366f1" },
  main: { flex:1, padding:"32px 40px", overflowY:"auto" },
  page: { maxWidth:960, margin:"0 auto" },
  pageTitle: { fontSize:24, fontWeight:800, color:"#1e293b", marginBottom:24 },
  sectionTitle: { fontSize:16, fontWeight:700, color:"#1e293b", marginBottom:12 },
  pfGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 },
  pfCard: { background:"#fff", borderRadius:12, padding:20, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,.06)" },
  pfLabel: { fontSize:13, color:"#64748b", marginBottom:6 },
  pfVal: { fontSize:20, fontWeight:700 },
  table: { width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,.06)" },
  th: { padding:"12px 16px", textAlign:"left", fontSize:13, color:"#64748b", borderBottom:"1px solid #e2e8f0", background:"#f8fafc" },
  td: { padding:"12px 16px", fontSize:14, color:"#334155", borderBottom:"1px solid #f1f5f9" },
  empty: { color:"#94a3b8", textAlign:"center", padding:"40px 0" },
  authWrap: { maxWidth:480, margin:"60px auto", padding:"0 16px" },
  authTitle: { fontSize:32, fontWeight:900, color:"#1e293b", textAlign:"center" },
  authSub: { color:"#64748b", textAlign:"center", marginBottom:20 },
  badges: { display:"flex", gap:8, justifyContent:"center", marginBottom:28, flexWrap:"wrap" },
  badge: { background:"#ede9fe", color:"#6366f1", padding:"6px 14px", borderRadius:20, fontSize:13, fontWeight:600 },
  authTabs: { display:"flex", marginBottom:20, background:"#f1f5f9", borderRadius:10, padding:4 },
  authTabBtn: { flex:1, padding:"10px", border:"none", background:"transparent", color:"#64748b", cursor:"pointer", borderRadius:8, fontSize:14, fontWeight:600 },
  authTabBtnActive: { background:"#fff", color:"#6366f1", boxShadow:"0 1px 4px rgba(0,0,0,.08)" },
  form: { display:"flex", flexDirection:"column", gap:12 },
  input: { padding:"12px 14px", background:"#fff", border:"1px solid #cbd5e1", borderRadius:8, color:"#1e293b", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
  checkRow: { display:"flex", alignItems:"center", gap:8, color:"#334155", cursor:"pointer" },
  btnPrimary: { padding:"12px 0", background:"#6366f1", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", width:"100%" },
  tradeLayout: { display:"flex", gap:20 },
  tradeLeft: { width:300, flexShrink:0 },
  tradeRight: { flex:1, background:"#fff", borderRadius:12, padding:24, minHeight:400, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,.06)" },
  marketTabs: { display:"flex", gap:8, marginBottom:12, marginTop:8 },
  mktBtn: { padding:"6px 16px", border:"1px solid #cbd5e1", borderRadius:6, background:"#fff", color:"#64748b", cursor:"pointer", fontSize:13 },
  mktBtnActive: { background:"#ede9fe", color:"#6366f1", borderColor:"#6366f1" },
  stockList: { display:"flex", flexDirection:"column", gap:2, maxHeight:"60vh", overflowY:"auto" },
  stockRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderRadius:8, cursor:"pointer", background:"#fff", border:"1px solid #f1f5f9" },
  stockRowSel: { background:"#ede9fe", outline:"1px solid #6366f1", border:"1px solid #6366f1" },
  stockName: { fontSize:14, fontWeight:600, color:"#1e293b" },
  stockCode: { fontSize:12, color:"#94a3b8" },
  stockPrice: { fontSize:14, fontWeight:600, color:"#1e293b" },
  bigPrice: { fontSize:28, fontWeight:800, color:"#1e293b", marginBottom:4 },
  priceDetail: { background:"#f8fafc", borderRadius:10, padding:16, marginBottom:16, border:"1px solid #e2e8f0" },
  priceRow: { display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:14, color:"#64748b", borderBottom:"1px solid #f1f5f9" },
  tradeModes: { display:"flex", gap:8, marginBottom:16 },
  tradeModeBtn: { flex:1, padding:"10px", border:"1px solid #cbd5e1", borderRadius:8, background:"#fff", color:"#64748b", cursor:"pointer", fontWeight:700, fontSize:15 },
  buyActive: { background:"#fef2f2", color:"#ef4444", borderColor:"#ef4444" },
  sellActive: { background:"#eff6ff", color:"#3b82f6", borderColor:"#3b82f6" },
  qtyRow: { display:"flex", alignItems:"center", gap:12, marginBottom:16, justifyContent:"center" },
  qtyBtn: { padding:"6px 14px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:6, color:"#334155", cursor:"pointer", fontSize:14, fontWeight:700 },
  noSelect: { color:"#94a3b8", textAlign:"center", paddingTop:80 },
  flexRow: { display:"flex", gap:12, alignItems:"center" },
  teamChip: { display:"flex", alignItems:"center", gap:6, background:"#ede9fe", color:"#6366f1", padding:"6px 12px", borderRadius:20, fontSize:14, fontWeight:600 },
  chipDel: { background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:14 },
  toast: { position:"fixed", top:24, right:24, padding:"14px 24px", borderRadius:10, color:"#fff", fontSize:15, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.15)" },
};
