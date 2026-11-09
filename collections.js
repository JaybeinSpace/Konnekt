(() => {
"use strict";
const key="konnektCollectionsV1",savedKey="konnektSavedItems";
const creators=Array.isArray(window.konnektCreators)?window.konnektCreators:[];
const projects=[...creators.flatMap(c=>(c.featuredProjects||[]).map(p=>({...p,creatorName:c.name}))),...(window.konnektStandaloneProjects||[])];
const root=document.querySelector("[data-collections]"),status=document.querySelector("[data-collection-status]");
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||"null")??fallback}catch{return fallback}};
const clean=items=>Array.isArray(items)?items.filter(c=>c&&typeof c.id==="string"&&typeof c.name==="string"&&Array.isArray(c.items)).slice(0,100):[];
let collections=clean(read(key,[]));
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(collections));return true}catch{status.textContent="Browser storage is unavailable. Changes may not be saved.";return false}};
const saved=()=>{const x=read(savedKey,{});return [...(Array.isArray(x.creators)?x.creators:[]).map(id=>({type:"creator",id})),...(Array.isArray(x.projects)?x.projects:[]).map(id=>({type:"project",id}))]};
const find=item=>item.type==="creator"?creators.find(c=>c.id===item.id):projects.find(p=>p.id===item.id);
const details=item=>{const d=find(item);return d?{title:d.name||d.title,image:d.profileImage||d.thumbnail||d.image||"",href:item.type==="creator"?"creator-profile.html?id="+encodeURIComponent(item.id):"project.html?id="+encodeURIComponent(item.id)}:null};
const el=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n};
function render(){
root.replaceChildren();
document.querySelector("[data-collection-count]").textContent=collections.length+" collection"+(collections.length===1?"":"s");
document.querySelector("[data-collections-empty]").hidden=collections.length!==0;
collections.forEach(collection=>{
const card=el("article","collection-card"),header=el("header"),heading=el("div"),title=el("h3","",collection.name),count=el("small","",collection.items.length+" item"+(collection.items.length===1?"":"s"));
heading.append(title,count);
const del=el("button","collection-delete","Delete");del.type="button";del.setAttribute("aria-label","Delete "+collection.name);del.onclick=()=>{if(!confirm("Delete collection '"+collection.name+"'?"))return;collections=collections.filter(c=>c.id!==collection.id);persist();render();status.textContent="Collection deleted."};header.append(heading,del);card.append(header);
const list=el("div","collection-items");
if(!collection.items.length)list.append(el("p","collection-no-items","Nothing here yet. Add a saved item below."));
collection.items.forEach(item=>{const d=details(item);if(!d)return;const row=el("div","collection-item"),a=el("a","",d.title);a.href=d.href;if(d.image){const img=el("img");img.src=d.image;img.alt="";img.loading="lazy";row.append(img)}const remove=el("button","collection-remove","Remove");remove.type="button";remove.setAttribute("aria-label","Remove "+d.title);remove.onclick=()=>{collection.items=collection.items.filter(x=>!(x.id===item.id&&x.type===item.type));persist();render();status.textContent="Item removed."};row.append(a,remove);list.append(row)});
card.append(list);
const choices=saved().filter(item=>find(item)&&!collection.items.some(x=>x.type===item.type&&x.id===item.id));
if(choices.length){const picker=el("div","collection-picker"),select=el("select"),placeholder=el("option","","Choose a saved item");placeholder.value="";select.append(placeholder);choices.forEach((item,i)=>{const d=details(item);const option=el("option","",d.title+" · "+item.type);option.value=String(i);select.append(option)});select.setAttribute("aria-label","Saved item to add to "+collection.name);const add=el("button","collection-add","Add item");add.type="button";add.onclick=()=>{if(select.value==="")return;const item=choices[Number(select.value)];if(!item)return;collection.items.push(item);persist();render();status.textContent="Added to "+collection.name+"."};picker.append(select,add);card.append(picker)}
else card.append(el("p","collection-no-items","Save more work in Discover to add it here."));
root.append(card)
})
}
document.querySelector("[data-collection-form]").addEventListener("submit",event=>{event.preventDefault();const input=document.querySelector("#collection-name");const name=input.value.trim().slice(0,60);if(!name)return;collections.unshift({id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),name,items:[]});persist();input.value="";render();status.textContent="Collection created."});
window.addEventListener("storage",event=>{if(event.key===key||event.key===savedKey){collections=clean(read(key,[]));render()}});
render();
})();