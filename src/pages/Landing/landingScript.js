export function initLandingScript() {
    const $ = id => document.getElementById(id);
    const cv = document.getElementById('waves');
    if (!cv) return () => {};
    const cx = cv.getContext('2d');
    let mx = -999, boost = 0, boostT = 0, rip = [], W, H, t = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
        W = cv.clientWidth; H = cv.clientHeight; 
        cv.width = W * dpr; cv.height = H * dpr; 
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', size); 
    size();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pts = [];
    for (let i = 0; i < 900; i++) {
        const y = 1 - 2 * (i + .5) / 900, rr = Math.sqrt(1 - y * y), a = i * 2.399963;
        pts.push({ x: Math.cos(a) * rr, y, z: Math.sin(a) * rr });
    }
    let animId;
    function draw() {
        if (!document.getElementById('waves')) return; 
        boost += (boostT - boost) * .06;
        cx.clearRect(0, 0, W, H);
        const g = cx.createRadialGradient(W / 2, H * 1.25, 60, W / 2, H * 1.25, W * .6);
        g.addColorStop(0, 'rgba(20,90,255,.55)'); g.addColorStop(.5, 'rgba(10,40,140,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        {
            const R = Math.min(W * .35, 460), gx = W / 2, gy = H + R * .55, c = Math.cos(t * .22), sn = Math.sin(t * .22), ct = Math.cos(.45), st = Math.sin(.45);
            for (const q of pts) {
                const x = q.x * c + q.z * sn, z2 = -q.x * sn + q.z * c, y = q.y * ct - z2 * st, z = q.y * st + z2 * ct, py = gy - y * R;
                if (py > H + 4 || z < -.15) continue;
                cx.fillStyle = `rgba(90,165,255,${(.12 + .5 * (z + .15) / 1.15).toFixed(2)})`; cx.fillRect(gx + x * R, py, 1.7, 1.7)
            }
            cx.beginPath(); cx.arc(gx, gy, R, 0, 7); cx.strokeStyle = 'rgba(60,130,255,.35)'; cx.lineWidth = 1.5; cx.stroke()
        }
        cx.globalCompositeOperation = 'lighter';
        const mid = H * .5, n = 14, voice = .75 + .35 * Math.sin(t * 1.7) * Math.sin(t * .53 + 1);
        for (let i = 0; i < n; i++) {
            const f = i / (n - 1);
            cx.beginPath();
            for (let x = 0; x <= W; x += 6) {
                const nx = x / W, env = Math.pow(Math.sin(Math.PI * nx), 1.2) * voice;
                const y = mid
                    + Math.sin(nx * 7 + t * 1.1 + i * .45) * 34 * env
                    + Math.sin(nx * 13 - t * 1.6 + i * .8) * 18 * env * (.4 + f)
                    + Math.sin(nx * 3 + t * .6 - i * .3) * 22 * env
                    + (f - .5) * 40 * env + Math.exp(-((x - mx) ** 2) / 26000) * Math.sin(t * 4 + i * .6) * 32 * boost;
                x ? cx.lineTo(x, y) : cx.moveTo(x, y);
            }
            cx.strokeStyle = `hsla(${210 + f * 12},100%,${55 + f * 20}%,${.22 + .3 * (1 - Math.abs(f - .5) * 2)})`;
            cx.lineWidth = 1.2; cx.shadowColor = '#2a7bff'; cx.shadowBlur = 10; cx.stroke();
        }
        rip = rip.filter(q => t - q.t < 1.6);
        rip.forEach(q => {
            const a = (t - q.t) / 1.6; cx.beginPath(); cx.arc(q.x, q.y, a * 320, 0, 7); cx.strokeStyle = `rgba(90,165,255,${.65 * (1 - a)})`; cx.lineWidth = 2; cx.stroke()
        });
        cx.shadowBlur = 0; cx.globalCompositeOperation = 'source-over';
        if (!reduce) { t += .018; animId = requestAnimationFrame(draw) }
    }
    draw();
    
    // Setup script return cleanup early
    let cleanupFns = [];
    cleanupFns.push(() => {
        window.removeEventListener('resize', size);
        if (animId) cancelAnimationFrame(animId);
    });

    const shown = { sav: 8004, lab: 816, hrs: 34 };
    function tween(key, to, fmt) {
        const el = $(key === 'sav' ? 'sav' : key === 'lab' ? 'lab' : 'hrs'), from = shown[key], t0 = performance.now();
        (function f(n) {
            const k = Math.min(1, (n - t0) / 450), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (el) el.textContent = fmt(v);
            if (k < 1) requestAnimationFrame(f); else shown[key] = to
        })(t0)
    }

    const spark = document.getElementById('spark'), NS = 'http://www.w3.org/2000/svg';
    if (spark) {
        for (let i = 0; i < 12; i++) { const rc = document.createElementNS(NS, 'rect'); rc.setAttribute('x', i * 20 + 2); rc.setAttribute('y', 0); rc.setAttribute('width', 16); rc.setAttribute('height', 46); rc.setAttribute('rx', 3); spark.appendChild(rc) }
        window.sparkSet = function (sv) { const k = Math.max(.1, Math.sqrt(sv / 52000)); spark.querySelectorAll('rect').forEach((rc, i) => rc.style.transform = `scaleY(${Math.min(1, k * (i + 1) / 12 * 1.6 + .04).toFixed(3)})`) };
        window.sparkSet(8004);
    }

    window._roi = function() {};
    window.roi = function () {
        if (!$('calls')) return;
        const c = +$('calls').value, w = +$('wage').value, h = Math.round(c * 4.5 / 60), l = h * w, sv = Math.max(0, (l - 149) * 12);
        if ($('cv')) $('cv').textContent = c + ' calls';
        if ($('wv')) $('wv').textContent = '$' + w + '/hr';
        if ($('calls')) $('calls').style.setProperty('--p', ((c - 50) / (1000 - 50) * 100) + '%');
        if ($('wage')) $('wage').style.setProperty('--p', ((w - 10) / (60 - 10) * 100) + '%');
        $('sav').textContent = '$' + shown.sav.toLocaleString(); $('lab').textContent = '$' + shown.lab.toLocaleString(); $('hrs').textContent = shown.hrs + ' hrs';
        if(window.sparkSet) window.sparkSet(sv); tween('sav', sv, v => '$' + v.toLocaleString()); tween('lab', l, v => '$' + v.toLocaleString()); tween('hrs', h, v => v + ' hrs');
        const rs = document.querySelector('.res'); if (rs) { rs.classList.add('bump'); clearTimeout(window.roi.t); window.roi.t = setTimeout(() => rs.classList.remove('bump'), 350) }
    };
    if ($('calls')) {
        ['calls', 'wage'].forEach(i => { $(i).addEventListener('input', window.roi) });
        window.roi();
    }

    const sw = $('sw');
    if (sw) {
        sw.onclick = e => {
            const on = e.currentTarget.classList.toggle('on');
            document.querySelectorAll('.p').forEach(p => {
                const from = +p.textContent.slice(1), to = Math.round(p.dataset.m * (on ? .8 : 1)), t0 = performance.now();
                (function f(n) {
                    const k = Math.min(1, (n - t0) / 500); p.textContent = '$' + Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
                    if (k < 1) requestAnimationFrame(f)
                })(t0)
            })
        };
    }

    function goTo(h) {
        const t = h.length > 1 && document.querySelector(h);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (h === '#') window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const clickHandler = e => {
        const a = e.target.closest('[data-go]');
        if (a) { e.preventDefault(); goTo(a.dataset.go) }
    };
    document.addEventListener('click', clickHandler);
    cleanupFns.push(() => document.removeEventListener('click', clickHandler));

    const links = [...document.querySelectorAll('#menu a')];
    const secs = links.map(a => document.querySelector(a.dataset.go));
    const spy = () => {
        let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * .4) cur = i });
        links.forEach((a, i) => a.classList.toggle('active', i === cur && window.scrollY > 40))
    };
    window.addEventListener('scroll', spy, { passive: true }); 
    cleanupFns.push(() => window.removeEventListener('scroll', spy));
    spy();

    let timers = [];
    const script = [['Caller', 'Hi, I need to book a cleaning this week.'], ['ai', 'AI Agent', 'Sure! I have Thursday at 10:30 AM or Friday at 2 PM.'], ['Caller', 'Thursday works.'], ['ai', 'AI Agent', 'Booked. I will send a WhatsApp reminder tonight.']];
    const callBtn = $('callBtn');
    if (callBtn) {
        callBtn.onclick = () => {
            const box = $('demoBox'), log = $('log'), on = !box.classList.contains('live');
            timers.forEach(clearTimeout); timers = []; log.innerHTML = '';
            box.classList.toggle('live', on); callBtn.textContent = on ? 'End call' : 'Start Sample Call / Live Demo';
            if (!on) return;
            script.forEach((l, i) => timers.push(setTimeout(() => {
                if (!$('demoBox')) return;
                const ai = l[0] === 'ai', d = document.createElement('div'); if (ai) d.className = 'ai';
                const full = (ai ? l[1] : l[0]) + ': ' + (ai ? l[2] : l[1]); log.appendChild(d); let ci = 0; const ty = setInterval(() => { d.textContent = full.slice(0, ++ci); if (ci >= full.length) clearInterval(ty) }, 28); timers.push(ty);
                if (i === script.length - 1) timers.push(setTimeout(() => { box.classList.remove('live'); callBtn.textContent = 'Start Sample Call / Live Demo' }, 2500));
            }, i * 1800)));
        };
    }
    cleanupFns.push(() => timers.forEach(clearTimeout));

    document.querySelectorAll('.q button').forEach(b => b.onclick = () => {
        const q = b.parentElement, o = q.classList.contains('open');
        document.querySelectorAll('.q').forEach(x => { x.classList.remove('open'); x.querySelector('span').textContent = '+' });
        if (!o) { q.classList.add('open'); b.querySelector('span').textContent = '–' }
    });

    const heroEl = document.getElementById('platform');
    const mouseMoveHero = e => {
        const b = heroEl.getBoundingClientRect(); mx = e.clientX - b.left; boostT = 1;
        heroEl.style.setProperty('--px', ((e.clientX - b.left) / b.width - .5).toFixed(3));
        heroEl.style.setProperty('--py', ((e.clientY - b.top) / b.height - .5).toFixed(3));
    };
    const mouseLeaveHero = () => { boostT = 0; heroEl.style.setProperty('--px', 0); heroEl.style.setProperty('--py', 0) };
    if (heroEl) {
        heroEl.addEventListener('mousemove', mouseMoveHero);
        heroEl.addEventListener('mouseleave', mouseLeaveHero);
        heroEl.addEventListener('click', e => { const b = cv.getBoundingClientRect(); rip.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: t }) });
        cleanupFns.push(() => {
            heroEl.removeEventListener('mousemove', mouseMoveHero);
            heroEl.removeEventListener('mouseleave', mouseLeaveHero);
        });
    }

    document.querySelectorAll('.card,.q').forEach(c => c.addEventListener('mousemove', e => {
        const b = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px')
    }));

    let prog = $('prog');
    if (!prog) {
        prog = document.createElement('div'); prog.id = 'prog';
        const nav = document.querySelector('nav');
        if (nav) nav.appendChild(prog);
    }
    const scrollProg = () => { if ($('prog')) $('prog').style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%' };
    window.addEventListener('scroll', scrollProg, { passive: true });
    cleanupFns.push(() => window.removeEventListener('scroll', scrollProg));

    let aura = $('aura');
    if (!aura) {
        aura = document.createElement('div'); aura.id = 'aura'; document.body.appendChild(aura);
    }
    const mouseMoveAura = e => { if ($('aura')) { $('aura').style.setProperty('--ax', e.clientX + 'px'); $('aura').style.setProperty('--ay', e.clientY + 'px') } };
    window.addEventListener('mousemove', mouseMoveAura, { passive: true });
    cleanupFns.push(() => window.removeEventListener('mousemove', mouseMoveAura));

    document.querySelectorAll('.price .card,.res,.step').forEach(c => {
        c.addEventListener('mousemove', e => {
            const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
            c.style.transition = 'transform .08s'; c.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`
        });
        c.addEventListener('mouseleave', () => { c.style.transform = ''; c.style.transition = '' })
    });

    document.querySelectorAll('.btn').forEach(b => {
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px,${((e.clientY - r.top) / r.height - .5) * 8}px)` });
        b.addEventListener('mouseleave', () => b.style.transform = '');
        b.addEventListener('click', e => {
            const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span'); s.className = 'rip';
            s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; b.appendChild(s); setTimeout(() => s.remove(), 600)
        })
    });

    const ioSteps = new IntersectionObserver((en, ob) => {
        if (en[0].isIntersecting) {
            document.querySelectorAll('.step').forEach((s, i) => setTimeout(() => s.classList.add('lit'), i * 650));
            ob.disconnect()
        }
    }, { threshold: .5 });
    if (document.querySelector('.step')) {
        ioSteps.observe(document.querySelector('.step').parentElement);
    }

    const dw = $('dw');
    let dwAnimId;
    if (dw) {
        const dx = dw.getContext('2d'); let dl = 0, dt = 0;
        function dwDraw() {
            if (!document.getElementById('dw')) return;
            const cw = dw.clientWidth, ch = dw.clientHeight || 50; if (dw.width !== cw || dw.height !== ch) { dw.width = cw; dw.height = ch }
            dx.clearRect(0, 0, cw, ch); const live = $('demoBox') && $('demoBox').classList.contains('live'); dl += ((live ? 1 : .08) - dl) * .08; dt += .09;
            dx.beginPath(); for (let x = 0; x < cw; x += 3) {
                const e = Math.sin(Math.PI * x / cw);
                const y = ch / 2 + Math.sin(x * .05 + dt) * ch * .32 * dl * e * Math.sin(dt * .6 + x * .01) + Math.sin(x * .19 - dt * 2) * ch * .12 * dl * e; x ? dx.lineTo(x, y) : dx.moveTo(x, y)
            }
            dx.strokeStyle = '#38b6ff'; dx.lineWidth = 2; dx.shadowColor = '#2a7bff'; dx.shadowBlur = 10; dx.stroke(); dwAnimId = requestAnimationFrame(dwDraw)
        }
        dwDraw();
        cleanupFns.push(() => {
            if (dwAnimId) cancelAnimationFrame(dwAnimId);
        });
    }

    {
        const el = document.createElement('div'); el.id = 'intro';
        const orbHtml = document.querySelector('.orb b') ? document.querySelector('.orb b').innerHTML : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg>';
        el.innerHTML = '<div class="c"><i></i><i></i>' + orbHtml + '</div>'; document.body.appendChild(el);
        const open = () => { el.classList.add('go'); setTimeout(() => el.remove(), 1500) }; el.onclick = open; setTimeout(open, 1500)
    }

    {
        const order = ['platform', 'roi', 'how', 'demo', 'pricing', 'faq'], names = { platform: 'Platform', roi: 'ROI Calculator', how: 'How it works', demo: 'Live Demo', pricing: 'Pricing', faq: 'FAQ' };
        const rail = document.createElement('div'); rail.id = 'rail';
        rail.innerHTML = order.map(k => `<i data-go="#${k}" data-l="${names[k]}" role="link" tabindex="0" aria-label="${names[k]}"></i>`).join(''); document.body.appendChild(rail);
        const dots = [...rail.children], ss = order.map(k => document.getElementById(k));
        const upd = () => { let c = 0; ss.forEach((e, i) => { if (e && e.getBoundingClientRect().top < window.innerHeight * .45) c = i }); dots.forEach((d, i) => d.classList.toggle('on', i === c)) };
        window.addEventListener('scroll', upd, { passive: true }); upd();
        cleanupFns.push(() => window.removeEventListener('scroll', upd));
    }

    {
        const CH = '01#$%&*+=?/<>';
        const dec = el => { const fin = el.textContent; let f = 0; const id = setInterval(() => { el.textContent = [...fin].map((c, i) => c === ' ' || i < f / 1.2 ? c : CH[Math.random() * CH.length | 0]).join(''); if (++f > fin.length * 1.2 + 2) { el.textContent = fin; clearInterval(id) } }, 28) };
        const io2 = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { io2.unobserve(x.target); dec(x.target) } }), { threshold: .7 });
        document.querySelectorAll('h2').forEach(h => io2.observe(h));
    }

    return () => {
        cleanupFns.forEach(fn => fn());
        const a = document.getElementById('aura'); if(a) a.remove();
        const r = document.getElementById('rail'); if(r) r.remove();
        const i = document.getElementById('intro'); if(i) i.remove();
        const p = document.getElementById('prog'); if(p) p.remove();
    };
}