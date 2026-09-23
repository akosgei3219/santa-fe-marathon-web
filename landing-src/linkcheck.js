const fs=require("fs");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64"),
  "User-Agent":"Mozilla/5.0 Chrome/128.0 SFHM-linkcheck"};
const BS=String.fromCharCode(92), DQ='"', SQ="'";
const DELETED_SLUGS=["event-overview","health-wellness-expo","santa-fe-marathon-hero"];
const DELETED_IDS=[752,3856,3857,3954,3955,3957,3958,3959,4877,4894,4896,4899,4900,4901];
function extract(blob){
  const out=[]; let i=0;
  while((i=blob.indexOf("href=",i))>=0){
    let j=i+5;
    while(j<blob.length && (blob[j]===BS)) j++;          // skip escaping backslashes
    const q=blob[j];
    if(q!==DQ && q!==SQ){ i+=5; continue; }
    j++;
    let v="";
    while(j<blob.length && blob[j]!==q && blob[j]!==BS && v.length<400){ v+=blob[j]; j++; }
    if(v) out.push(v);
    i=j;
  }
  return out;
}
(async()=>{
  const all=new Map();
  for(const id of [4897,4484,3564]){
    const p=await (await fetch(`${BASE}/wp-json/wp/v2/pages/${id}?context=edit`,{headers:H})).json();
    const blob=((p.content&&p.content.raw)||"")+((p.meta&&p.meta._elementor_data)||"");
    const uniq=[...new Set(extract(blob))];
    console.log(`=== ${id} "${(p.title.raw||"").slice(0,42)}" — ${uniq.length} unique links`);
    for(const h of uniq){ if(!all.has(h)) all.set(h,[]); all.get(h).push(id); }
  }
  const rows=[...all.entries()].sort();
  const internal=[],external=[],anchors=[],other=[];
  for(const [h,pg] of rows){
    if(h.startsWith("#")) anchors.push([h,pg]);
    else if(h.startsWith("mailto:")||h.startsWith("tel:")) other.push([h,pg]);
    else if(h.startsWith("http")&&h.indexOf("santafehalfmarathon.com")<0) external.push([h,pg]);
    else internal.push([h,pg]);
  }
  console.log(`\ninternal ${internal.length} | external ${external.length} | anchors ${anchors.length} | mail/tel ${other.length}\n`);
  console.log("--- INTERNAL (fetched logged-out) ---");
  let bad=0;
  for(const [h,pg] of internal){
    const url=h.startsWith("http")?h:BASE+(h.startsWith("/")?h:"/"+h);
    let st="ERR",fin="";
    try{const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","Accept-Language":"en-US,en;q=0.9"}});st=r.status;fin=r.url.replace(BASE,"");}catch(e){}
    const danger=DELETED_SLUGS.some(s=>h.indexOf(s)>=0)||DELETED_IDS.some(i=>h.indexOf("page_id="+i)>=0);
    let flag=""; if(st!==200){flag="  <<< HTTP "+st;bad++;} else if(danger){flag="  <<< DELETED PAGE";bad++;}
    else if(fin && fin!==h && fin!==h+"/") flag="  (redirects -> "+fin+")";
    console.log(`  ${String(st).padEnd(4)} ${h.slice(0,54).padEnd(56)} [${pg.join(",")}]${flag}`);
  }
  console.log(`\n--- EXTERNAL (${external.length}) ---`);
  for(const [h,pg] of external) console.log(`       ${h.slice(0,68).padEnd(70)} [${pg.join(",")}]`);
  if(other.length){console.log("--- MAIL/TEL ---");for(const [h,pg] of other) console.log(`       ${h}  [${pg.join(",")}]`);}
  console.log(`\nbroken or deleted-target internal links: ${bad}`);
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
