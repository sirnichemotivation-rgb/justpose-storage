// CONFIGURATION [cite: 2026-02-06]
const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// 1. KUNIN ANG MGA SESSION FOLDERS (Latest muna sa taas)
async function loadSessions() {
    if (!eventId) {
        gallery.innerHTML = "<p style='text-align:center;'>Missing Event ID (?event=...)</p>";
        return;
    }

    try {
        // Hahanapin ang folder ng event sa GitHub
        const response = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}`);
        if (!response.ok) throw new Error("No folders found");

        const folders = await response.json();
        gallery.innerHTML = "";

        // Sort folders (Timestamps) para latest ang una
        folders.sort((a, b) => b.name.localeCompare(a.name));

        for (const folder of folders) {
            if (folder.type === 'dir') {
                const sessId = folder.name;
                const card = document.createElement('div');
                card.className = "img-card"; 
                card.onclick = () => openSession(sessId);
                
                // THUMBNAIL LOGIC: Kukunin ang unang picture sa 'Prints' folder para sa gallery thumbnail
                const thumbRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/Prints`);
                const thumbFiles = await thumbRes.json();
                
                if (thumbFiles && thumbFiles[0]) {
                    card.innerHTML = `<img src="${thumbFiles[0].download_url}"><div style="text-align:center; font-size:10px; color:#666;">VIEW SESSION</div>`;
                } else {
                    card.innerHTML = `<div style="height:180px; display:flex; align-items:center; justify-content:center; color:#333;">No Print</div>`;
                }
                gallery.appendChild(card);
            }
        }
    } catch (err) {
        gallery.innerHTML = "<p style='text-align:center;'>No sessions found on GitHub.</p>";
    }
}

// 2. BUKSAN ANG LAHAT NG MEDIA (Prints, Singles, Animated) SA ISANG SWIPE
async function openSession(sessId) {
    modal.style.display = "flex"; 
    modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Loading session...</div>";

    const subFolders = ['Prints', 'Singles', 'Animated'];
    let allMedia = [];

    // Isa-isang babasahin ang 3 folders para ipunin ang media
    for (const sub of subFolders) {
        try {
            const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/${sub}`);
            const data = await r.json();
            if (Array.isArray(data)) allMedia = allMedia.concat(data);
        } catch (e) { /* skip kung walang folder */ }
    }

    modalContent.innerHTML = "";
    allMedia.forEach(file => {
        const div = document.createElement('div'); 
        div.className = "folder-item"; // Naka-style ito sa CSS mo para sa horizontal scroll
        const isVid = file.name.toLowerCase().endsWith('.mp4');
        
        div.innerHTML = `
            <a href="${file.download_url}" class="mini-download-btn" target="_blank" download>↓</a>
            ${isVid ? 
                `<video src="${file.download_url}" style="max-width:95%; max-height:85%;" controls autoplay loop playsinline></video>` : 
                `<img src="${file.download_url}">`
            }
        `;
        modalContent.appendChild(div);
    });
}

function closeModal() { modal.style.display = "none"; }
loadSessions();
