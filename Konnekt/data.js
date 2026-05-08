// Fake creator data for the frontend MVP.
// Later, this same shape can come from a backend or database.
window.konnektCreators = [
    {
        id: "maya-chen",
        name: "Maya Chen",
        category: "filmmaker",
        role: "Director of Photography",
        location: "Chicago, IL",
        bio: "Maya is an emerging cinematographer focused on expressive lighting, intimate portraits, and music-driven short films. Her work blends polished commercial visuals with raw, documentary-style movement.",
        shortDescription: "Moody commercial films, music videos, and cinematic brand stories.",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Portrait of Maya Chen",
        bannerImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Film crew working on a night shoot",
        tags: ["Cinematography", "Music Videos", "Low Light"],
        stats: {
            projects: "18",
            views: "4.8k",
            badges: "3"
        },
        badges: ["Featured This Month", "Top Film Pick", "Available for Projects"],
        socialLinks: [
            { label: "Instagram", url: "https://www.instagram.com/" },
            { label: "Vimeo", url: "https://vimeo.com/" },
            { label: "YouTube", url: "https://www.youtube.com/" },
            { label: "Website", url: "https://example.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80", alt: "Vintage camera on a table" },
            { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "Person standing in a dramatic landscape" },
            { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80", alt: "Road leading through cinematic scenery" },
            { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", alt: "Portrait shoot in warm light" },
            { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80", alt: "Camera lens closeup" },
            { src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80", alt: "Photographer taking a photo" }
        ],
        featuredProjects: [
            {
                id: "after-hours",
                creatorId: "maya-chen",
                title: "After Hours",
                category: "Music Video",
                type: "Music Video",
                description: "Low-light performance film with neon color and handheld camera movement.",
                thumbnail: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=900&q=80",
                alt: "Behind the scenes camera setup",
                media: [
                    { src: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1400&q=80", alt: "Behind the scenes camera setup" },
                    { src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80", alt: "Film crew working on a night shoot" },
                    { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80", alt: "Cinema camera on set" }
                ],
                credits: ["Director: Maya Chen", "Editor: Sofia Reyes", "Color: Northline Films"],
                tools: ["Blackmagic Pocket Cinema Camera", "DaVinci Resolve", "Aputure lighting"],
                year: "2026",
                tags: ["Low Light", "Music Video", "Cinematography"]
            },
            {
                id: "make-it-visible",
                creatorId: "maya-chen",
                title: "Make It Visible",
                category: "Brand Film",
                type: "Brand Film",
                description: "A founder story built around studio portraits, motion, and natural sound.",
                thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
                alt: "Cinema camera on set",
                media: [
                    { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80", alt: "Cinema camera on set" },
                    { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1400&q=80", alt: "Editing suite with monitors" }
                ],
                credits: ["Director of Photography: Maya Chen", "Producer: Northline Films"],
                tools: ["Sony FX3", "Premiere Pro", "Natural sound recording"],
                year: "2026",
                tags: ["Brand Film", "Founder Story", "Commercial"]
            }
        ],
        videos: [
            {
                title: "Night Moves",
                type: "Director Reel",
                description: "Sample reel card for cinematic music visuals and low-light camera movement.",
                image: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1000&q=80",
                alt: "Camera setup for a music video"
            },
            {
                title: "Founder Cut",
                type: "Brand Video",
                description: "Frontend-only video card showing where creator projects and embeds will live later.",
                image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1000&q=80",
                alt: "Editing suite with monitors"
            }
        ]
    },
    {
        id: "andre-miles",
        name: "Andre Miles",
        category: "photographer",
        role: "Portrait Photographer",
        location: "Atlanta, GA",
        bio: "Andre creates editorial portraits and artist press images built around bold lighting, clean direction, and confident color. His work helps emerging talent look ready for the next stage.",
        shortDescription: "Editorial portraits, artist press kits, and bold studio lighting setups.",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Portrait of Andre Miles",
        bannerImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Warm portrait session on a city street",
        tags: ["Portraits", "Editorial", "Studio Lighting"],
        stats: {
            projects: "24",
            views: "3.6k",
            badges: "2"
        },
        badges: ["Weekly Photo Spotlight", "Editorial Pick", "Open to Commissions"],
        socialLinks: [
            { label: "Instagram", url: "https://www.instagram.com/" },
            { label: "Website", url: "https://example.com/" },
            { label: "YouTube", url: "https://www.youtube.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80", alt: "Portrait photographer in studio" },
            { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", alt: "Warm portrait shoot outdoors" },
            { src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1200&q=80", alt: "Editorial portrait with dramatic lighting" },
            { src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1200&q=80", alt: "Studio portrait with soft light" },
            { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80", alt: "Portrait closeup in natural light" },
            { src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80", alt: "Fashion portrait against a simple background" }
        ],
        featuredProjects: [
            {
                id: "new-faces",
                creatorId: "andre-miles",
                title: "New Faces",
                category: "Portrait Series",
                type: "Portrait Series",
                description: "A studio portrait set for emerging actors and musicians.",
                thumbnail: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=900&q=80",
                alt: "Editorial portrait with dramatic lighting",
                media: [
                    { src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1400&q=80", alt: "Editorial portrait with dramatic lighting" },
                    { src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1400&q=80", alt: "Studio portrait with soft light" },
                    { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80", alt: "Portrait closeup in natural light" }
                ],
                credits: ["Photographer: Andre Miles", "Styling: Studio Team", "Retouching: Andre Miles"],
                tools: ["Canon R5", "Profoto lights", "Lightroom"],
                year: "2026",
                tags: ["Portraits", "Editorial", "Studio"]
            },
            {
                id: "press-ready",
                creatorId: "andre-miles",
                title: "Press Ready",
                category: "Artist Kit",
                type: "Artist Kit",
                description: "Clean press imagery designed for release campaigns and booking decks.",
                thumbnail: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=900&q=80",
                alt: "Studio portrait with soft light",
                media: [
                    { src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1400&q=80", alt: "Studio portrait with soft light" },
                    { src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1400&q=80", alt: "Fashion portrait against a simple background" }
                ],
                credits: ["Photographer: Andre Miles", "Creative Direction: Andre Miles"],
                tools: ["Sony A7 IV", "Lightroom", "Capture One"],
                year: "2025",
                tags: ["Artist Kit", "Press Photos", "Portraits"]
            }
        ],
        videos: [
            {
                title: "Studio Flow",
                type: "Behind the Scenes",
                description: "A sample video card for portrait session process and lighting breakdowns.",
                image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=80",
                alt: "Photographer taking a photo"
            }
        ]
    },
    {
        id: "sofia-reyes",
        name: "Sofia Reyes",
        category: "editor",
        role: "Video Editor",
        location: "Los Angeles, CA",
        bio: "Sofia cuts fast, emotional stories for short films, music visuals, and social campaigns. She focuses on rhythm, pacing, and clean delivery for creator-led brands.",
        shortDescription: "Fast-paced edits for short films, music visuals, and social campaigns.",
        profileImage: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Portrait of Sofia Reyes",
        bannerImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Video editing timeline on a laptop",
        tags: ["Editing", "Music Videos", "Social Campaigns"],
        stats: {
            projects: "31",
            views: "5.1k",
            badges: "2"
        },
        badges: ["Top Film Pick", "Fast Turnaround", "Remote Friendly"],
        socialLinks: [
            { label: "Vimeo", url: "https://vimeo.com/" },
            { label: "YouTube", url: "https://www.youtube.com/" },
            { label: "Website", url: "https://example.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80", alt: "Video editing timeline on a laptop" },
            { src: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1200&q=80", alt: "Person editing video in a studio" },
            { src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80", alt: "Editing workstation with monitors" },
            { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80", alt: "Editing suite with monitors" }
        ],
        featuredProjects: [
            {
                id: "cut-to-color",
                creatorId: "sofia-reyes",
                title: "Cut to Color",
                category: "Short Film",
                type: "Short Film",
                description: "A rhythm-driven edit for a short film built around movement and memory.",
                thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
                alt: "Editing workstation with monitors",
                media: [
                    { src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1400&q=80", alt: "Editing workstation with monitors" },
                    { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80", alt: "Video editing timeline on a laptop" }
                ],
                credits: ["Editor: Sofia Reyes", "Director: Maya Chen", "Sound: Priya Shah"],
                tools: ["Premiere Pro", "DaVinci Resolve", "Frame.io"],
                year: "2026",
                tags: ["Short Film", "Editing", "Color"]
            },
            {
                id: "launch-week",
                creatorId: "sofia-reyes",
                title: "Launch Week",
                category: "Social Campaign",
                type: "Social Campaign",
                description: "A fast set of creator-led cuts for a product launch sprint.",
                thumbnail: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=900&q=80",
                alt: "Person editing video in a studio",
                media: [
                    { src: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1400&q=80", alt: "Person editing video in a studio" },
                    { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1400&q=80", alt: "Editing suite with monitors" }
                ],
                credits: ["Editor: Sofia Reyes", "Producer: Northline Films"],
                tools: ["Premiere Pro", "After Effects", "Notion shot list"],
                year: "2025",
                tags: ["Social", "Campaign", "Editing"]
            }
        ],
        videos: [
            {
                title: "Edit Reel 01",
                type: "Editing Reel",
                description: "Sample reel card for pacing, transitions, and music-led cuts.",
                image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80",
                alt: "Video editing timeline on a laptop"
            }
        ]
    },
    {
        id: "northline-films",
        name: "Northline Films",
        category: "filmmaker",
        role: "Production Studio",
        location: "New York, NY",
        bio: "Northline Films is a lean production studio creating founder stories, interviews, launch films, and social-first campaign assets for teams that need premium visuals without a giant crew.",
        shortDescription: "Lean crews for launch films, interviews, and social-first campaign assets.",
        profileImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Camera lens closeup for Northline Films",
        bannerImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Film crew on set",
        tags: ["Production", "Brand Films", "Interviews"],
        stats: {
            projects: "42",
            views: "6.4k",
            badges: "4"
        },
        badges: ["Featured Studio", "Top Film Pick", "Brand Ready"],
        socialLinks: [
            { label: "Instagram", url: "https://www.instagram.com/" },
            { label: "Vimeo", url: "https://vimeo.com/" },
            { label: "Website", url: "https://example.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80", alt: "Film crew on set" },
            { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80", alt: "Cinema camera on set" },
            { src: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1200&q=80", alt: "Behind the scenes camera setup" },
            { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80", alt: "Editing suite with monitors" }
        ],
        featuredProjects: [
            {
                id: "launch-film",
                creatorId: "northline-films",
                title: "Launch Film",
                category: "Brand Film",
                type: "Brand Film",
                description: "A cinematic launch asset for a small product team.",
                thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
                alt: "Cinema camera on set",
                media: [
                    { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80", alt: "Cinema camera on set" },
                    { src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80", alt: "Film crew on set" }
                ],
                credits: ["Production: Northline Films", "DP: Maya Chen", "Edit: Sofia Reyes"],
                tools: ["Sony FX6", "DaVinci Resolve", "Aputure lighting"],
                year: "2026",
                tags: ["Launch", "Brand Film", "Production"]
            },
            {
                id: "founder-table",
                creatorId: "northline-films",
                title: "Founder Table",
                category: "Interview Series",
                type: "Interview Series",
                description: "A focused interview package built for web and social platforms.",
                thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
                alt: "Film crew on set",
                media: [
                    { src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80", alt: "Film crew on set" },
                    { src: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1400&q=80", alt: "Behind the scenes camera setup" }
                ],
                credits: ["Production: Northline Films", "Audio: Priya Shah"],
                tools: ["Canon C70", "Lav microphones", "Premiere Pro"],
                year: "2025",
                tags: ["Interview", "Founder Story", "Brand"]
            }
        ],
        videos: [
            {
                title: "Studio Reel",
                type: "Production Reel",
                description: "A sample video card for campaigns, interviews, and launch films.",
                image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80",
                alt: "Cinema camera on set"
            }
        ]
    },
    {
        id: "jalen-brooks",
        name: "Jalen Brooks",
        category: "photographer",
        role: "Lifestyle Photographer",
        location: "Dallas, TX",
        bio: "Jalen creates warm lifestyle photography for artists, independent brands, and creative founders. His work has a relaxed, human quality built for campaigns and launch pages.",
        shortDescription: "Warm lifestyle photography for artists, brands, and independent makers.",
        profileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Portrait of Jalen Brooks",
        bannerImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Person standing in a dramatic landscape",
        tags: ["Lifestyle", "Brand Photography", "Natural Light"],
        stats: {
            projects: "16",
            views: "2.9k",
            badges: "1"
        },
        badges: ["Weekly Photo Spotlight", "Brand Friendly"],
        socialLinks: [
            { label: "Instagram", url: "https://www.instagram.com/" },
            { label: "Website", url: "https://example.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", alt: "Person standing in a dramatic landscape" },
            { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", alt: "Warm portrait shoot outdoors" },
            { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80", alt: "Road leading through cinematic scenery" },
            { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80", alt: "Vintage camera on a table" }
        ],
        featuredProjects: [
            {
                id: "open-road",
                creatorId: "jalen-brooks",
                title: "Open Road",
                category: "Lifestyle Campaign",
                type: "Lifestyle Campaign",
                description: "A natural-light set for an independent apparel launch.",
                thumbnail: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
                alt: "Road leading through cinematic scenery",
                media: [
                    { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80", alt: "Road leading through cinematic scenery" },
                    { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80", alt: "Person standing in a dramatic landscape" },
                    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80", alt: "Warm portrait shoot outdoors" }
                ],
                credits: ["Photographer: Jalen Brooks", "Styling: Local creative team"],
                tools: ["Fujifilm X-T5", "Natural light", "Lightroom"],
                year: "2026",
                tags: ["Lifestyle", "Campaign", "Natural Light"]
            }
        ],
        videos: [
            {
                title: "Field Notes",
                type: "Photo Story",
                description: "A sample motion card for behind-the-scenes photo work.",
                image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1000&q=80",
                alt: "Photographer taking a photo"
            }
        ]
    },
    {
        id: "priya-shah",
        name: "Priya Shah",
        category: "editor",
        role: "Documentary Editor",
        location: "Seattle, WA",
        bio: "Priya edits documentary stories, branded interviews, and creator reels with a clean, patient rhythm. Her work is built around clarity, emotional beats, and strong narrative flow.",
        shortDescription: "Clean documentary cuts, branded interviews, and polished creator reels.",
        profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
        profileAlt: "Portrait of Priya Shah",
        bannerImage: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1800&q=80",
        bannerAlt: "Person editing video in a studio",
        tags: ["Documentary", "Interviews", "Creator Reels"],
        stats: {
            projects: "27",
            views: "4.2k",
            badges: "2"
        },
        badges: ["Documentary Pick", "Remote Friendly"],
        socialLinks: [
            { label: "Vimeo", url: "https://vimeo.com/" },
            { label: "Website", url: "https://example.com/" }
        ],
        gallery: [
            { src: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1200&q=80", alt: "Person editing video in a studio" },
            { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80", alt: "Video editing timeline on a laptop" },
            { src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80", alt: "Editing workstation with monitors" },
            { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80", alt: "Editing suite with monitors" }
        ],
        featuredProjects: [
            {
                id: "quiet-signal",
                creatorId: "priya-shah",
                title: "Quiet Signal",
                category: "Documentary Short",
                type: "Documentary Short",
                description: "A patient edit built around interviews, pauses, and natural sound.",
                thumbnail: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80",
                alt: "Editing suite with monitors",
                media: [
                    { src: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1400&q=80", alt: "Editing suite with monitors" },
                    { src: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1400&q=80", alt: "Person editing video in a studio" }
                ],
                credits: ["Editor: Priya Shah", "Producer: Northline Films"],
                tools: ["DaVinci Resolve", "Premiere Pro", "Descript"],
                year: "2026",
                tags: ["Documentary", "Interview", "Editing"]
            },
            {
                id: "creator-cutdown",
                creatorId: "priya-shah",
                title: "Creator Cutdown",
                category: "Reel Package",
                type: "Reel Package",
                description: "A polished reel package made from long-form creator footage.",
                thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
                image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80",
                alt: "Editing workstation with monitors",
                media: [
                    { src: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1400&q=80", alt: "Editing workstation with monitors" },
                    { src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80", alt: "Video editing timeline on a laptop" }
                ],
                credits: ["Editor: Priya Shah", "Motion: Sofia Reyes"],
                tools: ["Premiere Pro", "After Effects", "Frame.io"],
                year: "2025",
                tags: ["Reel", "Creator Package", "Editing"]
            }
        ],
        videos: [
            {
                title: "Documentary Reel",
                type: "Editing Reel",
                description: "A sample video card for interview-led documentary work.",
                image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=1000&q=80",
                alt: "Person editing video in a studio"
            }
        ]
    }
];
