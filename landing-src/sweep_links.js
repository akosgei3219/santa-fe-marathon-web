const fs=require("fs");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64"),
  "User-Agent":"Mozilla/5.0 Chrome/128.0 SFHM-deploy"};
const NEEDLE="/results-photos/";
(async()=>{
  for (const type of ["pages","posts"]) {
    for (let page=1;;page++){
      const r=await fetch(`${BASE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&status=publish,draft&context=edit`,{headers:H});
      if(r.status===400) break;
      const rows=await r.json(); if(!Array.isArray(rows)||!rows.length) break;
      for(const p of rows){
        const raw=(p.content&&p.content.raw)||"";
        const n=(raw.match(/(?<!race-information)\/results-photos\//g)||[]).length;
        // elementor meta
        let en=0;
        const em=(p.meta&&p.meta._elementor_data)||"";
        if(typeof em==="string"&&em) en=(em.match(/(?<!race-information)\/results-photos\//g)||[]).length;
        if(n||en) console.log(`${type} ${p.id} "${(p.title.raw||"").slice(0,44)}" content=${n} elementor=${en}`);
      }
      if(rows.length<100) break;
    }
  }
  console.log("-- sweep complete --");
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
