// Netlify-style serverless handler. Connect a persistent database before production use.
exports.handler = async (event) => {
 const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"};
 if(event.httpMethod==="OPTIONS") return {statusCode:204,headers,body:""};
 if(event.httpMethod!=="POST") return {statusCode:405,headers,body:JSON.stringify({ok:false,error:"Method not allowed"})};
 let data;try{data=JSON.parse(event.body||"{}");}catch{return {statusCode:400,headers,body:JSON.stringify({ok:false,errors:["Invalid JSON"]})};}
 const rules={roll:/^\d{2}[A-Z]{2,3}\d{3}$/,email:/^[a-z0-9._]+@[a-z0-9.-]+\.(edu|ac)\.in$/,mobile:/^(?:\+91)?[6-9]\d{9}$/,team:/^TV26-[A-Z]{3}-\d{4}$/};
 const errors=Object.entries(rules).filter(([k,r])=>!r.test(String(data[k]||""))).map(([k])=>`${k} is invalid`);
 if(errors.length)return {statusCode:400,headers,body:JSON.stringify({ok:false,errors})};
 const registrationId="TV-"+Date.now();
 // TODO: persist data to Supabase, Google Sheets or a platform KV store.
 return {statusCode:201,headers,body:JSON.stringify({ok:true,registrationId})};
};
