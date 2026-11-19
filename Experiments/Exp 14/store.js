const K='renewmarket_db';const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
let db=JSON.parse(localStorage.getItem(K)||'null');
if(!db){const c=['Electronics','Furniture','Clothing','Collectibles'].map(n=>({id:uid(),name:n}));
 const P=(t,d,p,ci,cond)=>({id:uid(),title:t,desc:d,price:p,cat:c[ci].id,seller:'u1',cond,image:'',status:'active',ts:Date.now()});
 db={users:[{id:'admin',username:'admin',password:'admin123',email:'admin@renewmarket.local',role:'admin',status:'active'},
 {id:'u1',username:'demo',password:'demo123',email:'demo@renewmarket.local',role:'user',status:'active'}],cats:c,
 products:[P('Refurbished laptop 14"','8GB RAM, 256GB SSD, new battery.',24000,0,'Good'),P('Oak study desk','Solid wood, two drawers, minor scratches.',6500,1,'Fair'),
 P('Denim jacket (M)','Lightly worn, no stains.',900,2,'Like new'),P('Vintage film camera','Working shutter, leather case included.',3800,3,'Good')],
 orders:[],offers:[],reviews:[],favs:{},notes:[]};save()}
function save(){localStorage.setItem(K,JSON.stringify(db))}
const me=()=>db.users.find(u=>u.id===localStorage.getItem('renew_session'));
const catName=id=>(db.cats.find(c=>c.id===id)||{name:'Uncategorised'}).name;
const userName=id=>(db.users.find(u=>u.id===id)||{username:'(deleted)'}).username;
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
function notify(user,text){db.notes.unshift({id:uid(),user,text,read:false,ts:Date.now()})}
function art(p){const e={Electronics:'💻',Furniture:'🪑',Clothing:'👕',Collectibles:'📷'}[catName(p.cat)]||'📦';let h=0;for(const ch of p.title)h=(h*31+ch.charCodeAt(0))%360;
 return p.image||'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="hsl(${h},35%,80%)"/><text x="200" y="175" font-size="90" text-anchor="middle">${e}</text></svg>`)}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2400)}
function modal(html,mount){const m=document.createElement('div');m.className='modal';m.innerHTML='<div>'+html+'</div>';document.body.appendChild(m);
 m.onclick=e=>{if(e.target===m||e.target.dataset.close!==undefined)m.remove()};mount&&mount(m);return m}
function logout(){localStorage.removeItem('renew_session');location.hash='#/login';location.reload()}
