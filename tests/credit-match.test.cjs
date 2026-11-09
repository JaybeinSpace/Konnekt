/* Run: node --test tests/credit-match.test.cjs */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {youtubeId,normalizeName,findMatch}=require("../credit-match-core.js");
const film={id:"existing-film",title:"The Devil in My House",youtubeUrl:"https://youtu.be/SJnMvchdG_E",credits:[{name:"Quincy Baker",role:"Director of Photography"},{name:"Alayna Williams",role:"Director"},{name:"Alayna Williams",role:"Editor"},{name:"Quincy B.",role:"Camera Assistant"}]};
const url="https://www.youtube.com/watch?v=SJnMvchdG_E&t=42";
test("YouTube URL normalization across formats",()=>{for(const u of ["https://youtu.be/SJnMvchdG_E?si=abc",url,"https://m.youtube.com/watch?v=SJnMvchdG_E","https://www.youtube.com/embed/SJnMvchdG_E","https://youtube.com/shorts/SJnMvchdG_E"])assert.equal(youtubeId(u),"SJnMvchdG_E")});
test("reject non-YouTube hosts and invalid IDs",()=>{assert.equal(youtubeId("https://youtube.com.evil.test/watch?v=SJnMvchdG_E"),null);assert.equal(youtubeId("https://youtu.be/abc"),null)});
test("same URL and matching contributor",()=>{const m=findMatch(url," quincy  baker ",[film]);assert.equal(m.kind,"credit-match");assert.equal(m.credits[0].role,"Director of Photography")});
test("same URL with nonmatching contributor prevents duplicate",()=>assert.equal(findMatch(url,"Unknown Person",[film]).kind,"duplicate"));
test("different URL same name does not trigger credit match",()=>assert.equal(findMatch("https://youtu.be/ABCDEFGHIJK","Quincy Baker",[film]).kind,"new"));
test("missing name never links credit",()=>assert.equal(findMatch(url,"",[film]).kind,"duplicate"));
test("similar names do not match by substring",()=>assert.equal(findMatch(url,"Quincy Ba",[film]).kind,"duplicate"));
test("multiple credits for same person remain separate roles",()=>assert.equal(findMatch(url,"Alayna Williams",[film]).credits.length,2));
test("normalization handles punctuation and whitespace",()=>assert.equal(normalizeName(" Alayna  Williams "),"alayna williams"));
test("matching never mutates existing credits or creates a project",()=>{const before=JSON.stringify(film);findMatch(url,"Quincy Baker",[film]);assert.equal(JSON.stringify(film),before)});
test("missing contributor credits do not match",()=>assert.equal(findMatch(url,"Quincy Baker",[{...film,credits:[]}]).kind,"duplicate"));
test("existing string credit format supported",()=>assert.equal(findMatch(url,"Quincy Baker",[{...film,credits:["Director of Photography: Quincy Baker"]}]).kind,"credit-match"));
