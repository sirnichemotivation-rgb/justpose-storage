const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

async function loadGallery() {
    if (!eventId) {
        gallery.innerHTML = "<p style='text-align:center;'>Input Event ID sa URL.</p>";
        return;
    }

    try {
        // Direkta sa Event ID folder dahil tinanggal natin ang 'Events/' prefix sa Python
        const res = await fetch(`https://api.github.com/repos/${GH_USER}/${REPO}/contents/Events/${eventId}?t=${Date.now()}`);
        if (!res.ok) throw new Error("No sessions");
        
        const folders = await res.json();
        gallery.innerHTML = "";
        
        // Sorting: Newest Session sa taas
        folders.sort((a, b) => b.name.localeCompare(a.name, undefined, {numeric: true}));

        for (const folder of folders) {
            if (folder.type === 'dir') {
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSession(folder.name);
                
                // Thumbnail: Kukunin ang unang file sa loob ng session folder (yung Print)
                const fRes = await fetch(folder.url);
                const files = await fRes.json();
                
                if (files[0]) {
                    card.innerHTML = `<img src="${files[0].download_url}" loading="lazy">`;
                }
                gallery.appendChild(card);
            }
        }
    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center;'>Waiting for photos to sync...</p>";
    }
}

async function openSession(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white;width:100%;text-align:center;margin-top:50px;'>Loading Photos...</div>";

    try {
        const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}`);
        const media = await r.json();
        
        modalContent.innerHTML = "";
        media.forEach(file => {
            // Filter: Siguraduhin na JPG/PNG lang at walang _3600.jpg
            if(!file.name.toLowerCase().endsWith('_3600.jpg')) {
                const div = document.createElement('div');
                div.className = "folder-item";
                div.innerHTML = `
                    <button onclick="forceDownload('${file.download_url}', '${file.name}')" class="mini-download-btn">↓</button>
                    <img src="${file.download_url}">
                `;
                modalContent.appendChild(div);
            }
        });
    } catch (err) {
        modalContent.innerHTML = "<div style='color:white;text-align:center;'>Error loading photos.</div>";
    }
}

async function forceDownload(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function closeModal() { modal.style.display = "none"; }
loadGallery();
// Auto-refresh bawat 20 seconds para sa Live
setInterval(loadGallery, 20000);
