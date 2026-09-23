const fs=require("fs");
const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64")};
(async()=>{
for(const id of [4877,4897,4484,752]){
  const p=await (await fetch(`${BASE}/wp-json/wp/v2/pages/${id}?context=edit`,{headers:H})).json();
  const raw=((p.content&&p.content.raw)||"")+" "+((p.meta&&p.meta._elementor_data)||"");
  let t=raw.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g," ");
  t=t.replace(/<[^>]+>/g," ");
  t=t.replace(/&[a-z#0-9]+;/gi," ");
  t=t.replace(/\[nrt]/g," ");
  t=t.replace(/[{}\[\]"\]/g," ");
  t=t.replace(/\s+/g," ").trim();
  console.log("=== "+id+"  "+(p.title.raw||""));
  console.log("   "+t.slice(0,420));
  console.log();
}
})();
