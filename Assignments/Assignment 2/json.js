document.getElementById("saveAgenda").addEventListener("click",()=>{
 const agenda=[{id:1,title:"CodeSprint"},{id:3,title:"Paper Presentation"}];
 try{localStorage.setItem("myAgenda",JSON.stringify(agenda));const restored=JSON.parse(localStorage.getItem("myAgenda"));
 document.getElementById("agendaStatus").textContent="Restored: "+restored.map(x=>x.title).join(", ");
 }catch(err){document.getElementById("agendaStatus").textContent="Could not read saved agenda.";}
});
function parseEvents(text){return JSON.parse(text,(key,value)=>((key==="start"||key==="end")&&typeof value==="string")?new Date(value):value);}
function exportRegistrations(registrations){return JSON.stringify(registrations,(key,value)=>key==="phone"?undefined:value,2);}
