const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");

const weeks = [
  {
    folder: "2026-07-10_2026-07-18",
    rangeText: "2026.07.10 - 2026.07.18",
    tradeRangeText: "2026.07.10 - 2026.07.17",
    label: "07.10-07.18",
    status: "补档草稿",
    title: "半导ETF快进快出，哈药股份盈利闭环",
    subtitle: "本页基于 2026/7/10-7/18 成交截图补档生成。截图含 7/10 与 07.06-07.10 周报重叠的成本/卖出行，账户日收益、期末持仓、日度KISS与二次反思待补后再校准。",
    accountNote: "账户日收益、收益率、仓位、期末权益暂缺；本页只计算截图内可配对买卖贡献，7/10 上午部分卖出缺历史成本，不强行计入真实盈亏。",
    thesis: "这一周的核心是两段交易：7/10 下午重新买入半导体ETF和科创半导，7/13 卖出后形成亏损闭环；7/14-7/16 分批买入哈药股份，7/17 全部卖出，形成正向闭环。截图可见口径下，哈药盈利抵消了一部分 ETF 亏损，但账户真实结果仍需每日收益表校准。",
    dailyNotes: [
      { date: "20260710", day: "周五", theme: "ETF历史卖出与重新买入", action: "上午卖出芯片ETF、科创半导ETF和半导体设备ETF；下午重新买入半导体设备ETF10400份、科创半导ETF3400份。", review: "这一天和 07.06-07.10 页面存在重叠。上午卖出缺前序成本，下午买回则为 7/13 卖出提供可见成本。半导方向属于反核/修复试错，不能直接升级成趋势主升。" },
      { date: "20260713", day: "周一", theme: "半导ETF兑现", action: "卖出科创半导ETF3400份、半导体设备ETF10400份。", review: "截图内可配对后形成亏损闭环。它验证了科技ETF如果买点偏早或反弹力度不足，隔日兑现未必盈利；ETF也要看节奏，不是无条件安全。" },
      { date: "20260714", day: "周二", theme: "哈药股份建仓", action: "分2笔买入哈药股份900股。", review: "开始切到医药方向，仓位先试，属于更清晰的个股闭环起点。后续 7/16 加仓、7/17 兑现，说明这笔比 ETF 更顺。" },
      { date: "20260716", day: "周四", theme: "哈药股份加仓", action: "分2笔买入哈药股份2200股。", review: "加仓后总持仓达到3100股，仓位明显集中。这里需要后续二次反思确认：是强度确认后的合理加仓，还是利润弹性驱动的放大仓位。" },
      { date: "20260717", day: "周五", theme: "哈药股份兑现", action: "卖出哈药股份3100股。", review: "哈药股份形成截图内最清楚的赚钱闭环，买入分批、卖出一次性兑现，说明强度确认后集中处理比科技ETF来回试错更干净。" },
    ],
    stockNotes: {
      "600664": "主要赚钱票。7/14 与 7/16 分四笔买入3100股，7/17 全部卖出，截图内可配对闭环约为正贡献。赚钱根源是买入后能等到强度兑现，而不是来回切换。",
      "159516": "主要亏损票之一。7/10 下午买入10400份，7/13 全部卖出，截图内形成负贡献；7/10 上午另有6400份卖出缺历史成本，不纳入本页真实盈亏。",
      "588170": "主要亏损票之一。7/10 下午买入3400份，7/13 卖出3400份形成亏损闭环；7/10 上午卖出3300份属于历史仓处理，缺前序成本。",
      "512760": "芯片ETF国泰 7/10 上午卖出1400份，截图内没有对应买入成本，只记录历史仓卖出动作，不计算真实盈亏。",
    },
    rules: [
      ["ETF也要看节奏", "ETF比单一个股分散，但买在反弹强度不足的位置，隔日也会亏；不能把ETF当成无风险替代品。"],
      ["历史卖出另算", "7/10 上午 ETF 卖出缺前序成本，必须和下午重新买入后的闭环分开，不把现金到账误判成盈利。"],
      ["强度确认后再集中", "哈药股份分批建仓后能集中兑现，说明确定性更强的标的可以给更多仓位，但前提是强度已经被市场确认。"],
      ["跨页重叠要标注", "这类筛选区间和上一周重叠时，要明确哪些行是成本/历史行，避免同一笔交易在周报中重复归因。"],
    ],
    missing: [
      "7/10 前芯片ETF、科创半导ETF、半导体设备ETF历史持仓成本，用于校准上午卖出真实盈亏。",
      "本周每日账户收益率、收益金额、仓位、当前总金额。",
      "7/18 或该周最后交易日的期末持仓截图，确认是否有未显示持仓、现金和账户总资产。",
      "本周日度KISS复盘与二次反思。",
      "若需要真实5分钟走势，请补券商/同花顺分时截图或确认使用行情接口可得数据。",
    ],
    trades: [
      { date: "20260717", time: "10:23:28", code: "600664", name: "哈药股份", side: "卖出", sideType: "sell", qty: 3100, price: 4.97, amount: 15407, fee: 5, tax: 7.7, net: 15394.17, cash: 15838.94, market: "沪A" },
      { date: "20260716", time: "09:42:57", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 1800, price: 4.94, amount: 8892, fee: 5, tax: 0, net: -8897.09, cash: 2425.79, market: "沪A" },
      { date: "20260716", time: "09:42:57", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 400, price: 4.94, amount: 1976, fee: 5, tax: 0, net: -1981.02, cash: 4447.77, market: "沪A" },
      { date: "20260714", time: "09:46:45", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 300, price: 4.01, amount: 1203, fee: 5, tax: 0, net: -1208.01, cash: 11322.88, market: "沪A" },
      { date: "20260714", time: "09:44:28", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 600, price: 4.08, amount: 2448, fee: 5, tax: 0, net: -2453.02, cash: 12530.89, market: "沪A" },
      { date: "20260713", time: "13:02:11", code: "588170", name: "科创半导ETF华夏", side: "卖出", sideType: "sell", qty: 3400, price: 1.221, amount: 4151.4, fee: 5, tax: 0, net: 4146.4, cash: 14983.91, market: "沪A" },
      { date: "20260713", time: "13:01:59", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 10400, price: 0.87, amount: 9051.2, fee: 5, tax: 0, net: 9046.2, cash: 10837.51, market: "深A" },
      { date: "20260710", time: "14:04:05", code: "588170", name: "科创半导ETF华夏", side: "买入", sideType: "buy", qty: 700, price: 1.334, amount: 933.8, fee: 5, tax: 0, net: -938.8, cash: 1791.31, market: "沪A" },
      { date: "20260710", time: "14:03:43", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1100, price: 0.937, amount: 1030.7, fee: 5, tax: 0, net: -1035.7, cash: 2730.11, market: "深A" },
      { date: "20260710", time: "13:54:12", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1300, price: 0.949, amount: 1233.7, fee: 5, tax: 0, net: -1238.7, cash: 3765.81, market: "深A" },
      { date: "20260710", time: "13:49:44", code: "588170", name: "科创半导ETF华夏", side: "买入", sideType: "buy", qty: 1200, price: 1.349, amount: 1618.8, fee: 5, tax: 0, net: -1623.8, cash: 5004.51, market: "沪A" },
      { date: "20260710", time: "13:49:31", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2100, price: 0.947, amount: 1988.7, fee: 5, tax: 0, net: -1993.7, cash: 6628.31, market: "深A" },
      { date: "20260710", time: "13:22:32", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2000, price: 0.962, amount: 1924, fee: 5, tax: 0, net: -1929, cash: 8622.01, market: "深A" },
      { date: "20260710", time: "13:21:56", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 2900, price: 0.962, amount: 2789.8, fee: 5, tax: 0, net: -2794.8, cash: 10551.01, market: "深A" },
      { date: "20260710", time: "13:20:38", code: "588170", name: "科创半导ETF华夏", side: "买入", sideType: "buy", qty: 1500, price: 1.369, amount: 2053.5, fee: 5, tax: 0, net: -2058.5, cash: 13345.81, market: "沪A" },
      { date: "20260710", time: "13:00:00", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 1000, price: 0.963, amount: 963, fee: 5, tax: 0, net: -968, cash: 15404.31, market: "深A" },
      { date: "20260710", time: "09:56:14", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 600, price: 0.999, amount: 599.4, fee: 5, tax: 0, net: 594.4, cash: 16372.31, market: "深A" },
      { date: "20260710", time: "09:44:09", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 600, price: 0.995, amount: 597, fee: 5, tax: 0, net: 592, cash: 15777.91, market: "深A" },
      { date: "20260710", time: "09:43:44", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 0.996, amount: 1195.2, fee: 5, tax: 0, net: 1190.2, cash: 15185.91, market: "深A" },
      { date: "20260710", time: "09:43:22", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 0.998, amount: 1197.6, fee: 5, tax: 0, net: 1192.6, cash: 13995.71, market: "深A" },
      { date: "20260710", time: "09:40:38", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1200, price: 1.003, amount: 1203.6, fee: 5, tax: 0, net: 1198.6, cash: 12803.11, market: "深A" },
      { date: "20260710", time: "09:37:19", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1600, price: 0.995, amount: 1592, fee: 5, tax: 0, net: 1587, cash: 11604.51, market: "深A" },
      { date: "20260710", time: "09:35:34", code: "588170", name: "科创半导ETF华夏", side: "卖出", sideType: "sell", qty: 3300, price: 1.409, amount: 4649.7, fee: 5, tax: 0, net: 4644.7, cash: 10017.51, market: "沪A" },
      { date: "20260710", time: "09:35:20", code: "512760", name: "芯片ETF国泰", side: "卖出", sideType: "sell", qty: 1400, price: 1.564, amount: 2189.6, fee: 5, tax: 0, net: 2184.6, cash: 5372.81, market: "沪A" },
    ],
  },
  {
    folder: "2026-07-24_2026-08-01",
    rangeText: "2026.07.24 - 2026.08.01",
    tradeRangeText: "2026.07.24 - 2026.07.31",
    label: "07.24-08.01",
    status: "补档草稿",
    title: "立新能源二次参与亏损，一鸣食品跨周试错",
    subtitle: "本页基于 2026/7/24-8/1 成交截图补档生成。截图含 7/24 跨周成本/兑现行，账户日收益、期末持仓、日度KISS与二次反思待补后再校准。",
    accountNote: "账户日收益、收益率、仓位、期末权益暂缺；本页只计算截图可闭环的成交贡献。",
    thesis: "这一周的核心问题是高位龙头二次参与的风险：立新能源 7/28 重新买回 1100 股，7/29 全部卖出，截图口径形成主要亏损闭环；哈药股份小赚、长缆科技亏损，一鸣食品是跨周试错仓。",
    dailyNotes: [
      { date: "20260724", day: "周五", theme: "跨周带入与哈药试错", action: "立新能源卖出1300股；买入哈药股份100股。", review: "这部分与上一周存在口径重叠，主要用于给后续哈药股份闭环提供成本。立新能源真实盈利需要上一周完整成本校准。" },
      { date: "20260727", day: "周一", theme: "哈药兑现，长缆试错", action: "卖出哈药股份100股；买入长缆科技100股。", review: "哈药股份小赚闭环，长缆科技属于新试错，次日快速退出，说明强度确认不足时不能给太多预期。" },
      { date: "20260728", day: "周二", theme: "立新能源二次参与", action: "分11笔买入立新能源1100股；卖出长缆科技100股。", review: "长缆科技止损后，资金重新集中到立新能源。但从结果看，二次参与成本偏高，隔日大幅亏损离场，是本周最需要复盘的动作。" },
      { date: "20260729", day: "周三", theme: "立新能源止损", action: "卖出立新能源1100股。", review: "止损动作执行了，但亏损根源在前一日买点和定位：高位标的二次参与必须重新确认唯一性和周期位置，不能只因为熟悉就回去做。" },
      { date: "20260731", day: "周五", theme: "一鸣食品跨周试错", action: "买入一鸣食品200股。", review: "一鸣食品本截图内未卖出，真实结果在下一张截图里闭环。本页先标记为期末待验证仓。" },
    ],
    stockNotes: {
      "001258": "主要亏损票。7/28 分11笔买入1100股，7/29 全部卖出，截图内这组闭环约为主要负贡献；同时 7/24 的卖出行属于跨周带入，真实总盈亏需要上一周成本一起校准。",
      "600664": "哈药股份 7/24 买入100股，7/27 卖出100股，截图内小幅正贡献。它是干净的小闭环，但不是本周账户主线。",
      "002879": "长缆科技 7/27 买入100股，7/28 卖出100股，形成亏损闭环。试错失败后能退出是对的，但买前需要更明确它是否具备题材第一性。",
      "601579": "一鸣食品 7/31 买入200股，本页内未卖出；它是跨周试错仓，结果放到下一周闭环校准。",
    },
    rules: [
      ["高位二次参与要重新定性", "做过的龙头再次参与时，不能沿用上一波预期，必须重新确认唯一性、周期位置和当日承接。"],
      ["熟悉票不等于核心票", "立新能源熟悉度高，但熟悉不能替代强度确认；没有新的转强信号就不能重仓回去。"],
      ["试错失败要快走", "长缆科技亏损虽小，关键是退出及时；小仓试错的价值在于快速验证，不是主观格局。"],
      ["跨周持仓单独标记", "一鸣食品这种本页未闭环的仓位，要和已闭环盈亏分开看，避免提前归因。"],
    ],
    missing: [
      "7/24 前立新能源历史持仓成本，用于校准跨周真实盈亏。",
      "本周每日账户收益率、收益金额、仓位、当前总金额。",
      "7/31 期末持仓截图，确认一鸣食品成本、市值、浮盈亏与账户总资产。",
      "本周日度KISS复盘与二次反思。",
      "若需要真实5分钟走势，请补券商/同花顺分时截图或允许继续使用行情接口可得数据。",
    ],
    trades: [
      { date: "20260731", time: "13:17:16", code: "601579", name: "一鸣食品", side: "买入", sideType: "buy", qty: 200, price: 19.37, amount: 3874, fee: 5, tax: 0, net: -3879.04, cash: 9340.03, market: "沪A" },
      { date: "20260729", time: "10:06:55", code: "001258", name: "立新能源", side: "卖出", sideType: "sell", qty: 1100, price: 11.61, amount: 12771, fee: 5, tax: 6.39, net: 12759.61, cash: 13219.07, market: "深A" },
      { date: "20260728", time: "11:15:32", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.06, amount: 1506, fee: 5, tax: 0, net: -1511, cash: 459.46, market: "深A" },
      { date: "20260728", time: "09:44:09", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.29, amount: 1529, fee: 5, tax: 0, net: -1534, cash: 1970.46, market: "深A" },
      { date: "20260728", time: "09:41:45", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.4, amount: 1540, fee: 5, tax: 0, net: -1545, cash: 3504.46, market: "深A" },
      { date: "20260728", time: "09:35:33", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.38, amount: 1538, fee: 5, tax: 0, net: -1543, cash: 5049.46, market: "深A" },
      { date: "20260728", time: "09:35:10", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.21, amount: 1521, fee: 5, tax: 0, net: -1526, cash: 6592.46, market: "深A" },
      { date: "20260728", time: "09:34:49", code: "002879", name: "长缆科技", side: "卖出", sideType: "sell", qty: 100, price: 17.9, amount: 1790, fee: 5, tax: 0.9, net: 1784.1, cash: 8118.46, market: "深A" },
      { date: "20260728", time: "09:34:42", code: "001258", name: "立新能源", side: "买入", sideType: "buy", qty: 100, price: 15.35, amount: 1535, fee: 5, tax: 0, net: -1540, cash: 6334.36, market: "深A" },
      { date: "20260728", time: "09:31:39", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 15.36, amount: 1536, fee: 5, tax: 0, net: -1541, cash: 7874.36, market: "深A" },
      { date: "20260728", time: "09:31:33", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 15.44, amount: 1544, fee: 5, tax: 0, net: -1549, cash: 9415.36, market: "深A" },
      { date: "20260728", time: "09:30:45", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 15.62, amount: 1562, fee: 5, tax: 0, net: -1567, cash: 10964.36, market: "深A" },
      { date: "20260728", time: "09:30:22", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 15.64, amount: 1564, fee: 5, tax: 0, net: -1569, cash: 12531.36, market: "深A" },
      { date: "20260728", time: "09:30:20", code: "001258", name: "立新能源", side: "对方买入", sideType: "buy", qty: 100, price: 15.64, amount: 1564, fee: 5, tax: 0, net: -1569, cash: 14100.36, market: "深A" },
      { date: "20260727", time: "13:49:32", code: "002879", name: "长缆科技", side: "买入", sideType: "buy", qty: 100, price: 19.86, amount: 1986, fee: 5, tax: 0, net: -1991, cash: 15669.36, market: "深A" },
      { date: "20260727", time: "10:44:30", code: "600664", name: "哈药股份", side: "卖出", sideType: "sell", qty: 100, price: 5.57, amount: 557, fee: 5, tax: 0.28, net: 551.71, cash: 17660.36, market: "沪A" },
      { date: "20260724", time: "10:05:05", code: "600664", name: "哈药股份", side: "买入", sideType: "buy", qty: 100, price: 5.4, amount: 540, fee: 5, tax: 0, net: -545.01, cash: 17108.65, market: "沪A" },
      { date: "20260724", time: "09:39:14", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 100, price: 12.99, amount: 1299, fee: 5, tax: 0.65, net: 1293.35, cash: 17653.66, market: "深A" },
      { date: "20260724", time: "09:32:28", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 100, price: 12.85, amount: 1285, fee: 5, tax: 0.64, net: 1279.36, cash: 16360.31, market: "深A" },
      { date: "20260724", time: "09:32:26", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 200, price: 12.81, amount: 2562, fee: 5, tax: 1.28, net: 2555.72, cash: 15080.95, market: "深A" },
      { date: "20260724", time: "09:32:21", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 300, price: 12.95, amount: 3885, fee: 5, tax: 1.94, net: 3878.06, cash: 12525.23, market: "深A" },
      { date: "20260724", time: "09:32:01", code: "001258", name: "立新能源", side: "对方卖出", sideType: "sell", qty: 600, price: 13.2, amount: 7920, fee: 5, tax: 3.96, net: 7911.04, cash: 8647.17, market: "深A" },
    ],
  },
  {
    folder: "2026-07-31_2026-08-08",
    rangeText: "2026.07.31 - 2026.08.08",
    tradeRangeText: "2026.07.31 - 2026.08.06",
    label: "07.31-08.08",
    status: "补档草稿",
    title: "半导ETF小赚闭环，风范股份期末持仓待验证",
    subtitle: "本页基于 2026/7/31-8/8 成交截图补档生成。截图含 7/31 一鸣食品成本行，账户日收益、期末持仓、日度KISS与二次反思待补后再校准。",
    accountNote: "账户日收益、收益率、仓位、期末权益暂缺；本页只计算截图可闭环的成交贡献。",
    thesis: "这一周更像是轻量试错和仓位切换：一鸣食品跨周小赚卖出，半导体ETF/科创半导形成小赚闭环，8/6 集中买入风范股份形成期末待验证仓。核心缺口是风范股份期末市值与浮盈亏。",
    dailyNotes: [
      { date: "20260731", day: "周五", theme: "一鸣食品成本行", action: "买入一鸣食品200股。", review: "该行用于给 8/3 卖出提供成本，属于跨周带入，不单独作为本周结论。" },
      { date: "20260803", day: "周一", theme: "一鸣兑现，半导试错", action: "卖出一鸣食品200股；买入半导体设备ETF国泰5000份、科创半导ETF华夏3600份。", review: "一鸣食品小赚闭环，半导ETF属于科技线试错。ETF仓位相对个股更分散，但仍需要次日强度验证。" },
      { date: "20260804", day: "周二", theme: "半导ETF兑现", action: "卖出半导体设备ETF国泰5000份、科创半导ETF华夏3600份。", review: "两只ETF都完成小幅正闭环，说明试错后能及时兑现，没有把ETF小反弹误判成大主升。" },
      { date: "20260806", day: "周四", theme: "风范股份建仓", action: "分6笔买入风范股份1800股。", review: "风范股份是本页最大期末待验证仓，真实结果取决于后续持仓截图和卖出处理；当前只能记录买入动作和成本。" },
    ],
    stockNotes: {
      "601579": "一鸣食品 7/31 买入200股，8/3 卖出200股，截图内小幅正贡献。它是跨周小闭环，不是本周主线。",
      "159516": "半导体设备ETF国泰 8/3 买入5000份，8/4 分三笔卖出5000份，截图内小赚。ETF试错能够快进快出，是比追单一科技个股更稳的动作。",
      "588170": "科创半导ETF华夏 8/3 买入3600份，8/4 分三笔卖出3600份，截图内小赚。它和半导设备ETF一起验证科技线弹性，但不能在不确认主升时升级仓位。",
      "601700": "风范股份 8/6 分6笔买入1800股，期末是否盈利取决于后续持仓和卖出数据。当前只能按持仓待验证处理。",
    },
    rules: [
      ["ETF试错快验快走", "半导ETF本周小赚，关键不是赚得多，而是试错后能及时兑现，不把小反弹升级成主升。"],
      ["趋势不明优先ETF", "科技方向没有明确唯一龙头时，ETF比中位个股更适合试错，仓位和预期都要低一级。"],
      ["期末持仓别提前归因", "风范股份只有买入没有卖出和期末浮盈亏，暂时只能写成待验证仓，不能提前说赚亏根源。"],
      ["跨周成本要保留", "一鸣食品这种跨周买卖必须保留上一周成本行，否则闭环盈亏会失真。"],
    ],
    missing: [
      "8/8 或该周最后交易日期的期末持仓截图，重点确认风范股份1800股成本、市价、市值、浮盈亏、账户总资产。",
      "本周每日账户收益率、收益金额、仓位、当前总金额。",
      "本周日度KISS复盘与二次反思。",
      "若需要真实5分钟走势，请补券商/同花顺分时截图或确认使用行情接口可得数据。",
    ],
    trades: [
      { date: "20260806", time: "13:07:22", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 200, price: 7.16, amount: 1432, fee: 5, tax: 0, net: -1437.02, cash: 487.21, market: "沪A" },
      { date: "20260806", time: "09:39:14", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 100, price: 7.16, amount: 716, fee: 5, tax: 0, net: -721.01, cash: 1924.23, market: "沪A" },
      { date: "20260806", time: "09:38:29", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 500, price: 7.16, amount: 3580, fee: 5, tax: 0, net: -3585.04, cash: 4082.25, market: "沪A" },
      { date: "20260806", time: "09:38:29", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 200, price: 7.16, amount: 1432, fee: 5, tax: 0, net: -1437.01, cash: 2645.24, market: "沪A" },
      { date: "20260806", time: "09:38:26", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 600, price: 7.16, amount: 4296, fee: 5, tax: 0, net: -4301.04, cash: 9104.3, market: "沪A" },
      { date: "20260806", time: "09:38:26", code: "601700", name: "风范股份", side: "买入", sideType: "buy", qty: 200, price: 7.16, amount: 1432, fee: 5, tax: 0, net: -1437.01, cash: 7667.29, market: "沪A" },
      { date: "20260804", time: "13:36:44", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 2300, price: 0.645, amount: 1483.5, fee: 5, tax: 0, net: 1478.5, cash: 12096.34, market: "深A" },
      { date: "20260804", time: "13:36:41", code: "588170", name: "科创半导ETF华夏", side: "卖出", sideType: "sell", qty: 1500, price: 0.876, amount: 1314, fee: 5, tax: 0, net: 1309, cash: 13405.34, market: "沪A" },
      { date: "20260804", time: "13:24:00", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1100, price: 0.637, amount: 700.7, fee: 5, tax: 0, net: 695.7, cash: 9844.34, market: "深A" },
      { date: "20260804", time: "13:23:43", code: "588170", name: "科创半导ETF华夏", side: "卖出", sideType: "sell", qty: 900, price: 0.865, amount: 778.5, fee: 5, tax: 0, net: 773.5, cash: 10617.84, market: "沪A" },
      { date: "20260804", time: "13:13:04", code: "588170", name: "科创半导ETF华夏", side: "卖出", sideType: "sell", qty: 1200, price: 0.862, amount: 1034.4, fee: 5, tax: 0, net: 1029.4, cash: 9148.64, market: "沪A" },
      { date: "20260804", time: "13:12:36", code: "159516", name: "半导体设备ETF国泰", side: "卖出", sideType: "sell", qty: 1600, price: 0.632, amount: 1011.2, fee: 5, tax: 0, net: 1006.2, cash: 8119.24, market: "深A" },
      { date: "20260803", time: "13:45:54", code: "588170", name: "科创半导ETF华夏", side: "买入", sideType: "buy", qty: 3600, price: 0.845, amount: 3042, fee: 5, tax: 0, net: -3047, cash: 7113.04, market: "沪A" },
      { date: "20260803", time: "13:36:50", code: "159516", name: "半导体设备ETF国泰", side: "买入", sideType: "buy", qty: 5000, price: 0.614, amount: 3070, fee: 5, tax: 0, net: -3075, cash: 10160.04, market: "深A" },
      { date: "20260803", time: "09:37:01", code: "601579", name: "一鸣食品", side: "卖出", sideType: "sell", qty: 200, price: 19.51, amount: 3902, fee: 5, tax: 1.95, net: 3895.01, cash: 13235.04, market: "沪A" },
      { date: "20260731", time: "13:17:16", code: "601579", name: "一鸣食品", side: "买入", sideType: "buy", qty: 200, price: 19.37, amount: 3874, fee: 5, tax: 0, net: -3879.04, cash: 9340.03, market: "沪A" },
    ],
  },
];

const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("en-US");

function money(value, sign = false) {
  if (typeof value !== "number" || Number.isNaN(value)) return "待补";
  const prefix = sign && value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${fmt.format(Math.abs(value))}`;
}

function rawMoney(value) {
  return typeof value === "number" ? fmt.format(value) : "待补";
}

function qty(value) {
  return intFmt.format(value || 0);
}

function classByValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return value >= 0 ? "is-profit" : "is-loss";
}

function actionClass(sideType) {
  return sideType === "buy" ? "is-buy" : "is-sell";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function shortDate(value) {
  return `${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function sortChronological(rows) {
  return [...rows].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function summarizeWeek(week) {
  const trades = week.trades;
  const buyRows = trades.filter((row) => row.sideType === "buy");
  const sellRows = trades.filter((row) => row.sideType === "sell");
  const turnover = trades.reduce((sum, row) => sum + row.amount, 0);
  const feeTotal = trades.reduce((sum, row) => sum + (row.fee || 0), 0);
  const taxTotal = trades.reduce((sum, row) => sum + (row.tax || 0), 0);
  const netCash = trades.reduce((sum, row) => sum + row.net, 0);
  const byCode = groupByCode(trades);
  const visibleRealized = byCode.reduce((sum, stock) => sum + stock.realized, 0);
  const openCost = byCode.reduce((sum, stock) => sum + stock.openCost, 0);
  const openPositions = byCode.filter((stock) => stock.openQty > 0);
  const dailyStats = groupByDate(trades);
  return { buyRows, sellRows, turnover, feeTotal, taxTotal, netCash, byCode, visibleRealized, openCost, openPositions, dailyStats };
}

function groupByCode(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.code)) {
      map.set(row.code, {
        code: row.code,
        name: row.name,
        rows: [],
        buyQty: 0,
        sellQty: 0,
        buyAmount: 0,
        sellAmount: 0,
        buyCash: 0,
        sellCash: 0,
        realized: 0,
        openQty: 0,
        openCost: 0,
        unmatchedSellQty: 0,
      });
    }
    const stock = map.get(row.code);
    stock.rows.push(row);
    if (row.sideType === "buy") {
      stock.buyQty += row.qty;
      stock.buyAmount += row.amount;
      stock.buyCash += Math.abs(row.net);
    } else {
      stock.sellQty += row.qty;
      stock.sellAmount += row.amount;
      stock.sellCash += row.net;
    }
  }

  for (const stock of map.values()) {
    Object.assign(stock, calculateFifo(stock.rows));
  }
  return [...map.values()].sort((a, b) => Math.abs(b.realized) - Math.abs(a.realized));
}

function calculateFifo(rows) {
  const lots = [];
  let realized = 0;
  let unmatchedSellQty = 0;

  for (const row of sortChronological(rows)) {
    if (row.sideType === "buy") {
      lots.push({ qty: row.qty, costPerShare: Math.abs(row.net) / row.qty });
      continue;
    }

    let remaining = row.qty;
    let sellCashLeft = row.net;
    while (remaining > 0 && lots.length) {
      const lot = lots[0];
      const used = Math.min(remaining, lot.qty);
      const sellCash = sellCashLeft * (used / remaining);
      realized += sellCash - used * lot.costPerShare;
      sellCashLeft -= sellCash;
      lot.qty -= used;
      remaining -= used;
      if (lot.qty <= 0.00001) lots.shift();
    }
    unmatchedSellQty += remaining;
  }

  const openQty = lots.reduce((sum, lot) => sum + lot.qty, 0);
  const openCost = lots.reduce((sum, lot) => sum + lot.qty * lot.costPerShare, 0);
  return { realized, openQty, openCost, unmatchedSellQty };
}

function groupByDate(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.date)) {
      map.set(row.date, { date: row.date, trades: 0, buyAmount: 0, sellAmount: 0, fee: 0, tax: 0, stocks: new Set() });
    }
    const item = map.get(row.date);
    item.trades += 1;
    item.stocks.add(`${row.code} ${row.name}`);
    item.fee += row.fee || 0;
    item.tax += row.tax || 0;
    if (row.sideType === "buy") item.buyAmount += row.amount;
    else item.sellAmount += row.amount;
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function renderWeekPage(week) {
  const summary = summarizeWeek(week);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${week.rangeText} 周度交易复盘</title>
  <style>${sharedStyles()}</style>
</head>
<body>
  <nav class="rail" aria-label="页面导航">
    <a href="../weekly-trading-review/">周度主页</a>
    <a href="../">总入口</a>
    <a href="#overview">总览</a>
    <a href="#profit-loss">盈亏票</a>
    <a href="#account">账户</a>
    <a href="#stocks">标的</a>
    <a href="#daily">逐日</a>
    <a href="#rules">规则</a>
    <a href="#trades">成交</a>
  </nav>
  <main class="page-shell">
    <section class="hero" id="overview">
      <div>
        <span class="label">${week.status} / 截图成交口径</span>
        <h1><span class="date-range"><span>${week.rangeText.replace(" - ", " -</span><span>")}</span></span>周度交易复盘</h1>
        <p>${week.subtitle}</p>
        <div class="button-row">
          <a class="button" href="../weekly-trading-review/">返回周度主页</a>
          <a class="button secondary" href="#missing">待补清单</a>
        </div>
      </div>
      <div class="metrics">
        ${metricCard("成交笔数", `${week.trades.length}`, "仅统计截图可见已成记录")}
        ${metricCard("可见闭环盈亏", money(summary.visibleRealized, true), "FIFO / 只算截图内可配对买卖", classByValue(summary.visibleRealized))}
        ${metricCard("期末可见成本", money(summary.openCost), `${summary.openPositions.length} 个未闭环标的`)}
        ${metricCard("账户收益", "待补", "需每日账户收益表")}
      </div>
    </section>

    <section class="panel thesis-panel">
      <span class="label">Week Thesis</span>
      <h2>${escapeHtml(week.title)}</h2>
      <p class="lead">${escapeHtml(week.thesis)}</p>
      <div class="thesis-grid">
        <article><b>成交口径</b><p>本页按截图中可见的成交日期、价格、数量、手续费、印花税、发生金额重建；不发布合同号、成交编号等敏感字段。</p></article>
        <article><b>账户口径</b><p>${escapeHtml(week.accountNote)}</p></article>
        <article><b>跨周提醒</b><p>截图中存在跨周成本行，已在对应标的里单独说明；未配对的历史卖出不强行计算盈亏。</p></article>
      </div>
    </section>

    <section class="panel data-panel">
      <div>
        <span class="label">Data Scope</span>
        <h2>本版数据口径</h2>
        <p>成交截图不含账户日收益、期末持仓市值与完整历史成本。本页先用于补齐交割动作、可闭环票、开放仓位和待补材料；后续你给账户表和二次反思后再校准账户结论。</p>
      </div>
      <div class="summary-grid">
        <span>买入笔数 <b>${summary.buyRows.length}</b></span>
        <span>卖出笔数 <b>${summary.sellRows.length}</b></span>
        <span>成交额 <b>${money(summary.turnover)}</b></span>
        <span>现金差额 <b class="${classByValue(summary.netCash)}">${money(summary.netCash, true)}</b></span>
        <span>费用合计 <b>${money(summary.feeTotal + summary.taxTotal)}</b></span>
        <span>未闭环成本 <b>${money(summary.openCost)}</b></span>
      </div>
    </section>

    ${renderProfitLossPanel(week, summary)}
    ${renderAccountPanel(week)}
    ${renderStocksPanel(week, summary)}
    ${renderDailyPanel(week, summary)}
    ${renderRulesPanel(week)}
    ${renderTradeTable(week)}
    ${renderMissingPanel(week)}
  </main>
</body>
</html>`;
}

function metricCard(label, value, foot, className = "") {
  return `<article class="metric"><span>${label}</span><strong class="${className}">${value}</strong><small>${foot}</small></article>`;
}

function renderProfitLossPanel(week, summary) {
  const important = summary.byCode.slice(0, 4);
  return `<section class="panel" id="profit-loss">
    <span class="label">Profit / Loss Roots</span>
    <h2>本周持有/闭环票：赚钱与亏损主因</h2>
    <div class="stock-grid tight">${important.map((stock) => `
      <article class="stock-card">
        <div class="stock-card-head"><div><span class="code">${stock.code}</span><h3>${stock.name}</h3></div><span class="chip">${stock.rows.length} 笔</span></div>
        <div class="stock-metrics">
          <span>可见已实现 <b class="${classByValue(stock.realized)}">${money(stock.realized, true)}</b><em>${stock.unmatchedSellQty ? `另有历史卖出 ${qty(stock.unmatchedSellQty)} 未配成本` : "截图内FIFO"}</em></span>
          <span>期末可见 <b>${stock.openQty ? `${qty(stock.openQty)} / ${money(stock.openCost)}` : "已清仓"}</b><em>持仓截图待校准</em></span>
        </div>
        <p>${escapeHtml(week.stockNotes[stock.code] || "截图成交已记录，等待账户和持仓数据补齐后再做最终归因。")}</p>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderAccountPanel(week) {
  return `<section class="panel" id="account">
    <span class="label">Account Curve</span>
    <h2>账户收益与仓位</h2>
    <p class="lead">${escapeHtml(week.accountNote)}</p>
    <div class="account-placeholder">
      <article><b>每日收益率</b><span>待补</span></article>
      <article><b>每日收益金额</b><span>待补</span></article>
      <article><b>每日仓位</b><span>待补</span></article>
      <article><b>期末总金额</b><span>待补</span></article>
    </div>
  </section>`;
}

function renderStocksPanel(week, summary) {
  return `<section class="panel" id="stocks">
    <span class="label">Stock Review</span>
    <h2>标的复盘与买卖点</h2>
    <div class="table-wrap compact-table">
      <table>
        <thead><tr><th>标的</th><th>买入数量</th><th>买入金额</th><th>卖出数量</th><th>卖出金额</th><th>可见已实现</th><th>期末可见</th></tr></thead>
        <tbody>${summary.byCode.map((stock) => `
          <tr>
            <td><a href="#stock-${stock.code}">${stock.code} ${stock.name}</a></td>
            <td>${qty(stock.buyQty)}</td>
            <td>${money(stock.buyAmount)}</td>
            <td>${qty(stock.sellQty)}</td>
            <td>${money(stock.sellAmount)}</td>
            <td class="${classByValue(stock.realized)}">${money(stock.realized, true)}</td>
            <td>${stock.openQty ? `${qty(stock.openQty)} / ${money(stock.openCost)}` : "已清仓"}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="stock-grid">${summary.byCode.map((stock) => renderStockCard(week, stock)).join("")}</div>
  </section>`;
}

function renderStockCard(week, stock) {
  const rows = sortChronological(stock.rows);
  return `<article class="stock-card" id="stock-${stock.code}">
    <div class="stock-card-head">
      <div><span class="code">${stock.code}</span><h3>${stock.name}</h3></div>
      <span class="chip">${stock.rows.length} 笔</span>
    </div>
    <div class="stock-metrics">
      <span>买入 <b>${qty(stock.buyQty)}</b><em>${money(stock.buyAmount)} / 现金${money(stock.buyCash)}</em></span>
      <span>卖出 <b>${qty(stock.sellQty)}</b><em>${money(stock.sellAmount)} / 到账${money(stock.sellCash)}</em></span>
      <span>可见已实现 <b class="${classByValue(stock.realized)}">${money(stock.realized, true)}</b><em>FIFO / 含截图费用</em></span>
      <span>期末可见 <b>${stock.openQty ? `${qty(stock.openQty)} 股/份，成本${money(stock.openCost)}` : "已清仓"}</b><em>持仓截图待校准</em></span>
    </div>
    <p>${escapeHtml(week.stockNotes[stock.code] || "成交回报口径已记录，等待账户和持仓数据补齐后做最终归因。")}</p>
    <div class="chart-frame">
      <div class="chart-empty">
        <b>真实5分钟走势待补</b>
        <span>当前补档页只展示截图成交点，不伪造价格路径。补分时图或可用行情数据后再画完整买卖点走势。</span>
      </div>
      <div class="trade-points">${rows.map((row) => `
        <span class="${actionClass(row.sideType)}">${row.sideType === "buy" ? "B" : "S"} ${shortDate(row.date)} ${row.time.slice(0, 5)} ${money(row.price)} / ${qty(row.qty)}</span>`).join("")}</div>
    </div>
  </article>`;
}

function renderDailyPanel(week, summary) {
  const notes = new Map(week.dailyNotes.map((note) => [note.date, note]));
  const dates = [...new Set([...summary.dailyStats.map((item) => item.date), ...week.dailyNotes.map((note) => note.date)])].sort();
  return `<section class="panel" id="daily">
    <span class="label">Daily Review</span>
    <h2>逐日复盘</h2>
    <div class="day-grid-cards">${dates.map((date) => {
      const stat = summary.dailyStats.find((item) => item.date === date);
      const note = notes.get(date);
      return `<article class="day-card">
        <div class="day-card-head"><b>${note?.day || formatDate(date)}</b><span>${shortDate(date)}</span></div>
        <h3>${escapeHtml(note?.theme || "成交日")}</h3>
        <p>${escapeHtml(note?.action || "截图含当日成交，具体日度KISS待补。")}</p>
        <div class="account-strip"><span>买入额 <b>${money(stat?.buyAmount || 0)}</b></span><span>卖出额 <b>${money(stat?.sellAmount || 0)}</b></span><span>成交笔数 <b>${stat?.trades || 0}</b></span></div>
        <p><b>初步复盘：</b>${escapeHtml(note?.review || "等待日度复盘文本补齐。")}</p>
      </article>`;
    }).join("")}</div>
  </section>`;
}

function renderRulesPanel(week) {
  return `<section class="panel" id="rules">
    <span class="label">Rules</span>
    <h2>本周暂定规则</h2>
    <p class="lead">这些规则来自截图成交反推，等你补二次反思后再替换成正式版本。</p>
    <div class="rules">${week.rules.map((rule, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(rule[0])}</b><p>${escapeHtml(rule[1])}</p></article>`).join("")}</div>
  </section>`;
}

function renderTradeTable(week) {
  return `<section class="panel" id="trades">
    <span class="label">Transactions</span>
    <h2>成交明细</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>日期</th><th>时间</th><th>代码</th><th>名称</th><th>方向</th><th>数量</th><th>均价</th><th>金额</th><th>费用</th><th>发生金额</th><th>资金余额</th><th>市场</th></tr></thead>
        <tbody>${week.trades.map((row) => `
          <tr>
            <td>${formatDate(row.date)}</td>
            <td>${row.time}</td>
            <td>${row.code}</td>
            <td>${escapeHtml(row.name)}</td>
            <td class="${actionClass(row.sideType)}">${escapeHtml(row.side)}</td>
            <td>${qty(row.qty)}</td>
            <td>${money(row.price)}</td>
            <td>${money(row.amount)}</td>
            <td>${money((row.fee || 0) + (row.tax || 0))}</td>
            <td class="${classByValue(row.net)}">${money(row.net, true)}</td>
            <td>${money(row.cash)}</td>
            <td>${row.market}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>
  </section>`;
}

function renderMissingPanel(week) {
  return `<section class="panel missing-panel" id="missing">
    <span class="label">To Fill</span>
    <h2>后续待补内容</h2>
    <div class="missing-list">${week.missing.map((item, index) => `<article><b>${index + 1}. ${escapeHtml(item.split("，")[0])}</b><p>${escapeHtml(item)}</p></article>`).join("")}</div>
  </section>`;
}

function sharedStyles() {
  return `
    :root{--bg:#f5f7fa;--panel:#fff;--ink:#0f1b2a;--muted:#64748b;--line:#d9e1ea;--accent:#c2412d;--profit:#b91c1c;--loss:#047857;--blue:#1d4ed8;--soft:#f8fafc;--shadow:0 18px 45px rgba(15,27,42,.08)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,"Microsoft YaHei",sans-serif;line-height:1.7}a{color:inherit;text-decoration:none}
    .page-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:28px 0 48px}.rail{position:sticky;top:0;z-index:10;display:flex;gap:8px;flex-wrap:wrap;width:min(1180px,calc(100% - 32px));margin:0 auto;padding:10px 0;background:rgba(245,247,250,.92);backdrop-filter:blur(10px)}.rail a,.button{border-radius:8px;background:var(--ink);color:#fff;padding:10px 14px;font-weight:700;font-size:14px}.rail a{background:#fff;color:var(--ink);border:1px solid var(--line)}.button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.button-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .hero,.panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:28px;margin-bottom:18px}.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center}.label{display:inline-block;border-radius:999px;background:#fff0ec;color:var(--accent);font-weight:800;font-size:12px;padding:6px 10px;margin-bottom:10px}h1{font-size:48px;line-height:1.1;margin:0 0 14px;letter-spacing:0}h2{font-size:26px;margin:0 0 10px}h3{margin:0 0 8px}.date-range{display:grid}.lead,.hero p{color:#475569;font-size:16px}
    .metrics,.summary-grid,.stock-metrics,.account-placeholder,.account-strip,.latest-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.metric,.summary-grid span,.stock-metrics span,.account-placeholder article,.account-strip span{border:1px solid var(--line);border-radius:8px;background:var(--soft);padding:12px}.metric span,.summary-grid span,.stock-metrics em,.account-strip span{color:var(--muted);font-style:normal}.metric strong{display:block;font-size:24px}.metric small,.stock-metrics em{display:block;font-size:12px;color:var(--muted)}
    .is-profit{color:var(--profit)!important}.is-loss{color:var(--loss)!important}.is-buy{color:#dc2626;font-weight:800}.is-sell{color:#1d4ed8;font-weight:800}.thesis-grid,.stock-grid,.rules,.missing-list,.day-grid-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.thesis-grid article,.stock-card,.rules article,.missing-list article,.day-card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:16px}.stock-grid.tight{grid-template-columns:repeat(2,minmax(0,1fr))}
    .stock-card-head,.day-card-head{display:flex;justify-content:space-between;gap:10px;align-items:start}.code,.chip{color:var(--muted);font-size:13px}.chip{border:1px solid var(--line);border-radius:999px;padding:4px 8px;background:var(--soft)}.chart-frame{border:1px solid var(--line);border-radius:9px;background:#f8fafc;padding:14px;margin-top:12px}.chart-empty{display:grid;gap:4px;color:var(--muted)}.chart-empty b{color:var(--ink)}.trade-points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.trade-points span{border:1px solid var(--line);border-radius:8px;background:#fff;padding:8px;font-size:12px}
    .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px}.compact-table{margin-bottom:16px}table{width:100%;border-collapse:collapse;min-width:920px;background:#fff}th,td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}th:first-child,td:first-child,th:nth-child(4),td:nth-child(4){text-align:left}thead th{background:#f8fafc;color:#475569;font-size:13px}tbody tr:hover{background:#fff7ed}
    @media(max-width:920px){.hero,.metrics,.summary-grid,.stock-metrics,.account-placeholder,.account-strip,.thesis-grid,.stock-grid,.rules,.missing-list,.day-grid-cards,.stock-grid.tight{grid-template-columns:1fr}h1{font-size:36px}.panel,.hero{padding:20px}.page-shell,.rail{width:calc(100% - 16px)}}
  `;
}

for (const week of weeks) {
  const weekDir = path.join(repo, week.folder);
  fs.mkdirSync(weekDir, { recursive: true });
  fs.writeFileSync(path.join(weekDir, "index.html"), renderWeekPage(week), "utf8");
  console.log(`Wrote ${week.folder}\\index.html`);
}
