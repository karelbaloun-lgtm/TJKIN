"""
GA4 statistiky pro kinplavani.cz
Použití: python tools/ga4_report.py [--days 28]

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


def run_report(client, days: int):
    date_range = DateRange(start_date=f"{days}daysAgo", end_date="today")

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


def print_report(overview, pages, events, sources, days: int):
    print(f"\n{'=' * 60}")
    print(f"  KIN plavání – GA4 přehled za posledních {days} dní")
    print(f"{'=' * 60}\n")

    if overview.rows:
        r = overview.rows[0]
        v = r.metric_values
        print("CELKEM")
        print(f"  Relace:         {int(v[0].value):,}")
        print(f"  Uživatelé:      {int(v[1].value):,}")
        print(f"  Zobrazení:      {int(v[2].value):,}")
        bounce = float(v[3].value)
        print(f"  Bounce rate:    {bounce * 100:.1f} %")
        dur = float(v[4].value)
        print(f"  Prům. délka:    {fmt_duration(dur)}")

    print("\nTOP 10 STRÁNEK  (zobrazení / uživatelé)")
    for row in pages.rows:
        path = row.dimension_values[0].value
        views = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        print(f"  {path:<45} {views:>5}  {users:>5}")

    print("\nEVENTY")
    custom = {"chat_otevreni", "chat_zavreni", "zmena_vzhledu"}
    for row in events.rows:
        name = row.dimension_values[0].value
        count = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        marker = "  ← custom" if name in custom else ""
        print(f"  {name:<45} {count:>5}  {users:>4} usr{marker}")

    print("\nZDROJE")
    for row in sources.rows:
        channel = row.dimension_values[0].value
        sessions = int(row.metric_values[0].value)
        users = int(row.metric_values[1].value)
        print(f"  {channel:<30} {sessions:>5} relací  {users:>5} usr")

    print()


def main():
    parser = argparse.ArgumentParser(description="GA4 report pro kinplavani.cz")
    parser.add_argument("--days", type=int, default=28, help="Počet dní (výchozí: 28)")
    args = parser.parse_args()

    client = get_client()
    overview, pages, events, sources = run_report(client, args.days)
    print_report(overview, pages, events, sources, args.days)


if __name__ == "__main__":
    main()
