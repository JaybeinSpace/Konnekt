/* Data boundary for Credit Match. Replace this adapter with authenticated API calls later.
   Never treat client-side matches as verification or authorization. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.KonnektCreditMatchData=api;})(typeof window!=="undefined"?window:null,function(){
"use strict";
function createDemoRepository({creators=[],examples=[],standaloneProjects=[]}={}){
 const projects=[...creators.flatMap(c=>Array.isArray(c.featuredProjects)?c.featuredProjects:[]),...standaloneProjects,...examples];
 return {
  mode:"demo",
  async findExistingProject({youtubeUrl,submitterName}){
   if(typeof window!=="undefined"&&!window.KonnektCreditMatch)throw new Error("Credit Match core not loaded");
   const engine=typeof window!=="undefined"?window.KonnektCreditMatch:require("./credit-match-core.js");
   return engine.findMatch(youtubeUrl,submitterName,projects);
  },
  async requestReview(){return {ok:false,reason:"backend_unavailable"}},
  async saveDraft(){return {ok:false,reason:"backend_unavailable"}}
 };
}
return {createDemoRepository};
});
