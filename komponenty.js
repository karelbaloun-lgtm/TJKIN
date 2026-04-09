/* =========================================
   1. GENEROVÁNÍ MENU (VČETNĚ NASTAVENÍ)
   ========================================= */
function vlozMenu() {
    const dnesMenu = new Date();
    const rokMenu = dnesMenu.getFullYear();
    const jeVelikonoceMenu = dnesMenu >= new Date(rokMenu, 2, 30) && dnesMenu < new Date(rokMenu, 3, 7);

    const menuHTML = `
    <nav>
        <div class="hamburger" onclick="prepnoutMenu()">☰</div>
        <div class="menu-polozky" id="mojeMenu">

            <div class="nastaveni-wrapper" onclick="this.classList.toggle('aktivni')">
                <div class="nastaveni-tlacitko">
                    <span class="gear-icon">⚙️</span>
                    <span class="text-tlacitka">Přizpůsobit</span>
                </div>
                <div class="nastaveni-menu">
                    <div class="menu-sipka"></div>

                    <a onclick="zmenRezim('light'); event.stopPropagation();">
                        <span class="rezim-ikona">🔥</span> Klubový styl
                    </a>

                    <a onclick="zmenRezim('dark'); event.stopPropagation();" style="border-top: 1px solid #eee;">
                        <span class="rezim-ikona">🌑</span> Dark Mode
                    </a>

${jeVelikonoceMenu ? `
                    <a onclick="zmenRezim('velikonoce'); event.stopPropagation();" style="border-top: 1px solid #eee;">
                        <span class="rezim-ikona">🐰</span> Velikonoční mód
                    </a>` : ''}

                </div>
            </div>

            <a href="index.html">Úvod</a>
            <a href="aktuality.html">Aktuality</a>
            <a href="terminovka.html">Termínovka</a>
            <a href="fotogalerie.html">Galerie</a>
            <a href="historie.html">Rekordy & Historie</a>
            <a href="sponzori.html">Partneři</a>
            <a href="kontakt.html">Kontakt</a> 

        </div>  
    </nav>
    `;
    const menuElement = document.getElementById('spolecne-menu');
    if (menuElement) menuElement.innerHTML = menuHTML;
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
    body.classList.remove('dark-mode', 'silvestr-mode', 'valentyn-mode', 'zoh-mode', 'velikonoce-mode');
    
    // Zastavíme případné efekty a smažeme je
    if (intervalEfektu) {
        clearInterval(intervalEfektu);
        intervalEfektu = null;
    }
    document.querySelectorAll('.srdicko, .vlocka, .vajicko').forEach(e => e.remove());

    // Nastavíme nový režim
    if (rezim === 'dark') {
        body.classList.add('dark-mode');
        localStorage.setItem('tema', 'dark');
    } else if (rezim === 'velikonoce') {
        body.classList.add('velikonoce-mode');
        localStorage.setItem('tema', 'velikonoce');
        spustitVajicka();
    } else {
        localStorage.setItem('tema', 'light');
    }

    // CHYTRÁ VÝMĚNA LOGA (Respektuje MDŽ)
    if (logo) {
        if (jeDnesMdz()) {
            logo.src = 'images/logos/logo_mdz.png'; // Cesta přímo v kořenu dle zadání
            logo.classList.add('logo-mdz-aktivni');
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

/* =========================================
   4. OSTATNÍ FUNKCE (lightbox, ICS, menu)
   ========================================= */
function prepnoutMenu() {
    var x = document.getElementById("mojeMenu");
    if (x.className === "menu-polozky") {
        x.className += " responsive";
    } else {
        x.className = "menu-polozky";
    }
}

function spustitVybuch(element) {
    if (element.classList.contains('vybuch')) return;
    element.classList.add('vybuch');
    element.addEventListener('animationend', () => {
        element.classList.remove('vybuch');
    }, { once: true });
}

function pridatDoKalendare(nazev, datumOdStr, datumDoStr, misto) {
    const datumOd = new Date(datumOdStr);
    if (isNaN(datumOd)) { alert("Chyba data"); return; }
    const startStr = formatDatumICS(datumOd);
    let datumDo = (datumDoStr && datumDoStr.trim() !== "") ? new Date(datumDoStr) : new Date(datumOd);
    datumDo.setDate(datumDo.getDate() + 1);
    const endStr = formatDatumICS(datumDo);

    const icsObsah = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TJKIN//Web//CZ',
        'BEGIN:VEVENT', `SUMMARY:🏊 ${nazev}`, `DTSTART;VALUE=DATE:${startStr}`,
        `DTEND;VALUE=DATE:${endStr}`, `LOCATION:${misto}`,
        'DESCRIPTION:Více info na www.kinplavani.cz', 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
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
    if (ulozeneTema === 'dark') {
        document.body.classList.add('dark-mode');
        if (logo) logo.src = 'images/logos/logo.png';
    } else if (ulozeneTema === 'velikonoce') {
        document.body.classList.add('velikonoce-mode');
        if (logo) logo.src = 'images/logos/logo_velikonoce.png';
        spustitVajicka();
    } else {
        if (logo) logo.src = 'images/logos/logo.png';
        if (ulozeneTema !== 'light') localStorage.setItem('tema', 'light');
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
        if (!manualniVolba) {
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

    // 5. Vložení menu, patičky, analytiky
    vlozMenu();
    vlozPaticku();
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
   6. LOGO – výbuch (krátké kliknutí)
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