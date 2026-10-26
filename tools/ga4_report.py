"""
GA4 statistiky pro kinplavani.cz
Použití: python tools/ga4_report.py [--days 28] [--shift 7]

Srovnává s oknem stejné délky posunutým o --shift dní zpět
(výchozí 7 = co ukázal minulý týdenní report). --shift 0 srovnání vypne.

Před prvním spuštěním:
  pip install google-analytics-data
  Uložit service account klíč jako tools/ga4_key.json
  Přidat email účtu (kin-ga4-reader@kin-analytics-510720.iam.gserviceaccount.com)
  jako Viewer do GA4 property 518165982

Scheduled task v Routines: weekly-ga4-report
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        DateRange,
        Dimension,
        Metric,
        RunReportRequest,
        OrderBy,
    )
    from google.oauth2 import service_account
except ImportError:
    print("Chybí knihovna. Spusť: pip install google-analytics-data")
    sys.exit(1)

PROPERTY_ID = "518165982"
KEY_PATH = Path(__file__).parent / "ga4_key.json"


def get_client():
    if not KEY_PATH.exists():
        print(f"Chybí klíč: {KEY_PATH}")
        print("Stáhni JSON klíč ze Google Cloud Console a ulož ho jako tools/ga4_key.json")
        sys.exit(1)
    creds = service_account.Credentials.from_service_account_file(
        str(KEY_PATH),
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    return BetaAnalyticsDataClient(credentials=creds)


def run_report(client, date_range: DateRange):

    # 1. Celkové návštěvy a uživatelé
    req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[date_range],
        metrics=[
            Metric(name="sessions"),
            Metric(name="activeUsers"),
            Metric(name="screenPageViews"),
            Metric(name="bounceRate"),
            Metric(name="averageSessionDuration"),
        ],
    )
    overview = client.run_report(req)

    # 2. Top 10 stránek
    req_pages = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[date_range],
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews"), Metric(name="activeUsers")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
        limit=10,
    )
    pages = client.run_report(req_pages)

    # 3. Custom events
    req_events = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[date_range],
        dimensions=[Dimension(name="eventName")],
        metrics=[Metric(name="eventCount"), Metric(name="totalUsers")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
        limit=20,
    )
    events = client.run_report(req_events)

    # 4. Zdroje návštěvnosti
    req_sources = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[date_range],
        dimensions=[Dimension(name="sessionDefaultChannelGrouping")],
        metrics=[Metric(name="sessions"), Metric(name="activeUsers")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
    )
    sources = client.run_report(req_sources)

    return overview, pages, events, sources


def fmt_duration(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 60}m {s % 60}s"


def fmt_delta(cur: float, prev) -> str:
    """Rozdíl proti minulému období, např. '  (+12, +15 %)'. Bez srovnání prázdné."""
    if prev is None:
        return ""
    d = cur - prev
    if not d:
        return "  (=)"
    pct = f", {d / prev * 100:+.0f} %" if prev else ", nové"
    return f"  ({d:+,.0f}{pct})"


def by_key(report) -> dict:
    """Řádky reportu jako {dimenze: [hodnoty metrik]}."""
    if report is None:
        return {}
    return {
        row.dimension_values[0].value: [float(m.value) for m in row.metric_values]
        for row in report.rows
    }


def print_report(cur, prev, days: int, shift: int):
    overview, pages, events, sources = cur
    p_overview, p_pages, p_events, p_sources = prev if prev else (None,) * 4
    compare = prev is not None

    print(f"\n{'=' * 60}")
    print(f"  KIN plavání – GA4 přehled za posledních {days} dní")
    if compare:
        print(f"  (v závorce rozdíl proti stejnému oknu před {shift} dny)")
    print(f"{'=' * 60}\n")

    if overview.rows:
        v = [float(m.value) for m in overview.rows[0].metric_values]
        pv = [None] * 5
        if compare and p_overview.rows:
            pv = [float(m.value) for m in p_overview.rows[0].metric_values]
        print("CELKEM")
        print(f"  Relace:         {int(v[0]):,}{fmt_delta(v[0], pv[0])}")
        print(f"  Uživatelé:      {int(v[1]):,}{fmt_delta(v[1], pv[1])}")
        print(f"  Zobrazení:      {int(v[2]):,}{fmt_delta(v[2], pv[2])}")
        bounce_delta = "" if pv[3] is None else f"  ({(v[3] - pv[3]) * 100:+.1f} p.b.)"
        print(f"  Bounce rate:    {v[3] * 100:.1f} %{bounce_delta}")
        dur_delta = "" if pv[4] is None else f"  ({v[4] - pv[4]:+.0f} s)"
        print(f"  Prům. délka:    {fmt_duration(v[4])}{dur_delta}")

    prev_pages = by_key(p_pages)
    print("\nTOP 10 STRÁNEK  (zobrazení / uživatelé)")
    for row in pages.rows:
        path = row.dimension_values[0].value
        views = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        delta = fmt_delta(views, prev_pages.get(path, [0])[0]) if compare else ""
        print(f"  {path:<45} {views:>5}  {users:>5}{delta}")

    prev_events = by_key(p_events)
    print("\nEVENTY")
    custom = {"chat_otevreni", "chat_zavreni", "chip_kliknuti", "zprava_odeslana", "zmena_vzhledu"}
    for row in events.rows:
        name = row.dimension_values[0].value
        count = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        marker = "  ← custom" if name in custom else ""
        delta = fmt_delta(count, prev_events.get(name, [0])[0]) if compare else ""
        print(f"  {name:<45} {count:>5}  {users:>4} usr{marker}{delta}")

    prev_sources = by_key(p_sources)
    print("\nZDROJE")
    for row in sources.rows:
        channel = row.dimension_values[0].value
        sessions = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        delta = fmt_delta(sessions, prev_sources.get(channel, [0])[0]) if compare else ""
        print(f"  {channel:<30} {sessions:>5} relací  {users:>5} usr{delta}")
    # Kanály, které minule byly a teď zmizely
    current = {r.dimension_values[0].value for r in sources.rows}
    for channel in sorted(set(prev_sources) - current):
        print(f"  {channel:<30}     0 relací      0 usr{fmt_delta(0, prev_sources[channel][0])}")

    print()


def main():
    parser = argparse.ArgumentParser(description="GA4 report pro kinplavani.cz")
    parser.add_argument("--days", type=int, default=28, help="Počet dní (výchozí: 28)")
    parser.add_argument("--shift", type=int, default=7, help="Srovnat s oknem posunutým o N dní zpět (0 = bez srovnání)")
    args = parser.parse_args()

    client = get_client()
    cur = run_report(client, DateRange(start_date=f"{args.days}daysAgo", end_date="today"))
    prev = None
    if args.shift > 0:
        prev = run_report(
            client,
            DateRange(start_date=f"{args.days + args.shift}daysAgo", end_date=f"{args.shift}daysAgo"),
        )
    print_report(cur, prev, args.days, args.shift)


if __name__ == "__main__":
    main()
