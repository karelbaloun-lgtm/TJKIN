/* =========================================
   KIN Asistent – chatbot widget
   Volán přes initChatbot() z komponenty.js
   ========================================= */

function initChatbot() {
    if (document.getElementById('kin-chat-widget')) return;

    // ── CSS ──
    const style = document.createElement('style');
    style.textContent = `
    #kin-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; }

    #kin-chat-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
        font-family: 'Barlow', 'Segoe UI', sans-serif;
    }

    #kin-chat-window {
        width: 340px;
        max-height: 520px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 32px rgba(211,47,47,0.18);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(211,47,47,0.12);
        transform-origin: bottom right;
        animation: kinChatPopIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes kinChatPopIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
    }

    #kin-chat-window.skryto {
        display: none !important;
    }

    .kin-chat-header {
        background: #d32f2f;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .kin-chat-avatar {
        width: 36px; height: 36px;
        background: #fbc02d;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
    }

    .kin-chat-header-info { flex: 1; min-width: 0; }

    .kin-chat-name {
        font-family: 'Barlow Condensed', 'Segoe UI', sans-serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    .kin-chat-status {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.78);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .kin-status-dot {
        width: 6px; height: 6px;
        background: #69f0ae;
        border-radius: 50%;
        display: inline-block;
    }

    .kin-chat-close {
        background: none;
        border: none;
        color: rgba(255,255,255,0.8);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 2px 4px;
        line-height: 1;
    }
    .kin-chat-close:hover { color: #fff; }

    .kin-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scroll-behavior: smooth;
        background: #fdf8f8;
    }

    .kin-chat-messages::-webkit-scrollbar { width: 4px; }
    .kin-chat-messages::-webkit-scrollbar-thumb { background: rgba(211,47,47,0.15); border-radius: 4px; }

    .kin-msg { display: flex; gap: 8px; align-items: flex-end; max-width: 88%; }
    .kin-msg.bot  { align-self: flex-start; }
    .kin-msg.user { align-self: flex-end; flex-direction: row-reverse; }

    .kin-msg-avatar {
        width: 26px; height: 26px;
        background: #fbc02d;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem;
        flex-shrink: 0;
    }

    .kin-bubble {
        padding: 9px 13px;
        border-radius: 14px;
        font-size: 0.875rem;
        line-height: 1.55;
        max-width: 100%;
    }

    .kin-msg.bot  .kin-bubble { background: #fff; color: #1a1010; border-bottom-left-radius: 4px; border: 1px solid rgba(211,47,47,0.12); }
    .kin-msg.user .kin-bubble { background: #d32f2f; color: #fff; border-bottom-right-radius: 4px; }

    .kin-typing-dots { display: flex; gap: 4px; align-items: center; padding: 4px 2px; }
    .kin-typing-dots span {
        width: 6px; height: 6px;
        background: #aaa;
        border-radius: 50%;
        animation: kinDot 1.2s infinite;
    }
    .kin-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .kin-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes kinDot {
        0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
    }

    .kin-quick-replies {
        padding: 6px 14px 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        flex-shrink: 0;
        background: #fdf8f8;
    }

    .kin-chip {
        background: #fff0f0;
        border: 1.5px solid rgba(211,47,47,0.25);
        color: #d32f2f;
        font-family: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 5px 11px;
        border-radius: 20px;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        white-space: nowrap;
    }
    .kin-chip:hover { background: #d32f2f; color: #fff; border-color: #d32f2f; transform: translateY(-1px); }

    .kin-chat-input-row {
        padding: 10px 12px;
        display: flex;
        gap: 8px;
        align-items: center;
        border-top: 1px solid rgba(211,47,47,0.1);
        flex-shrink: 0;
        background: #fff;
    }

    .kin-chat-input {
        flex: 1;
        border: 1.5px solid rgba(211,47,47,0.2);
        border-radius: 20px;
        padding: 8px 14px;
        font-family: inherit;
        font-size: 0.85rem;
        background: #fdf8f8;
        color: #1a1010;
        outline: none;
    }
    .kin-chat-input:focus { border-color: #d32f2f; }
    .kin-chat-input::placeholder { color: #b08080; }

    .kin-send-btn {
        width: 36px; height: 36px;
        background: #d32f2f;
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s, transform 0.1s;
    }
    .kin-send-btn:hover { background: #b71c1c; transform: scale(1.05); }

    #kin-chat-fab {
        width: 56px; height: 56px;
        background: #d32f2f;
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(211,47,47,0.35);
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.15s;
        position: relative;
    }
    #kin-chat-fab:hover { background: #b71c1c; transform: scale(1.08); }

    .kin-fab-badge {
        position: absolute;
        top: -2px; right: -2px;
        width: 18px; height: 18px;
        background: #fbc02d;
        border-radius: 50%;
        font-size: 0.65rem;
        font-weight: 700;
        color: #1a1010;
        display: flex; align-items: center; justify-content: center;
    }

    @media (max-width: 400px) {
        #kin-chat-window { width: calc(100vw - 32px); }
        #kin-chat-widget { right: 16px; bottom: 16px; }
    }

    @media (prefers-reduced-motion: reduce) {
        #kin-chat-window { animation: none; }
        .kin-typing-dots span { animation: none; opacity: 0.6; }
    }
    `;
    document.head.appendChild(style);

    // ── HTML ──
    const widget = document.createElement('div');
    widget.id = 'kin-chat-widget';
    widget.innerHTML = `
        <div id="kin-chat-window">
            <div class="kin-chat-header">
                <div class="kin-chat-avatar">🏊</div>
                <div class="kin-chat-header-info">
                    <div class="kin-chat-name">KIN Asistent</div>
                    <div class="kin-chat-status"><span class="kin-status-dot"></span> Online – odpovím hned</div>
                </div>
                <button class="kin-chat-close" id="kinChatClose" aria-label="Zavřít chat">✕</button>
            </div>
            <div class="kin-chat-messages" id="kinMessages"></div>
            <div class="kin-quick-replies" id="kinQuickReplies">
                <button class="kin-chip" data-q="tréninky">🕐 Kdy jsou tréninky?</button>
                <button class="kin-chip" data-q="cena">💰 Kolik to stojí?</button>
                <button class="kin-chip" data-q="zápis">📝 Jak se zapsat?</button>
                <button class="kin-chip" data-q="kurzy">🐠 Kurzy neplavců</button>
                <button class="kin-chip" data-q="věk">👶 Od kolika let?</button>
            </div>
            <div class="kin-chat-input-row">
                <input class="kin-chat-input" id="kinInput" type="text" placeholder="Napište dotaz…" autocomplete="off">
                <button class="kin-send-btn" id="kinSend" aria-label="Odeslat">➤</button>
            </div>
        </div>
        <button id="kin-chat-fab" style="display:none;" aria-label="Otevřít chat">
            💬
            <span class="kin-fab-badge">1</span>
        </button>
    `;
    document.body.appendChild(widget);

    // ── Logika ──
    const answers = {
        tréninky: "Tréninky probíhají v bazénu na Střeleckém ostrově. Nová sezóna 2026/2027 začíná <strong>2. září 2026</strong> pro všechny skupiny. Přesný rozvrh sdělíme osobně při zápisu. 🏊",
        cena: "Členský příspěvek se liší podle skupiny a sezóny. Podrobnosti najdete v <a href='/terminovka.html' style='color:#d32f2f;font-weight:600;'>ekonomických podmínkách</a>. Rádi vše vysvětlíme osobně!",
        zápis: "Zápis do sezóny 2026/2027 probíhá – <strong>25.–27. 8. 2026</strong> od 16:00 do 18:30, vstup přes dětské hřiště. Přijďte osobně. 📝",
        kurzy: "Kurzy pro neplavce (Plavecká škola Rybky) začínají <strong>7. září 2026</strong>. Děti od 4 let, 1× týdně. Závodění není podmínkou! 🐠",
        věk: "Do závodní skupiny přijímáme od <strong>6 let</strong>. Kurzy pro neplavce jsou od <strong>4 let</strong>. Nejste si jistí? Přijďte na zápis, vše probereme. 👋",
        kontakt: "Napište nám na <a href='mailto:plavani.tjkin@gmail.com' style='color:#d32f2f;font-weight:600;'>plavani.tjkin@gmail.com</a> nebo volejte <strong>723 062 048</strong>. 📞",
        bazén: "Trénujeme v bazénu na <strong>Střeleckém ostrově</strong> v Českých Budějovicích. 📍",
        závody: "Termínovku závodů najdete na <a href='/terminovka.html' style='color:#d32f2f;font-weight:600;'>stránce Termínovka</a>. Závodění není povinné. 🏁",
        soustředění: "Soustředění pořádáme v průběhu sezóny. Termíny sledujte v <a href='/aktuality.html' style='color:#d32f2f;font-weight:600;'>Aktualitách</a>. 🏕️",
    };

    const keywords = [
        ["od kolika", "věk"], ["kolika let", "věk"], ["kolik let", "věk"], ["roků", "věk"], ["staré", "věk"], ["dítě", "věk"],
        ["trénink", "tréninky"], ["trénin", "tréninky"], ["plavání", "tréninky"], ["rozvrh", "tréninky"],
        ["příspěvek", "cena"], ["poplatek", "cena"], ["cen", "cena"], ["plat", "cena"], ["stojí", "cena"],
        ["zápis", "zápis"], ["zapsat", "zápis"], ["přihlásit", "zápis"], ["registrace", "zápis"],
        ["kurz", "kurzy"], ["neplavec", "kurzy"], ["rybky", "kurzy"], ["začátečník", "kurzy"], ["neumí plavat", "kurzy"],
        ["bazén", "bazén"], ["bazenu", "bazén"], ["kde plavete", "bazén"],
        ["závod", "závody"], ["soutěž", "závody"],
        ["soustředění", "soustředění"], ["soustředeni", "soustředění"],
        ["kontakt", "kontakt"], ["telefon", "kontakt"], ["email", "kontakt"], ["e-mail", "kontakt"], ["napsat", "kontakt"], ["obrátit", "kontakt"], ["volat", "kontakt"],
        ["kdy", "tréninky"],
    ];

    function detectKey(text) {
        const t = text.toLowerCase();
        for (const [kw, key] of keywords) {
            if (t.includes(kw)) return key;
        }
        return null;
    }

    const msgs = document.getElementById('kinMessages');
    const input = document.getElementById('kinInput');
    const sendBtn = document.getElementById('kinSend');
    const closeBtn = document.getElementById('kinChatClose');
    const fab = document.getElementById('kin-chat-fab');
    const chatWindow = document.getElementById('kin-chat-window');
    const quickReplies = document.getElementById('kinQuickReplies');

    const CTA = "Máte další dotazy? Jsme tu pro vás! 😊<br>📧 <a href='mailto:plavani.tjkin@gmail.com' style='color:#d32f2f;font-weight:600;'>plavani.tjkin@gmail.com</a><br>💬 <a href='https://wa.me/420723062048' target='_blank' style='color:#25d366;font-weight:600;'>WhatsApp</a>";

    function addMsg(text, who) {
        const div = document.createElement('div');
        div.className = `kin-msg ${who}`;
        div.innerHTML = who === 'bot'
            ? `<div class="kin-msg-avatar">🏊</div><div class="kin-bubble">${text}</div>`
            : `<div class="kin-bubble">${text}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function addTyping() {
        const div = document.createElement('div');
        div.className = 'kin-msg bot';
        div.id = 'kin-typing';
        div.innerHTML = `<div class="kin-msg-avatar">🏊</div><div class="kin-bubble"><div class="kin-typing-dots"><span></span><span></span><span></span></div></div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
        return div;
    }

    function botReply(key) {
        quickReplies.style.display = 'none';
        const t = addTyping();
        setTimeout(() => {
            t.remove();
            const ans = answers[key] || "Na tuto otázku Vám nejlépe odpoví paní Šmausová osobně. 😊";
            addMsg(ans, 'bot');
            setTimeout(() => {
                addMsg(CTA, 'bot');
                quickReplies.style.display = 'flex';
            }, 600);
        }, 900 + Math.random() * 400);
    }

    function send() {
        const val = input.value.trim();
        if (!val) return;
        addMsg(val, 'user');
        input.value = '';
        botReply(detectKey(val));
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

    document.querySelectorAll('.kin-chip').forEach(c => {
        c.addEventListener('click', () => {
            addMsg(c.textContent.trim(), 'user');
            botReply(c.dataset.q);
        });
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('skryto');
        fab.style.display = 'flex';
    });

    fab.addEventListener('click', () => {
        fab.style.display = 'none';
        chatWindow.classList.remove('skryto');
        msgs.scrollTop = msgs.scrollHeight;
    });

    // Pozdrav
    setTimeout(() => addMsg("Dobrý den! 👋 Jsem asistent KIN ČB. Pomohu vám s informacemi o trénincích, zápisech nebo cenách.", 'bot'), 400);
    setTimeout(() => addMsg("Na co se chcete zeptat?", 'bot'), 1100);
}
