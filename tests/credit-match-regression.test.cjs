const {test}=require("node:test");const assert=require("node:assert/strict");const {findMatch}=require("../credit-match-core.js");
const url="https://youtu.be/SJnMvchdG_E";
test("multiple canonical records require reconciliation rather than arbitrary attribution",()=>{const r=findMatch(url,"Quincy Baker",[{id:"one",youtubeUrl:url,credits:[{name:"Quincy Baker",role:"DP"}]},{id:"two",youtubeUrl:url,credits:[{name:"Quincy Baker",role:"DP"}]}]);assert.equal(r.kind,"ambiguous");assert.equal(r.projects.length,2)});
test("malformed video entries do not crash lookup",()=>{const r=findMatch(url,"Quincy Baker",[{id:"a",videos:[null,{src:url}],credits:[]}]);assert.equal(r.kind,"duplicate")});
test("unknown project entries do not crash lookup",()=>assert.equal(findMatch(url,"", [null,undefined,{}]).kind,"new"));
