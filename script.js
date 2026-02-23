const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// 1. LOAD SESSIONS (MAIN GALLERY)
async function loadGallery() {
    if (!eventId) {
        gallery.innerHTML = "<p style='text-align:center; padding:50px;'>Missing Event ID.</p>";
        return;
    }

    try {
        // Fetch direct sa event folder
        const res = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}`);
        if (!res.ok) throw new Error("No sessions");
        
        const folders = await res.json();
        gallery.innerHTML = "";

        // Sort: Session_10 pababa sa Session_1
        folders.sort((a, b) => b.name.localeCompare(a.name, undefined, {numeric: true, sensitivity: 'base'}));

        for (const folder of folders) {
            if (folder.type === 'dir') {
                const sessId = folder.name;
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSession(sessId);
                
                // Kunin ang Print image para sa Thumbnail
                const pRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}/Prints`);
                const prints = await pRes.json();
                
                if (Array.isArray(prints) && prints[0]) {
                    card.innerHTML = `<img src="${prints[0].download_url}">`;
                } else {
                    card.innerHTML = `<div class="no-thumb">No Print</div>`;
                }
                gallery.appendChild(card);
            }
        }
    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center; padding:50px;'>No sessions found for event: " + eventId + "</p>";
    }
}

// 2. OPEN SESSION (SWIPE VIEW)
async function openSession(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Loading session...</div>";

    const subs = ['Prints', 'Singles', 'Animated'];
    let allMedia = [];

    // Sabay-sabay na i-fetch ang Singles at Animated
    for (const s of subs) {
        try {
            const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}/${s}`);
            const data = await r.json();
            if (Array.isArray(data)) allMedia = allMedia.concat(data);
        } catch (err) {}
    }

    modalContent.innerHTML = "";
    if (allMedia.length === 0) {
        modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Empty Session</div>";
        return;
    }

    allMedia.forEach(file => {
        const div = document.createElement('div');
        div.className = "folder-item";
        const isVid = file.name.toLowerCase().endsWith('.mp4');
        
        div.innerHTML = `
            <button onclick="forceDownload('${file.download_url}', '${file.name}')" class="mini-download-btn">↓</button>
            ${isVid ? 
                `<video src="${file.download_url}" controls playsinline></video>` : 
                `<img src="${file.download_url}">`
            }
        `;
        modalContent.appendChild(div);
    });
}

// 3. FORCE DOWNLOAD FIX
async function forceDownload(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        window.open(url, '_blank');
    }
}

function closeModal() { modal.style.display = "none"; }
loadGallery();
