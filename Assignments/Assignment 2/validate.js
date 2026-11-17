const patterns={
 roll:/^\d{2}[A-Z]{2,3}\d{3}$/,
 email:/^[a-z0-9._]+@[a-z0-9.-]+\.(?:edu|ac)\.in$/,
 mobile:/^(?:\+91)?[6-9]\d{9}$/,
 password:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
 team:/^TV26-[A-Z]{3}-\d{4}$/
};
const fields=["roll","email","mobile","password","team"], submit=document.getElementById("submit");
function validate(id){const input=document.getElementById(id),ok=patterns[id].test(input.value),msg=ok?"":({
roll:"Use 24CSE045 format.",email:"Enter a valid .edu.in or .ac.in email.",
mobile:"Enter a valid 10-digit Indian mobile number.",password:"Use 8+ characters with uppercase, lowercase, digit and special character.",
team:"Use TV26-ROB-0042 format."
})[id];document.getElementById(id+"Error").textContent=msg;input.setCustomValidity(msg);return ok;}
fields.forEach(id=>["input","blur"].forEach(ev=>document.getElementById(id).addEventListener(ev,()=>{
 fields.forEach(validate);submit.disabled=!fields.every(id=>patterns[id].test(document.getElementById(id).value));
})));
document.getElementById("regForm").addEventListener("submit",e=>{e.preventDefault();document.getElementById("formResult").textContent="Client-side validation passed.";});
const feedback=document.getElementById("feedback");
feedback.addEventListener("input",()=>{document.getElementById("hashtags").textContent="Hashtags: "+(feedback.value.match(/#[A-Za-z0-9_]+/g)||[]).join(", ");});
const banned=["badword","spamword"];
function cleanFeedback(s){return s.replace(new RegExp("\\\\b("+banned.join("|")+")\\\\b","gi"),m=>"*".repeat(m.length));}
