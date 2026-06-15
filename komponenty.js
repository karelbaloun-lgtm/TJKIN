/* =========================================
   1. GENEROVÁNÍ MENU (VČETNĚ NASTAVENÍ)
   ========================================= */
function vlozMenu() {
    const dnesMenu = new Date();
    const rokMenu = dnesMenu.getFullYear();
    const jeVelikonoceMenu = dnesMenu >= new Date(rokMenu, 2, 30) && dnesMenu < new Date(rokMenu, 3, 7);
    const jeCarodejniceMenu = dnesMenu >= new Date(rokMenu, 3, 28) && dnesMenu < new Date(rokMenu, 4, 2);
    const jeMajMenu = dnesMenu >= new Date(rokMenu, 4, 1) && dnesMenu < new Date(rokMenu, 4, 3);

    const menuHTML = `
    <nav>
        <div class="hamburger" onclick="prepnoutMenu()">☰</div>
        <div class="menu-polozky" id="mojeMenu">
            <a href="index.html">Úvod</a>
            <a href="aktuality.html">Aktuality</a>
            <a href="terminovka.html">Termínovka</a>
            <a href="fotogalerie.html">Galerie</a>
            <a href="historie.html">Rekordy & Historie</a>
            <a href="sponzori.html">Partneři</a>
            <a href="kontakt.html">Kontakt</a>
        </div>
        <script>
        (function() {
            const stranka = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.menu-polozky a').forEach(a => {
                if (a.getAttribute('href') === stranka) a.classList.add('nav-aktivni');
            });
        })();
        </script>
    </nav>
    `;

    const vzhledHTML = `
    <div class="vzhled-wrap" id="vzhled-wrap">
        <button class="vzhled-btn" id="vzhled-btn" aria-label="Změnit vzhled" onclick="document.getElementById('vzhled-wrap').classList.toggle('otevreno')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
        </button>
        <div class="vzhled-panel">
            <p class="vzhled-nadpis">Vzhled</p>
            <button class="vzhled-volba" onclick="zmenRezim('light'); document.getElementById('vzhled-wrap').classList.remove('otevreno')">
                <span class="vzhled-swatch" style="background:#d32f2f"></span>
                Klubový styl
            </button>
            <button class="vzhled-volba" onclick="zmenRezim('dark'); document.getElementById('vzhled-wrap').classList.remove('otevreno')">
                <span class="vzhled-swatch" style="background:#1a1a2e"></span>
                Dark Mode
            </button>
            ${jeVelikonoceMenu ? `
            <button class="vzhled-volba" onclick="zmenRezim('velikonoce'); document.getElementById('vzhled-wrap').classList.remove('otevreno')">
                <span class="vzhled-swatch" style="background:#7b1fa2"></span>
                Velikonoční mód
            </button>` : ''}
            ${jeCarodejniceMenu ? `
            <button class="vzhled-volba" onclick="zmenRezim('carodejnice'); document.getElementById('vzhled-wrap').classList.remove('otevreno')">
                <span class="vzhled-swatch" style="background:linear-gradient(135deg,#ff6d00,#7b1fa2)"></span>
                Čarodějnický mód 🧙‍♀️
            </button>` : ''}
            ${jeMajMenu ? `
            <button class="vzhled-volba" onclick="zmenRezim('maj'); document.getElementById('vzhled-wrap').classList.remove('otevreno')">
                <span class="vzhled-swatch" style="background:linear-gradient(135deg,#2e7d32,#e91e63)"></span>
                Prvomájový mód 🌸
            </button>` : ''}
        </div>
    </div>
    `;
    const menuElement = document.getElementById('spolecne-menu');
    if (menuElement) {
        menuElement.innerHTML = menuHTML;
        document.body.insertAdjacentHTML('beforeend', vzhledHTML);

        // Zavři panel kliknutím mimo
        document.addEventListener('click', e => {
            const wrap = document.getElementById('vzhled-wrap');
            if (wrap && !wrap.contains(e.target)) wrap.classList.remove('otevreno');
        });
        // Označ aktivní stránku
        const aktualniStranka = window.location.pathname.split('/').pop() || 'index.html';
        menuElement.querySelectorAll('.menu-polozky > a[href]').forEach(odkaz => {
            if (odkaz.getAttribute('href') === aktualniStranka) odkaz.classList.add('nav-aktivni');
        });

    }
}

/* =========================================
   2. GENEROVÁNÍ PATIČKY
   ========================================= */
function vlozPaticku() {
    const patickaHTML = `
    <footer>
        <div class="footer-container">
            
            <div class="footer-sloupec">
                <h3>TJ KIN České Budějovice</h3>
                <p style="opacity: 0.8; margin-bottom: 20px;">
                    Plavecký oddíl s tradicí od roku 1951.<br>
                    Vychováváme plavce, tvoříme partu.
                </p>
                <a href="mailto:plavani@tjkin.cz" style="color: white; font-weight: bold;">
                    <span class="footer-icon">📧</span> plavani@tjkin.cz
                </a>
                <a href="mailto:info@kinplavani.cz" style="color: white; font-weight: bold;">
                    <span class="footer-icon">📧</span> info@kinplavani.cz
                </a>
                <a href="404.html" target="_blank" style="color: #E1306C;">
                    <span class="footer-icon">📸</span> Sledujte nás na Instagramu
                </a>
            </div>

            <div class="footer-sloupec">
                <h3>Rychlé odkazy</h3>
                <a href="index.html">🏠 Úvod</a>
                <a href="aktuality.html">📰 Aktuality</a>
                <a href="terminovka.html">📅 Termínovka</a>
                <a href="fotogalerie.html">📷 Fotogalerie</a>
                <a href="kontakt.html">📞 Kontakty</a>
                <a href="archiv.html" style="color: var(--akcni-barva); margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 10px;">
                    🗄️ Archiv článků
                </a>
            </div>

            <div class="footer-sloupec">
                <h3>Důležité info</h3>
                <a href="documents/GDPR_2025.pdf" target="_blank">
                    <span class="footer-icon">🔒</span> Ochrana údajů (GDPR)
                </a>
                <a href="404.html" target="_blank">
                    <span class="footer-icon">📜</span> Stanovy spolku
                </a>
                <a href="documents/ekonom_26.pdf" target="_blank">
                    <span class="footer-icon">💰</span> Příspěvky a platby
                </a>
                <a href="https://kin-plavecky-oddil.webnode.cz" target="_blank" style="opacity: 0.6; margin-top: 15px;">
                    <span class="footer-icon">⏳</span> Archiv starého webu
                </a>
            </div>

        </div>

        <div class="footer-bottom">
            <p>© 2026 TJ KIN České Budějovice - Všechna práva vyhrazena.</p>
            <p class="made-with" 
               onmouseover="this.innerHTML='Vytvořeno s 💧 vůní chlóru pro plavání'" 
               onmouseout="this.innerHTML='Vytvořeno s ❤️ pro plavání'">
               Vytvořeno s ❤️ pro plavání
            </p>
        </div>
    </footer>
    `;
    const patickaElement = document.getElementById('spolecna-paticka');
    if (patickaElement) patickaElement.innerHTML = patickaHTML;
}

/* =========================================
   3. PŘEPÍNÁNÍ REŽIMŮ
   ========================================= */
let intervalEfektu = null; 

// Pomocná funkce pro zjištění MDŽ (8. března)
function jeDnesMdz() {
    const dnes = new Date();
    return (dnes.getDate() === 8 && dnes.getMonth() === 2); // Březen je 2 (počítá se od nuly)
}

function zmenRezim(rezim) {
    const body = document.body;
    const logo = document.getElementById('hlavni-logo');

    // Uložíme, že uživatel volil ručně → sezonní logika to bude respektovat po celou návštěvu
    sessionStorage.setItem('tema-manual', rezim);

    // Vyčistíme všechny staré sezónní režimy
    body.classList.remove('dark-mode', 'silvestr-mode', 'valentyn-mode', 'zoh-mode', 'velikonoce-mode', 'carodejnice-mode', 'maj-mode');

    // Zastavíme případné efekty a smažeme je
    if (intervalEfektu) {
        clearInterval(intervalEfektu);
        intervalEfektu = null;
    }
    document.querySelectorAll('.srdicko, .vlocka, .vajicko, .metla, .kvetina').forEach(e => e.remove());

    // Nastavíme nový režim
    if (rezim === 'dark') {
        body.classList.add('dark-mode');
        localStorage.setItem('tema', 'dark');
    } else if (rezim === 'velikonoce') {
        body.classList.add('velikonoce-mode');
        localStorage.setItem('tema', 'velikonoce');
        spustitVajicka();
    } else if (rezim === 'carodejnice') {
        body.classList.add('carodejnice-mode');
        localStorage.setItem('tema', 'carodejnice');
        spustitCarodejnice();
    } else if (rezim === 'maj') {
        body.classList.add('maj-mode');
        localStorage.setItem('tema', 'maj');
        spustitMaj();
    } else {
        localStorage.setItem('tema', 'light');
    }

    // CHYTRÁ VÝMĚNA LOGA (Respektuje MDŽ a sezónní módy)
    if (logo) {
        if (jeDnesMdz()) {
            logo.src = 'images/logos/logo_mdz.png';
            logo.classList.add('logo-mdz-aktivni');
        } else if (rezim === 'carodejnice') {
            logo.src = 'images/logos/logo_carodejnice.png';
            logo.classList.remove('logo-mdz-aktivni');
        } else if (rezim === 'maj') {
            logo.src = 'images/logos/logo_maj.png';
            logo.classList.remove('logo-mdz-aktivni');
        } else {
            logo.src = 'images/logos/logo.png';
            logo.classList.remove('logo-mdz-aktivni');
        }
    }

    // Odeslání do GA
    if (typeof gtag === 'function') {
        gtag('event', 'zmena_vzhledu', {
            'event_category': 'Interakce',
            'event_label': rezim
        });
    }
}

// Funkci pro padání tu nechám "spící"...
function spustitPadani(symboly, trida) {
    if (intervalEfektu) return; // Zabráníme dvojímu spuštění (dva DOMContentLoaded handlery)
    intervalEfektu = setInterval(() => {
        const prvek = document.createElement('div');
        prvek.classList.add(trida);
        prvek.innerText = symboly[Math.floor(Math.random() * symboly.length)];
        prvek.style.left = Math.random() * 100 + 'vw';
        prvek.style.fontSize = (Math.random() * 20 + 15) + 'px';
        prvek.style.animationDuration = (Math.random() * 3 + 3) + 's';
        document.body.appendChild(prvek);
        setTimeout(() => { prvek.remove(); }, 6000);
    }, 400); 
}

function spustitVajicka() {
    spustitPadani(['🥚', '🐣', '🐰', '🌷', '🌸'], 'vajicko');
}

function spustitCarodejnice() {
    spustitPadani(['🧹', '🧙‍♀️', '🦇', '🕷️', '⭐', '🌙', '🔮', '🕸️'], 'metla');
}

function spustitMaj() {
    spustitPadani(['🌸', '🌷', '🌺', '🌼', '🐦', '🍃', '🌿', '💐'], 'kvetina');
}

/* =========================================
   4. OSTATNÍ FUNKCE (lightbox, ICS, menu)
   ========================================= */
function prepnoutMenu() {
    var x = document.getElementById("mojeMenu");
    var mobNav = document.querySelector(".mob-nav");
    if (x.className === "menu-polozky") {
        x.className += " responsive";
        if (mobNav) mobNav.style.display = "none";
    } else {
        x.className = "menu-polozky";
        if (mobNav) mobNav.style.display = "";
    }
}

function spustitVybuch(element) {
    if (element.classList.contains('vybuch')) return;
    element.classList.add('vybuch');
    element.addEventListener('animationend', () => {
        element.classList.remove('vybuch');
    }, { once: true });
}

function pridatDoKalendare(nazev, datumOdStr, datumDoStr, misto, odkaz) {
    const datumOd = new Date(datumOdStr);
    if (isNaN(datumOd)) { alert("Chyba data"); return; }
    const startStr = formatDatumICS(datumOd);
    let datumDo = (datumDoStr && datumDoStr.trim() !== "") ? new Date(datumDoStr) : new Date(datumOd);
    datumDo.setDate(datumDo.getDate() + 1);
    const endStr = formatDatumICS(datumDo);
    const desc = odkaz || 'www.kinplavani.cz';

    const icsObsah = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TJKIN//Web//CZ',
        'BEGIN:VEVENT', `SUMMARY:🏊 ${nazev}`, `DTSTART;VALUE=DATE:${startStr}`,
        `DTEND;VALUE=DATE:${endStr}`, `LOCATION:${misto}`,
        `DESCRIPTION:${desc}`, 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsObsah], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nazev.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function formatDatumICS(date) {
    const r = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    return `${r}${m}${d}`;
}

// LIGHTBOX
let vsehnyFotky = []; let aktualniIndex = 0;
function otevritLightbox(element) {
    const galerieElementy = document.querySelectorAll(".foto-box");
    vsehnyFotky = Array.from(galerieElementy);
    aktualniIndex = vsehnyFotky.indexOf(element);
    document.getElementById("lightbox").style.display = "block";
    ukazSlide(aktualniIndex);
}
function zavritLightbox() { document.getElementById("lightbox").style.display = "none"; }
function posunSlidu(n) { ukazSlide(aktualniIndex += n); }
function ukazSlide(n) {
    const modalImg = document.getElementById("lightbox-img");
    const captionText = document.getElementById("lightbox-popisek");
    if (n >= vsehnyFotky.length) aktualniIndex = 0;
    if (n < 0) aktualniIndex = vsehnyFotky.length - 1;
    const vybranyBox = vsehnyFotky[aktualniIndex];
    modalImg.src = vybranyBox.querySelector("img").src;
    captionText.innerHTML = vybranyBox.querySelector(".popisek").innerText;
}
document.addEventListener('keydown', function(event) {
    if (document.getElementById("lightbox").style.display === "block") {
        if (event.key === "ArrowLeft") posunSlidu(-1);
        else if (event.key === "ArrowRight") posunSlidu(1);
        else if (event.key === "Escape") zavritLightbox();
    }
});
document.addEventListener("contextmenu", function(e) { if (e.target.tagName === 'IMG') e.preventDefault(); });

// Google Analytics
function spustitGoogleAnalytics() {
    const GA_ID = 'G-3QFGZR5QX5';
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
}

// Cookie souhlas
function zobrazCookieBanner() {
    const souhlas = localStorage.getItem('cookie-souhlas');
    if (souhlas) return; // už rozhodl dřív

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <p>Používáme Google Analytics pro sledování návštěvnosti. Vaše data nezneužijeme.</p>
        <div class="cookie-tlacitka">
            <button onclick="prijimatCookies()">Přijmout</button>
            <button onclick="odmitnoutCookies()" class="cookie-odmitout">Odmítnout</button>
        </div>
    `;
    document.body.appendChild(banner);
    // Animace – zobrazit po chvíli
    setTimeout(() => banner.classList.add('cookie-viditelny'), 300);
}

function prijimatCookies() {
    localStorage.setItem('cookie-souhlas', 'ano');
    document.getElementById('cookie-banner')?.remove();
    spustitGoogleAnalytics();
}

function odmitnoutCookies() {
    localStorage.setItem('cookie-souhlas', 'ne');
    document.getElementById('cookie-banner')?.remove();
}

/* =========================================
   5. HLAVNÍ INICIALIZACE (Start webu)
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
    const logo = document.getElementById('hlavni-logo');
    const dnes = new Date();
    const ulozeneTema = localStorage.getItem('tema');

    // 1. Načtení uloženého tématu
    // Pomocné datumové rozsahy pro ověření platnosti uloženého sezónního tématu
    const rokLoad = dnes.getFullYear();
    const platneVelikonoce  = dnes >= new Date(rokLoad, 2, 30) && dnes < new Date(rokLoad, 3, 7);
    const platneCarodejnice = dnes >= new Date(rokLoad, 3, 28) && dnes < new Date(rokLoad, 4, 2);
    const platneMaj         = dnes >= new Date(rokLoad, 4,  1) && dnes < new Date(rokLoad, 4, 3);

    if (ulozeneTema === 'dark') {
        document.body.classList.add('dark-mode');
        if (logo) logo.src = 'images/logos/logo.png';
    } else if (ulozeneTema === 'velikonoce' && platneVelikonoce) {
        document.body.classList.add('velikonoce-mode');
        if (logo) logo.src = 'images/logos/logo_velikonoce.png';
        spustitVajicka();
    } else if (ulozeneTema === 'carodejnice' && platneCarodejnice) {
        document.body.classList.add('carodejnice-mode');
        if (logo) logo.src = 'images/logos/logo_carodejnice.png';
        spustitCarodejnice();
    } else if (ulozeneTema === 'maj' && platneMaj) {
        document.body.classList.add('maj-mode');
        if (logo) logo.src = 'images/logos/logo_maj.png';
        spustitMaj();
    } else {
        if (logo) logo.src = 'images/logos/logo.png';
        // Sezónní téma mimo platný termín → reset na light
        if (ulozeneTema !== 'light' && ulozeneTema !== 'dark') localStorage.setItem('tema', 'light');
    }

    // 2. MDŽ (8. března)
    const jeMdz = (dnes.getDate() === 8 && dnes.getMonth() === 2);
    if (jeMdz) {
        if (logo) { logo.src = 'images/logos/logo_mdz.png'; logo.classList.add('logo-mdz-aktivni'); }
        vlozMdzModal();
    }

    // 3. Velikonoce (30. března – 6. dubna)
    const rok = dnes.getFullYear();
    const jeVelikonoce = dnes >= new Date(rok, 2, 30) && dnes < new Date(rok, 3, 7);
    if (jeVelikonoce && !jeMdz) {
        const manualniVolba = sessionStorage.getItem('tema-manual');
        if (!manualniVolba && ulozeneTema !== 'light') {
            if (logo) logo.src = 'images/logos/logo_velikonoce.png';
            if (ulozeneTema !== 'dark') {
                document.body.classList.add('velikonoce-mode');
                localStorage.setItem('tema', 'velikonoce');
                spustitVajicka();
            }
        }
    }

    // 4. Reset po skončení Velikonoc
    if (!jeVelikonoce && localStorage.getItem('tema') === 'velikonoce') {
        localStorage.setItem('tema', 'light');
        document.body.classList.remove('velikonoce-mode');
    }

    // 4b. Čarodějnice (28. dubna – 1. května)
    const jeCarodejnice = dnes >= new Date(rok, 3, 28) && dnes < new Date(rok, 4, 2);
    if (jeCarodejnice && !jeMdz) {
        const manualniVolba = sessionStorage.getItem('tema-manual');
        if (!manualniVolba && ulozeneTema !== 'light') {
            if (logo) logo.src = 'images/logos/logo_carodejnice.png';
            if (ulozeneTema !== 'dark') {
                document.body.classList.add('carodejnice-mode');
                localStorage.setItem('tema', 'carodejnice');
                spustitCarodejnice();
            }
        }
    }

    // 4c. Reset po skončení čarodějnic
    if (!jeCarodejnice && localStorage.getItem('tema') === 'carodejnice') {
        localStorage.setItem('tema', 'light');
        document.body.classList.remove('carodejnice-mode');
    }

    // 4d. Máj (1. – 7. května)
    const jeMaj = dnes >= new Date(rok, 4, 1) && dnes < new Date(rok, 4, 3);
    if (jeMaj && !jeMdz) {
        const manualniVolba = sessionStorage.getItem('tema-manual');
        if (!manualniVolba && ulozeneTema !== 'light') {
            if (logo) logo.src = 'images/logos/logo_maj.png';
            if (ulozeneTema !== 'dark') {
                document.body.classList.add('maj-mode');
                localStorage.setItem('tema', 'maj');
                spustitMaj();
            }
        }
    }

    // 4e. Reset po skončení máje
    if (!jeMaj && localStorage.getItem('tema') === 'maj') {
        localStorage.setItem('tema', 'light');
        document.body.classList.remove('maj-mode');
    }

    // 5. Vložení menu, patičky, analytiky, mobilní nav
    vlozMenu();
    vlozPaticku();
    vlozMobileNav();
    if (localStorage.getItem('cookie-souhlas') === 'ano') {
        spustitGoogleAnalytics();
    } else {
        zobrazCookieBanner();
    }

    // 6. Scroll animace
    const prvky = document.querySelectorAll('.odkryt-na-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('odkryto');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    prvky.forEach(prvek => observer.observe(prvek));
});

/* =========================================
   6. MOBILNÍ SPODNÍ NAVIGACE
   ========================================= */
function vlozMobileNav() {
    const stranka = window.location.pathname.split('/').pop() || 'index.html';

    const polozky = [
        {
            href: 'index.html',
            label: 'Úvod',
            barva: '#d32f2f',
            ikona: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
        },
        {
            href: 'aktuality.html',
            label: 'Aktuality',
            barva: '#e65100',
            ikona: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`
        },
        {
            href: 'terminovka.html',
            label: 'Termínovka',
            barva: '#1565c0',
            ikona: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
        },
        {
            href: 'fotogalerie.html',
            label: 'Galerie',
            barva: '#6a1b9a',
            ikona: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`
        },
        {
            href: 'kontakt.html',
            label: 'Kontakt',
            barva: '#2e7d32',
            ikona: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
        }
    ];

    let activeIndex = 0;
    polozky.forEach((p, i) => {
        if (stranka === p.href || (stranka === '' && p.href === 'index.html')) activeIndex = i;
    });

    const navHTML = `
    <nav class="mob-nav">
        <div class="mob-nav__bublina" style="background:${polozky[activeIndex].barva}"></div>
        ${polozky.map((p, i) => `
            <a href="${p.href}" class="mob-nav__item${i === activeIndex ? ' active' : ''}" data-barva="${p.barva}" data-index="${i}">
                ${p.ikona}
                <span>${p.label}</span>
            </a>`).join('')}
    </nav>`;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    // Nastav počáteční pozici bubliny
    requestAnimationFrame(() => {
        posunBublinu(activeIndex);

        // Animace při kliknutí (vizuální feedback před přechodem na stránku)
        document.querySelectorAll('.mob-nav__item').forEach(item => {
            item.addEventListener('click', function(e) {
                const idx = parseInt(this.dataset.index);
                const barva = this.dataset.barva;
                document.querySelectorAll('.mob-nav__item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                document.querySelector('.mob-nav__bublina').style.background = barva;
                posunBublinu(idx);
            });
        });
    });
}

/* =========================================
   POČÍTADLA – animace při scrollu
   ========================================= */
(function () {
    function spustitPocitadlo(el) {
        const cilHodnota = parseInt(el.dataset.cilovaHodnota, 10);
        const cisloEl = el.querySelector('.pocitadlo-cislo');
        if (!cisloEl || el.dataset.hotovo) return;
        el.dataset.hotovo = '1';

        const doba = 1600;
        const fps = 60;
        const kroky = Math.round(doba / (1000 / fps));
        let krok = 0;

        const timer = setInterval(() => {
            krok++;
            const progress = krok / kroky;
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4);
            cisloEl.textContent = Math.round(ease * cilHodnota);
            if (krok >= kroky) {
                cisloEl.textContent = cilHodnota;
                clearInterval(timer);
            }
        }, 1000 / fps);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.pocitadlo').forEach(spustitPocitadlo);
            }
        });
    }, { threshold: 0.3 });

    document.addEventListener('DOMContentLoaded', () => {
        const sekce = document.querySelector('.pocitadla-sekce');
        if (sekce) observer.observe(sekce);
    });
})();

function posunBublinu(index) {
    const nav = document.querySelector('.mob-nav');
    const bublina = document.querySelector('.mob-nav__bublina');
    if (!nav || !bublina) return;
    const pocetPolozek = nav.querySelectorAll('.mob-nav__item').length;
    const sirkaPolozky = nav.offsetWidth / pocetPolozek;
    bublina.style.left = (index * sirkaPolozky + sirkaPolozky / 2 - 28) + 'px';
}

/* =========================================
   7. LOGO – výbuch (krátké kliknutí)
            + retro režim 1951 (držení 3 vteřiny)
   ========================================= */
(function () {
    let retroTimer = null;
    let drzeni = false;

    function spustitRetroTimer(logo) {
        drzeni = true;
        logo.classList.add('nabijeni');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                logo.classList.add('nabijeni-aktivni');
            });
        });

        retroTimer = setTimeout(() => {
            drzeni = false;
            const jeRetro = document.body.classList.contains('retro-mode');
            if (jeRetro) {
                document.body.classList.remove('retro-mode');
                localStorage.setItem('tema-retro', 'off');
            } else {
                document.body.classList.add('retro-mode');
                localStorage.setItem('tema-retro', 'on');
                zobrazitRetroOverlay();
            }
            zrusitRetroTimer(logo);
        }, 3000);
    }

    function zrusitRetroTimer(logo) {
        const byloDrzeni = drzeni;
        clearTimeout(retroTimer);
        retroTimer = null;
        drzeni = false;
        logo.classList.remove('nabijeni', 'nabijeni-aktivni');
        if (byloDrzeni) spustitVybuch(logo);
    }

    function zobrazitRetroOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'retro-overlay';
        overlay.innerHTML = `
            <div class="retro-overlay-obsah">
                <div class="retro-overlay-rok">1951</div>
                <div class="retro-overlay-linka"></div>
                <p class="retro-overlay-text">Vítejte v roce vzniku<br>plaveckého oddílu KIN</p>
                <p class="retro-overlay-podtext">České Budějovice</p>
                <span class="retro-overlay-zavreni">— klikněte pro pokračování —</span>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => {
            overlay.classList.add('retro-overlay-mizeni');
            overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
        });
        requestAnimationFrame(() => overlay.classList.add('retro-overlay-viditelny'));
    }

// MDŽ modal (voláno z hlavní inicializace)
function vlozMdzModal() {
    // 1. Zkontrolujeme, jestli uživatel už okno během této návštěvy nezavřel
    if (sessionStorage.getItem('mdzZavreno') === 'true') return;

    // 2. Pojistka, aby se modal nepřidal dvakrát
    if (document.getElementById('modal-mdz')) return; 

    const modalHTML = `
    <div id="modal-mdz" class="modal-overlay" style="display: flex;">
        <div class="modal-box" style="border-top-color: #e91e63; max-width: 450px;">
            
            <span class="zavrit-krizek" onclick="sessionStorage.setItem('mdzZavreno', 'true'); document.getElementById('modal-mdz').remove()">×</span>
            
            <img src="images/logos/logo_mdz.png" alt="MDŽ TJ KIN" style="width: 100%; max-width: 250px; margin-bottom: 15px; border-radius: 10px;">
            <h2 style="color: #c2185b; margin-bottom: 10px; border:none;">Vše nejlepší našim ženám! 💐</h2>
            <p style="margin-bottom: 20px; font-size: 1em; line-height: 1.5;">
                Dnes patří bazén i uznání všem našim úžasným ženám. 
                Děkujeme naší paní předsedkyni, všem obětavým trenérkám, našim skvělým plavkyním a samozřejmě <strong>všem maminkám</strong>, které je ve sportu neúnavně podporují! Bez vás všech by to neplavalo.
            </p>
            
            <button onclick="sessionStorage.setItem('mdzZavreno', 'true'); document.getElementById('modal-mdz').remove()" class="tlacitko" style="background-color: #e91e63; color: white; width: 100%; border:none;">
                Děkujeme! 🏊‍♀️
            </button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
})();

/* =========================================
   7. SERVICE WORKER (PWA)
   ========================================= */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}

/* =========================================
   8. CHATBOT
   ========================================= */
function nactiChatbota() {
    const skript = document.createElement('script');
    skript.src = 'chatbot.js';
    skript.onload = function() { if (typeof initChatbot === 'function') initChatbot(); };
    document.body.appendChild(skript);
}

/* =========================================
   SMART HIDE NAVIGACE – pouze desktop
   Schová se při scrollu dolů, ukáže při scrollu nahoru.
   ========================================= */
(function () {
    let posledniScroll = 0;
    const PRAH = 80;

    window.addEventListener('scroll', function () {
        if (window.innerWidth <= 768) return;

        const nav = document.querySelector('nav');
        if (!nav) return;

        const aktualniScroll = window.scrollY;

        if (aktualniScroll <= PRAH) {
            nav.classList.remove('nav-skryta');
        } else if (aktualniScroll > posledniScroll) {
            nav.classList.add('nav-skryta');
        } else {
            nav.classList.remove('nav-skryta');
        }

        posledniScroll = aktualniScroll;
    }, { passive: true });
})();