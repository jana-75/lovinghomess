(function(){
  const root = document.documentElement;
  const body = document.body;

  // Loader hide
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('hidden'), 250);
  });

  // Restore settings
  const savedTheme = localStorage.getItem('lh3_theme') || 'light';
  if(savedTheme === 'dark') body.classList.add('dark');

  const savedAccent = localStorage.getItem('lh3_accent') || 'sky';
  root.setAttribute('data-accent', savedAccent);

  const minPx = 14, maxPx = 24;
  let current = parseInt(localStorage.getItem('lh3_font') || '16', 10);
  current = Math.max(minPx, Math.min(maxPx, current));
  root.style.setProperty('--base-font', current + 'px');

  const inc = document.getElementById('increaseFont');
  const dec = document.getElementById('decreaseFont');
  const themeBtn = document.getElementById('toggleTheme');
  const topBtn = document.getElementById('topBtn');
  const burger = document.getElementById('burger');
  const nav = document.querySelector('.nav');

  const panel = document.getElementById('panel');
  const openPanel = document.getElementById('openPanel');
  const closePanel = document.getElementById('closePanel');
  const motionToggle = document.getElementById('motionToggle');

  function sync(){
    if(dec) dec.disabled = current <= minPx;
    if(inc) inc.disabled = current >= maxPx;
    if(themeBtn){
      const isDark = body.classList.contains('dark');
      themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeBtn.textContent = isDark ? '☀️' : '🌙';
    }
  }
  sync();

  inc && inc.addEventListener('click', () => {
    current = Math.min(maxPx, current + 2);
    root.style.setProperty('--base-font', current + 'px');
    localStorage.setItem('lh3_font', String(current));
    sync();
  });
  dec && dec.addEventListener('click', () => {
    current = Math.max(minPx, current - 2);
    root.style.setProperty('--base-font', current + 'px');
    localStorage.setItem('lh3_font', String(current));
    sync();
  });
  themeBtn && themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('lh3_theme', body.classList.contains('dark') ? 'dark' : 'light');
    sync();
  });

  // Mobile nav
  burger && burger.addEventListener('click', () => {
    const isOpen = nav && nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Panel
  function setPanel(open){
    if(!panel) return;
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  openPanel && openPanel.addEventListener('click', () => setPanel(true));
  closePanel && closePanel.addEventListener('click', () => setPanel(false));
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') setPanel(false);
  });

  // Accent swatches
  document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.getAttribute('data-accent');
      root.setAttribute('data-accent', a);
      localStorage.setItem('lh3_accent', a);
    });
  });

  // Back to top
  function onScroll(){
    if(!topBtn) return;
    const y = document.documentElement.scrollTop || document.body.scrollTop;
    topBtn.style.display = (y > 240) ? 'block' : 'none';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  topBtn && topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Background parallax with mouse
  let allowMotion = (localStorage.getItem('lh3_motion') ?? 'true') === 'true';
  if(motionToggle){
    motionToggle.checked = allowMotion;
    motionToggle.addEventListener('change', () => {
      allowMotion = motionToggle.checked;
      localStorage.setItem('lh3_motion', allowMotion ? 'true' : 'false');
      if(!allowMotion){
        body.style.removeProperty('--bgx');
        body.style.removeProperty('--bgy');
        root.style.removeProperty('--bgx');
        root.style.removeProperty('--bgy');
      }
    });
  }

  let tx=0, ty=0, cx=0, cy=0;
  document.addEventListener('mousemove', (e) => {
    if(!allowMotion) return;
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    tx = x * 18;
    ty = y * 18;
  });
  (function animate(){
    if(allowMotion){
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      body.style.setProperty('--bgx', cx.toFixed(2) + 'px');
      body.style.setProperty('--bgy', cy.toFixed(2) + 'px');
      root.style.setProperty('--bgx', cx.toFixed(2) + 'px');
      root.style.setProperty('--bgy', cy.toFixed(2) + 'px');
    }
    requestAnimationFrame(animate);
  
  // Text-to-Speech (قراءة النص)
  const ttsPlay = document.getElementById('ttsPlay');
  const ttsStop = document.getElementById('ttsStop');

  function getReadableText(){
    const main = document.getElementById('main');
    const el = main || document.body;
    // جمع النص من العناوين والفقرات والقوائم فقط لتقليل الضوضاء
    const parts = [];
    el.querySelectorAll('h1,h2,h3,p,li,label,summary').forEach(n => {
      const t = (n.innerText || '').trim();
      if(t.length) parts.push(t);
    });
    return parts.join('.  ');
  }

  function speakArabic(text){
    if(!('speechSynthesis' in window)) return alert('ميزة تحويل النص إلى كلام غير مدعومة في هذا المتصفح.');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  ttsPlay && ttsPlay.addEventListener('click', () => {
    const text = getReadableText();
    if(!text) return;
    speakArabic(text);
  });

  ttsStop && ttsStop.addEventListener('click', () => {
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  });
// ===== Hero parallax + scroll reveal =====
  const hero = document.querySelector('.hero-home');
  if(hero){
    let tx=0, ty=0, cx=0, cy=0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) - 0.5;
      const y = ((e.clientY - r.top) / r.height) - 0.5;
      tx = x * 20;  // قوة الحركة
      ty = y * 20;
    });
    hero.addEventListener('mouseleave', () => { tx=0; ty=0; });

    (function animHero(){
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      hero.style.setProperty('--hx', cx.toFixed(2)+'px');
      hero.style.setProperty('--hy', cy.toFixed(2)+'px');
      requestAnimationFrame(animHero);
    })();

    const arrow = hero.querySelector('.scroll-indicator');
    arrow && arrow.addEventListener('click', () => {
      const next = document.querySelector('#services') || document.querySelector('.section') || document.querySelector('main section:nth-of-type(2)');
      if(next) next.scrollIntoView({behavior:'smooth'});
    });
  }

  // Reveal sections on scroll
  const revealTargets = Array.from(document.querySelectorAll('section, .card, .price, .stat, .kpi')).filter(el => !el.classList.contains('hero-home'));
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if(ent.isIntersecting) ent.target.classList.add('show');
    });
  }, {threshold: 0.12});
  revealTargets.forEach(el => io.observe(el));
})();

  // Forms (demo)
  const contactForm = document.getElementById('contactForm');
  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('تم استلام طلبك ✅ سنقوم بالتواصل لتأكيد التفاصيل.');
    contactForm.reset();
  });

  // Text-to-Speech (قراءة النص)
  const ttsPlay = document.getElementById('ttsPlay');
  const ttsStop = document.getElementById('ttsStop');

  function getReadableText(){
    const main = document.getElementById('main');
    const el = main || document.body;
    // جمع النص من العناوين والفقرات والقوائم فقط لتقليل الضوضاء
    const parts = [];
    el.querySelectorAll('h1,h2,h3,p,li,label,summary').forEach(n => {
      const t = (n.innerText || '').trim();
      if(t.length) parts.push(t);
    });
    return parts.join('.  ');
  }

  function speakArabic(text){
    if(!('speechSynthesis' in window)) return alert('ميزة تحويل النص إلى كلام غير مدعومة في هذا المتصفح.');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  ttsPlay && ttsPlay.addEventListener('click', () => {
    const text = getReadableText();
    if(!text) return;
    speakArabic(text);
  });

  ttsStop && ttsStop.addEventListener('click', () => {
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  });


// Click-to-read (paragraph)
  function speakText(text){
    if(!('speechSynthesis' in window)) return;
    if(!text || !text.trim()) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "ar-SA";
    u.rate = 1;
    u.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const ar = voices.find(v => (v.lang || "").toLowerCase().startsWith("ar")) || voices.find(v => /arab/i.test(v.name || ""));
    if(ar) u.voice = ar;

    window.speechSynthesis.speak(u);
  }

  function cleanText(t){
    return (t || "")
      .replace(/https?:\/\/\S+/g," ")
      .replace(/www\.\S+/g," ")
      .replace(/\S+@\S+/g," ")
      .replace(/[A-Za-z0-9_\/\-\.\:\?\=\&\#]+/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  const readableSelector = "p, li, h1, h2, h3, summary, label";
  const mainEl = document.getElementById("main") || document.querySelector("main") || document.body;

  if(mainEl){
    mainEl.addEventListener("click", (e) => {
      const target = e.target.closest(readableSelector);
      if(!target) return;
      if(e.target.closest("a, button, input, select, textarea")) return;

      const text = cleanText(target.innerText);
      if(!text) return;

      target.classList.add("read-highlight");
      setTimeout(() => target.classList.remove("read-highlight"), 900);

      speakText(text);
    });
  }



// Quick booking (home)
  const quickBooking = document.getElementById('quickBooking');
  quickBooking && quickBooking.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('تم استلام طلب الحجز ✅ سنقوم بالتواصل لتأكيد التفاصيل.');
    quickBooking.reset();
  });

// ===== Hero parallax + scroll reveal =====
  const hero = document.querySelector('.hero-home');
  if(hero){
    let tx=0, ty=0, cx=0, cy=0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) - 0.5;
      const y = ((e.clientY - r.top) / r.height) - 0.5;
      tx = x * 20;  // قوة الحركة
      ty = y * 20;
    });
    hero.addEventListener('mouseleave', () => { tx=0; ty=0; });

    (function animHero(){
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      hero.style.setProperty('--hx', cx.toFixed(2)+'px');
      hero.style.setProperty('--hy', cy.toFixed(2)+'px');
      requestAnimationFrame(animHero);
    })();

    const arrow = hero.querySelector('.scroll-indicator');
    arrow && arrow.addEventListener('click', () => {
      const next = document.querySelector('#services') || document.querySelector('.section') || document.querySelector('main section:nth-of-type(2)');
      if(next) next.scrollIntoView({behavior:'smooth'});
    });
  }

  // Reveal sections on scroll
  const revealTargets = Array.from(document.querySelectorAll('section, .card, .price, .stat, .kpi')).filter(el => !el.classList.contains('hero-home'));
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if(ent.isIntersecting) ent.target.classList.add('show');
    });
  }, {threshold: 0.12});
  revealTargets.forEach(el => io.observe(el));


// ===== Robust Arabic TTS (click to read) =====
  function pickArabicVoice(){
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    return voices.find(v => (v.lang||"").toLowerCase().startsWith("ar"))
        || voices.find(v => /arab/i.test(v.name||""))
        || null;
  }

  function speakRobust(text){
    if(!('speechSynthesis' in window)){
      alert('ميزة تحويل النص إلى كلام غير مدعومة في هذا المتصفح.');
      return;
    }
    const clean = (text||"").trim();
    if(!clean) return;

    // Cancel any current speech and make sure engine is running
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'ar-SA';
    u.rate = 1;
    u.pitch = 1;

    const trySpeak = () => {
      const v = pickArabicVoice();
      if(v) u.voice = v;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    };

    // Voices sometimes load asynchronously
    const voicesNow = window.speechSynthesis.getVoices();
    if(!voicesNow || voicesNow.length === 0){
      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        const vs = window.speechSynthesis.getVoices();
        if(vs && vs.length){
          clearInterval(timer);
          trySpeak();
        } else if(tries >= 20){ // ~2s
          clearInterval(timer);
          trySpeak(); // speak even if no voices list
        }
      }, 100);

      window.speechSynthesis.onvoiceschanged = () => {
        trySpeak();
      };
    } else {
      trySpeak();
    }
  }

  function stopRobust(){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Buttons (if exist)
  const ttsPlayBtn = document.getElementById('ttsPlay');
  const ttsStopBtn = document.getElementById('ttsStop');
  ttsPlayBtn && ttsPlayBtn.addEventListener('click', () => {
    const main = document.getElementById('main') || document.querySelector('main') || document.body;
    const text = (main && main.innerText) ? main.innerText : document.body.innerText;
    speakRobust(text);
  });
  ttsStopBtn && ttsStopBtn.addEventListener('click', stopRobust);

  // Click any paragraph/heading/list item to read it
  const readableSel = 'p, li, h1, h2, h3, summary';
  const mainRoot = document.getElementById('main') || document.querySelector('main') || document.body;

  if(mainRoot){
    mainRoot.addEventListener('click', (e) => {
      const target = e.target.closest(readableSel);
      if(!target) return;
      if(e.target.closest('a, button, input, select, textarea')) return;

      const t = (target.innerText || '')
        .replace(/https?:\/\/\S+/g,' ')
        .replace(/www\.\S+/g,' ')
        .replace(/\S+@\S+/g,' ')
        .replace(/\s+/g,' ')
        .trim();

      if(!t) return;

      target.classList.add('read-highlight');
      setTimeout(() => target.classList.remove('read-highlight'), 900);

      // IMPORTANT: speak only clicked text
      speakRobust(t);

      // prevent other handlers from cancelling
      e.stopPropagation();
    }, true);
  }

})();

// تحسين تحويل النص الى كلام
function getPageText(){
const main=document.getElementById("main") || document.body;
return main.innerText;
}

function speakPage(){
if(!("speechSynthesis" in window)){
alert("المتصفح لا يدعم تحويل النص الى كلام");
return;
}

window.speechSynthesis.cancel();

const text=getPageText();
const speech=new SpeechSynthesisUtterance(text);

speech.lang="ar-SA";
speech.rate=1;
speech.pitch=1;

const voices=window.speechSynthesis.getVoices();
const arabicVoice=voices.find(v=>v.lang.startsWith("ar"));

if(arabicVoice) speech.voice=arabicVoice;

window.speechSynthesis.speak(speech);
}

function stopSpeech(){
window.speechSynthesis.cancel();
}

document.addEventListener("DOMContentLoaded",()=>{
const play=document.getElementById("ttsPlay");
const stop=document.getElementById("ttsStop");

if(play) play.onclick=speakPage;
if(stop) stop.onclick=stopSpeech;
});




// ===== Arabic TTS that reads page text only =====
function getPageText(){
const main=document.getElementById("main") || document.querySelector("main") || document.body;

let text=main.innerText || "";

// remove links and urls
text=text.replace(/https?:\/\/\S+/g," ");
text=text.replace(/www\.\S+/g," ");
text=text.replace(/\S+@\S+/g," ");

// remove english fragments
text=text.replace(/[A-Za-z0-9_\/\-\.\:\?\=\&\#]+/g," ");

return text.trim();
}

function speakPage(){

if(!('speechSynthesis' in window)){
alert("المتصفح لا يدعم تحويل النص الى كلام");
return;
}

window.speechSynthesis.cancel();

let speech=new SpeechSynthesisUtterance(getPageText());

speech.lang="ar-SA";
speech.rate=1;
speech.pitch=1;

let voices=window.speechSynthesis.getVoices();
let arabicVoice=voices.find(v=>v.lang && v.lang.startsWith("ar"));

if(arabicVoice) speech.voice=arabicVoice;

window.speechSynthesis.speak(speech);
}

function stopSpeech(){
window.speechSynthesis.cancel();
}

document.addEventListener("DOMContentLoaded",()=>{

const play=document.getElementById("ttsPlay");
const stop=document.getElementById("ttsStop");

if(play) play.onclick=speakPage;
if(stop) stop.onclick=stopSpeech;

});
