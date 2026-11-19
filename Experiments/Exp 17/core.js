const K='voltpay_db_v1',$=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>d.toISOString().slice(0,10),TODAY=()=>iso(new Date()),D=s=>new Date(s+'T00:00:00Z');
const addDays=(s,n)=>iso(new Date(D(s).getTime()+n*864e5)),diff=(a,b)=>Math.round((D(a)-D(b))/864e5);
const addMonths=(s,n)=>{const d=D(s);d.setUTCMonth(d.getUTCMonth()+n);return iso(d)};
const fd=s=>D(s).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
const rs=n=>'₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
let db=JSON.parse(localStorage.getItem(K)||'null');
if(!db){const t=TODAY(),c1={id:'c1',start:addDays(t,-120),end:addDays(t,-61),due:addDays(t,-46)},c2={id:'c2',start:addDays(t,-60),end:addDays(t,-1),due:addDays(t,10)};
 const mk=(id,u,p,type,no,pw)=>({id,name:u,email:id+'@example.com',phone:'9876500000',password:pw,type,no,address:'12, Gandhi Road, Chennai',autopay:{on:false,method:'Debit card',since:''},remind:{sms:true,email:true,days:5}});
 db={settings:{free:200,fine:10,tariff:{domestic:[{upto:100,rate:1},{upto:200,rate:2.5},{upto:500,rate:4},{upto:null,rate:6}],commercial:[{upto:100,rate:2},{upto:200,rate:4.5},{upto:500,rate:6},{upto:null,rate:7}]}},
 admin:{username:'admin',password:'admin123'},cycles:[c1,c2],users:[mk('u1','Demo Customer',0,'domestic','EB1001','demo123'),mk('u2','Metro Traders',0,'commercial','EB2001','demo123')],
 readings:[{cycle:'c1',user:'u1',units:340},{cycle:'c2',user:'u1',units:420},{cycle:'c1',user:'u2',units:610},{cycle:'c2',user:'u2',units:520}],payments:[],logs:[]};
 const p=pay('u1','c1','Net banking',{bank:'SBI'},addDays(t,-50));save()}
function save(){localStorage.setItem(K,JSON.stringify(db))}
function calc(type,units){const F=db.settings.free;let prev=0,rows=[],tot=0;
 for(const s of db.settings.tariff[type]){const hi=s.upto==null?Infinity:s.upto,inSlab=Math.max(0,Math.min(units,hi)-prev),bill=Math.max(0,Math.min(units,hi)-Math.max(prev,F)),amt=bill*s.rate;
  rows.push({label:s.upto==null?`${prev+1}+`:`${prev+1}–${hi}`,units:inSlab,free:inSlab-bill,bill,rate:s.rate,amt});tot+=amt;prev=hi}return{rows,energy:tot}}
function fineOf(cycle,on=TODAY()){return Math.max(0,diff(on,cycle.due))*db.settings.fine}
function billFor(u,cid){const c=db.cycles.find(x=>x.id===cid),r=db.readings.find(x=>x.cycle===cid&&x.user===u.id);if(!c||!r)return null;
 const p=db.payments.find(x=>x.cycle===cid&&x.user===u.id),k=calc(u.type,r.units),late=p?p.fine:fineOf(c);
 return{cycle:c,units:r.units,rows:k.rows,energy:k.energy,fine:late,total:k.energy+late,pay:p,daysLate:p?0:Math.max(0,diff(TODAY(),c.due))}}
function bills(u){return db.cycles.map(c=>billFor(u,c.id)).filter(Boolean).sort((a,b)=>b.cycle.start.localeCompare(a.cycle.start))}
function pay(uid_,cid,method,detail,on=TODAY()){const u=db.users.find(x=>x.id===uid_),c=db.cycles.find(x=>x.id===cid),r=db.readings.find(x=>x.cycle===cid&&x.user===uid_),k=calc(u.type,r.units),fine=fineOf(c,on);
 const p={id:'RCP'+Date.now().toString().slice(-8)+uid().slice(0,2).toUpperCase(),user:uid_,cycle:cid,units:r.units,energy:k.energy,fine,amount:k.energy+fine,method,detail,date:on,ts:Date.now()};db.payments.push(p);return p}
function log(user,channel,text){db.logs.unshift({id:uid(),user,channel,text,ts:Date.now()})}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2600)}
function modal(h,mount){const m=document.createElement('div');m.className='modal';m.innerHTML='<div>'+h+'</div>';document.body.appendChild(m);m.onclick=e=>{if(e.target===m||e.target.dataset.close!==undefined)m.remove()};mount&&mount(m);return m}
function receiptHtml(p){const u=db.users.find(x=>x.id===p.user)||{},c=db.cycles.find(x=>x.id===p.cycle)||{};
 return `<div class="receipt"><h2>VoltPay · Payment receipt</h2><p class="mute">Receipt no. ${p.id} · ${fd(p.date)}</p><table><tr><td>Customer</td><td>${esc(u.name)} (${esc(u.no)})</td></tr><tr><td>Connection</td><td>${esc(u.type)}</td></tr><tr><td>Billing period</td><td>${fd(c.start)} – ${fd(c.end)}</td></tr><tr><td>Units consumed</td><td>${p.units}</td></tr><tr><td>Energy charges</td><td>${rs(p.energy)}</td></tr><tr><td>Late fine</td><td>${rs(p.fine)}</td></tr><tr><td>Method</td><td>${esc(p.method)}</td></tr><tr><td><b>Total paid</b></td><td><b>${rs(p.amount)}</b></td></tr></table></div>`}
function showReceipt(id){const p=db.payments.find(x=>x.id===id),u=db.users.find(x=>x.id===p.user);
 modal(receiptHtml(p)+`<div class="row noprint" style="margin-top:14px"><button class="btn go" id="dl">Download</button><button class="btn ghost" onclick="print()">Print / Save PDF</button><button class="btn ghost" id="em">Email receipt</button><button class="btn ghost" data-close>Close</button></div>`,m=>{
 m.querySelector('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([`<!doctype html><meta charset=utf-8><title>${p.id}</title><body style="font-family:sans-serif;max-width:560px;margin:30px auto">${receiptHtml(p).replace(/class="receipt"/,'style="border:2px dashed #ccc;padding:20px"')}</body>`],{type:'text/html'}));a.download=p.id+'.html';a.click()};
 m.querySelector('#em').onclick=()=>{log(u.id,'Email',`Receipt ${p.id} emailed to ${u.email}`);save();location.href=`mailto:${u.email}?subject=${encodeURIComponent('VoltPay receipt '+p.id)}&body=${encodeURIComponent(`Paid ${rs(p.amount)} on ${fd(p.date)} via ${p.method}. Receipt ${p.id}.`)}`;toast('Receipt emailed to '+u.email)}})}
