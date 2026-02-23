// CONFIG [cite: 2026-02-06]
const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

async function loadGallery() {
    if (!eventId) {
        gallery.innerHTML = "<p style='text-align:center; padding:50px;'>Missing Event ID in URL.</p>";
        return;
    }

    // API URL para sa Event folder
    const apiURL = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}`;
    
    try {
        const res = await fetch(apiURL);
        if (!res.ok) throw new Error("Folder not found");
        
        const folders = await res.json();
        gallery.innerHTML = "";

        // I-sort ang folders (Session IDs) - Latest muna
        folders.sort((a, b) => b.name.localeCompare(a.name));

        folders.forEach(folder => {
            if (folder.type === 'dir') {
                const sessId = folder.name;
                const card = document.createElement('div');
                card.className = "img-card";
                card.innerHTML = `<div class="loading-thumb">Loading...</div>`;
                card.onclick = () => openFolder(sessId);
                
                // Kunin ang thumbnail galing sa Prints folder ng session na ito
                fetch(`${apiURL}/${sessId}/Prints`)
                    .then(r => r.json())
                    .then(files => {
                        if (files && files[0]) {
                            card.innerHTML = `<img src="${files[0].download_url}">`;
                        } else {
                            card.innerHTML = `<div class="no-thumb">No Print</div>`;
                        }
                    }).catch(() => {
                        card.innerHTML = `<div class="no-thumb">Error</div>`;
                    });

                gallery.appendChild(card);
            }
        });

    } catch (err) {
        gallery.innerHTML = `<p style='text-align:center; padding:50px;'>No sessions found for "${eventId}".<br>Check if folder "Events/${eventId}" exists in GitHub.</p>`;
    }
}

async function openFolder(sessId) {
    modal.style.display = "flex"; 
    modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Loading session...</div>";

    const subFolders = ['Prints', 'Singles', 'Animated'];
    let allMedia = [];

    for (const sub of subFolders) {
        try {
            const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/${sub}`);
            const data = await r.json();
            if (Array.isArray(data)) allMedia = allMedia.concat(data);
        } catch (e) {}
    }

    modalContent.innerHTML = "";
    if (allMedia.length === 0) {
        modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Session is empty.</div>";
        return;
    }

    allMedia.forEach(file => {
        const div = document.createElement('div'); 
        div.className = "folder-item";
        const isVid = file.name.toLowerCase().endsWith('.mp4');
        
        if (isVid) {
            div.innerHTML = `
                <a href="${file.download_url}" class="mini-download-btn" target="_blank" download>↓</a>
                <video src="${file.download_url}" controls autoplay loop playsinline></video>
            `;
        } else {
            div.innerHTML = `
                <a href="${file.download_url}" class="mini-download-btn" target="_blank" download>↓</a>
                <img src="${file.download_url}">
            `;
        }
        modalContent.appendChild(div);
    });
}

function closeModal() { modal.style.display = "none"; }

loadGallery();
