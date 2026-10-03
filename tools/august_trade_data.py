from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date, time
from decimal import Decimal
from pathlib import Path


MONTH = "2026-08"
ZERO = Decimal("0")
DECIMAL_FIELDS = (
    "price", "amount", "commission", "stamp_tax", "other_fees",
    "cash_flow", "cash_balance",
)


def money(value: Decimal, signed: bool = False) -> str:
    return format(value, "+,.2f" if signed else ",.2f")


def load_trade_data(path: Path) -> tuple[list[dict], dict]:
    with path.open(encoding="utf-8", newline="") as source:
        rows = list(csv.DictReader(source))
    seen_ids = set()
    for row in rows:
        if row["row_id"] in seen_ids:
            raise ValueError(f"Duplicate source row: {row['row_id']}")
        seen_ids.add(row["row_id"])
        date.fromisoformat(row["trade_date"])
        date.fromisoformat(row["settlement_date"])
        time.fromisoformat(row["trade_time"])
        if row["side"] not in ("买入", "对方买入", "卖出"):
            raise ValueError(f"Unknown trade side in row {row['row_id']}")
        row["quantity"] = int(row["quantity"])
        for field in DECIMAL_FIELDS:
            row[field] = Decimal(row[field])
        row["is_buy"] = row["side"] != "卖出"
        if row["quantity"] <= 0 or row["is_buy"] != (row["cash_flow"] < ZERO):
            raise ValueError(f"Invalid quantity or cash direction: {row['row_id']}")
        # Displayed average prices may be rounded to three decimal places.
        rounding_limit = Decimal(row["quantity"]) * Decimal("0.0005") + Decimal("0.001")
        if abs(row["amount"] - row["price"] * row["quantity"]) > rounding_limit:
            raise ValueError(f"Amount/price mismatch: {row['row_id']}")
        row["total_cost"] = (
            abs(row["cash_flow"]) - row["amount"] if row["is_buy"]
            else row["amount"] - row["cash_flow"]
        )
        row["fee_difference"] = row["total_cost"] - sum(
            (row[field] for field in ("commission", "stamp_tax", "other_fees")), ZERO
        )
        if row["fee_difference"] < ZERO or row["fee_difference"] > Decimal("0.20"):
            raise ValueError(f"Cash/fee mismatch: {row['row_id']}")

    groups = defaultdict(list)
    for row in rows:
        groups[row["code"]].append(row)
    closed, open_trades, unmatched_sells = [], [], []
    for code, group in groups.items():
        balance, cycle = 0, []
        ordered = sorted(group, key=lambda row: (
            row["trade_date"], row["trade_time"], -int(row["row_id"])
        ))
        for row in ordered:
            if not row["is_buy"] and row["quantity"] > balance:
                unmatched_sells.append(row["row_id"])
                cycle, balance = [], 0
                continue
            cycle.append(row)
            balance += row["quantity"] if row["is_buy"] else -row["quantity"]
            if balance == 0:
                if row["trade_date"].startswith(MONTH):
                    buys = [item for item in cycle if item["is_buy"]]
                    sells = [item for item in cycle if not item["is_buy"]]
                    quantity = sum(item["quantity"] for item in buys)
                    cost = -sum((item["cash_flow"] for item in buys), ZERO)
                    proceeds = sum((item["cash_flow"] for item in sells), ZERO)
                    closed.append({
                        "code": code, "name": row["name"], "quantity": quantity,
                        "buy_date": buys[0]["trade_date"], "sell_date": row["trade_date"],
                        "buy_average": sum((item["amount"] for item in buys), ZERO) / quantity,
                        "sell_average": sum((item["amount"] for item in sells), ZERO) / quantity,
                        "buy_cost": cost, "sell_proceeds": proceeds,
                        "total_cost": sum((item["total_cost"] for item in cycle), ZERO),
                        "net_pnl": proceeds - cost, "return_pct": (proceeds - cost) / cost * 100,
                        "cross_month": not buys[0]["trade_date"].startswith(MONTH),
                        "source_rows": [item["row_id"] for item in cycle],
                    })
                cycle = []
        if balance > 0 and any(row["trade_date"].startswith(MONTH) for row in cycle):
            open_trades.append({
                "code": code, "name": cycle[0]["name"], "quantity": balance,
                "buy_date": cycle[0]["trade_date"],
                "buy_cost": -sum((item["cash_flow"] for item in cycle), ZERO),
                "source_rows": [item["row_id"] for item in cycle],
                "status": "截图内未闭合；期末持仓与估值待核验",
            })

    month_rows = [row for row in rows if row["trade_date"].startswith(MONTH)]
    buys = [row for row in month_rows if row["is_buy"]]
    sells = [row for row in month_rows if not row["is_buy"]]
    closed.sort(key=lambda cycle: cycle["net_pnl"], reverse=True)
    summary = {
        "source": "用户提供的券商交易截图，人工逐行核对转录",
        "query_start": "2026-07-26", "query_end": "2026-08-16",
        "visible_start": min(row["trade_date"] for row in rows),
        "visible_end": max(row["trade_date"] for row in rows),
        "month": MONTH, "full_month_verified": False, "account_return_pct": None,
        "source_row_count": len(rows), "month_row_count": len(month_rows),
        "reference_row_count": len(rows) - len(month_rows),
        "month_buy_count": len(buys), "month_sell_count": len(sells),
        "month_symbol_count": len({row["code"] for row in month_rows}),
        "month_buy_amount": sum((row["amount"] for row in buys), ZERO),
        "month_sell_amount": sum((row["amount"] for row in sells), ZERO),
        "month_commission": sum((row["commission"] for row in month_rows), ZERO),
        "month_stamp_tax": sum((row["stamp_tax"] for row in month_rows), ZERO),
        "month_total_cost": sum((row["total_cost"] for row in month_rows), ZERO),
        "month_fee_difference": sum((row["fee_difference"] for row in month_rows), ZERO),
        "closed_count": len(closed), "closed_net_pnl": sum((item["net_pnl"] for item in closed), ZERO),
        "cross_month_pnl": sum((item["net_pnl"] for item in closed if item["cross_month"]), ZERO),
        "within_month_pnl": sum((item["net_pnl"] for item in closed if not item["cross_month"]), ZERO),
        "closed_trades": closed, "open_trades": open_trades,
        "unmatched_sell_rows": unmatched_sells,
        "pnl_basis": "可见买卖完整配对、八月卖出的整段持有期盈亏；按券商发生金额计入费用，跨月交易含七月买入成本；非整月账户收益",
    }
    return rows, summary
