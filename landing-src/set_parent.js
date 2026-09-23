const fs=require("fs");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64"),
  "Content-Type":"application/json","User-Agent":"Mozilla/5.0 Chrome/128.0 SFHM-deploy"};
const [id,parent]=[Number(process.argv[2]),Number(process.argv[3])];
(async()=>{
  const before=await (await fetch(`${BASE}/wp-json/wp/v2/pages/${id}?context=edit`,{headers:H})).json();
  console.log("before: parent="+before.parent+"  link="+before.link);
  const r=await fetch(`${BASE}/wp-json/wp/v2/pages/${id}`,{method:"POST",headers:H,body:JSON.stringify({parent})});
  const t=await r.text(); if(!r.ok) throw new Error(r.status+" "+t.slice(0,300));
  const after=JSON.parse(t);
  console.log("after : parent="+after.parent+"  link="+after.link);
  console.log("slug unchanged:", after.slug===before.slug, "| status:", after.status);
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
