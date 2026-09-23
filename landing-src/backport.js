const fs=require("fs"),path=require("path");
const BS=String.fromCharCode(92);
const ESCAPED=" "+BS+"u0026 ";            // what the deploy writes inside <script>
const PLAIN=" & ";                        // what the source holds

// token map read from the deploy script so the two cannot drift
const deploySrc=fs.readFileSync(path.join(__dirname,"recreate-wp-page.js"),"utf8");
const mapBlock=deploySrc.match(/const CDN = "([^"]+)";\s*const urlMap = \{([\s\S]*?)\n\};/);
if(!mapBlock) throw new Error("could not read urlMap");
const CDN=mapBlock[1]; const urlMap={};
for(const m of mapBlock[2].matchAll(/"(%%IMG_[A-Z]+%%)":\s*(?:CDN \+ "([^"]+)"|"([^"]+)")/g))
  urlMap[m[1]]=m[2]?CDN+m[2]:m[3];

const env={};for(const l of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim();}
const BASE=env.WP_URL.replace(/\/$/,"");
const H={Authorization:"Basic "+Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64")};

(async()=>{
  const q=await (await fetch(`${BASE}/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit`,{headers:H})).json();
  let live=q[0].content.raw;
  console.log("live content: "+live.length+" chars (page "+q[0].id+")");

  // 1. strip the wp:html wrapper
  const PRE="<!-- wp:html -->\n", POST="\n<!-- /wp:html -->";
  if(!live.startsWith(PRE)||!live.endsWith(POST)) throw new Error("wrapper not found as expected");
  let html=live.slice(PRE.length, live.length-POST.length);
  console.log("  wrapper stripped        -> "+html.length);

  // 2. reverse the & escape, inside <script> only (mirrors the forward transform)
  let escCount=0;
  html=html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,(m,o,b,c)=>{
    const n=b.split(ESCAPED).length-1; escCount+=n;
    return o+b.split(ESCAPED).join(PLAIN)+c;
  });
  console.log("  unescaped ' \u0026 '     -> "+escCount+" occurrence(s)");

  // 3. re-tokenise the base64 logo then the CDN image URLs
  let imgN=0;
  for(const [token,url] of Object.entries(urlMap)){
    const n=html.split(url).length-1; imgN+=n;
    if(n===0) console.log("    WARNING: url not found for "+token);
    html=html.split(url).join(token);
  }
  console.log("  re-tokenised images     -> "+imgN+" url(s)");

  fs.writeFileSync(path.join(__dirname,"run-santa-fe-2026.prod.src.html"),html,"utf8");
  console.log("\nwritten run-santa-fe-2026.prod.src.html: "+html.length+" chars");
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
