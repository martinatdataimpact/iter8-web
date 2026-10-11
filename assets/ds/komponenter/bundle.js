/* @ds-bundle: {"format":4,"namespace":"Iter8","components":[{"name":"Button"},{"name":"Field"},{"name":"Badge"},{"name":"KpiTile"},{"name":"DataTable"},{"name":"MapLegend"},{"name":"CompareStat"},{"name":"InsightCard"},{"name":"LasseMark"},{"name":"Tagline"},{"name":"LasseMessage"},{"name":"Composer"},{"name":"SharedView"},{"name":"FileCard"},{"name":"Ending"},{"name":"TimetableGrid"},{"name":"Hero"},{"name":"ProofPoints"},{"name":"Quote"},{"name":"CtaBand"},{"name":"Slide"},{"name":"ReportPage"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var Fragment = React.Fragment;

  function fmt(n, dec) { var s = Math.abs(n).toFixed(dec == null ? 0 : dec).replace('.', ','); return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); }
  var reduceMotion = function () { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  function cx() { var out = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); } return out.join(' '); }

  /* ---- Ikoner: Lucide-linjer, 1,5 px, currentColor ---- */
  var PATHS = {
    'arrow-right': 'M5 12h14M13 6l6 6-6 6',
    'search': 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5',
    'chevron-down': 'M6 9l6 6 6-6',
    'map': 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    'message': 'M4 5h16v11H8l-4 3z',
    'clock': 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
    'download': 'M12 4v11M7 10l5 5 5-5M4 20h16',
    'external': 'M14 4h6v6M20 4l-9 9M18 13v7H4V6h7',
    'plus': 'M12 5v14M5 12h14',
    'check': 'M5 12l4 4L19 7',
    'x': 'M6 6l12 12M18 6L6 18'
  };
  function Icon(props) {
    var d = PATHS[props.name] || PATHS['arrow-right'];
    return h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', width: props.size || 18, height: props.size || 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', style: props.style },
      h('path', { d: d }));
  }

  /* ---- Button ---- */
  function Button(props) {
    var variant = props.variant || 'primary';
    var Tag = props.href ? 'a' : 'button';
    return h(Tag, {
      className: cx('i8', 'i8-btn', 'i8-btn--' + variant, props.size === 'sm' && 'i8-btn--sm', props.className),
      href: props.href, type: props.href ? undefined : (props.type || 'button'), disabled: props.disabled, onClick: props.onClick, 'aria-label': props.ariaLabel
    }, props.iconLeft && h(Icon, { name: props.iconLeft }), props.children, props.icon && h(Icon, { name: props.icon }));
  }

  /* ---- Field ---- */
  function Field(props) {
    var id = props.id || ('f-' + Math.random().toString(36).slice(2, 7));
    var control = props.options
      ? h('select', { id: id, value: props.value, defaultValue: props.defaultValue, onChange: props.onChange, disabled: props.disabled },
          props.options.map(function (o) { return h('option', { key: o.value != null ? o.value : o, value: o.value != null ? o.value : o }, o.label || o); }))
      : h('input', { id: id, type: props.type || 'text', value: props.value, defaultValue: props.defaultValue, placeholder: props.placeholder, onChange: props.onChange, disabled: props.disabled, inputMode: props.mono ? 'numeric' : undefined, 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': props.hint || props.error ? id + '-hint' : undefined });
    return h('div', { className: cx('i8', 'i8-field', props.error && 'i8-field--error', props.mono && 'i8-field--mono', props.className), style: props.style },
      props.label && h('label', { className: 'i8-field__label', htmlFor: id }, props.label, props.optional && h('small', null, 'valfritt')),
      h('div', { className: 'i8-field__control' },
        props.icon && h(Icon, { name: props.icon }),
        control,
        props.options && h(Icon, { name: 'chevron-down', style: { marginRight: 0, marginLeft: 8 } })),
      (props.error || props.hint) && h('div', { className: 'i8-field__hint', id: id + '-hint' }, props.error || props.hint));
  }

  /* ---- Badge ---- */
  var STATUS = { tidig: ['ochre', 'Tidig'], 'i-tid': ['sage', 'I tid'], sen: ['brick', 'Sen'] };
  function Badge(props) {
    var tone = props.tone;
    var label = props.children;
    if (props.status && STATUS[props.status]) { tone = STATUS[props.status][0]; label = label || STATUS[props.status][1]; }
    return h('span', { className: cx('i8', 'i8-badge', tone && 'i8-badge--' + tone, (props.pill || props.status) && 'i8-badge--pill', props.className) },
      (props.dot || props.status) && h('i', { className: 'i8-badge__dot' }), label);
  }

  /* ---- KpiTile ---- */
  function KpiTile(props) {
    var d = props.delta;
    var dir = d == null ? null : (typeof d === 'number' ? (d > 0 ? 'up' : d < 0 ? 'down' : 'flat') : d.direction || 'flat');
    if (props.invert && dir === 'up') dir = 'down'; else if (props.invert && dir === 'down') dir = 'up';
    var dText = d == null ? null : (typeof d === 'number' ? (d > 0 ? '+' : d < 0 ? '−' : '±') + fmt(d, props.deltaDecimals != null ? props.deltaDecimals : (String(d).split('.')[1] || '').length) + (props.deltaUnit || '') : d.text);
    return h('div', { className: cx('i8', 'i8-kpi', props.raised && 'i8-kpi--raised', props.className) },
      h('div', { className: 'i8-kpi__label' }, props.label),
      h('div', { className: 'i8-kpi__value' }, props.value, props.unit && h('span', { className: 'i8-kpi__unit' }, props.unit)),
      props.share != null && h('div', { className: 'i8-kpi__bar', 'aria-hidden': 'true' }, h('i', { style: { width: Math.max(0, Math.min(100, props.share)) + '%' } })),
      (dText || props.note) && h('div', { className: 'i8-kpi__note' },
        dText && h('span', { className: cx('i8-kpi__delta', 'i8-kpi__delta--' + dir) }, dText), dText && props.note && ' · ', props.note));
  }

  /* ---- DataTable ---- */
  function DataTable(props) {
    var cols = props.columns || [];
    var max = null;
    function num(v) { return Number(String(v).replace(/\s/g, '').replace(',', '.')) || 0; }
    if (props.barColumn) { max = Math.max.apply(null, props.rows.map(function (r) { return num(r[props.barColumn]); })); }
    return h('table', { className: cx('i8', 'i8-table', props.className) },
      props.caption && h('caption', null, props.caption),
      h('thead', null, h('tr', null, props.rank && h('th', { style: { width: 40 } }, '#'), cols.map(function (c) { return h('th', { key: c.key, className: c.num ? 'num' : undefined }, c.label); }))),
      h('tbody', null, props.rows.map(function (r, i) {
        return h('tr', { key: r.id || i },
          props.rank && h('td', { className: 'i8-table__rank' }, i + 1),
          cols.map(function (c) {
            var v = r[c.key];
            var cls = cx(c.num && 'num', c.signed && Number(v) > 0 && (c.invert ? 'neg' : 'pos'), c.signed && Number(v) < 0 && (c.invert ? 'pos' : 'neg'));
            var text = c.render ? c.render(v, r) : (c.signed && typeof v === 'number' ? (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) : v);
            return h('td', { key: c.key, className: cls || undefined },
              props.barColumn === c.key && max ? h('i', { className: 'i8-table__bar', style: { width: Math.round(80 * num(v) / max) + 'px' } }) : null,
              text, c.unit && h('span', { className: 'i8-muted' }, ' ' + c.unit));
          }));
      })));
  }

  /* ---- MapLegend ---- */
  function MapLegend(props) {
    var kind = props.kind || 'speed';
    var tokens = kind === 'seq' ? ['seq-1', 'seq-2', 'seq-3', 'seq-4', 'seq-5'] : ['speed-1', 'speed-2', 'speed-3', 'speed-4', 'speed-5'];
    var labels = props.labels || (kind === 'seq' ? ['få', 'många'] : ['fri', 'kö']);
    return h('div', { className: cx('i8', 'i8-legend', props.className), role: 'group', 'aria-label': props.title || 'Kartlegend' },
      h('div', { className: 'i8-legend__title' }, props.title || (kind === 'seq' ? 'Antal turer' : 'Hastighet per segment')),
      h('div', { className: 'i8-legend__scale', 'aria-hidden': 'true' }, tokens.map(function (t) { return h('i', { key: t, style: { background: 'var(--' + t + ')' } }); })),
      h('div', { className: 'i8-legend__labels' }, h('span', null, labels[0]), props.mid && h('span', null, props.mid), h('span', null, labels[1])),
      props.rows !== false && h(Fragment, null,
        h('div', { className: 'i8-legend__row' }, h('span', { className: 'i8-legend__stop' }), 'Hållplats'),
        h('div', { className: 'i8-legend__row' }, h('span', { className: 'i8-legend__line', style: { background: 'var(--sage)' } }), 'Markerad sträcka'),
        h('div', { className: 'i8-legend__row' }, h('span', { className: 'i8-legend__line', style: { background: 'var(--slate)' } }), 'Tåg / annan trafik')),
      props.note && h('div', { className: 'i8-legend__note' }, props.note));
  }

  /* ---- CompareStat ---- */
  function CompareStat(props) {
    var a = props.a, b = props.b;
    var diff = b.value - a.value;
    var pct = a.value ? (diff / a.value) * 100 : 0;
    var better = props.lowerIsBetter ? diff < 0 : diff > 0;
    var tone = Math.abs(diff) < (props.threshold || 0.0001) ? 'flat' : better ? 'better' : 'worse';
    var sign = diff > 0 ? '+' : diff < 0 ? '−' : '±';
    return h('div', { className: cx('i8', 'i8-cmp', props.className) },
      h('div', { className: 'i8-cmp__head' }, h('span', { className: 'i8-cmp__title' }, props.title), h('span', { className: 'i8-cmp__unit' }, props.unit)),
      h('div', { className: 'i8-cmp__period' }, h('small', null, 'A · ' + a.label), h('b', null, fmt(a.value, props.decimals)), a.note && h('span', null, a.note)),
      h('div', { className: cx('i8-cmp__delta', 'i8-cmp__delta--' + tone) },
        h('b', null, sign + fmt(diff, props.decimals)), h('span', null, sign + fmt(pct, 0) + ' %'),
        h('em', null, tone === 'better' ? 'Bättre' : tone === 'worse' ? 'Sämre' : 'Oförändrat')),
      h('div', { className: 'i8-cmp__period', style: { textAlign: 'right' } }, h('small', null, 'B · ' + b.label), h('b', null, fmt(b.value, props.decimals)), b.note && h('span', null, b.note)));
  }

  /* ---- InsightCard ---- */
  var PRIO = { 'Hög': 'brick', 'Medel': 'ochre', 'Låg': 'sage' };
  function InsightCard(props) {
    return h('article', { className: cx('i8', 'i8-insight', props.className) },
      h('div', { className: 'i8-insight__meta' },
        props.area && h(Badge, { tone: 'primary' }, props.area),
        props.priority && h(Badge, { tone: PRIO[props.priority] || 'sage', dot: true }, props.priority + ' prioritet'),
        props.line && h(Badge, null, props.line),
        props.time && h('time', null, props.time)),
      h('h3', { className: 'i8-insight__title' }, props.title),
      props.lead && h('p', { className: 'i8-insight__lead' }, props.lead),
      props.facts && h('div', { className: 'i8-insight__facts' }, props.facts.map(function (f, i) { return h('div', { className: 'i8-insight__fact', key: i }, h('b', null, f.value), h('span', null, f.label)); })),
      props.children,
      props.actions && props.actions.length > 0 && h('div', { className: 'i8-insight__actions' },
        props.actions.map(function (a, i) { return h(Button, { key: i, variant: a.variant || (i === 0 ? 'secondary' : 'ghost'), size: 'sm', iconLeft: a.icon, href: a.href, onClick: a.onClick }, a.label); })));
  }

  /* ---- LasseMark: "● Lasse." ---- */
  function LasseMark(props) {
    return h('p', { className: cx('i8', 'i8-mark', props.size === 'sm' && 'i8-mark--sm', props.className) },
      h('span', { className: 'i8-mark__dot', 'aria-hidden': 'true' }), 'Lasse.',
      props.time && h('time', { className: 'i8-mark__time' }, props.time));
  }

  /* ---- Tagline: sista ordet roterar lugnt ---- */
  var TAGLINE_WORDS = ['kollektivtrafik', 'demografi', 'arbetsplatser', 'restider', 'punktlighet', 'väder', 'utbud',
    'trafikstörningar', 'hållplatser', 'tidtabeller', 'omlopp', 'målpunkter', 'framkomlighet', 'beläggning', 'data'];
  function Tagline(props) {
    var words = props.words || TAGLINE_WORDS;
    var prefix = props.prefix || 'Din nya kollega – med väldigt bra koll på ';
    var st = React.useState(0), i = st[0], setI = st[1];
    var hold = props.hold || 4500, every = props.every || 3200;
    React.useEffect(function () {
      if (props.stop || props.still || reduceMotion()) { setI(0); return; }
      var t, first = setTimeout(function () {
        setI(1);
        t = setInterval(function () { setI(function (x) { return (x + 1) % words.length; }); }, every);
      }, hold);
      return function () { clearTimeout(first); clearInterval(t); };
    }, [props.stop, props.still]);
    var Tag = props.as || 'h1';
    return h(Tag, { className: cx('i8', 'i8-tagline', 'display-1', props.className), 'aria-label': prefix + words[0] },
      h('span', { 'aria-hidden': 'true' }, prefix, h('em', { className: 'i8-tagline__word', key: i }, words[i])));
  }

  /* ---- LasseMessage ---- */
  function LasseMessage(props) {
    var caret = props.streaming && h('span', { className: 'i8-caret', 'aria-hidden': 'true' });
    var body = props.children;
    var text = body != null && h('div', { className: 'i8-msg__text', 'aria-busy': props.streaming ? 'true' : undefined },
      typeof body === 'string' ? h('p', null, body, caret) : [h(Fragment, { key: 'b' }, body), caret && h(Fragment, { key: 'c' }, caret)]);
    // Användaren: bara bubblan till höger – ingen avatar, inget namn.
    if (props.from === 'user') return h('div', { className: cx('i8', 'i8-msg', 'i8-msg--user', props.className) }, text);
    var steps = props.steps || [];
    return h('div', { className: cx('i8', 'i8-msg', 'i8-msg--lasse', props.className) },
      h(LasseMark, { size: 'sm', time: props.time }),
      steps.length > 0 && h('ul', { className: 'i8-msg__steps', 'aria-label': 'Vad Lasse gör' }, steps.map(function (s, i) {
        var st = typeof s === 'string' ? { label: s } : s, run = st.state === 'run';
        return h('li', { key: i, className: cx('i8-msg__step', run ? 'is-run' : 'is-done') },
          h('span', { className: 'i8-msg__step-ico', 'aria-hidden': 'true' }), st.label,
          h('span', { className: 'i8-msg__sr' }, run ? ' – pågår' : ' – klart'));
      })),
      text || (props.streaming && h('div', { className: 'i8-msg__text' }, caret)),
      props.list && h('ol', { className: 'i8-msg__list' }, props.list.map(function (r, i) {
        return h('li', { key: i }, h('span', { className: 'rank' }, i + 1), h('span', null, r.label), h('span', { className: 'num' }, r.value), h('span', { className: 'i8-muted', style: { fontSize: 13 } }, r.unit));
      })),
      props.how && props.how.length > 0 && h('details', { className: 'i8-msg__source', open: props.howOpen },
        h('summary', null, 'Så räknade Lasse', h('span', { className: 'i8-msg__tag' }, 'riktiga data · alltid')),
        h('ol', null, props.how.map(function (t, i) { return h('li', { key: i }, t); })),
        props.rows != null && h('p', { className: 'i8-msg__rows' }, 'Resultat: ' + fmt(props.rows) + ' rader')),
      props.actions && h('div', { className: 'i8-msg__actions' }, props.actions.map(function (a, i) { return h(Button, { key: i, variant: 'secondary', size: 'sm', iconLeft: a.icon, onClick: a.onClick }, a.label); })));
  }

  /* ---- Composer: inmatningsrutan ---- */
  function Composer(props) {
    var own = React.useState(''), draft = props.value != null ? props.value : own[0];
    function set(v) { if (props.value == null) own[1](v); if (props.onChange) props.onChange(v); }
    function ask() {
      var q = (draft || '').trim() || props.suggestion;
      if (!q || props.busy) return;
      if (props.onAsk) props.onAsk(q);
      set('');
    }
    // Medan Lasse arbetar blir Fråga till Stoppa, om konsumenten ger onStop. Knappen är låst
    // en kort stund först (stopDelay), så att ett dubbelklick på Fråga inte stoppar svaret.
    var stoppable = !!(props.busy && props.onStop), armed = React.useState(false);
    React.useEffect(function () {
      armed[1](false);
      if (!stoppable) return;
      var t = setTimeout(function () { armed[1](true); }, props.stopDelay != null ? props.stopDelay : 700);
      return function () { clearTimeout(t); };
    }, [stoppable]);
    var hint = props.hint || (props.busy ? 'Lasse arbetar …' : draft ? 'Enter för att fråga' : props.suggestion ? 'Skriv din fråga, eller tryck Enter för förslaget' : 'Enter för att fråga');
    return h('div', { className: cx('i8', 'i8-composer', props.landing && 'i8-composer--landing', props.className) },
      h('div', { className: 'i8-composer__box' },
        h('label', { className: 'i8-msg__sr', htmlFor: props.id || 'i8-ask' }, 'Fråga Lasse'),
        h('textarea', { id: props.id || 'i8-ask', rows: props.landing ? 2 : 1, value: draft, maxLength: props.maxLength,
          placeholder: props.suggestion || props.placeholder || 'Fråga Lasse om er trafik …',
          onChange: function (e) { set(e.target.value); },
          onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } } }),
        h('div', { className: 'i8-composer__bar' },
          h('span', { className: 'i8-composer__hint' }, hint),
          h('div', { className: 'i8-composer__end' },
            props.tools,
            stoppable
              ? h(Button, { variant: 'secondary', size: 'sm', disabled: !armed[0], onClick: props.onStop }, props.stopLabel || 'Stoppa')
              : h(Button, { variant: 'accent', size: 'sm', disabled: props.busy || !(draft || props.suggestion), onClick: ask }, props.buttonLabel || 'Fråga')))),
      props.fine && h('p', { className: 'i8-composer__fine' }, props.fine));
  }

  /* ---- SharedView: ytan Lasse öppnar när svaret behöver den ---- */
  // from: 'lasse' – något Lasse har tagit fram (ljust huvud, sage-punkt);
  //       'tool' | 'app' – ett verktyg eller en app (navy huvud och ram).
  function SharedView(props) {
    var from = props.from || 'lasse', framed = from === 'tool' || from === 'app';
    return h('aside', { className: cx('i8', 'i8-shared', framed && 'i8-shared--framed', props.className),
        'aria-label': framed ? (from === 'tool' ? 'Verktyg' : 'App') + ' som är öppen' : 'Det Lasse har tagit fram' },
      h('div', { className: 'i8-shared__head' },
        framed
          ? h('span', { className: 'i8-shared__who' }, h('span', { className: 'i8-shared__app', 'aria-hidden': 'true' }), h('b', null, from === 'tool' ? 'Verktyg' : 'App'), props.name && h('span', null, props.name))
          : h('span', { className: 'i8-shared__who' }, h('span', { className: 'i8-mark__dot', 'aria-hidden': 'true' }), h('b', null, 'Lasse'), h('span', null, 'har tagit fram · ' + (props.kind || 'Insikt'))),
        props.onClose && h(Button, { variant: 'ghost', size: 'sm', onClick: props.onClose }, 'Stäng')),
      h('div', { className: 'i8-shared__body' },
        props.title && h('h2', { className: 'i8-shared__title' }, props.title),
        props.children));
  }

  /* ---- FileCard + FileModal: filer i svaret ---- */
  function FileCard(props) {
    return h('button', { type: 'button', className: cx('i8', 'i8-file', props.className), onClick: props.onOpen },
      h('span', { className: 'i8-file__ico', 'aria-hidden': 'true' }, props.type || 'PDF'),
      h('span', { className: 'i8-file__txt' }, h('b', null, props.name), props.meta && h('span', null, props.meta)),
      h('span', { className: 'i8-file__go' }, props.openLabel || 'Öppna'));
  }
  function FileModal(props) {
    React.useEffect(function () {
      function onKey(e) { if (e.key === 'Escape' && props.onClose) props.onClose(); }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, [props.onClose]);
    return h('div', { className: cx('i8', 'i8-modal', props.className), onClick: function (e) { if (e.target === e.currentTarget && props.onClose) props.onClose(); } },
      h('div', { className: 'i8-modal__box', role: 'dialog', 'aria-modal': 'true', 'aria-label': props.name },
        h('div', { className: 'i8-modal__bar' },
          h('span', { className: 'i8-file__ico i8-file__ico--sm', 'aria-hidden': 'true' }, props.type || 'PDF'),
          h('span', { className: 'i8-file__txt' }, h('b', null, props.name), props.meta && h('span', null, props.meta)),
          props.href && h(Button, { variant: 'secondary', size: 'sm', iconLeft: 'download', href: props.href }, 'Ladda ned'),
          h(Button, { variant: 'ghost', size: 'sm', onClick: props.onClose }, 'Stäng')),
        h('div', { className: 'i8-modal__body' }, props.children)));
  }

  /* ---- Ending: samtalet är slut, ridån går upp ---- */
  function Ending(props) {
    var ref = React.useRef(null);
    React.useEffect(function () { if (ref.current) ref.current.focus({ preventScroll: true }); }, []);
    return h('div', { className: cx('i8', 'i8-end', props.className) },
      h('div', { className: 'i8-end__curtain', 'aria-hidden': 'true' }),
      h('section', { className: 'i8-end__stage', 'aria-labelledby': 'i8-end-title' },
        h('div', { className: 'i8-end__inner' },
          h('p', { className: 'i8-mark i8-end__st i8-end__st1' }, h('span', { className: 'i8-mark__dot', 'aria-hidden': 'true' }), 'Lasse.'),
          h('h2', { className: 'i8-end__title i8-end__st i8-end__st2', id: 'i8-end-title', tabIndex: -1, ref: ref },
            props.title || h(Fragment, null, 'Er trafik ligger ', h('em', null, 'redan'), ' här.')),
          h('p', { className: 'i8-end__text i8-end__st i8-end__st3' }, props.text || 'Logga in med er jobbmejl, så svarar Lasse om er egen trafik. Det finns inget att installera och inget att vänta på.'),
          props.before !== false && h('div', { className: 'i8-end__vs i8-end__st i8-end__st4' },
            h('div', { className: 'i8-end__col i8-end__col--before' }, h('p', { className: 'i8-end__h' }, 'I dag'),
              h('ul', null, (props.before || ['Uttag för hand och analyser i Excel', 'Veckor från fråga till svar', 'Kunskapen sitter hos en eller två personer']).map(function (t, i) { return h('li', { key: i }, t); }))),
            h('div', { className: 'i8-end__col i8-end__col--after' }, h('p', { className: 'i8-end__h' }, 'Med Lasse'),
              h('ul', null, (props.after || ['Fråga på svenska, svar direkt', 'Tidtabell och beslutsunderlag samma dag', 'Alla ser samma tal, uppdaterade varje dag']).map(function (t, i) { return h('li', { key: i }, t); })))),
          h('div', { className: 'i8-end__actions i8-end__st i8-end__st5' },
            h(Button, { variant: 'accent', icon: 'arrow-right', href: props.loginHref || 'https://app.iter8.se' }, props.cta || 'Logga in med er jobbmejl')),
          h('p', { className: 'i8-end__mail i8-end__st i8-end__st6' }, props.mailText || 'Vill ni hellre gå igenom er trafik tillsammans? Det tar en kvart. ',
            h('a', { href: 'mailto:' + (props.email || 'lasse@iter8.se') }, props.email || 'lasse@iter8.se'))),
        props.logoSrc && h('div', { className: 'i8-end__foot i8-end__st i8-end__st6' }, h('img', { src: props.logoSrc, alt: 'iter8' }))));
  }

  /* ---- TimetableGrid ---- */
  function TimetableGrid(props) {
    var mode = props.mode || 'Differens';
    var modes = ['Föreslagen', 'Nuvarande', 'Differens', 'Antal turer'];
    var slots = props.slots || ['Morgon', 'Dag', 'Kväll', 'Helg'];
    var slotHours = props.slotHours || ['06–09', '09–15', '15–19', 'lör–sön'];
    function cellClass(c) {
      if (mode !== 'Differens') return 'i8-tt__cell--same';
      if (c.hold) return 'i8-tt__cell--hold';
      if (c.diff > 0) return 'i8-tt__cell--more';
      if (c.diff < 0) return 'i8-tt__cell--less';
      return 'i8-tt__cell--same';
    }
    function cellText(c) {
      if (mode === 'Föreslagen') return [c.proposed, h('small', { key: 's' }, 's')];
      if (mode === 'Nuvarande') return [c.current, h('small', { key: 's' }, 's')];
      if (mode === 'Antal turer') return [c.n, h('small', { key: 's' }, 'turer')];
      var s = c.diff > 0 ? '+' : c.diff < 0 ? '−' : '±';
      return [s + Math.abs(c.diff), h('small', { key: 's' }, 's')];
    }
    return h('div', { className: cx('i8', props.className) },
      props.showModes !== false && h('div', { className: 'i8-tt__mode', role: 'group', 'aria-label': 'Cellläge' }, modes.map(function (m) { return h('button', { key: m, 'aria-pressed': m === mode ? 'true' : 'false', onClick: function () { props.onMode && props.onMode(m); } }, m); })),
      h('table', { className: 'i8-tt' },
        h('thead', null, h('tr', null, h('th', null, props.rowLabel || 'Delsträcka'), slots.map(function (s, i) { return h('th', { key: s, className: 'slot' }, s, h('small', null, slotHours[i])); }))),
        h('tbody', null, props.rows.map(function (r) {
          return h('tr', { key: r.label }, h('td', null, r.label), r.cells.map(function (c, i) {
            return h('td', { key: i }, h('div', { className: cx('i8-tt__cell', cellClass(c)), title: 'Nuvarande ' + c.current + ' s · föreslagen ' + c.proposed + ' s · ' + c.n + ' turer' }, cellText(c)));
          }));
        }))),
      mode === 'Differens' && h('div', { className: 'i8-tt__legend' },
        h('span', null, h('i', { style: { background: 'var(--brick-soft)' } }), 'Behöver mer tid'),
        h('span', null, h('i', { style: { background: 'var(--sage-soft)' } }), 'Kan kortas'),
        h('span', null, h('i', { style: { background: 'var(--ochre-soft)' } }), 'Reglering')));
  }

  /* ---- Hero ---- */
  function Hero(props) {
    return h('section', { className: cx('i8', 'i8-hero', props.className) },
      h('div', { className: 'i8-hero__inner' },
        h('div', null,
          props.eyebrow && h('p', { className: 'i8-hero__eyebrow' }, props.eyebrow),
          h('h1', { className: 'i8-hero__title' }, props.title),
          props.lead && h('p', { className: 'i8-hero__lead' }, props.lead),
          h('div', { className: 'i8-hero__actions' },
            h(Button, { variant: 'primary', icon: 'arrow-right', href: props.ctaHref || '#' }, props.cta || 'Logga in med er jobbmejl'),
            props.secondary && h(Button, { variant: 'ghost', href: '#' }, props.secondary))),
        h('div', { className: 'i8-hero__aside' }, props.children, props.fine && h('p', { className: 'i8-hero__fine' }, props.fine))));
  }

  /* ---- ProofPoints ---- */
  function ProofPoints(props) {
    var items = props.items || [
      { value: '16', of: 'av 21', label: 'regioner där Lasse redan följer trafiken varje dag', note: 'Ambitionen är alla 21.' },
      { value: '0', of: 'dagar', label: 'uppstartstid', note: 'Er trafik ligger redan analyserad innan ni är kund.' },
      { value: '70', of: '%', label: 'av Sveriges kollektivtrafik att jämföra med', note: 'Minst. Se hur linjer under samma villkor klarar sig.' },
      { value: '365', of: 'dagar/år', label: 'varje tur, varje dag', note: 'I stället för en mätning på fem dagar.' }
    ];
    return h('div', { className: cx('i8', 'i8-proof', props.className), style: { gridTemplateColumns: 'repeat(' + items.length + ', 1fr)' } },
      items.map(function (it, i) {
        return h('div', { className: 'i8-proof__item', key: i },
          h('div', { className: 'i8-proof__value' }, it.value, it.of && h('small', null, it.of)),
          h('div', { className: 'i8-proof__label' }, it.label),
          it.note && h('div', { className: 'i8-proof__note' }, it.note));
      }));
  }

  /* ---- Quote ---- */
  function Quote(props) {
    return h('figure', { className: cx('i8', 'i8-quote', props.className), style: { margin: 0 } },
      h('div', { className: 'i8-quote__mark', 'aria-hidden': 'true' }, '”'),
      h('div', null,
        h('blockquote', { className: 'i8-quote__text', style: { margin: 0 } }, props.children),
        h('figcaption', { className: 'i8-quote__who' }, props.who, props.role && h('span', null, ' · ' + props.role), props.segment && h('div', { className: 'i8-quote__seg' }, h(Badge, null, props.segment)))));
  }

  /* ---- CtaBand ---- */
  function CtaBand(props) {
    return h('section', { className: cx('i8', 'i8-cta', props.className) },
      h('div', null,
        h('h2', { className: 'i8-cta__title' }, props.title || 'Er data väntar redan på er.'),
        props.text && h('p', { className: 'i8-cta__text' }, props.text),
        h('div', { className: 'i8-cta__form', style: { marginTop: 24 } },
          h(Field, { label: 'Jobbmejl', placeholder: 'fornamn@skanetrafiken.se', type: 'email', style: { width: 320 } }),
          h(Button, { variant: 'accent', icon: 'arrow-right' }, props.cta || 'Logga in'))));
  }

  /* ---- Slide ---- */
  function Slide(props) {
    var variant = props.variant || 'title';
    return h('section', { className: cx('i8', 'i8-slide', props.tone === 'band' && 'i8-slide--band', props.tone === 'paper' && 'i8-slide--paper', props.className), 'aria-label': props.ariaLabel },
      props.eyebrow && h('p', { className: 'i8-slide__eyebrow' }, props.eyebrow),
      h('h1', { className: 'i8-slide__title', style: variant === 'list' || variant === 'stat' ? { fontSize: 80, lineHeight: 1.05 } : undefined }, props.title),
      variant === 'stat' && h('div', { className: 'i8-slide__body' },
        h('div', { className: 'i8-slide__stat' }, h('b', null, props.stat), h('span', null, props.statLabel)),
        props.text && h('p', { className: 'i8-slide__text' }, props.text)),
      variant === 'list' && h('div', { className: 'i8-slide__body', style: { display: 'block' } },
        h('ol', { className: 'i8-slide__list' }, (props.items || []).map(function (it, i) { return h('li', { key: i }, h('b', null, it.key || String(i + 1).padStart(2, '0')), h('span', null, it.text || it)); }))),
      variant === 'title' && props.text && h('div', { className: 'i8-slide__body' }, h('p', { className: 'i8-slide__text' }, props.text)),
      h('div', { className: 'i8-slide__foot' },
        h('span', null, props.footer || 'iter8 · ' + (props.date || '')),
        props.markSrc ? h('img', { src: props.markSrc, alt: '' }) : h('span', { className: 'n' }, props.n != null ? String(props.n).padStart(2, '0') : '')));
  }

  /* ---- ReportPage ---- */
  function ReportPage(props) {
    var cover = props.variant === 'cover';
    return h('div', { className: cx('i8', 'i8-report', props.className) },
      h('div', { className: cx('i8-report__plate', cover && 'i8-report__plate--band') },
        h('div', { className: 'i8-report__meta' }, (props.meta || ['Åtgärdsunderlag', props.date || '']).map(function (m, i) { return h('span', { key: i }, m); })),
        h('h1', { className: 'i8-report__title' }, props.title),
        props.subtitle && h('p', { className: 'i8-report__sub' }, props.subtitle)),
      h('div', { className: 'i8-report__body' }, props.children),
      h('div', { className: 'i8-report__foot' },
        h('span', null, props.source || 'Källa: iter8'),
        props.logoSrc ? h('img', { src: props.logoSrc, alt: 'iter8' }) : h('span', { className: 'n' }, props.page != null ? 'Sida ' + props.page : 'iter8')));
  }

  window.Iter8 = {
    Icon: Icon, Button: Button, Field: Field, Badge: Badge,
    KpiTile: KpiTile, DataTable: DataTable, MapLegend: MapLegend, CompareStat: CompareStat, InsightCard: InsightCard,
    LasseMark: LasseMark, Tagline: Tagline, LasseMessage: LasseMessage, Composer: Composer, SharedView: SharedView, FileCard: FileCard, FileModal: FileModal, Ending: Ending, TimetableGrid: TimetableGrid, Hero: Hero, ProofPoints: ProofPoints, Quote: Quote,
    CtaBand: CtaBand, Slide: Slide, ReportPage: ReportPage, fmt: fmt
  };
})();
