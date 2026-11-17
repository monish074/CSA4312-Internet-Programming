const target=new Date("2026-12-15T09:00:00+05:30"), countdown=document.getElementById("countdown");
const timer=setInterval(()=>{const diff=target-Date.now();if(diff<=0){clearInterval(timer);countdown.textContent="Event is LIVE";return;}
const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000);
countdown.textContent=`${d} days ${h} hours ${m} minutes ${s} seconds`;},1000);
document.querySelectorAll(".faq button").forEach(btn=>btn.addEventListener("click",()=>{
 const current=btn.parentElement;
 document.querySelectorAll(".faq").forEach(item=>{if(item!==current){item.classList.remove("open");item.querySelector("button").setAttribute("aria-expanded","false");}});
 current.classList.toggle("open");btn.setAttribute("aria-expanded",String(current.classList.contains("open")));
}));

setInterval(()=>{
 eventData.forEach(ev=>{
  if(ev.registered<ev.seats) ev.registered++;
  const card=container.querySelector(`.card[data-id="${ev.id}"]`);
  if(!card)return;
  const fill=card.querySelector(".seat span");
  fill.style.width=(ev.registered/ev.seats*100)+"%";
  fill.className=ev.registered/ev.seats>=.9?"red":ev.registered/ev.seats>=.6?"amber":"green";
  card.querySelector("p:last-child").textContent=`${ev.registered}/${ev.seats} registered`+(ev.registered/ev.seats>=.9?" — Few seats left!":"");
 });
},5000);
