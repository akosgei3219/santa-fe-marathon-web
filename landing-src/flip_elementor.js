const fs=require("fs"),path=require("path");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64"),
  "Content-Type":"application/json","User-Agent":"Mozilla/5.0 Chrome/128.0 SFHM-deploy"};
const BK=path.join(__dirname,"..","backups","reparent-links-2026-09-22");
const RE=/(?<!race-information)\?\/results-photos\?\//g;
const id=3963;
(async()=>{
  const p=await (await fetch(`${BASE}/wp-json/wp/v2/pages/${id}?context=edit`,{headers:H})).json();
  const em=(p.meta&&p.meta._elementor_data)||"";
  if(!em){console.log("no _elementor_data readable via REST");return;}
  fs.writeFileSync(path.join(BK,`page-${id}-elementor-before.json`),em,"utf8");
  const hits=(em.match(/\/results-photos\//g)||[]).length;
  console.log("elementor hits:",hits);
  if(!hits) return;
  // JSON-safe: operate on the serialized string, skipping already-nested paths
  const next=em.replace(/(?<!race-information)\/results-photos\//g,"/race-information/results-photos/");
  try{ JSON.parse(next); console.log("replacement still valid JSON: true"); }
  catch(e){ console.log("ABORT - replacement broke JSON:",e.message); return; }
  const r=await fetch(`${BASE}/wp-json/wp/v2/pages/${id}`,{method:"POST",headers:H,
    body:JSON.stringify({meta:{_elementor_data:next}})});
  const t=await r.text(); if(!r.ok){console.log("FAILED",r.status,t.slice(0,200));return;}
  const back=(JSON.parse(t).meta||{})._elementor_data||"";
  console.log("round-trip identical:", back===next, "| remaining:",(back.match(/(?<!race-information)\/results-photos\//g)||[]).length);
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
