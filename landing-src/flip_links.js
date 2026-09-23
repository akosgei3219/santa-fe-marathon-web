const fs=require("fs"),path=require("path");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64"),
  "Content-Type":"application/json","User-Agent":"Mozilla/5.0 Chrome/128.0 SFHM-deploy"};
const BK=path.join(__dirname,"..","backups","reparent-links-2026-09-22");
fs.mkdirSync(BK,{recursive:true});
// only rewrite occurrences NOT already nested
const RE=/(?<!race-information)\/results-photos\//g;
const NEW="/race-information/results-photos/";
const TARGETS=[["pages",5134],["pages",5103],["pages",4855],["pages",3963],
               ["pages",2538],["pages",2537],["pages",1606],["posts",4181]];
(async()=>{
  let total=0;
  for(const [type,id] of TARGETS){
    const p=await (await fetch(`${BASE}/wp-json/wp/v2/${type}/${id}?context=edit`,{headers:H})).json();
    const raw=(p.content&&p.content.raw)||"";
    fs.writeFileSync(path.join(BK,`${type}-${id}-before.html`),raw,"utf8");
    const hits=(raw.match(RE)||[]).length;
    if(!hits){ console.log(`${type} ${id}: no content hits, skipped`); continue; }
    const next=raw.replace(RE,NEW);
    const r=await fetch(`${BASE}/wp-json/wp/v2/${type}/${id}`,{method:"POST",headers:H,body:JSON.stringify({content:next})});
    const t=await r.text(); if(!r.ok){console.log(`${type} ${id}: FAILED ${r.status} ${t.slice(0,160)}`);continue;}
    const back=JSON.parse(t).content.raw;
    const left=(back.match(RE)||[]).length;
    console.log(`${type} ${id}: replaced ${hits}  round-trip-identical=${back===next}  remaining=${left}`);
    total+=hits;
  }
  console.log("content replacements:",total);
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
