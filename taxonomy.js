// Broad categories and selectable specialties. A creator can belong to several.
window.konnektTaxonomy = [
 {id:"film-video",name:"Film & Video",specialties:["Directing","Cinematography","Videography","Screenwriting","Producing"]},
 {id:"photography",name:"Photography",specialties:["Portrait","Fashion","Sports","Street","Editorial","Event"]},
 {id:"visual-arts",name:"Visual Arts",specialties:["Painting","Drawing","Illustration","Sculpture","Mixed Media","Digital Art","Portraiture","Figurative Art"]},
 {id:"design",name:"Design",specialties:["Graphic Design","UI/UX","Branding","Typography","3D Design"]},
 {id:"post-production",name:"Post-Production",specialties:["Video Editing","Color Grading","VFX","Animation","Motion Graphics"]},
 {id:"performing-arts",name:"Performing Arts",specialties:["Acting","Dance","Modeling","Voice Acting"]},
 {id:"music-audio",name:"Music & Audio",specialties:["Singing","Rapping","Music Production","DJing","Songwriting","Audio Engineering"]},
 {id:"fashion-beauty",name:"Fashion & Beauty",specialties:["Fashion Design","Styling","Makeup Artistry","Costume Design"]},
 {id:"writing-storytelling",name:"Writing & Storytelling",specialties:["Poetry","Creative Writing","Playwriting","Authoring"]},
 {id:"interactive-digital",name:"Interactive & Digital",specialties:["Game Design","Game Art","Interactive Media"]}
];
window.getCreatorCategories = creator => creator.categories || ({
 filmmaker:["film-video"],photographer:["photography"],editor:["post-production"],"visual-artist":["visual-arts"]
}[creator.category] || []);
