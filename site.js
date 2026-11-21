// First pull, Munnar (IST). Date confirmed; 8:00 AM start time is a placeholder.
const FIRST_PULL = new Date("2027-04-02T08:00:00+05:30");
const VOLUNTEER_EMAIL = "paravaultimate@gmail.com";
function tick(){
  let ms=FIRST_PULL-new Date(); const v={d:0,h:0,m:0};
  if(ms>0){v.d=Math.floor(ms/864e5);ms-=v.d*864e5;v.h=Math.floor(ms/36e5);ms-=v.h*36e5;v.m=Math.floor(ms/6e4);}
  document.querySelectorAll("[data-cd]").forEach(el=>{const k=el.dataset.cd;el.textContent=k==="d"?v.d:String(v[k]).padStart(2,"0");});
}
tick();setInterval(tick,30000);
// Mobile menu: full height panel; Escape or any link closes it, and the page behind does not scroll while it is open
document.querySelectorAll(".menu-btn").forEach(btn=>{
  const menu=btn.nextElementSibling;
  const set=o=>{menu.classList.toggle("open",o);btn.setAttribute("aria-expanded",o);btn.setAttribute("aria-label",o?"Close menu":"Menu");
    document.documentElement.classList.toggle("menu-open",o);};
  btn.addEventListener("click",()=>set(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>set(false)));
  addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.classList.contains("open")){set(false);btn.focus();}});
  matchMedia("(min-width:1161px)").addEventListener("change",e=>{if(e.matches)set(false);});
});
document.querySelectorAll('a[data-ph]').forEach(a=>a.addEventListener("click",e=>e.preventDefault()));
// Page titles: a short dashed throw from the handwritten note, over the title, landing as a disc beside it.
// Drawn once by CSS animation; skipped when the title fills the column and there is no room for the disc.
document.querySelectorAll(".pagehead h1").forEach(h=>{
  const col=h.parentElement,note=col.querySelector(".kicker");if(!note)return;
  const NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");svg.classList.add("title-throw");svg.setAttribute("aria-hidden","true");
  col.append(svg);
  const draw=()=>{
    svg.innerHTML="";
    const c=col.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(note);
    const n=r.getBoundingClientRect(),t=h.getBoundingClientRect(),lh=parseFloat(getComputedStyle(h).lineHeight)||t.height;
    const x0=n.right-c.left+10,y0=n.top-c.top+n.height/2,x1=t.right-c.left+26,y1=t.top-c.top+lh*.45;
    if(x1+14>innerWidth-c.left-8||x1-x0<40)return;
    const d=`M${x0},${y0} C${x0+(x1-x0)*.45},${y0-46} ${x1+8},${y0-34} ${x1},${y1}`;
    svg.innerHTML=`<defs><mask id="tt-${h.textContent.length}" maskUnits="userSpaceOnUse" x="-50" y="-100" width="${c.width+200}" height="${c.height+200}"><path class="reveal-path" d="${d}"/></mask></defs>`+
      `<path d="${d}" mask="url(#tt-${h.textContent.length})"/><ellipse cx="${x1}" cy="${y1}" rx="9" ry="4"/>`;
    const m=svg.querySelector(".reveal-path");m.style.setProperty("--len",Math.ceil(m.getTotalLength()));
  };
  draw();document.fonts&&document.fonts.ready.then(draw);
  let w=innerWidth;addEventListener("resize",()=>{if(innerWidth!==w){w=innerWidth;draw();}});
});
// Photo viewer: any [data-viewer] wall opens its photos full screen. Arrow keys or swipe to move, Escape to close;
// focus goes back to the photo that was opened.
document.querySelectorAll("[data-viewer]").forEach(wall=>{
  const figs=[...wall.querySelectorAll("figure")];if(!figs.length)return;
  const icon=d=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const dlg=document.createElement("dialog");dlg.className="viewer";dlg.setAttribute("aria-label","Photo viewer");
  dlg.innerHTML=`<figure><img alt=""></figure><div class="bar"><span class="cap"></span><span class="count"></span></div>`+
    `<button class="close" type="button" aria-label="Close">${icon("M6 6l12 12M18 6L6 18")}</button>`+
    `<button class="prev" type="button" aria-label="Previous photo">${icon("M15 5l-7 7 7 7")}</button>`+
    `<button class="next" type="button" aria-label="Next photo">${icon("M9 5l7 7-7 7")}</button>`;
  document.body.append(dlg);
  const img=dlg.querySelector("img"),cap=dlg.querySelector(".cap"),count=dlg.querySelector(".count");
  let i=0,opener=null;
  const show=n=>{i=(n+figs.length)%figs.length;const f=figs[i],src=f.querySelector("img");
    img.src=src.currentSrc||src.src;img.alt=src.alt;cap.textContent=f.querySelector("figcaption")?.textContent||"";count.textContent=`${i+1} / ${figs.length}`;
    [figs[(i+1)%figs.length],figs[(i-1+figs.length)%figs.length]].forEach(x=>{const p=new Image();p.src=x.querySelector("img").src;});};
  const open=n=>{opener=figs[n];show(n);dlg.showModal();document.documentElement.classList.add("menu-open");};
  dlg.addEventListener("close",()=>{document.documentElement.classList.remove("menu-open");opener&&opener.focus();});
  figs.forEach((f,n)=>{
    const label=f.querySelector("figcaption")?.textContent||f.querySelector("img").alt;
    f.tabIndex=0;f.setAttribute("role","button");f.setAttribute("aria-label",`Open photo: ${label}`);
    f.addEventListener("click",()=>open(n));
    f.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(n);}});
  });
  dlg.querySelector(".close").addEventListener("click",()=>dlg.close());
  dlg.querySelector(".prev").addEventListener("click",()=>show(i-1));
  dlg.querySelector(".next").addEventListener("click",()=>show(i+1));
  dlg.addEventListener("keydown",e=>{if(e.key==="ArrowRight")show(i+1);else if(e.key==="ArrowLeft")show(i-1);});
  let x0=null,swiped=false;
  dlg.addEventListener("click",e=>{if(!swiped&&(e.target===dlg||e.target.tagName==="FIGURE"))dlg.close();});   // a tap outside the photo closes; a swipe does not
  dlg.addEventListener("pointerdown",e=>{x0=e.clientX;swiped=false;});
  dlg.addEventListener("pointerup",e=>{if(x0===null)return;const dx=e.clientX-x0;x0=null;swiped=Math.abs(dx)>10;if(Math.abs(dx)>50)show(dx<0?i+1:i-1);});
});
// Volunteer form: inline, specific errors per field; still sends through the visitor's email app
document.querySelectorAll(".vol-form").forEach(f=>{
  const t=f.querySelector(".toast");
  const msg=(input,text)=>{let m=input.parentElement.querySelector(".err");
    if(!m){m=document.createElement("small");m.className="err";m.id="err-"+input.name;m.setAttribute("aria-live","polite");input.insertAdjacentElement("afterend",m);
      input.setAttribute("aria-describedby",m.id);}
    m.textContent=text;input.setAttribute("aria-invalid",text?"true":"false");return !text;};
  const checks={name:v=>v.trim()?"":"Add your name.",email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())?"":"Enter a valid email, like name@example.com.",
    // phone is optional: empty passes; otherwise digits, spaces, + and - with 7 to 15 digits
    phone:v=>{v=v.trim();const n=v.replace(/\D/g,"").length;return !v||(/^\+?[\d\s-]+$/.test(v)&&n>=7&&n<=15)?"":"Enter a valid phone number, like +91 98765 43210.";}};
  Object.keys(checks).forEach(n=>f[n].addEventListener("input",()=>{if(f[n].getAttribute("aria-invalid")==="true")msg(f[n],checks[n](f[n].value));}));
  f.addEventListener("submit",e=>{
    e.preventDefault();t.classList.remove("show");
    const bad=Object.keys(checks).filter(n=>!msg(f[n],checks[n](f[n].value)));
    if(bad.length){f[bad[0]].focus();return;}
    const body=`Name: ${f.name.value}\nPhone: ${f.phone.value}\nEmail: ${f.email.value}\nRole: ${f.role.value}\nAvailability: ${f.days.value}`;
    window.location.href=`mailto:${VOLUNTEER_EMAIL}?subject=${encodeURIComponent("Parava volunteer: "+f.name.value)}&body=${encodeURIComponent(body)}`;
    t.textContent="Your email app should open with the request ready to send.";t.classList.add("show");
  });
});


// Looped videos: start muted once on screen, pause off screen. Reduced motion or data saving keeps the still frame
// until the viewer presses play. The button pauses and resumes, and a pause by the viewer sticks.
document.querySelectorAll("video.loop").forEach(v=>{
  const btn=v.parentElement.querySelector(".vid-toggle");
  const calm=matchMedia("(prefers-reduced-motion: reduce)").matches||(navigator.connection&&navigator.connection.saveData);
  let held=!!calm,seen=false;
  const show=paused=>{if(!btn)return;btn.hidden=false;btn.classList.toggle("paused",paused);btn.setAttribute("aria-label",paused?"Play the video":"Pause the video");};
  const play=()=>{v.preload="auto";const p=v.play();if(p&&p.catch)p.catch(()=>show(true));};
  v.addEventListener("play",()=>show(false));v.addEventListener("pause",()=>show(true));
  if(btn)btn.addEventListener("click",()=>{if(v.paused){held=false;play();}else{held=true;v.pause();}});
  if(held)v.pause();
  show(v.paused);
  if(!("IntersectionObserver" in window)){if(!held)play();return;}
  new IntersectionObserver(es=>es.forEach(e=>{seen=e.isIntersecting;if(seen&&!held)play();else if(!seen&&!v.paused)v.pause();}),{threshold:.15}).observe(v);
});
// ---------- Team registration ----------
// REG.api is the Apps Script web app URL (apps-script/SETUP.md): the test deployment on the preview site,
// the live deployment on paravaultimate.com. The server's OPEN_AT decides when registration opens;
// REG.openAt is only the fallback when the server can't be reached.
const REG = { api: "", openAt: new Date("2026-12-01T14:00:00+05:30"), cap: 24 };
(function(){
  const lists=document.getElementById("team-lists"),form=document.querySelector(".reg-form"),labels=document.querySelectorAll("[data-reg-label]");
  if(!lists&&!form&&!labels.length)return;
  let api=REG.api;
  try{if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){const q=new URLSearchParams(location.search).get("api");if(q)sessionStorage.setItem("regApi",q);api=sessionStorage.getItem("regApi")||api;}}catch(e){}
  let state=null;
  const openAt=()=>state&&state.openAt?new Date(state.openAt):REG.openAt;
  const isOpen=()=>Date.now()>=openAt().getTime();
  const when=d=>{const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",day:"numeric",month:"long",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}).formatToParts(d).map(x=>[x.type,x.value]));
    return `${p.day} ${p.month} ${p.year} at ${p.hour}${p.minute==="00"?"":":"+p.minute} ${String(p.dayPeriod).toUpperCase()} IST`;};

  // public lists: logo (or a disc), team name, city (and country for teams outside India)
  const disc='<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="26" rx="18" ry="8"/><ellipse cx="24" cy="23" rx="18" ry="8"/></svg>';
  const card=t=>{const li=document.createElement("li");li.className="team";
    const logo=document.createElement("div");logo.className="team-logo";
    const none=()=>{logo.innerHTML=disc;logo.classList.add("none");};
    if(t.logo){const img=new Image();img.alt="";img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";img.onerror=none;img.src=t.logo;logo.append(img);}else none();
    const txt=document.createElement("div"),n=document.createElement("b");n.textContent=t.team;txt.append(n);
    const where=[t.city,t.country].filter(Boolean).join(", ");if(where){const s=document.createElement("span");s.textContent=where;txt.append(s);}
    li.append(logo,txt);return li;};
  const render=()=>{
    if(!lists||!state||!Array.isArray(state.teams))return;
    ["Confirmed","Pending","Waitlist"].forEach(s=>{
      const items=state.teams.filter(t=>t.status===s);
      lists.querySelector(`[data-tl="${s}"]`).replaceChildren(...items.map(card));
      const wrap=lists.querySelector(`[data-tl-wrap="${s}"]`);if(wrap)wrap.hidden=!items.length;
      const empty=lists.querySelector(`[data-tl-empty="${s}"]`);if(empty)empty.hidden=!!items.length;
    });
    lists.querySelector("[data-tl-count]").textContent=state.teams.filter(t=>t.status==="Confirmed").length+" of "+(state.cap||REG.cap)+" slots confirmed";
  };
  const status=form&&document.querySelector("[data-reg-status]"),fields=form&&form.querySelector("[data-reg-fields]");
  const applyOpen=()=>{
    const open=isOpen();
    labels.forEach(a=>a.textContent=open?"Register your team":"See how to register");
    const empty=lists&&lists.querySelector('[data-tl-empty="Confirmed"]');
    if(empty)empty.textContent=open?"No teams confirmed yet.":"No teams confirmed yet. Registration opens on "+when(openAt())+".";
    if(form&&!form.dataset.sending){
      fields.disabled=!(open&&api);
      status.textContent=!open?"Registration opens on "+when(openAt())+". The form unlocks then, without reloading the page."
        :api?"Registration is open. Teams are queued in the order the form reaches us.":"Registration is open, but the form isn’t connected yet. Please check back shortly.";
    }
  };
  const load=()=>api?fetch(api+(api.includes("?")?"&":"?")+"action=teams",{cache:"no-store"}).then(r=>r.json()).then(j=>{if(j&&j.ok){state=j;render();applyOpen();}}).catch(()=>{}):Promise.resolve();
  applyOpen();load();
  setInterval(applyOpen,15000);setInterval(load,60000);

  if(!form)return;
  // the form: the amount and reference label follow where the team is based
  const toast=form.querySelector(".toast"),btn=form.querySelector("button.submit"),done=document.querySelector("[data-reg-done]");
  const wrapOf=n=>form.querySelector(`[data-f="${n}"]`);
  const based=()=>(form.querySelector('input[name="based"]:checked')||{}).value||"";
  const onBased=()=>{const b=based();
    wrapOf("country").hidden=b!=="Outside India";
    form.querySelector("[data-pay-due]").innerHTML=b==="India"?"Pay <b>₹12,000</b> (6 players) by UPI using the details above, then add the UTR and a screenshot."
      :b==="Outside India"?"Pay <b>USD 150</b> (6 players) by wire transfer using the details above, charge type <b>OUR</b>, then add the transfer reference and confirmation.":"Choose where your team is based to see the amount.";
    form.querySelector("[data-ref-label]").textContent=b==="Outside India"?"Wire transfer reference":b==="India"?"UPI transaction ID (UTR)":"UTR or transfer reference number";};
  form.querySelectorAll('input[name="based"]').forEach(r=>r.addEventListener("change",()=>{onBased();if(wrapOf("based").querySelector(".err"))check("based");}));

  const err=(n,text)=>{const w=wrapOf(n);let m=w.querySelector(":scope > .err");
    if(!m){m=document.createElement("small");m.className="err";m.id="err-"+n;m.setAttribute("aria-live","polite");w.append(m);
      w.querySelectorAll("input").forEach(i=>i.setAttribute("aria-describedby",((i.getAttribute("aria-describedby")||"")+" "+m.id).trim()));}
    m.textContent=text;w.querySelectorAll("input").forEach(i=>i.setAttribute("aria-invalid",text?"true":"false"));return !text;};
  const val=n=>(form.elements[n].value||"").trim();
  const file=n=>form.elements[n].files[0];
  const MB=1024*1024;
  const rules={
    based:()=>based()?"":"Choose where your team is based.",
    country:()=>based()!=="Outside India"||val("country")?"":"Add your country.",
    team:()=>val("team").length>=2?"":"Add your team name.",
    city:()=>val("city")?"":"Add your city.",
    logo:()=>{const f=file("logo");if(!f)return "";if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type))return "The logo must be a PNG, JPG, WebP or SVG image.";
      return f.type==="image/svg+xml"&&f.size>2*MB?"The logo must be under 2 MB.":"";},
    name:()=>val("name")?"":"Add the contact person’s name.",
    email:()=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))?"":"Enter a valid email, like name@example.com.",
    whatsapp:()=>{const v=val("whatsapp"),d=v.replace(/\D/g,"").length;return /^\+?[\d\s-]+$/.test(v)&&d>=8&&d<=15?"":"Enter a WhatsApp number with country code, like +91 98765 43210.";},
    reference:()=>val("reference").length>=4?"":"Add the reference number from your payment.",
    proof:()=>{const f=file("proof");if(!f)return "Attach a screenshot or PDF of your payment.";
      if(!/^(image\/|application\/pdf$)/.test(f.type))return "The payment proof must be an image or a PDF.";
      return f.type==="application/pdf"&&f.size>5*MB?"The PDF must be under 5 MB.":"";},
    ratio:()=>form.elements.ratio.checked?"":"Confirm your team will have at least 6 men and 6 women.",
    consent:()=>form.elements.consent.checked?"":"Tick to agree, so we can list your team.",
  };
  const check=n=>err(n,rules[n]());
  Object.keys(rules).forEach(n=>{const w=wrapOf(n);w.addEventListener(w.querySelector('input[type="file"],input[type="checkbox"]')?"change":"input",()=>{if(w.querySelector(".err"))check(n);});});

  // images are scaled down in the browser before upload (quicker at 2 PM); PDFs, SVGs and HEIC go as they are
  const asData=blob=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=no;r.readAsDataURL(blob);});
  const shrink=async(f,max,type,q)=>{
    if(!/^image\/(png|jpeg|webp)$/.test(f.type)||!window.createImageBitmap)return f;
    try{const bmp=await createImageBitmap(f),k=Math.min(1,max/Math.max(bmp.width,bmp.height));
      if(k===1&&f.size<MB)return f;
      const c=document.createElement("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
      const out=await new Promise(r=>c.toBlob(r,type,q));return out&&out.size<f.size?out:f;}catch(e){return f;}};
  const pack=async(f,max,type,q,limit,label)=>{const b=await shrink(f,max,type,q);
    if(b.size>limit*MB)throw new Error(`The ${label} is too large. Please use a file under ${limit} MB.`);
    return {name:f.name,type:b.type||f.type,data:await asData(b)};};

  form.addEventListener("submit",async e=>{
    e.preventDefault();toast.classList.remove("show");
    const bad=Object.keys(rules).filter(n=>!check(n));
    if(bad.length){(wrapOf(bad[0]).querySelector("input")||wrapOf(bad[0])).focus();return;}
    form.dataset.sending="1";btn.disabled=true;btn.textContent="Sending…";
    const fail=msg=>{delete form.dataset.sending;btn.disabled=false;btn.textContent="Register our team";toast.textContent=msg;toast.classList.add("show","bad");};
    try{
      const proof=await pack(file("proof"),1800,"image/jpeg",.85,5,"payment proof");
      const logo=file("logo")?await pack(file("logo"),600,"image/png",undefined,2,"logo"):null;
      const payload={based:based(),country:val("country"),team:val("team"),city:val("city"),name:val("name"),email:val("email"),whatsapp:val("whatsapp"),
        reference:val("reference"),ratio:form.elements.ratio.checked,consent:form.elements.consent.checked,website:form.elements.website.value,proof,logo};
      const res=await fetch(api,{method:"POST",body:JSON.stringify(payload)});   // text/plain body: no CORS preflight for Apps Script
      const j=await res.json();
      if(!j.ok)return fail(j.error||"Something went wrong. Please try again.");
      form.hidden=true;done.hidden=false;
      done.querySelector("[data-done-text]").textContent=`${payload.team} is number ${j.position} in the verification queue. Your registration ID is ${j.id}. We’ve emailed the details to ${payload.email}, and we’ll email again once your payment is verified.`;
      done.focus();load();
    }catch(x){fail(x&&x.message&&/too large/.test(x.message)?x.message:"We couldn’t reach the registration server. Check your connection and try again. If it keeps failing, message Anand or Manu on WhatsApp.");}
  });
})();
