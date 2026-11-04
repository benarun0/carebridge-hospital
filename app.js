const DOCS=[
{id:1,n:"Dr. Anita Menon",d:"Cardiology",q:"MD, DM Cardiology",e:18,t:"Mon, Wed, Fri"},
{id:2,n:"Dr. Rahul Varghese",d:"Orthopaedics",q:"MS Orthopaedics",e:12,t:"Tue, Thu, Sat"},
{id:3,n:"Dr. Sneha Nair",d:"Paediatrics",q:"MD Paediatrics",e:9,t:"Mon, Tue, Thu"},
{id:4,n:"Dr. Joseph Kurian",d:"Neurology",q:"MD, DM Neurology",e:15,t:"Wed, Fri, Sat"},
{id:5,n:"Dr. Fathima Rasheed",d:"Gynaecology",q:"MS Obstetrics & Gynaecology",e:11,t:"Mon, Wed, Sat"},
{id:6,n:"Dr. Arjun Pillai",d:"General Medicine",q:"MD General Medicine",e:7,t:"Mon to Sat"}];
const DEPTS=[...new Set(DOCS.map(d=>d.d))];
const SLOTS=["09:00","10:00","11:00","14:00","15:00","16:00"];
const $=(s,r=document)=>r.querySelector(s);
const ini=n=>n.replace("Dr. ","").split(" ").map(w=>w[0]).join("");
const load=()=>{try{return JSON.parse(localStorage.getItem("cb_appts"))||[]}catch(e){return[]}};
const save=a=>{try{localStorage.setItem("cb_appts",JSON.stringify(a))}catch(e){}};
const cur=document.body.dataset.page;
const P=[["index.html","Home"],["doctors.html","Doctors"],["appointment.html","Book Appointment"],["portal.html","Patient Portal"],["contact.html","Contact & Emergency"]];
$("#hdr").innerHTML=`<header><a class="logo" href="index.html">✚ CareBridge Hospital</a><button id="mb" aria-label="Open menu">☰</button><nav id="nv">${P.map(p=>`<a href="${p[0]}"${p[0]==cur?' class="on"':''}>${p[1]}</a>`).join("")}</nav></header>`;
$("#ftr").innerHTML=`<footer>CareBridge Hospital, Kochi, Kerala. Emergency: <a href="tel:108">108</a> · <a href="contact.html">Contact</a><br>Student design project for CXT453 Design Process and Perspective (SDG 3: Good Health and Well-Being)</footer>`;
$("#mb").onclick=()=>$("#nv").classList.toggle("open");
const q=new URLSearchParams(location.search);

if(cur=="index.html"){
 $("#dg").innerHTML=DEPTS.map(d=>`<a href="doctors.html?dept=${encodeURIComponent(d)}">${d}</a>`).join("");
 const st={icu:6,gen:42,er:12};
 const draw=()=>{$("#icu").textContent=st.icu;$("#gen").textContent=st.gen;$("#er").textContent=st.er+" min";
  $("#icu").className=st.icu<4?"warn":"ok";$("#er").className=st.er>20?"warn":"ok"};
 draw();setInterval(()=>{st.icu=Math.max(1,Math.min(10,st.icu+(Math.random()<.5?-1:1)));st.gen=Math.max(20,Math.min(60,st.gen+Math.round(Math.random()*4-2)));st.er=Math.max(5,Math.min(35,st.er+Math.round(Math.random()*6-3)));draw()},3500);
}

if(cur=="doctors.html"){
 let sel=q.get("dept")||"All";
 const show=()=>{
  $("#fl").innerHTML=["All",...DEPTS].map(d=>`<button class="chip${d==sel?' on':''}" data-d="${d}">${d}</button>`).join("");
  const l=DOCS.filter(x=>sel=="All"||x.d==sel);
  $("#dl").innerHTML=l.map(x=>`<div class="doc"><div class="av">${ini(x.n)}</div><div><h3>${x.n}</h3><div>${x.d} · ${x.q}</div><small>${x.e} years experience · OPD: ${x.t}</small></div><a class="btn" href="appointment.html?doc=${x.id}">Book appointment</a></div>`).join("");
  document.querySelectorAll("#fl .chip").forEach(b=>b.onclick=()=>{sel=b.dataset.d;show()});
 };show();
}

if(cur=="appointment.html"){
 const f=$("#bf"),ds=$("#dept"),dc=$("#doc"),dt=$("#date");let slot="";
 const pre=DOCS.find(x=>x.id==q.get("doc"));
 ds.innerHTML=DEPTS.map(d=>`<option>${d}</option>`).join("");
 if(pre)ds.value=pre.d;
 const fillDocs=()=>{dc.innerHTML=DOCS.filter(x=>x.d==ds.value).map(x=>`<option value="${x.id}">${x.n}</option>`).join("");if(pre&&pre.d==ds.value)dc.value=pre.id;slots()};
 const slots=()=>{
  const taken=load().filter(a=>a.doc==dc.value&&a.date==dt.value).map(a=>a.time);
  if(taken.includes(slot))slot="";
  $("#sl").innerHTML=SLOTS.map(s=>`<button type="button" class="chip${s==slot?' on':''}" data-s="${s}"${taken.includes(s)?' disabled':''}>${s}</button>`).join("");
  document.querySelectorAll("#sl .chip").forEach(b=>b.onclick=()=>{slot=b.dataset.s;slots()});
 };
 dt.min=new Date().toISOString().slice(0,10);dt.value=dt.min;
 ds.onchange=fillDocs;dc.onchange=slots;dt.onchange=slots;fillDocs();
 f.onsubmit=e=>{e.preventDefault();
  if(!slot){$("#err").textContent="Choose a time slot to continue.";return}
  $("#err").textContent="";
  const d=DOCS.find(x=>x.id==dc.value),a={ref:"CB"+Date.now().toString().slice(-6),name:$("#nm").value,phone:$("#ph").value,doc:dc.value,dn:d.n,dept:d.d,date:dt.value,time:slot,why:$("#why").value};
  const all=load();all.push(a);save(all);f.hidden=true;
  $("#ok").innerHTML=`<div class="msg"><h2>Appointment confirmed</h2><p><b>${a.ref}</b>: ${a.dn} (${a.dept}) on ${a.date} at ${a.time}.<br>Please arrive 15 minutes early with a photo ID.</p><a class="btn" href="portal.html">View in Patient Portal</a> <a class="btn alt" href="appointment.html">Book another</a></div>`;
 };
}

if(cur=="portal.html"){
 const tabs={
  Appointments:()=>{const a=load();return a.length?`<div class="tbl"><table><tr><th>Ref</th><th>Doctor</th><th>Date</th><th>Time</th><th></th></tr>${a.map((x,i)=>`<tr><td>${x.ref}</td><td>${x.dn}<br><small>${x.dept}</small></td><td>${x.date}</td><td>${x.time}</td><td><button class="btn alt" data-i="${i}">Cancel</button></td></tr>`).join("")}</table></div>`:`<p>No appointments yet. <a href="appointment.html">Book your first appointment</a>.</p>`},
  Reports:()=>`<div class="tbl"><table><tr><th>Test</th><th>Date</th><th>Result</th></tr><tr><td>Complete Blood Count</td><td>12 Oct 2026</td><td class="ok">Normal</td></tr><tr><td>Lipid Profile</td><td>12 Oct 2026</td><td>Borderline LDL, diet review advised</td></tr><tr><td>ECG</td><td>02 Oct 2026</td><td class="ok">Normal sinus rhythm</td></tr></table></div><small>Sample data for demonstration.</small>`,
  Prescriptions:()=>`<div class="tbl"><table><tr><th>Medicine</th><th>Dose</th><th>Duration</th></tr><tr><td>Vitamin D3 60,000 IU</td><td>Once a week</td><td>8 weeks</td></tr><tr><td>Paracetamol 500 mg</td><td>When needed, max 3 a day</td><td>5 days</td></tr></table></div><small>Sample data for demonstration.</small>`};
 let t="Appointments";
 const show=()=>{$("#tb").innerHTML=Object.keys(tabs).map(k=>`<button class="chip${k==t?' on':''}" data-t="${k}">${k}</button>`).join("");
  $("#tc").innerHTML=tabs[t]();
  document.querySelectorAll("#tb .chip").forEach(b=>b.onclick=()=>{t=b.dataset.t;show()});
  document.querySelectorAll("#tc [data-i]").forEach(b=>b.onclick=()=>{const a=load();a.splice(b.dataset.i,1);save(a);show()});};
 show();
}

if(cur=="contact.html"){
 $("#cf").onsubmit=e=>{e.preventDefault();$("#cm").innerHTML=`<div class="msg">Thank you, ${$("#cn").value}. Our front desk will reply within one working day.</div>`;e.target.reset()};
}
