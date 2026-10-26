(() => {
"use strict";
const ARTIST_IDS=["jaelyn-ramos"]; // Expand only with real artists and approved content.
const creators=Array.isArray(window.konnektCreators)?window.konnektCreators:[];
const artist=creators.find(c=>ARTIST_IDS.includes(c.id)&&!c.isDemo);
const artworks=artist?(artist.featuredProjects||[]).filter(p=>p.image||p.thumbnail):[];
const safe=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const provisional=p=>/temporary artwork title|original title pending/i.test(p.description||"")||/temporary title/i.test(p.alt||"");
// Exhibition-only working titles: these are Konnekt suggestions, not artist-approved names.
const workingTitles={
 "the-dancers":"In Motion",
 "street-scene":"City in Color",
 "portrait-study":"A Study in Presence",
 "two-children":"Side by Side",
 "parrot":"Feathers & Color",
 "teddy-bear":"A Familiar Friend",
 "still-life":"The Quiet Arrangement",
 "chicken":"A Little Character",
 "architecture":"Lines of the City"
};
const title=p=>provisional(p)?(workingTitles[p.id]||"Untitled work"):(p.title||"Untitled work");
const working=p=>provisional(p)&&!!workingTitles[p.id];
const medium=p=>p.medium||p.type||p.category||"";
const profile=artist?"creator-profile.html?id="+encodeURIComponent(artist.id):"explore.html";
const gallery=document.querySelector("[data-gallery-grid]");
if(gallery){if(!artist){gallery.innerHTML='<p class="gallery-empty">Our first exhibition is being prepared.</p>';return;}
const image=document.querySelector("[data-gallery-feature-image]");if(image){const src=artist.bannerImage||artworks[0]?.image;if(src){const img=document.createElement("img");img.src=src;img.alt=artist.bannerAlt||"Featured artwork";image.appendChild(img);}}
const introduction=document.querySelector("[data-gallery-artist]");if(introduction){const disciplines=(artist.specialties||[]).join(" · ");introduction.innerHTML=`<div><p class="gallery-eyebrow">01 / FEATURED ARTIST</p><h2>${safe(artist.name)}</h2><p class="gallery-location">${safe(artist.location)} · ${safe(disciplines)}</p><a class="gallery-button" href="${profile}">VIEW JAELYN'S PORTFOLIO ↗</a></div><div class="gallery-artist-bio"><p>${safe(artist.bio||"")}</p></div>`;}
const count=document.querySelector("[data-gallery-count]");if(count)count.textContent=artworks.length+" original works";
gallery.innerHTML=artworks.map((p,i)=>`<a class="gallery-work" href="gallery-artwork.html?id=${encodeURIComponent(p.id)}" aria-label="View artwork ${i+1} by ${safe(artist.name)}"><div class="gallery-work-image"><img loading="lazy" src="${safe(p.thumbnail||p.image)}" alt="${safe(p.alt||"Artwork by "+artist.name)}"></div><div class="gallery-work-meta"><span>${String(i+1).padStart(2,"0")} / ${String(artworks.length).padStart(2,"0")}</span><div><h3>${safe(title(p))}</h3><p>${safe(medium(p))}${working(p)?" · Working title":""}</p></div><span aria-hidden="true">↗</span></div></a>`).join("");
const portfolio=document.querySelector("[data-gallery-portfolio]");if(portfolio)portfolio.href=profile;
}
const viewer=document.querySelector("[data-gallery-viewer]");if(viewer){const id=new URLSearchParams(location.search).get("id");const i=artworks.findIndex(p=>p.id===id);if(i<0){viewer.innerHTML='<div class="gallery-empty"><h1>Artwork unavailable.</h1><a href="gallery.html">Return to the exhibition →</a></div>';return;}
const p=artworks[i];document.title=title(p)+" | Konnekt Gallery";
const art=document.querySelector("[data-gallery-viewer-art]");const img=document.createElement("img");img.src=p.image||p.thumbnail;img.alt=p.alt||"Artwork by "+artist.name;art.appendChild(img);
const info=document.querySelector("[data-gallery-viewer-info]");const description=p.description&&!provisional(p)?`<p class="gallery-art-description">${safe(p.description)}</p>`:"";info.innerHTML=`<p class="gallery-eyebrow">EXHIBITION 001 / WORK ${String(i+1).padStart(2,"0")}</p><h1>${safe(title(p))}</h1><p class="gallery-art-medium">${safe(medium(p))}${working(p)?" · Working title (pending artist approval)":""}</p><p class="gallery-art-byline">By <a href="${profile}">${safe(artist.name)} ↗</a></p>${description}<div class="gallery-art-actions"><a class="gallery-button" href="${profile}">Explore Artist ↗</a><a href="project.html?id=${encodeURIComponent(p.id)}">Project details →</a></div>`;
const prev=document.querySelector("[data-gallery-prev]"),next=document.querySelector("[data-gallery-next]");prev.href="gallery-artwork.html?id="+encodeURIComponent(artworks[(i-1+artworks.length)%artworks.length].id);next.href="gallery-artwork.html?id="+encodeURIComponent(artworks[(i+1)%artworks.length].id);document.querySelector("[data-gallery-position]").textContent=String(i+1).padStart(2,"0")+" / "+String(artworks.length).padStart(2,"0");
document.addEventListener("keydown",e=>{if(e.altKey||e.ctrlKey||e.metaKey||["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;if(e.key==="ArrowLeft")location.href=prev.href;if(e.key==="ArrowRight")location.href=next.href;});
}
})();