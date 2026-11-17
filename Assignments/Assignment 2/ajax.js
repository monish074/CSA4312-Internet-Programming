function loadData(url,onSuccess,onError){
 const xhr=new XMLHttpRequest();xhr.open("GET",url,true);xhr.timeout=5000;
 xhr.onreadystatechange=()=>{console.log("readyState:",xhr.readyState);
 if(xhr.readyState===4){if(xhr.status===200)onSuccess(xhr.responseText);else onError("Request failed. Please retry.");}};
 xhr.onerror=()=>onError("Network error. Check your connection.");
 xhr.ontimeout=()=>onError("Request timed out. Please retry.");xhr.send();
}
function loadSchedule(){const loading=document.getElementById("loading"),error=document.getElementById("ajaxError");loading.hidden=false;error.textContent="";
 loadData("data/events.json",text=>{loading.hidden=true;const items=JSON.parse(text);document.getElementById("schedule").textContent=items.map(e=>`${e.title} — ${e.hall} — ${e.start}`).join("\n");},
 msg=>{loading.hidden=true;error.textContent=msg;});}
document.getElementById("retry").addEventListener("click",loadSchedule);loadSchedule();
