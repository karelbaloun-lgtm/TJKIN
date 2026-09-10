#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rekordy_watcher.py — týdenní kontrola krajských rekordů jihočeských klubů.

Co dělá:
  1. Stáhne seznam závodů roku z vysledky.czechswimming.cz (lehký endpoint ?year=).
  2. Vyfiltruje bazénové plavecké závody z posledních N dní (default 7),
     u kterých jsou zveřejněné výsledky. Přeskočí dálkové plavání (poolLength null).
  3. Pro každý závod stáhne výsledky – přednostně LENEX (.lxf/.lef), PDF jen jako záloha.
  4. Z LENEXu vytáhne výkony jihočeských klubů (podle kódu i názvu klubu),
     určí délku bazénu (SCM = 25 m / LCM = 50 m).
  5. Porovná je s aktuálními rekordy v rekordy_kraj.html (ve STEJNÉ délce bazénu)
     napříč věkovými kategoriemi a vypíše návrhy na nové rekordy.
  6. VŽDY přepíše datum "Data aktuální k ..." na dnešní (pokud není --no-date).
  7. Uloží stav (tools/rekordy_watcher_state.json) – datum běhu a ID závodů,
     u nichž ještě nebyly výsledky, aby je příští běh zkontroloval znovu.

Výstup je Markdown report na stdout. Skript sám NErediguje tabulky rekordů ani
necommituje – návrhy je potřeba zkontrolovat a zanést ručně (viz report).

Použití:
    python tools/rekordy_watcher.py                 # report + aktualizace data
    python tools/rekordy_watcher.py --days 14       # širší okno
    python tools/rekordy_watcher.py --no-date       # neměnit HTML vůbec
    python tools/rekordy_watcher.py --comp 10635    # jen konkrétní závod (ladění)

Závislosti: standardní knihovna. pdfplumber jen volitelně pro záložní čtení PDF.
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

# Report je v UTF-8 (Windows konzole / roura bývá cp1250).
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

API = "https://vysledky.czechswimming.cz/cz.zma.csps.portal.rest/api/public"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REKORDY_HTML = os.path.join(ROOT, "rekordy_kraj.html")
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rekordy_watcher_state.json")

# Jihočeské kluby – zkratka -> klíčová slova v názvu klubu (pro případ, že se
# LENEX kód liší od zkratky). Kód i název se porovnávají bez diakritiky, velkými.
JC_CLUBS = {
    "PKJH":  ["jindrich", "jindrichuv hradec"],
    "PLČB":  ["plavani ceske budejovice", "plavani cb"],
    "KIN":   ["koh-i-noor", "koh i noor", "tj kin"],
    "FEZKO": ["fezko"],
    "PKPí":  ["klub pisek", "plavecky klub pisek"],
    "TJTá":  ["tj tabor", "tabor z.s", "tabor, z.s"],
    # širší jihočeský okruh (v tabulkách rekordů se zatím nevyskytují, ale hlídáme):
    "ČKPK":  ["ceskokrumlovsky", "cesky krumlov"],
    "PlPra": ["plavani prachatice"],
}

STROKE_CZ = {
    "FREE": "volný způsob",
    "BACK": "znak",
    "BREAST": "prsa",
    "FLY": "motýlek",
    "MEDLEY": "pol. závod",
}

# Věkové kategorie na stránce (id -> lidský název doplní parser z tlačítek).
AGE_CATS = [
    (14, "cat__actvo_14_let"),
    (13, "cat__actvo_13_let"),
    (12, "cat__actvo_12_let"),
    (11, "cat__actvo_11_let"),
    (10, "cat__actvo_10_let"),
]


# --------------------------------------------------------------------------- utils
def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def norm(s: str) -> str:
    return strip_accents(s or "").upper().strip()


def http_get(url: str, timeout: int = 90) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "tjkin-rekordy-watcher/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def to_seconds(t: str) -> float | None:
    """'00:01:13.23' | '1:02,34' | '28,11' -> sekundy."""
    if not t:
        return None
    t = t.strip().replace(",", ".")
    if t in ("NT", "0", "0.0", "00:00:00.00", "99:99:99.99", "-"):
        return None
    parts = [p for p in t.split(":") if p != ""]
    try:
        if len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        if len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        return float(parts[0])
    except ValueError:
        return None


def fmt_cell_time(sec: float) -> str:
    """Sekundy -> formát tabulky rekordů: 'M:SS,ss' (i pod minutu jako '0:SS,ss')."""
    m = int(sec // 60)
    s = sec - m * 60
    return f"{m}:{s:05.2f}".replace(".", ",")


# --------------------------------------------------------------- competitions list
def fetch_year_competitions(year: int) -> list[dict]:
    data = http_get(f"{API}/competitions?year={year}&month=1")
    return json.loads(data.decode("utf-8"))


def recent_pool_competitions(comps: list[dict], today: dt.date, days: int,
                             extra_ids: set[int]) -> list[dict]:
    lo = today - dt.timedelta(days=days)
    out = []
    for c in comps:
        if c.get("sport") != 1:  # 1 = plavání v bazénu
            continue
        pl = c.get("poolLength")
        if pl not in (25, 50):  # None = dálkové plavání apod.
            continue
        try:
            sd = dt.date.fromisoformat(c["startDate"][:10])
            ed = dt.date.fromisoformat(c["endDate"][:10])
        except (ValueError, KeyError, TypeError):
            continue
        in_window = ed >= lo and sd <= today
        if in_window or c.get("competitionId") in extra_ids:
            out.append({
                "id": c["competitionId"],
                "title": c.get("title", "").strip(),
                "start": sd.isoformat(),
                "end": ed.isoformat(),
                "pool": pl,
                "hasResults": bool(c.get("hasResults")),
            })
    out.sort(key=lambda x: x["start"])
    return out


def fetch_documents(comp_id: int) -> dict:
    return json.loads(http_get(f"{API}/competitions/{comp_id}/documents").decode("utf-8"))


def download_results(comp_id: int, docs: dict, dest_dir: str) -> tuple[str, str] | None:
    """Vrátí (cesta, 'lenex'|'pdf') nebo None. Přednost má LENEX."""
    types = {d.get("type"): d for d in docs.get("documents", [])}
    order = [
        ("C_FILE_LENEX_RESULTS", "lenex"),
        ("RESULTS_PDF", "pdf"),
    ]
    # jakýkoli další "*LENEX*" typ
    for t in types:
        if "LENEX" in (t or "") and (t, "lenex") not in order:
            order.insert(0, (t, "lenex"))
    for t, kind in order:
        if t not in types:
            continue
        url = f"{API}/competitions/{comp_id}/documents/{t}"
        try:
            blob = http_get(url)
        except Exception as e:  # noqa: BLE001
            print(f"  ! stažení {t} selhalo: {e}", file=sys.stderr)
            continue
        ext = "lxf" if kind == "lenex" else "pdf"
        path = os.path.join(dest_dir, f"{comp_id}.{ext}")
        with open(path, "wb") as fh:
            fh.write(blob)
        return path, kind
    return None


# ----------------------------------------------------------------- LENEX parsing
def _lenex_xml(path: str) -> bytes:
    with open(path, "rb") as fh:
        head = fh.read(4)
    if head[:2] == b"PK":
        with zipfile.ZipFile(path) as z:
            name = next((n for n in z.namelist() if n.lower().endswith((".lef", ".lxf", ".xml"))),
                        z.namelist()[0])
            return z.read(name)
    with open(path, "rb") as fh:
        return fh.read()


def parse_lenex(path: str) -> tuple[str, list[dict]]:
    """Vrátí (course, results). course: '25m bazén' / '50m bazén' / '?'."""
    root = ET.fromstring(_lenex_xml(path))
    tag = lambda e: e.tag.split("}")[-1]  # noqa: E731

    course = "?"
    for meet in root.iter():
        if tag(meet) == "MEET" and meet.get("course"):
            c = meet.get("course").upper()
            course = {"SCM": "25m bazén", "LCM": "50m bazén"}.get(c, "?")
            break

    events = {}
    for ev in root.iter():
        if tag(ev) != "EVENT":
            continue
        ss = [c for c in ev if tag(c) == "SWIMSTYLE"]
        if not ss:
            continue
        s = ss[0]
        events[ev.get("eventid")] = {
            "gender": ev.get("gender"),
            "dist": int(s.get("distance")),
            "relay": s.get("relaycount"),
            "stroke": s.get("stroke"),
        }

    results: list[dict] = []
    for club in root.iter():
        if tag(club) != "CLUB":
            continue
        code = club.get("code") or ""
        name = club.get("name") or ""
        abbr = match_jc_club(code, name)
        if not abbr:
            continue
        for ath in club.iter():
            if tag(ath) != "ATHLETE":
                continue
            first = (ath.get("firstname") or "").strip()
            last = (ath.get("lastname") or "").strip()
            by = (ath.get("birthdate") or "")[:4]
            if not by.isdigit():
                continue
            for res in ath.iter():
                if tag(res) != "RESULT":
                    continue
                ev = events.get(res.get("eventid"))
                if not ev or (ev["relay"] and ev["relay"] != "1"):
                    continue
                status = (res.get("status") or "").upper()
                if status in ("DSQ", "DNS", "DNF", "SICK", "WDR"):
                    continue
                sec = to_seconds(res.get("swimtime"))
                if sec is None:
                    continue
                results.append({
                    "club": abbr, "club_name": name,
                    "first": first, "last": last, "birthyear": int(by),
                    "gender": "Muži" if ev["gender"] == "M" else "Ženy",
                    "dist": ev["dist"], "stroke": ev["stroke"],
                    "sec": sec, "swimtime": res.get("swimtime"),
                })
    return course, results


def match_jc_club(code: str, name: str) -> str | None:
    ncode, nname = norm(code), norm(name)
    for abbr, keys in JC_CLUBS.items():
        if ncode == norm(abbr):
            return abbr
        if any(norm(k) in nname for k in keys):
            return abbr
    return None


# ------------------------------------------------------------------ PDF fallback
def scan_pdf_for_jc(path: str) -> list[str]:
    """Bez časového porovnání – jen vytáhne řádky se zkratkami JČ klubů k ruční kontrole."""
    try:
        import pdfplumber  # type: ignore
    except ImportError:
        return ["(pdfplumber není nainstalován – PDF nelze přečíst)"]
    text = ""
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            text += (p.extract_text() or "") + "\n"
    keys = [norm(a) for a in JC_CLUBS] + [
        "JINDRICHUV HRADEC", "FEZKO", "KOH-I-NOOR", "KLUB PISEK", "TJ TABOR",
        "CESKOKRUMLOVSKY", "PLAVANI PRACHATICE", "PLAVANI CESKE BUDEJOVICE",
    ]
    hits = []
    for line in text.splitlines():
        nl = norm(line)
        if any(k in nl for k in keys):
            hits.append(line.strip())
    return hits


# --------------------------------------------------------------- records parsing
def load_records(html_path: str) -> tuple[dict, dict]:
    doc = open(html_path, encoding="utf-8").read()
    btn = dict(re.findall(r"showCat\('([^']+)',this\)\">([^<]+)</button>", doc))
    parts = re.split(r'<section class="rekordy-cat" id="([^"]+)"', doc)
    records: dict[tuple, tuple] = {}
    catname: dict[str, str] = {}
    for i in range(1, len(parts), 2):
        catid = parts[i]
        chunk = parts[i + 1].split("</section>")[0]
        catname[catid] = btn.get(catid, catid)
        for gm in re.finditer(r'<h2 class="gender-nadpis">([^<]+)</h2>(.*?)(?=<h2 class="gender-nadpis">|$)',
                              chunk, re.S):
            gender = gm.group(1).strip()
            for pm in re.finditer(r'<h3 class="pool-nadpis">([^<]+)</h3>(.*?)</table>', gm.group(2), re.S):
                pool = pm.group(1).strip()
                for row in re.findall(r"<tr[^>]*>(.*?)</tr>", pm.group(2), re.S):
                    tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)
                    if len(tds) != 5:
                        continue
                    clean = lambda x: re.sub(r"\s+", " ", re.sub("<[^>]+>", "", x)).strip()  # noqa: E731
                    disc = clean(tds[0])
                    tstr = clean(tds[1])
                    sec = to_seconds(tstr)
                    if sec is None:
                        continue
                    records[(catid, gender, pool, disc)] = (
                        sec, tstr, clean(tds[2]),
                        clean(tds[3]).replace("KIN KIN", "KIN"),
                        clean(tds[4]).lstrip("*"),
                    )
    return records, catname


def eligible_cats(age: int) -> list[str]:
    cats = ["cat_open"]
    if age <= 18:
        cats.append("cat_star___junio_i")
    if age <= 16:
        cats.append("cat_mlad___junio_i")
    for amax, cid in AGE_CATS:
        if age <= amax:
            cats.append(cid)
    if age <= 9:
        cats.append("cat_9_let_a_mlad__")
    return cats


def discipline_name(dist: int, stroke: str) -> str:
    return f"{dist} m {STROKE_CZ[stroke]}"


def compare(results: list[dict], course: str, records: dict, catname: dict,
            comp_year: int) -> list[dict]:
    # nejlepší čas závodníka na disciplínu (více rozplaveb / rozjížděk)
    best: dict[tuple, dict] = {}
    for r in results:
        key = (r["club"], r["last"], r["first"], r["birthyear"], r["gender"], r["dist"], r["stroke"])
        if key not in best or r["sec"] < best[key]["sec"]:
            best[key] = r

    hits = []
    for r in best.values():
        disc = discipline_name(r["dist"], r["stroke"])
        age = comp_year - r["birthyear"]
        for cid in eligible_cats(age):
            rec = records.get((cid, r["gender"], course, disc))
            row = {
                "cat": catname.get(cid, cid), "cat_id": cid,
                "gender": r["gender"], "pool": course, "disc": disc,
                "name": f"{r['first']} {r['last']}", "club": r["club"],
                "birthyear": r["birthyear"], "new_time": r["swimtime"],
                "new_cell": fmt_cell_time(r["sec"]),
            }
            if rec is None:
                row["kind"] = "chybí řádek v tabulce"
                row["old"] = None
                hits.append(row)
            elif r["sec"] < rec[0] - 1e-6:
                row["kind"] = "překonání"
                row["old"] = f"{rec[1]} ({rec[2]}, {rec[3]} *{rec[4]})"
                row["delta"] = rec[0] - r["sec"]
                hits.append(row)
    hits.sort(key=lambda x: (x["pool"], x["gender"], x["cat_id"], x["disc"]))
    return hits


# ---------------------------------------------------------------------- date bump
def bump_date(html_path: str, today: dt.date) -> str | None:
    doc = open(html_path, encoding="utf-8").read()
    new = f"Data aktuální k {today.day}. {today.month}. {today.year}"
    doc2, n = re.subn(r"Data aktuální k \d{1,2}\. \d{1,2}\. \d{4}", new, doc)
    if n == 0:
        return None
    if doc2 != doc:
        open(html_path, "w", encoding="utf-8", newline="\n").write(doc2)
    return new


# ---------------------------------------------------------------------- state
def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        try:
            return json.loads(open(STATE_FILE, encoding="utf-8").read())
        except (ValueError, OSError):
            pass
    return {"last_run": None, "pending_result_ids": []}


def save_state(state: dict) -> None:
    open(STATE_FILE, "w", encoding="utf-8", newline="\n").write(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n")


# ---------------------------------------------------------------------- main
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=7, help="okno zpět ve dnech (default 7)")
    ap.add_argument("--no-date", action="store_true", help="neaktualizovat datum v HTML")
    ap.add_argument("--comp", type=int, action="append", help="zkontrolovat jen daný závod (lze víckrát)")
    ap.add_argument("--tmp", default=os.path.join(ROOT, ".rekordy_tmp"), help="adresář pro stažené soubory")
    args = ap.parse_args()

    today = dt.date.today()
    os.makedirs(args.tmp, exist_ok=True)
    state = load_state()
    pending = set(state.get("pending_result_ids", []))

    print(f"# Kontrola krajských rekordů – {today.day}. {today.month}. {today.year}\n")

    try:
        comps_raw = fetch_year_competitions(today.year)
    except Exception as e:  # noqa: BLE001
        print(f"**CHYBA:** nepodařilo se stáhnout seznam závodů: {e}")
        comps_raw = []

    if args.comp:
        wanted = set(args.comp)
        comps = [{
            "id": c["competitionId"], "title": c.get("title", "").strip(),
            "start": c["startDate"][:10], "end": c["endDate"][:10],
            "pool": c.get("poolLength"), "hasResults": bool(c.get("hasResults")),
        } for c in comps_raw if c["competitionId"] in wanted]
    else:
        comps = recent_pool_competitions(comps_raw, today, args.days, pending)

    if not comps:
        print("_V zadaném okně nebyl nalezen žádný bazénový plavecký závod._\n")

    checked, all_hits, new_pending = [], [], []
    for c in comps:
        label = f"**{c['id']}** – {c['title']} ({c['start']}"
        label += f"–{c['end']}" if c["end"] != c["start"] else ""
        label += f", {c['pool']}m)"
        if not c["hasResults"]:
            print(f"- {label}: výsledky zatím nezveřejněny – zkontroluje se příště")
            new_pending.append(c["id"])
            continue
        try:
            docs = fetch_documents(c["id"])
            got = download_results(c["id"], docs, args.tmp)
        except Exception as e:  # noqa: BLE001
            print(f"- {label}: chyba při stahování dokumentů: {e}")
            new_pending.append(c["id"])
            continue
        if not got:
            print(f"- {label}: nenalezeny výsledkové soubory (LENEX ani PDF)")
            new_pending.append(c["id"])
            continue
        path, kind = got
        if kind == "pdf":
            hits_lines = scan_pdf_for_jc(path)
            checked.append((c, "pdf", 0))
            if hits_lines:
                print(f"- {label}: **jen PDF** – ruční kontrola těchto řádků:")
                for ln in hits_lines[:40]:
                    print(f"    - `{ln}`")
            else:
                print(f"- {label}: jen PDF, žádná jihočeská zmínka nenalezena")
            continue
        try:
            course, results = parse_lenex(path)
        except Exception as e:  # noqa: BLE001
            print(f"- {label}: chyba při parsování LENEXu: {e}")
            new_pending.append(c["id"])
            continue
        pool_from_meta = f"{c['pool']}m bazén"
        if course == "?":
            course = pool_from_meta
        comp_year = int(c["start"][:4])
        records, catname = load_records(REKORDY_HTML)
        hits = compare(results, course, records, catname, comp_year)
        clubs_present = sorted({r["club"] for r in results})
        checked.append((c, course, len(clubs_present)))
        print(f"- {label}: LENEX OK, bazén {course}, "
              f"jihočeská účast: {', '.join(clubs_present) or 'žádná'}, "
              f"{'**' + str(len(hits)) + ' návrh(ů) na rekord**' if hits else 'bez nových rekordů'}")
        all_hits.extend(hits)

    # ---- souhrn návrhů
    print("\n## Návrhy na nové rekordy\n")
    if not all_hits:
        print("_Žádné._ Žádný jihočeský výkon nepřekonal stávající krajský rekord "
              "ve stejné délce bazénu.\n")
    else:
        print("| Kategorie | Pohlaví | Bazén | Disciplína | Nový čas | Závodník/ce | Klub | Roč. | Stávající rekord |")
        print("|---|---|---|---|---|---|---|---|---|")
        for h in all_hits:
            old = h["old"] if h["old"] else f"_{h['kind']}_"
            print(f"| {h['cat']} | {h['gender']} | {h['pool']} | {h['disc']} | "
                  f"**{h['new_cell']}** | {h['name']} | {h['club']} | *{h['birthyear']} | {old} |")
        print("\n> Pozn.: věková způsobilost je jen orientační (věk = rok závodu − ročník); "
              "před zápisem ověřit kategorii ručně. Skript tabulky needituje.\n")

    # ---- datum
    print("## Aktualizace data\n")
    if args.no_date:
        print("_Přeskočeno (--no-date)._\n")
    else:
        res = bump_date(REKORDY_HTML, today)
        if res:
            print(f"`rekordy_kraj.html`: „{res}“\n")
        else:
            print("**CHYBA:** řádek „Data aktuální k …“ nebyl v HTML nalezen.\n")

    # ---- stav
    state["last_run"] = today.isoformat()
    state["pending_result_ids"] = sorted(set(new_pending))
    save_state(state)

    # ---- shrnutí pro report
    print("## Shrnutí\n")
    print(f"- Zkontrolováno závodů: {len(checked)}")
    for c, course, nclubs in checked:
        print(f"  - {c['id']} – {c['title']} · {course} · jihočeských klubů: {nclubs}")
    if new_pending:
        print(f"- Čeká na výsledky (příští běh): {', '.join(map(str, sorted(set(new_pending))))}")
    print(f"- Nových rekordů k zápisu: {len(all_hits)}")
    print("\n> Commit: pokud jsou návrhy prázdné -> "
          "`chore: aktualizovat datum kontroly krajských rekordů – "
          f"{today.day}. {today.month}. {today.year}`")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
