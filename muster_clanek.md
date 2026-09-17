# Muster článku – KIN České Budějovice

Šablona pro AI agenta, který píše závodní reportáže pro web kinplavani.cz.

---

## Kontext webu

- Jazyk: česky, přátelský tón, fanouškovský ale stručný
- Barvy: červená `#d32f2f` (--hlavni-barva), zlatá `#ffd700` (--akcni-barva)
- Font nadpisů: Barlow Condensed 900, verzálky
- WhatsApp skupina fotek: `https://chat.whatsapp.com/F3wOiqvbZro3JcuR93BoGg`
- Google formulář pro nahrání fotek: `https://forms.gle/ogYmzCAypzpctphz5`
- ID článku: slug z názvu závodu, např. `chomutov-vc-2026`

---

## Vstupy (vyplní agent před psaním)

| Proměnná | Popis | Příklad |
|---|---|---|
| `[NAZEV_ZAVODU]` | Celý název závodu | Velká cena města Chomutova |
| `[DATUM_TEXT]` | Datum pro zobrazení | 11.–12. září 2026 |
| `[DATUM_ISO]` | ISO datum začátku | 2026-09-11 |
| `[MISTO]` | Místo konání | Chomutov |
| `[ODKAZ_VYSLEDKY_PDF]` | URL PDF výsledků z ČSPS | https://vysledky.czechswimming.cz/... |
| `[ODKAZ_SOUTEZE]` | URL stránky závodu | https://vysledky.czechswimming.cz/souteze/9969 |
| `[ARTICLE_ID]` | HTML id článku | chomutov-vc-2026 |
| `[HERO_FOTO]` | Cesta k titulní fotce (volitelné) | images/fotogalerie/2026/... |
| `[VYSLEDKY_KIN]` | Výsledky plavců KIN (viz sekce níže) | — |

---

## 1. Teaser pro index.html

Vložit **nad** existující teaser nebo nahradit stávající. Najít blok s komentářem `<!-- INFO: ... -->` nebo poslední teaser div a přidat před něj.

```html
<!-- INFO: [NAZEV_ZAVODU] -->
<div style="background:var(--pozadi-obsahu);border-radius:14px;border:1px solid rgba(0,0,0,0.07);border-top:4px solid var(--hlavni-barva);padding:20px 24px;box-shadow:0 2px 12px rgba(0,0,0,0.05);margin-bottom:12px;">
    <p style="font-size:0.72em;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--barva-textu-mute);margin:0 0 6px;">Výsledky · [DATUM_TEXT]</p>
    <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:900;text-transform:uppercase;margin:0 0 10px;color:var(--hlavni-barva);">[NAZEV_ZAVODU] – jak si vedli naši?</h3>
    <p style="margin:0 0 14px;">[JEDEN_VĚTA_PEREX – nejzajímavější výsledek, max 1–2 věty.]</p>
    <a href="aktuality.html#[ARTICLE_ID]" style="font-size:0.85em;color:var(--hlavni-barva);font-weight:600;text-decoration:none;">Číst celou reportáž →</a>
</div>
```

---

## 2. Článek pro aktuality.html

Vložit jako **první** `<article>` uvnitř `<main class="aktuality-clanky">`, před stávající články.

### 2a. Varianta BEZ hero fotky

```html
<!-- ===================== [NAZEV_ZAVODU] ===================== -->
<article class="clanek" id="[ARTICLE_ID]" style="border-top-color: var(--hlavni-barva);">
    <div class="clanek-telo-wrap">

        <h2>[NAZEV_ZAVODU]: [KRÁTKÝ TITULEK – co se povedlo]</h2>

        <div class="meta-info">
            <span class="meta-datum">[DATUM_TEXT]</span>
            <span class="meta-misto">[MISTO]</span>
            <span class="meta-akce">Výsledky</span>
        </div>

        <!-- ÚVODNÍ ODSTAVEC: 2–3 věty. Kde, kdy, kolik KIN závodníků startovalo, celkový dojem. -->
        <p>[UVODNI_ODSTAVEC]</p>

        <!-- VÝSLEDKY KIN PLAVCŮ -->
        <div class="vysledky-box">
            <h3>🏊 Výsledky KIN – [NAZEV_ZAVODU]</h3>
            <!-- Pokud jsou medaile / umístění, použij třídy zlata / stribrna / bronzova -->
            <ul class="vysledky-list">
                <!-- Jeden řádek = jeden závodník nebo disciplína -->
                <!-- Formát: Příjmení Jméno – [disciplína] – [umístění nebo čas] -->
                <!-- Příklady: -->
                <!-- <li><span class="zlata">🥇</span> Kubálková Ela – 100 m Z – 1. místo · <strong>1:02,45</strong></li> -->
                <!-- <li>Tůmová Zoe – 200 m V – 4. místo · <strong>2:18,30</strong></li> -->
                [VYSLEDKY_KIN_RADKY]
            </ul>
        </div>

        <!-- ROZVINUTÝ TEXT: 2–4 odstavce. Kontext závodu, zajímavosti, citace nebo postřeh trenéra, atmosféra. -->
        <p>[ROZVITY_TEXT_1]</p>
        <p>[ROZVITY_TEXT_2]</p>

        <!-- ODKAZ NA VÝSLEDKY (pokud existuje PDF) -->
        <p style="font-size:0.85em;color:var(--barva-textu-mute);">
            Kompletní výsledky:
            <a href="[ODKAZ_VYSLEDKY_PDF]" target="_blank" rel="noopener">PDF výsledků ↗</a>
            ·
            <a href="[ODKAZ_SOUTEZE]" target="_blank" rel="noopener">stránka závodu (ČSPS) ↗</a>
        </p>

        <!-- FOTO VÝZVA – vždy na konci, nepřeskakovat -->
        <div class="foto-vyzva">
            <div class="foto-vyzva-ikona">📸</div>
            <p class="foto-vyzva-text"><strong>Fotili jste na závodech?</strong> Pošlete snímky do naší skupiny nebo nahrajte přes formulář – nejlepší fotky přidáme do galerie!</p>
            <a href="https://forms.gle/ogYmzCAypzpctphz5" target="_blank" class="foto-vyzva-btn">Nahrát fotky</a>
            <a href="https://chat.whatsapp.com/F3wOiqvbZro3JcuR93BoGg" target="_blank" class="foto-vyzva-btn" style="background-color:#25D366;">💬 WhatsApp</a>
        </div>

    </div>
</article>
```

### 2b. Varianta S hero fotkou

Přidat `<img class="clanek-hero">` těsně uvnitř `<article>`, před `<div class="clanek-telo-wrap">`:

```html
<article class="clanek" id="[ARTICLE_ID]" style="border-top-color: var(--hlavni-barva);">
    <img src="[HERO_FOTO]" class="clanek-hero" alt="[NAZEV_ZAVODU] [DATUM_ISO_ROK]" style="object-position: center 30%;">
    <div class="clanek-telo-wrap">
        <!-- ... stejný obsah jako 2a ... -->
    </div>
</article>
```

---

## 3. Tabulka výsledků (volitelné, místo vysledky-list)

Použít, pokud závodníků je 5+ nebo jsou výsledky přehledné v tabulce.

```html
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:0.92em;">
    <thead>
        <tr style="background:var(--hlavni-barva);color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Závodník/ce</th>
            <th style="padding:8px 12px;text-align:left;">Disciplína</th>
            <th style="padding:8px 12px;text-align:center;">Umístění</th>
            <th style="padding:8px 12px;text-align:right;">Čas</th>
        </tr>
    </thead>
    <tbody>
        <!-- Zlatá: background rgba(251,192,45,0.15) -->
        <!-- Ostatní: background rgba(0,0,0,0.02) (střídavě) -->
        <tr style="background:rgba(251,192,45,0.15);">
            <td style="padding:8px 12px;font-weight:600;">[PRIJMENI Jméno]</td>
            <td style="padding:8px 12px;">[DISCIPLINA]</td>
            <td style="padding:8px 12px;text-align:center;font-weight:700;color:var(--hlavni-barva);">🥇 1. místo</td>
            <td style="padding:8px 12px;text-align:right;font-family:monospace;">[CAS]</td>
        </tr>
        <tr style="background:rgba(0,0,0,0.02);">
            <td style="padding:8px 12px;font-weight:600;">[PRIJMENI Jméno]</td>
            <td style="padding:8px 12px;">[DISCIPLINA]</td>
            <td style="padding:8px 12px;text-align:center;">🥈 2. místo</td>
            <td style="padding:8px 12px;text-align:right;font-family:monospace;">[CAS]</td>
        </tr>
    </tbody>
</table>
```

---

## 4. Pravidla pro agenta

- **Výsledky KIN pouze** – nezmiňovat ostatní závodníky ani kluby, leda jako kontext (např. "z celkových 120 závodníků")
- **Příjmení před jménem** v tabulkách a výsledkových listech (Kubálková Ela)
- **Časy** vždy v monospace: `<strong>1:02,45</strong>` nebo `font-family:monospace`
- **Titulek** (`<h2>`) max 10 slov, strhující, bez tečky na konci
- **Teaser na index.html** max 2 věty, bez spoilerování celé zprávy
- **Foto výzva** vždy přidat – oba tlačítka (formulář + WhatsApp)
- **Neuvádět** WA body (World Aquatics body)
- **Formát datumu** v `meta-datum`: „11.–12. září 2026" (slovně, s pomlčkou pro vícero dnů)
- Pokud nejsou k dispozici časy ani umístění plavců KIN, napsat otevřeně: „Výsledky KIN závodníků ještě nejsou k dispozici – doplníme co nejdříve."
