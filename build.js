/**
 * Build skript – generuje aktuality-data.json z Markdown souborů v _aktuality/
 * Spouští se automaticky při každém deployi na Netlify.
 *
 * Přidat nový článek = přidat .md soubor přes Decap CMS na kinplavani.cz/admin
 */

const fs   = require('fs');
const path = require('path');

const SLOZKA = '_aktuality';
const VYSTUP  = 'aktuality-data.json';

// Složka ještě neexistuje (první deploy bez článků)
if (!fs.existsSync(SLOZKA)) {
    fs.writeFileSync(VYSTUP, JSON.stringify({ clanky: [] }, null, 2), 'utf-8');
    console.log('Složka _aktuality/ neexistuje – vytvořen prázdný ' + VYSTUP);
    process.exit(0);
}

const soubory = fs.readdirSync(SLOZKA)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Nejnovější nahoře (soubory začínají datem: 2026-04-05-nazev.md)

const clanky = soubory.map(soubor => {
    const obsah = fs.readFileSync(path.join(SLOZKA, soubor), 'utf-8');
    return parsovat(obsah, soubor);
});

fs.writeFileSync(VYSTUP, JSON.stringify({ clanky }, null, 2), 'utf-8');
console.log(`✓ Vygenerováno ${clanky.length} článků → ${VYSTUP}`);

/* --- Jednoduchý parser YAML frontmatter --- */
function parsovat(obsah, soubor) {
    const shoda = obsah.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!shoda) {
        return { nadpis: soubor, telo: obsah };
    }

    const meta = {};
    shoda[1].split('\n').forEach(radek => {
        const dvojtecka = radek.indexOf(':');
        if (dvojtecka === -1) return;
        const klic  = radek.slice(0, dvojtecka).trim();
        const hodnota = radek.slice(dvojtecka + 1).trim().replace(/^["']|["']$/g, '');
        if (klic) meta[klic] = hodnota;
    });

    return { ...meta, telo: shoda[2].trim() };
}
