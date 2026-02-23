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
        // FIX: Inalis ang 'Events/' dahil base sa screenshot mo, diretso ang event folder
        const res = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}?t=${Date.now()}`);
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
                
                // Thumbnail: Kuhanin ang unang file sa loob ng session folder
                const fRes = await fetch(folder.url);
                const files = await fRes.json();
                
                // Hanapin ang unang valid image na hindi _3600.jpg
                const thumb = files.find(f => f.name.toLowerCase().endsWith('.jpg') && !f.name.includes('_3600'));
                
                if (thumb) {
                    card.innerHTML = `<img src="${thumb.download_url}" loading="lazy">`;
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
        // Fetch files directly from the session folder
        const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}`);
        const media = await r.json();
        
        modalContent.innerHTML = "";
        media.forEach(file => {
            // Filter: Ipakita lahat maliban sa _3600.jpg at MP4
            if(!file.name.toLowerCase().includes('_3600') && !file.name.toLowerCase().endsWith('.mp4')) {
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
setInterval(loadGallery, 20000);
