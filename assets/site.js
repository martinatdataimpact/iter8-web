/* Lanseringswebben: sidan är ett samtal med Lasse, i samma ram som appen.
   Besökaren går nedåt i ett frågeträd av inspelade svar ur riktig trafik, med orter och
   linjer dolda (assets/svar/). Frågorna är färdiga val: de
   går inte att ändra, och ett val skrivs in i rutan som om någon skrev det. En egen fråga
   får inget svar här – den leder till en visning. */
(function () {
  'use strict';
  var React = window.React, ReactDOM = window.ReactDOM, I8 = window.Iter8;
  var root = document.getElementById('app');
  if (!React || !ReactDOM || !I8 || !root) return;          // reserven i index.html står kvar
  var h = React.createElement, Frag = React.Fragment, useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fmt = function (n, d) { return I8.fmt(n, d); };

  /* Dit "Boka en visning" går: bokningsschemat i Google Kalender (1 h, vardagar 10–14; tiderna
     ställs in i kalendern). Det öppnas i en ruta på sidan. Adressen är schemats inbäddningsadress
     (Dela → Bädda in på webbplats). */
  var BOOK = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2dCYjpomaH7pvcBEw5VV6MGM3fPj4rlSp1hGjdbMZ2urgOaoK-dh-CQYD_VnUJyvvlOSBXT5Xk?gv=true';
  var BOOK_EMBEDS = BOOK.indexOf('https://calendar.google.com/calendar/appointments/') === 0;
  var LOGIN = 'https://app.iter8.se';
  var AUTOPLAY_MS = 30000;     // orörd landning: så länge väntar Lasse innan första frågan ställs av sig själv (0 = aldrig)
  var TYPE_MS = 26;            // ett tecken när en vald fråga skrivs in i rutan
  var STEP_MS = 700;           // ett arbetssteg
  var START = 'Hur kommer vi igång?';

  /* ── Mätning (Cloudflare Web Analytics) ──────────────────────────────────────────────
     Cloudflare räknar besöken: antal, sidvisningar, varifrån besökaren kom, land och enhet.
     Inga kakor sätts, ingenting lagras i webbläsaren och ingen besökare känns igen, så sidan
     har ingen samtyckesfråga. Skriptet laddas BARA på den skarpa sajten (CF_HOSTS); lokalt
     laddas ingenting och adressen rörs inte.

     Cloudflare tar inte emot egna händelser, men räknar ett adressbyte som en sidvisning.
     Det besökaren gör räknas därför som adresser: track() byter sidans adress till
     aktivitetens (activityPath), och i Cloudflare står antalet per adress under sidor.
     Varje aktivitetsadress finns också som en riktig sida (deploy-live.sh gör en kopia av
     index.html per adress, ur ACTIVITY_PATHS, ACTIVITY_PREFIXES och trädets frågor), så att
     en kopierad eller omladdad adress fungerar; sidan börjar då om på roten.

     Händelserna (namn → när → parametrar), och adressen de räknas under:
       question_select     en fråga i trädet väljs            question_id, depth, auto (ställd av sidan själv)
       answer_complete     svaret har skrivits klart          question_id, seconds (från valet)
       view_open/_close    ytan bredvid öppnas/stängs         question_id, view (lasse | tool | app)
       own_question_open   ”Ställ en egen fråga” öppnas
       own_question_submit en egen fråga skickas              length (antal tecken, inte texten)
       end_view            slutet visas                       answers (antal svar besökaren sett)
       booking_click       ”Boka en visning”                  source (top | end | own_question), answers
       contact_click       mejladressen                       source
       login_click         ”Logga in”
       about_open          Om oss öppnas                      source (footer | end)
       start_over          ”Börja om”                         answers
     Tratten: question_select (auto = false) → answer_complete → end_view / own_question_submit → booking_click.
     Adresserna: fraga-<id> (vald fråga) · auto-<id> (ställd av sidan själv) · yta-<id> ·
     egen-fraga · egen-fraga-skickad · slut · boka-<källa> · kontakt · logga-in · om-oss ·
     borja-om. answer_complete och view_close räknas inte. */
  var CF_TOKEN = '239e5105f0a742e29bc77d133e828df9';  // iter8.se:s token i Cloudflare Web Analytics. Tomt = ingen mätning någonstans.
  var CF_HOSTS = /^(www\.)?iter8\.se$/;
  var CF_LIVE = !!CF_TOKEN && CF_HOSTS.test(window.location.hostname);
  // deploy-live.sh läser de två raderna nedan: en sida per adress. track() byter bara till en adress som står här.
  var ACTIVITY_PATHS = ['egen-fraga', 'egen-fraga-skickad', 'slut', 'boka-topp', 'boka-slut', 'boka-egen-fraga', 'boka-om-oss', 'kontakt', 'logga-in', 'om-oss', 'borja-om'];
  var ACTIVITY_PREFIXES = ['fraga-', 'auto-', 'yta-'];
  var SOURCE = { top: 'topp', end: 'slut', own_question: 'egen-fraga', about: 'om-oss' };
  function activityPath(name, p) {
    if (name === 'question_select') return (p.auto ? 'auto-' : 'fraga-') + p.question_id;
    if (name === 'view_open') return 'yta-' + p.question_id;
    if (name === 'booking_click') return 'boka-' + SOURCE[p.source];
    return { own_question_open: 'egen-fraga', own_question_submit: 'egen-fraga-skickad', end_view: 'slut', contact_click: 'kontakt',
      login_click: 'logga-in', about_open: 'om-oss', start_over: 'borja-om' }[name] || null;
  }
  function known(path) {
    return ACTIVITY_PATHS.indexOf(path) >= 0 || ACTIVITY_PREFIXES.some(function (x) { return path.indexOf(x) === 0 && /^[a-z0-9]+$/.test(path.slice(x.length)); });
  }
  if (CF_LIVE) {
    // En aktivitetsadress som laddas direkt börjar om på roten, innan besöket räknas.
    if (window.location.pathname !== '/') { try { window.history.replaceState(null, '', '/'); } catch (e) { /* adressen står kvar */ } }
    var cf = document.createElement('script');
    cf.type = 'module'; cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(cf);
  }
  function track(name, params) {
    if (!CF_LIVE) return;
    var path = activityPath(name, params || {});
    if (!path || !known(path)) return;
    // Cloudflares skript räknar varje adressbyte där webbläsaren har Navigation API, annars bara pushState.
    try {
      if ('navigation' in window) window.history.replaceState(null, '', '/' + path);
      else window.history.pushState(null, '', '/' + path);
    } catch (e) { /* utan adressbyte räknas aktiviteten inte */ }
  }

  function bookHref(q) {
    return q && BOOK.indexOf('mailto:') === 0 ? BOOK + '&body=' + encodeURIComponent('Min fråga till Lasse: ' + q + '\n\n') : BOOK;
  }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
  function clock() {
    try { return new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' }); }
    catch (e) { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  }

  /* Taglinens sista ord roterar genom det Lasse har koll på. Det börjar inte på kollektivtrafik. */
  var TAGLINE = 'Din nya kollega, med väldigt bra koll på ';
  var WORDS = ['demografi', 'arbetsplatser', 'restider', 'punktlighet', 'kollektivtrafik', 'väder', 'utbud', 'trafikstörningar',
    'hållplatser', 'tidtabeller', 'omlopp', 'målpunkter', 'framkomlighet', 'beläggning', 'data'];

  /* De inspelade svaren hämtas när de behövs. */
  var SVAR = {};
  function svar(id) {
    return SVAR[id] || (SVAR[id] = fetch('assets/svar/' + id + '.json').then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); }));
  }

  function useNarrow() {
    var mq = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
    var s = useState(!!(mq && mq.matches));
    useEffect(function () {
      if (!mq || !mq.addEventListener) return;
      function on() { s[1](mq.matches); }
      mq.addEventListener('change', on);
      return function () { mq.removeEventListener('change', on); };
    }, []);
    return s[0];
  }

  /* ── Text med **fet** och stycken (tom rad), strömmad ord för ord ───────── */
  function tokens(text) {
    var out = [];
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (seg) {
      if (!seg) return;
      var bold = /^\*\*/.test(seg);
      seg.replace(/\*\*/g, '').split(/(\s+)/).forEach(function (w) { if (w) out.push({ w: w, b: bold }); });
    });
    return out;
  }
  // Ett block är ett stycke eller en punktlista (rader som börjar med "- ").
  function blocksOf(text) {
    return text.split(/\n\n/).map(function (b) {
      var lines = b.split('\n'), list = lines.every(function (l) { return /^- /.test(l); });
      return { list: list, items: (list ? lines.map(function (l) { return l.slice(2); }) : [b]).map(tokens) };
    });
  }
  function size(parts) { return parts.reduce(function (n, b) { return n + b.items.reduce(function (m, t) { return m + t.length; }, 0); }, 0); }
  function rich(parts, n) {
    var left = n, out = [];
    function run(toks, key) {
      var take = toks.slice(0, left); left -= take.length;
      return take.map(function (t, j) { return t.b ? h('b', { key: j }, t.w) : t.w; });
    }
    parts.forEach(function (b, i) {
      if (left <= 0) return;
      if (!b.list) { out.push(h('p', { key: i }, run(b.items[0]))); return; }
      var lis = [];
      b.items.forEach(function (toks, j) { if (left > 0) lis.push(h('li', { key: j }, run(toks))); });
      out.push(h('ul', { key: i }, lis));
    });
    return out;
  }

  /* ── Diagram (ECharts) med ett tema ur designsystemets tokens ───────────── */
  function tok(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'; }
  function resolveVars(o) {
    if (typeof o === 'string') { var m = /^var\((--[\w-]+)\)$/.exec(o); return m ? tok(m[1]) : o; }
    if (Array.isArray(o)) return o.map(resolveVars);
    if (o && typeof o === 'object') { var r = {}; for (var k in o) if (k.charAt(0) !== '_') r[k] = resolveVars(o[k]); return r; }
    return o;
  }
  function EChart(p) {
    var ref = useRef(null);
    useEffect(function () {
      if (!window.echarts || !ref.current) return;
      var ink = tok('--ink'), muted = tok('--ink-muted'), line = tok('--line');
      var o = resolveVars(p.option), dec = p.dec == null ? 1 : p.dec;
      var num = function (v) { return typeof v === 'number' ? fmt(v, v % 1 ? dec : 0) : v; };
      o.textStyle = { fontFamily: tok('--font-sans'), color: muted };
      if (o.legend) o.legend.textStyle = { color: muted };
      if (o.tooltip) {
        o.tooltip.backgroundColor = tok('--surface-paper'); o.tooltip.borderColor = line; o.tooltip.textStyle = { color: ink, fontSize: 13 };
        if (!o.tooltip.formatter && o.series[0].type !== 'boxplot') o.tooltip.valueFormatter = num;
      }
      [].concat(o.xAxis, o.yAxis).forEach(function (ax) {
        if (!ax) return;
        ax.axisLine = { lineStyle: { color: line } }; ax.axisTick = { show: false };
        ax.axisLabel = Object.assign({ color: muted }, ax.type === 'value' ? { formatter: num } : { interval: 0, fontSize: 11, hideOverlap: false });
        ax.splitLine = { lineStyle: { color: line, type: 'dashed', opacity: 0.6 } };
        ax.nameTextStyle = Object.assign({ color: muted }, ax.nameTextStyle || {});
      });
      if (o.series[0].type === 'boxplot') {
        var thin = (p.option._thin || []);
        o.tooltip.formatter = function (x) {
          var v = x.data.length === 6 ? x.data.slice(1) : x.data;
          return 'kl ' + x.name + (thin.indexOf(x.name) >= 0 ? ' (tunt underlag)' : '') + '<br>snabbaste tiondelen ' + fmt(v[0], 0) + ' s<br>median ' + fmt(v[2], 0) + ' s<br>långsammaste tiondelen ' + fmt(v[4], 0) + ' s';
        };
      }
      var c = window.echarts.init(ref.current, null, { renderer: 'svg' });
      c.setOption(o);
      var ro = window.ResizeObserver ? new ResizeObserver(function () { c.resize(); }) : null;
      if (ro) ro.observe(ref.current);
      return function () { if (ro) ro.disconnect(); c.dispose(); };
    }, [p.option]);
    return h('div', { className: 'echart', ref: ref, style: { height: p.height || 260 } });
  }

  /* ── Tabell: designsystemets DataTable; en kolumn med light bär stoppljuset ── */
  var LJUS = { 'grön': 'var(--data-i-tid)', 'gul': 'var(--ochre)', 'röd': 'var(--data-sen)' };
  function Table(p) {
    return h('div', { className: 'tablebox' }, h(I8.DataTable, { caption: p.caption,
      columns: p.columns.map(function (c) {
        return { key: c.key, label: c.label, num: !!c.num, render: function (v, r) {
          var txt = v == null || v === '' ? '–' : typeof v === 'number' ? fmt(v, c.dec || 0) + (c.unit ? ' ' + c.unit : '') : v;
          var l = c.light && r[c.key + '_ljus'];
          return l ? h('span', { className: 'lt', style: { '--l': LJUS[l] } }, txt) : txt;
        } };
      }),
      rows: p.rows }));
  }

  /* ── Karta utan baskarta: banor, färgade, ritade en i taget ─────────────── */
  var DRAW_STEP_MS = 22, LABEL_H = 48;
  function paint(c) { return c.indexOf('--') === 0 ? 'var(' + c + ')' : c; }
  function SMap(p) {
    var b = p.block, w = b.box[0], legs = b.legs || [], groups = b.groups || [], top = b.top;
    var areas = b.areas || [], points = b.points || [];
    var lw = top ? top.label.length * 13 + 36 : 0;
    var lx = top ? Math.max(8, Math.min(w - lw - 8, top.x - lw / 2)) : 0;
    var ly = top ? (top.y > 130 ? top.y - 110 : top.y + 66) : 0;
    return h('figure', { className: 'kmap' },
      h('svg', { viewBox: '0 0 ' + w + ' ' + b.box[1], role: 'img', 'aria-label': p.label || 'Karta' },
        b.base && h('path', { className: 'kmap__base', d: b.base }),
        areas.map(function (g, i) {
          return h('path', { key: 'a' + i, className: 'kmap__area', d: g.d, style: { fill: paint(g.c), stroke: paint(g.c), animationDelay: (i * 30) + 'ms' } });
        }),
        groups.map(function (g, i) {
          return h('path', { key: 'g' + i, className: 'kmap__group', d: g.d, style: { stroke: paint(g.c), animationDelay: (i * 140) + 'ms' } });
        }),
        legs.map(function (g, i) {
          return h('path', { key: i, d: g.d, pathLength: 1, className: 'kmap__leg' + (g.thin ? ' is-thin' : '') + (b.dots ? ' is-dot' : ''),
            style: { stroke: paint(g.c), animationDelay: (i * DRAW_STEP_MS) + 'ms' } }, g.tip && h('title', null, g.tip));
        }),
        points.map(function (g, i) {
          return h('circle', { key: 'p' + i, className: 'kmap__point', cx: g.x, cy: g.y, r: g.r * 1.3, style: { fill: paint(g.c), animationDelay: (areas.length * 30 + i * 25) + 'ms' } },
            g.tip && h('title', null, g.tip));
        }),
        top && h('g', { className: 'kmap__top', style: { animationDelay: (legs.length * DRAW_STEP_MS + 700) + 'ms' } },
          h('circle', { cx: top.x, cy: top.y, r: 16 }),
          h('path', { d: 'M' + top.x + ' ' + (top.y - 16) + 'V' + (ly + LABEL_H) }),
          h('rect', { x: lx, y: ly, width: lw, height: LABEL_H, rx: 8 }),
          h('text', { x: lx + lw / 2, y: ly + LABEL_H / 2, textAnchor: 'middle', dominantBaseline: 'central' }, top.label))),
      b.legend && h('ul', { className: 'kmap__legend' },
        b.legend.title && h('li', null, h('b', null, b.legend.title)),
        b.legend.items.map(function (r, i) { return h('li', { key: i }, h('i', { style: { background: paint(r.c) } }), r.l); })),
      b.note && h('p', { className: 'kmap__note' }, b.note));
  }

  /* ── Framkomlighetsverktyget: de tio platserna och den valdas dygn ──────── */
  function Framk(p) {
    var places = p.block.places;
    var ss = useState(1), sel = ss[0], setSel = ss[1];
    var cur = places[sel - 1];
    return h('div', { className: 'fk' },
      h('div', { className: 'fk__list', role: 'listbox', 'aria-label': 'De tio platserna' }, places.map(function (x) {
        return h('button', { key: x.nr, type: 'button', role: 'option', 'aria-selected': x.nr === sel, className: 'fk__item' + (x.nr === sel ? ' is-on' : ''), onClick: function () { setSel(x.nr); } },
          h('span', { className: 'fk__nr' }, x.nr), h('span', { className: 'fk__name' }, x.plats, h('small', null, x.kommun)),
          h('span', { className: 'fk__min' }, fmt(x.sparad_min, 0), h('small', null, 'min/dag')));
      })),
      h('div', { className: 'fk__detail', key: sel },
        h('h3', { className: 'h3', style: { margin: 0 } }, cur.plats + ', ' + cur.kommun.toLowerCase()),
        h('div', { className: 'fk__kpi' },
          h(I8.KpiTile, { label: 'Turer per vardag', value: fmt(cur.turer), raised: true }),
          h(I8.KpiTile, { label: 'Typisk tid', value: fmt(cur.median_s, 1), unit: 's', note: 'snabbaste tiondelen ' + fmt(cur.p10_s, 0) + ' s', raised: true }),
          h(I8.KpiTile, { label: 'Möjlig tidsvinst', value: fmt(cur.sparad_min, 0), unit: 'min', note: 'per vardag, som tak', raised: true })),
        h('p', { className: 'fig__t' }, 'Restiden på sträckan timme för timme, vardagar'),
        h(EChart, { option: cur.box, height: 240, dec: 0 }),
        h('p', { className: 'kmap__note' }, 'Lådan visar mittersta hälften av turerna, strecket medianen, morrhåren snabbaste och långsammaste tiondelen. Sträckan är ' + cur.langd_m + ' m.')));
  }

  /* Ett svars block: rubrik, stycke, tabell, diagram, karta, verktyg. */
  function Blocks(p) {
    return h(Frag, null, p.blocks.map(function (b, i) {
      if (b.t === 'h') return h('h3', { key: i, className: 'blk-h' }, b.text);
      if (b.t === 'p') return h('p', { key: i, className: 'blk-p' }, b.text);
      if (b.t === 'lead') return h('p', { key: i, className: 'blk-lead' }, b.text);
      if (b.t === 'kpis') return h('div', { key: i, className: 'fk__kpi' }, b.items.map(function (k) { return h(I8.KpiTile, { key: k.label, label: k.label, value: k.value, unit: k.unit, note: k.note, raised: true }); }));
      // En jämförelse av andelar: en rad per mått, med talet stort och en stapel mot 100 %.
      if (b.t === 'reach') return h('figure', { key: i, className: 'reach' }, b.title && h('figcaption', { className: 'fig__t' }, b.title),
        b.rows.map(function (r) {
          return h('div', { key: r.label, className: 'reach__row' },
            h('span', { className: 'reach__label' }, r.label),
            h('span', { className: 'reach__bar', role: 'img', 'aria-label': fmt(r.pct, 1) + ' procent' }, h('i', { style: { width: r.pct + '%' } })),
            h('span', { className: 'reach__pct' }, fmt(r.pct, 1), h('small', null, '\u00a0%')),
            h('span', { className: 'reach__note' }, r.note));
        }));
      if (b.t === 'table') return h(Table, { key: i, caption: b.caption, columns: b.columns, rows: b.rows });
      if (b.t === 'chart') return h('figure', { key: i, className: 'fig' }, b.title && h('figcaption', { className: 'fig__t' }, b.title), h(EChart, { option: b.option, height: b.height, dec: b.dec }));
      if (b.t === 'smap') return h(SMap, { key: i, block: b, label: p.label });
      if (b.t === 'framk') return h(Framk, { key: i, block: b });
      return null;
    }));
  }

  /* ── En tur i samtalet: frågan, arbetsstegen, svaret som strömmar ───────── */
  function Turn(p) {
    var t = p.turn, a = t.a, steps = a.steps || [];
    var parts = useRef(blocksOf(a.text)).current;
    var total = size(parts);
    var ph = useState(t.done ? 'done' : 'think'), phase = ph[0], setPhase = ph[1];
    var sn = useState(t.done ? steps.length : 0), stepN = sn[0], setStepN = sn[1];
    var ns = useState(t.done ? total : 0), n = ns[0], setN = ns[1];
    useEffect(function () {
      if (t.done) return;
      var alive = true;
      (async function () {
        for (var i = 0; i < steps.length; i++) { await wait(STEP_MS); if (!alive) return; setStepN(i + 1); }
        await wait(250); if (!alive) return;
        if (a.canvas) p.onView(t);       // ytan öppnas bara när svaret behöver den
        setPhase('write');
      })();
      return function () { alive = false; };
    }, []);
    useEffect(function () {
      if (phase !== 'write') return;
      if (n >= total) { setPhase('done'); t.done = true; p.onDone(t); return; }
      var id = setTimeout(function () { setN(reduce ? total : n + 3); }, 22);
      return function () { clearTimeout(id); };
    }, [phase, n]);

    var live = phase !== 'think' ? undefined
      : steps.slice(0, stepN + 1).map(function (s, i) { return { label: s, state: i < stepN ? 'done' : 'run' }; });
    var done = phase === 'done';
    var actions = done && a.canvas && !p.narrow && !p.viewOpen ? [{ label: 'Visa igen', onClick: function () { p.onView(t); } }] : undefined;
    return h('div', { className: 'turn', ref: p.last ? p.anchor : undefined },
      h(I8.LasseMessage, { from: 'user', time: t.time }, a.q),
      h(I8.LasseMessage, { from: 'lasse', time: t.time, steps: live, streaming: phase === 'write', how: done ? a.how : undefined, actions: actions },
        done && steps.length > 0 && h('details', { className: 'steps-done' },
          h('summary', null, steps.length + ' arbetssteg'),
          h('ul', { className: 'i8-msg__steps', 'aria-label': 'Vad Lasse gjorde' }, steps.map(function (s, i) {
            return h('li', { key: i, className: 'i8-msg__step is-done' }, h('span', { className: 'i8-msg__step-ico', 'aria-hidden': 'true' }), s);
          }))),
        phase !== 'think' && h('div', { className: 'answer' }, rich(parts, n))),
      // Tabeller, diagram och kartor som hör till svaret står i samtalet, under texten.
      done && a.chat && a.chat.length > 0 && h('div', { className: 'blocks' }, h(Blocks, { blocks: a.chat, label: a.q })),
      // På en smal skärm står också ytans innehåll i samtalet.
      done && a.canvas && p.narrow && h('div', { className: 'blocks blocks--card' },
        h('p', { className: 'label', style: { margin: 0 } }, a.canvas.title), h('p', { className: 'kmap__sub body-sm' }, a.canvas.sub),
        h(Blocks, { blocks: a.canvas.blocks, label: a.canvas.title })));
  }

  /* ── Rutan: färdiga frågor som val. Ett val skrivs in tecken för tecken, med
     markören efter texten, och skickas av sig självt. Texten går inte att ändra.
     En egen fråga skrivs i ett eget fält och leder till en visning. ─────────── */
  function AskBox(p) {
    var os = useState(false), own = os[0], setOwn = os[1];
    var ts = useState(''), text = ts[0], setText = ts[1];
    var inp = useRef(null);
    useEffect(function () { if (own && inp.current) inp.current.focus(); }, [own]);
    function send(e) { e.preventDefault(); var q = text.trim(); if (!q) return; setText(''); setOwn(false); p.onOwn(q); }
    var idle = p.typed == null && !p.busy;
    return h('div', { className: 'askbox' + (p.landing ? ' askbox--landing' : '') },
      idle && !own && p.choices.length > 0 && h('div', { className: 'askbox__choices', role: 'group', 'aria-label': 'Välj en fråga' },
        p.choices.map(function (c) {
          return h('button', { key: c.id, type: 'button', className: 'askbox__chip' + (c.cta ? ' is-cta' : ''), title: c.q, onClick: function () { p.onPick(c); } }, c.chip);
        })),
      own
        ? h('form', { className: 'askbox__own', onSubmit: send },
            h('label', { className: 'i8-msg__sr', htmlFor: 'egen' }, 'Din egen fråga'),
            h('input', { id: 'egen', ref: inp, className: 'askbox__input', value: text, maxLength: 300, placeholder: 'Skriv din egen fråga', autoComplete: 'off',
              onChange: function (e) { setText(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Escape') setOwn(false); } }),
            h(I8.Button, { variant: 'ghost', size: 'sm', onClick: function () { setOwn(false); } }, 'Avbryt'),
            h(I8.Button, { variant: 'accent', size: 'sm', type: 'submit', disabled: !text.trim() }, 'Skicka'))
        : h('div', { className: 'askbox__line', 'aria-live': 'polite' },
            p.typed != null ? h('span', { className: 'askbox__typed' }, p.typed, h('span', { className: 'i8-caret', 'aria-hidden': 'true' }))
              : h('span', { className: 'askbox__hint' }, p.busy ? 'Lasse arbetar …' : p.choices.length ? 'Välj en fråga här ovanför' : '')),
      !own && h('div', { className: 'askbox__bar' },
        h('span', { className: 'askbox__fine' }, 'Frågorna är färdiga exempel ur riktig trafik. Orter och linjer är dolda.'),
        idle && h('button', { type: 'button', className: 'askbox__ownlink', onClick: function () { track('own_question_open'); setOwn(true); } }, 'Ställ en egen fråga')));
  }

  /* ── Bokningen: Google Kalenders bokningsschema i en ruta ovanpå sidan ──── */
  function Booking(p) {
    useEffect(function () {
      function onKey(e) { if (e.key === 'Escape') p.onClose(); }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, []);
    return h('div', { className: 'book', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Boka en visning',
        onClick: function (e) { if (e.target === e.currentTarget) p.onClose(); } },
      h('div', { className: 'book__box' },
        h('div', { className: 'work__bar' },
          h('span', { className: 'work__who' }, h('span', { className: 'mode__dot', 'aria-hidden': 'true' }), h('b', null, 'Lasse'), h('span', null, 'Boka en visning')),
          h(I8.Button, { variant: 'ghost', size: 'sm', onClick: p.onClose }, 'Stäng')),
        p.q && h('p', { className: 'book__q' }, 'Ta med din fråga i bokningen: ', h('b', null, p.q)),
        h('iframe', { className: 'book__frame', src: BOOK, title: 'Välj en tid för visningen' })));
  }

  /* ── Slutet: designsystemets slut (ridå, ● Lasse., rubrik, en knapp) med en jämförelse:
     dagens arbetssätt mot Lasses, rad för rad ─────────────────────────────── */
  var VS = [
    ['Kvalitetssäkrad data', 'Saknas, eller olika tal i olika uttag'],
    ['Svar på under en minut', 'Dagar eller veckor'],
    ['Tabeller, grafer och kartor', 'För hand i Excel'],
    ['Interaktiva rapporter', 'Statiska dokument'],
    ['Färdiga applikationer', 'Byggs och förvaltas själv'],
    ['PDF och dataexport', 'För hand']
  ];
  function End(p) {
    var ref = useRef(null);
    useEffect(function () { if (ref.current) ref.current.focus({ preventScroll: true }); }, []);
    return h('div', { className: 'i8 i8-end' },
      h('div', { className: 'i8-end__curtain', 'aria-hidden': 'true' }),
      h('section', { className: 'i8-end__stage', 'aria-labelledby': 'slut' },
        h('div', { className: 'i8-end__inner' },
          h('p', { className: 'i8-mark i8-end__st i8-end__st1' }, h('span', { className: 'i8-mark__dot', 'aria-hidden': 'true' }), 'Lasse.'),
          h('h2', { className: 'i8-end__title i8-end__st i8-end__st2', id: 'slut', tabIndex: -1, ref: ref }, 'Låter det för bra för att vara ', h('em', null, 'sant'), '?'),
          h('div', { className: 'i8-end__text i8-end__st i8-end__st3' }, h('p', null, 'Det är det inte.'), h('p', null, 'Vi har redan er data, allt som behövs är konton.')),
          h('table', { className: 'vs i8-end__st i8-end__st4' },
            h('thead', null, h('tr', null, h('th', { scope: 'col', className: 'vs__yes' }, 'Med Lasse'), h('th', { scope: 'col' }, h('span', { className: 'i8-msg__sr' }, 'Vad')), h('th', { scope: 'col' }, 'I dag'))),
            h('tbody', null, VS.map(function (r) {
              return h('tr', { key: r[0] },
                h('td', { className: 'vs__yes' }, h('span', { className: 'vs__check', 'aria-hidden': 'true' }), h('span', { className: 'i8-msg__sr' }, 'Ja')),
                h('th', { scope: 'row' }, r[0]), h('td', { className: 'vs__now' }, r[1]));
            }))),
          h('div', { className: 'i8-end__actions i8-end__st i8-end__st5' }, h(I8.Button, { variant: 'accent', icon: 'arrow-right', href: BOOK }, 'Boka en visning')),
          h('p', { className: 'i8-end__mail i8-end__st i8-end__st6' }, 'Skriver ni hellre? ', h('a', { href: 'mailto:lasse@iter8.se' }, 'lasse@iter8.se')),
          h('p', { className: 'i8-end__mail i8-end__st i8-end__st6' }, h('button', { type: 'button', className: 'end__about', onClick: p.onAbout }, 'Om oss'))),
        h('div', { className: 'i8-end__foot i8-end__st i8-end__st6' }, h('img', { src: 'assets/ds/logotyp/iter8-symbol-liggande-beige.svg', alt: 'iter8' }))));
  }

  /* ── Om oss: vad iter8 gör, grundarna och bolaget. Ett ark som kommer in från höger. ── */
  function About(p) {
    var closeRef = useRef(null);
    useEffect(function () {
      if (closeRef.current) closeRef.current.focus();
      function key(e) { if (e.key === 'Escape') p.onClose(); }
      document.addEventListener('keydown', key);
      return function () { document.removeEventListener('keydown', key); };
    }, []);
    return h('div', { className: 'about', onClick: function (e) { if (e.target === e.currentTarget) p.onClose(); } },
      h('div', { className: 'about__sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'about-title' },
        h('div', { className: 'about__bar' },
          h('span', { className: 'overline' }, 'Om iter8'),
          h('button', { ref: closeRef, type: 'button', className: 'i8 i8-btn i8-btn--ghost i8-btn--sm', onClick: p.onClose }, 'Stäng')),
        h('div', { className: 'about__body' },
          h('h2', { className: 'about__title', id: 'about-title' }, 'Vårt mål är att få saker att hända i ', h('em', null, 'verkligheten'), '.'),
          h('p', null, 'Lasse gör data till beslut: han hittar problemet, föreslår åtgärden, tar fram underlaget och följer upp att det verkade.'),
          h('ul', { className: 'about__points' },
            h('li', null, h('b', null, 'Begripligt.'), ' Rådata blir kartor, tabeller och svar du förstår direkt.'),
            h('li', null, h('b', null, 'Agerbart.'), ' Vi stannar inte vid diagram. Lasse föreslår vad ni kan göra, och var det gör störst skillnad.'),
            h('li', null, h('b', null, 'I framkant.'), ' Vi bygger vidare hela tiden. Ni får den nyaste tekniken utan att byta system.')),
          h('p', { className: 'about__loop' }, 'Namnet ', h('em', null, 'iter8'), ' har två rötter. Iter är latin för väg. Iterate är att upprepa: data, insikt, åtgärd, mätning, och sedan om igen. Åttan i loggan ligger ner och blir en oändlighetsslinga, för det arbetet tar aldrig slut.'),
          h('p', { className: 'about__loop' }, 'Och ', h('em', null, 'Lasse'), ' då? Det var AI:ns första förslag på en rutinerad chaufför. 🤷'),
          h('h3', { className: 'about__h' }, 'Grundarna'),
          h('p', null, 'Eva-Marie Wenehed och Martin Bergström har byggt och drivit analysverktyg för svensk kollektivtrafik sedan 2019, hos regioner, städer, operatörer och akademi i hela landet. iter8 grundades 2026.'),
          h('p', null, 'Produkten har formats tillsammans med en referensgrupp av ett 30-tal branschkollegor från ett 10-tal organisationer.'),
          h('div', { className: 'about__foot' },
            h('img', { className: 'top__symbol--light', src: 'assets/ds/logotyp/iter8-symbol-liggande-navy.svg', alt: 'iter8', height: 20 }),
            h('img', { className: 'top__symbol--dark', src: 'assets/ds/logotyp/iter8-symbol-liggande-beige.svg', alt: 'iter8', height: 20 }),
            h('p', null, 'iter8 AB · org.nr 559591-9423 · ', h('a', { href: 'mailto:lasse@iter8.se' }, 'lasse@iter8.se'),
              ' · ', h('a', { href: 'https://www.linkedin.com/company/iter-8/', target: '_blank', rel: 'noopener' }, 'LinkedIn'))))));
  }

  /* ── Avdelaren mellan samtalet och ytan, som i appen: dra, piltangenter, dubbelklick återställer ── */
  var CHAT_SPLIT = { min: 0.2, max: 0.8, initial: 5 / 12 };
  function Divider(p) {
    var r = p.range;
    function clamp(v) { return Math.min(r.max, Math.max(r.min, v)); }
    function onPointerDown(e) {
      var el = p.room.current; if (!el) return;
      e.preventDefault(); e.target.setPointerCapture(e.pointerId); p.onDragging(true);
      var rect = el.getBoundingClientRect(), cs = getComputedStyle(el);
      var left = rect.left + parseFloat(cs.paddingLeft), width = rect.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var half = e.currentTarget.getBoundingClientRect().width / 2;
      function move(ev) { p.onChange(clamp((ev.clientX - left - half) / width)); }
      function up() {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        p.onDragging(false);
      }
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    function onKeyDown(e) {
      var step = e.shiftKey ? 0.1 : 0.02, v = null;
      if (e.key === 'ArrowLeft') v = clamp(p.split - step); else if (e.key === 'ArrowRight') v = clamp(p.split + step);
      else if (e.key === 'Home') v = r.min; else if (e.key === 'End') v = r.max; else if (e.key === 'Enter') v = r.initial;
      if (v === null) return;
      e.preventDefault(); p.onChange(v);
    }
    return h('div', { className: 'divider', role: 'separator', 'aria-orientation': 'vertical', tabIndex: 0, 'aria-label': p.label,
        'aria-valuemin': Math.round(r.min * 100), 'aria-valuemax': Math.round(r.max * 100), 'aria-valuenow': Math.round(p.split * 100),
        onPointerDown: onPointerDown, onKeyDown: onKeyDown, onDoubleClick: function () { p.onChange(r.initial); } },
      h('span', { className: 'divider__grip', 'aria-hidden': 'true' }));
  }

  /* ── Sidan ──────────────────────────────────────────────────────────────── */
  function App(p) {
    var tree = p.tree, narrow = useNarrow();
    var ts = useState([]), turns = ts[0], setTurns = ts[1];
    var ty = useState(null), typed = ty[0], setTyped = ty[1];         // frågan som skrivs in i rutan just nu
    var bs = useState(false), busy = bs[0], setBusy = bs[1];
    var vs = useState(null), viewId = vs[0], setViewId = vs[1];       // turen vars yta står bredvid samtalet
    var es = useState(null), ended = es[0], setEnded = es[1];         // null | 'end' | 'own'
    var bk = useState(false), booking = bk[0], setBooking = bk[1];
    var ab = useState(false), about = ab[0], setAbout = ab[1];
    var sp = useState(CHAT_SPLIT.initial), split = sp[0], setSplit = sp[1];           // samtalets andel bredvid ytan
    var dg = useState(false), dragging = dg[0], setDragging = dg[1];
    var roomRef = useRef(null);
    var ownQ = useRef(''), ids = useRef(0), timer = useRef(null);
    var anchor = useRef(null), pickRef = useRef(null), stopAuto = useRef(null);
    var started = turns.length > 0;

    // Valen: frågans följdfrågor; i slutet av en gren de som återstår längre upp. Och vägen till en visning.
    var asked = {};
    turns.forEach(function (t) { asked[t.a.id] = true; });
    function kids(id) { return tree.filter(function (n) { return n.parent === id && !asked[n.id]; }); }
    function node(id) { return tree.filter(function (n) { return n.id === id; })[0]; }
    var choices = [];
    if (!started) choices = tree.filter(function (n) { return !n.parent; });
    else {
      var at = node(turns[turns.length - 1].a.id);
      while (at && !choices.length) { choices = kids(at.id); at = node(at.parent); }
      choices = choices.slice(0, 3).concat([{ id: 'igang', chip: START, q: START, cta: true }]);
    }

    function choose(c, auto) {
      if (busy || typed != null || ended) return;
      if (stopAuto.current) stopAuto.current();
      if (c.cta) { track('end_view', { answers: turns.length }); setEnded('end'); return; }
      var depth = 0, up = node(c.id);
      while (up && up.parent) { depth++; up = node(up.parent); }
      track('question_select', { question_id: c.id, depth: depth, auto: !!auto });
      var t0 = Date.now();
      var ready = svar(c.id), i = 0;
      (function step() {
        i = reduce ? c.q.length : i + 1;
        setTyped(c.q.slice(0, i));
        if (i < c.q.length) { timer.current = setTimeout(step, TYPE_MS); return; }
        timer.current = setTimeout(function () {
          ready.then(function (a) {
            setTyped(null); setBusy(true); setViewId(null);      // den förra frågans yta stängs; den nya öppnar sin egen
            setTurns(function (x) { return x.concat([{ id: ++ids.current, a: a, time: clock(), t0: t0 }]); });
          }).catch(function () { setTyped(null); });
        }, reduce ? 0 : 380);
      })();
    }
    pickRef.current = choose;
    function onDone(t) {
      setBusy(false);
      track('answer_complete', { question_id: t.a.id, seconds: Math.round((Date.now() - t.t0) / 1000) });
      tree.forEach(function (n) { if (n.parent === t.a.id) svar(n.id).catch(function () {}); });    // nästa svar hämtas i förväg
    }
    function own(q) { track('own_question_submit', { length: q.length }); ownQ.current = q; setEnded('own'); }
    function startOver() {
      if (turns.length) track('start_over', { answers: turns.length });
      clearTimeout(timer.current); ownQ.current = '';
      setTurns([]); setTyped(null); setBusy(false); setViewId(null); setEnded(null);
    }

    // Orörd landning: efter en stund ställer Lasse första frågan själv.
    useEffect(function () {
      if (reduce || !AUTOPLAY_MS) return;
      var off = false;
      var t = setTimeout(function () { stop(); pickRef.current(tree.filter(function (n) { return !n.parent; })[0], true); }, AUTOPLAY_MS);
      function stop() {
        if (off) return; off = true; clearTimeout(t);
        window.removeEventListener('pointerdown', stop, true); window.removeEventListener('keydown', stop, true);
      }
      window.addEventListener('pointerdown', stop, true); window.addEventListener('keydown', stop, true);
      stopAuto.current = stop;
      return stop;
    }, []);

    // Senaste frågan förankras överst; svaret växer nedåt utan att sidan rullar.
    useEffect(function () {
      if (anchor.current) anchor.current.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }, [turns.length]);
    useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
    // Länkarna ut ur sidan: bokningen, mejlet och inloggningen. Bokningen öppnas här i stället för att
    // lämna sidan, när bokningsschemat går att bädda in.
    var seenRef = useRef(0);
    seenRef.current = turns.length;
    useEffect(function () {
      function onClick(e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href'), source = a.closest('.i8-end.own') ? 'own_question' : a.closest('.i8-end') ? 'end' : a.closest('.about') ? 'about' : 'top';
        if (href.indexOf(BOOK) === 0) {
          track('booking_click', { source: source, answers: seenRef.current });
          if (BOOK_EMBEDS) { e.preventDefault(); setBooking(true); }
        } else if (href.indexOf('mailto:') === 0) track('contact_click', { source: source });
        else if (href.indexOf(LOGIN) === 0) track('login_click');
      }
      document.addEventListener('click', onClick);
      return function () { document.removeEventListener('click', onClick); };
    }, []);

    var askbox = h('div', { className: started ? 'composer' : 'composer composer--landing' },
      h(AskBox, { choices: choices, typed: typed, busy: busy, landing: !started, onPick: choose, onOwn: own }));

    var chat = h('section', { className: 'chat', 'aria-label': 'Samtal med Lasse' },
      h('div', { className: 'chat__scroll' }, h('div', { className: 'chat__col' },
        !started && h('div', { className: 'intro' }, h(I8.LasseMark, { size: 'lg' }), h(I8.Tagline, { prefix: TAGLINE, words: WORDS, hold: 2600 }),
          h('p', { className: 'intro__lead body-lg' }, 'Fråga Lasse och få svar på nästan vad som helst.')),
        !started && askbox,
        turns.map(function (t, i) {
          return h(Turn, { key: t.id, turn: t, last: i === turns.length - 1, anchor: anchor, narrow: narrow, viewOpen: viewId === t.id,
            onView: function (x) { track('view_open', { question_id: x.a.id, view: x.a.canvas.from }); setViewId(x.id); }, onDone: onDone });
        }))),
      started && askbox);

    var shown = null;
    turns.forEach(function (t) { if (t.id === viewId && t.a.canvas) shown = t; });
    var mapOpen = !!shown && !narrow, cv = shown && shown.a.canvas;
    var columns = mapOpen ? 'minmax(320px, ' + split + 'fr) var(--space-4) minmax(0, ' + (1 - split) + 'fr)' : undefined;
    var cls = ['room', mapOpen && 'room--split', dragging && 'room--dragging'].filter(Boolean).join(' ');

    return h('div', { className: 'page' },
      h('header', { className: 'top' },
        h('span', { className: 'top__known' }, 'Redan kund?'),
        h(I8.Button, { variant: 'ghost', size: 'sm', href: LOGIN }, 'Logga in'),
        h(I8.Button, { variant: 'secondary', size: 'sm', href: BOOK }, 'Boka en visning')),

      h('main', { ref: roomRef, className: cls, style: columns ? { gridTemplateColumns: columns } : undefined },
        h('div', { className: 'leftcol' },
          h('div', { className: 'modebar' },
            h('button', { type: 'button', className: 'top__home', title: 'Börja om', onClick: startOver },
              h('img', { className: 'top__symbol top__symbol--light', src: 'assets/ds/logotyp/iter8-symbol-liggande-navy.svg', alt: 'iter8' }),
              h('img', { className: 'top__symbol top__symbol--dark', src: 'assets/ds/logotyp/iter8-symbol-liggande-beige.svg', alt: 'iter8' })),
            started && !narrow && h(I8.Button, { variant: 'ghost', size: 'sm', onClick: startOver }, 'Börja om')),
          chat),
        mapOpen ? h(Divider, { split: split, range: CHAT_SPLIT, label: 'Ändra bredden på samtalet och ytan', onChange: setSplit, onDragging: setDragging, room: roomRef })
          : h('div', { className: 'divider divider--off', 'aria-hidden': 'true' }),
        h('aside', { className: 'work' + (mapOpen && cv.from !== 'lasse' ? ' work--blue' : ''), 'aria-hidden': !mapOpen },
          mapOpen && h(I8.SharedView, { key: shown.id, from: cv.from, kind: cv.kind, name: cv.name, title: cv.title, onClose: function () { track('view_close', { question_id: shown.a.id, view: cv.from }); setViewId(null); } },
            h('p', { className: 'kmap__sub body-sm' }, cv.sub),
            h(Blocks, { blocks: cv.blocks, label: cv.title })))),

      // Sidfoten: alltid längst ned, på varje vy.
      h('button', { type: 'button', className: 'foot', onClick: function () { track('about_open', { source: 'footer' }); setAbout(true); } }, 'iter8 AB · Om oss'),

      ended === 'end' && h(Frag, null,
        h(End, { onAbout: function () { track('about_open', { source: 'end' }); setAbout(true); } }),
        h('button', { type: 'button', className: 'again', onClick: function () { setEnded(null); } }, 'Tillbaka')),
      // En egen fråga: inget svar här, men en väg till ett.
      ended === 'own' && h(Frag, null,
        h(I8.Ending, { className: 'own', cta: 'Boka en visning', loginHref: bookHref(ownQ.current),
          title: 'Den här frågan hade säkerligen kunnat besvaras, om du haft ett konto.',
          text: '”' + ownQ.current + '”', before: false,
          mailText: 'Eller kontakta oss: ', logoSrc: 'assets/ds/logotyp/iter8-symbol-liggande-beige.svg' }),
        h('button', { type: 'button', className: 'again', onClick: function () { setEnded(null); } }, 'Tillbaka')),
      about && h(About, { onClose: function () { setAbout(false); } }),
      booking && h(Booking, { q: ownQ.current, onClose: function () { setBooking(false); } }));
  }

  fetch('assets/svar/trad.json')
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (tree) {
      svar(tree[0].id).catch(function () {});
      ReactDOM.createRoot(root).render(h(App, { tree: tree }));
    })
    .catch(function () { /* reserven i index.html står kvar */ });
})();
