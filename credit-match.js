(() => {
"use strict";
const form=document.querySelector("form.konnekt-form"),box=document.querySelector("[data-credit-match]"),status=document.querySelector("[data-credit-status]");
if(!form||!box||!window.KonnektCreditMatch)return;
const repository=window.KonnektCreditMatchData.createDemoRepository({creators:window.konnektCreators||[],standaloneProjects:window.konnektStandaloneProjects||[],examples:window.konnektCreditMatchExamples||[]});
let lookupVersion=0;
const urlField=document.querySelector("#project-video-url"),nameField=document.querySelector("#creator-name");
function elem(tag,txt,cls){const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n}
function showStatus(text){status.textContent=text}
function button(label,handler){const b=elem("button",label);b.type="button";b.addEventListener("click",handler);return b}
function reset(){box.replaceChildren();box.hidden=true}
function focusPanel(){box.setAttribute("tabindex","-1");box.focus();}
function notice(text){box.append(elem("p",text,"credit-notice"))}
function clarification(){
 box.replaceChildren();box.hidden=false;
 box.append(elem("h2","We won't link this credit until it's confirmed."));
 notice("We found a project that may be connected to you. We won't link this credit to your profile until the connection is confirmed.");
 const field=elem("fieldset"),legend=elem("legend","What was your involvement?");field.append(legend);
 const options=["I worked on this project.","I'm sharing someone else's work.","I'm not sure."];
 options.forEach((label,i)=>{const wrap=elem("label"),radio=document.createElement("input");radio.type="radio";radio.name="credit-involvement";radio.value=label;radio.required=true;if(i===2)radio.checked=true;wrap.append(radio,document.createTextNode(" "+label));field.append(wrap)});
 box.append(field);const label=elem("label","Optional information about your involvement");label.htmlFor="credit-extra";const extra=elem("textarea");extra.id="credit-extra";extra.rows=3;extra.maxLength=1500;box.append(label,extra);
 const actions=elem("div",undefined,"credit-actions");
 actions.append(button("Request review",()=>showStatus("Demonstration only: no review request was sent, no evidence was stored, and no credit was linked.")));
 const later=button("Save for later (unavailable)",()=>{});later.disabled=true;later.title="Draft persistence is not available";actions.append(later,button("Cancel",()=>{reset();showStatus("Credit Match cancelled. Nothing was submitted.")}));box.append(actions);focusPanel();
}
function render(result){
 reset();box.hidden=false;
 box.append(elem("p","KONNEKT CREDIT MATCH · FRONTEND DEMONSTRATION","credit-eyebrow"));
 box.append(elem("h2",result.kind==="credit-match"?"We found a possible credit match. Is this you?":"This project already exists on Konnekt."));
 notice("Existing project: "+result.project.title+". This demonstration does not submit projects, verify identities, save requests, or link accounts.");
 if(result.kind==="credit-match"){
 const unique=[...new Set(result.credits.map(c=>c.name+" — "+c.role))];
 unique.forEach(c=>box.append(elem("p",c,"credit-identified")));
 const actions=elem("div",undefined,"credit-actions");
 actions.append(button("Yes, that's me",()=>{clarification();showStatus("You indicated a possible match. Verification is still required.")}));
 actions.append(button("No, that's someone else",()=>{reset();showStatus("No identity or credit was linked. The existing project remains unchanged.")}));
 actions.append(button("I'm not sure",()=>{clarification();showStatus("This credit remains unconfirmed.")}));
 box.append(actions);
 }else{
 notice("Your name does not match a listed contributor credit. This project will not be duplicated. A future review process can handle missing or disputed credits.");
 box.append(button("Cancel",()=>{reset();showStatus("Nothing was submitted.")}));
 }
 box.focus();
}
async function check(){
 const version=++lookupVersion,url=urlField.value.trim(),name=nameField.value.trim();
 if(!url){reset();showStatus("Add a YouTube project URL to check for an existing project.");return}
 showStatus("Checking the demonstration project index…");
 try{
  const result=await repository.findExistingProject({youtubeUrl:url,submitterName:name});
  if(version!==lookupVersion)return;
  if(result.kind==="invalid"){reset();showStatus("Enter a valid YouTube video URL (watch, youtu.be, Shorts, or embed).");return}
  if(result.kind==="ambiguous"){reset();box.hidden=false;box.append(elem("h2","Multiple existing project records need review."));notice("This video is associated with more than one project record. No credit can be matched automatically. No project was submitted.");focusPanel();showStatus("Duplicate records detected; manual reconciliation is required.");return}
  if(result.kind==="new"){reset();showStatus("No existing YouTube project match found in this frontend demonstration. Nothing has been uploaded.");return}
  render(result);showStatus("Duplicate detected. No new project has been created.");
 }catch(error){if(version!==lookupVersion)return;reset();showStatus("Project lookup is unavailable. No project was submitted.");}
}
urlField.addEventListener("input",()=>{lookupVersion++;reset();showStatus("Project URL changed. Check again before submitting.")});
nameField.addEventListener("input",()=>{lookupVersion++;reset();showStatus("Submitter name changed. Check again before submitting.")});

document.querySelector("[data-credit-check]").addEventListener("click",check);
form.addEventListener("submit",event=>{event.preventDefault();if(urlField.value.trim()){check()}else showStatus("Frontend-only preview: no project or form data was sent.")});
})();
