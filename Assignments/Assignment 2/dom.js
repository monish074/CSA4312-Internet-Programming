const eventData = [
{id:1,title:"CodeSprint",category:"coding",hall:"Hall A",time:"9:00 AM",seats:100,registered:45},
{id:2,title:"RoboRace",category:"robotics",hall:"Hall B",time:"10:00 AM",seats:80,registered:55},
{id:3,title:"Paper Presentation",category:"paper",hall:"Hall C",time:"1:00 PM",seats:60,registered:56},
{id:4,title:"Game Arena",category:"gaming",hall:"Lab 1",time:"2:00 PM",seats:70,registered:30},
{id:5,title:"Bug Bash",category:"coding",hall:"Hall A",time:"11:00 AM",seats:50,registered:20},
{id:6,title:"Line Follower",category:"robotics",hall:"Lab 2",time:"3:00 PM",seats:40,registered:25}
];
const container=document.getElementById("events"), fragment=document.createDocumentFragment();
eventData.forEach(ev=>{
 const card=document.createElement("article"); card.className="card"; card.dataset.cat=ev.category; card.dataset.id=ev.id;
 const title=document.createElement("h3"); title.textContent=ev.title;
 const info=document.createElement("p"); info.textContent=`${ev.hall} · ${ev.time}`;
 const bar=document.createElement("div"); bar.className="seat";
 const fill=document.createElement("span"); fill.style.width=(ev.registered/ev.seats*100)+"%";
 fill.className=ev.registered/ev.seats>=.9?"red":ev.registered/ev.seats>=.6?"amber":"green"; bar.append(fill);
 const status=document.createElement("p"); status.textContent=`${ev.registered}/${ev.seats} registered`+(ev.registered/ev.seats>=.9?" — Few seats left!":"");
 card.append(title,info,bar,status); fragment.append(card);
});
container.append(fragment);
const search=document.getElementById("search"), empty=document.getElementById("empty");
let category="all";
function filterCards(){let count=0;container.querySelectorAll(".card").forEach(card=>{
 const match=card.textContent.toLowerCase().includes(search.value.toLowerCase())&&(category==="all"||card.dataset.cat===category);
 card.hidden=!match;if(match)count++;
});empty.hidden=count!==0;}
search.addEventListener("input",filterCards);
document.getElementById("filters").addEventListener("click",e=>{if(e.target.dataset.filter){category=e.target.dataset.filter;filterCards();}});
container.addEventListener("click",e=>{const card=e.target.closest(".card");if(!card)return;
 const ev=eventData.find(x=>x.id===Number(card.dataset.id));const panel=document.getElementById("details");
 panel.hidden=false;panel.textContent=`${ev.title}: ${ev.category}, ${ev.hall}, ${ev.time}. Seats: ${ev.seats}.`;});
