# CLAUDE.md – KIN České Budějovice

## Projekt
Statický web plaveckého oddílu KIN České Budějovice (kinplavani.cz), hostovaný na Netlify. Git push do `main` = deploy.

## Design pravidla

### Zakazuji generické AI klišé
- Žádné fialovo-modré gradienty na tmavém pozadí jako výchozí estetika.
- Žádné tři stejně široké karty s kruhovými ikonami jen pro vyplnění prostoru.
- Žádné těžké `backdrop-filter: blur` glassmorphism panely přes rušné pozadí.
- Žádné neonové glow bordery nebo bounce/pulse animace na statických prvcích.
- Žádný prázdný marketingový buzzword copy.

### Typografie
- Zavedená sada fontů: **Bebas Neue** pro display/nadpisy, **Barlow Condensed** pro UI a tlačítka.
- Body text (`p`, listy): čitelný neutrální font, `line-height: 1.5–1.65`, max. ~70 znaků na řádek u dlouhých textů (aktuality, články).
- Hierarchie pomocí velikosti a mezery, ne jen tučností.

### Barvy a CSS proměnné
- Vždy používat CSS custom properties definované v `style.css` (`:root`). Nikdy hardcode hex barvy přímo v HTML nebo komponentách.
- Klíčové proměnné: `--hlavni-barva`, `--akcni-barva`, `--gold`, `--pozadi-stranky`, `--pozadi-obsahu`, `--pozadi-sekce`, `--barva-border`, `--barva-nadpisu`.
- Paleta je disciplinovaná: neutrální povrchy + 2 akcentní barvy. Bez dekorativních gradientů tam, kde stačí plochý povrch.

### Layout a rytmus
- Nestřídat stále stejný vzor: hero → 3 karty → CTA → footer. Střídat kadenci sekcí.
- Tabulky, definition listy a kompaktní řádky jsou lepší než karty, pokud komunikují data rychleji.
- Přechody: jemné, `150ms–250ms`, pouze stavová zpětná vazba.

### Obsah
- Žádný lorem ipsum, žádné placeholder závodnice (Jan Novák, acme.cz).
- Používat reálná data: skutečné časy, jména závodnic (Ela Kubíčková, Zoe Tumová…), výsledky z rekordy_kin.html.
- World Aquatics body se v článcích nikdy nezmiňují (ani zkratka „b."). Výjimka: profily a rekordy_kin.html.
- Správný termín je „rozplavba" (ne „rozplávání").

### Kód
- HTML sémantické a přístupné: správné landmarks, focus stavy, pořadí nadpisů.
- Inline styly jen pro skutečně jedinečné hodnoty; pro opakující se vzory CSS třída.
- Transitions a animace subtilní; respektovat `prefers-reduced-motion`.

## Věkové kategorie rekordů
Kategorie se nepřekrývají: ml. junioři 15–16 let, st. junioři 17–18 let. Mladší závodnice nemůže zaplavat rekord starší kategorie.

## Checklist před dokončením UI
1. Kdyby se smazal název KIN, vypadalo by to jako každý jiný AI template?
2. Zaslouží si každá karta, border, stín a animace své místo funkčně nebo strukturálně?
3. Je typografie čitelná a proporcionální na desktopu i mobilu?
4. Jsou všechny interaktivní stavy (hover, focus, error, empty) jasné?
