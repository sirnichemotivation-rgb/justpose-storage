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
        // FIX: Tinanggal ang '/Events/' dahil base sa screenshot mo, diretso ang folders sa repo
        const apiUrl = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}?t=${Date.now()}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) throw new Error("Folder not found");
        
        const sessions = await res.json();
        gallery.innerHTML = "";
        
        // Isort ang sessions (Newest first)
        sessions.sort((a, b) => b.name.localeCompare(a.name, undefined, {numeric: true}));

        for (const session of sessions) {
            if (session.type === 'dir') {
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSession(session.name);
                
                // Kuhanin ang thumbnail mula sa loob ng session folder
                const fRes = await fetch(session.url);
                const files = await fRes.json();
                
                // Hanapin ang unang file na hindi _3600.jpg at hindi MP4
                const thumbFile = files.find(f => 
                    f.name.toLowerCase().endsWith('.jpg') && 
                    !f.name.includes('_3600')
                );
                
                if (thumbFile) {
                    card.innerHTML = `<img src="${thumbFile.download_url}" loading="lazy">`;
                } else {
                    card.innerHTML = `<div style="padding:20px; font-size:10px; color:#444;">No Preview</div>`;
                }
                gallery.appendChild(card);
            }
        }
    } catch (e) {
        gallery.innerHTML = `<p style='text-align:center;'>Event folder "${eventId}" not found or repo is empty.</p>`;
    }
}

async function openSession(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white;width:100%;text-align:center;margin-top:50px;'>Loading Photos...</div>";

    try {
        // Fetch files directly from the session folder path
        const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}`);
        const media = await r.json();
        
        modalContent.innerHTML = "";
        media.forEach(file => {
            // Filter: Ipakita ang lahat maliban sa _3600.jpg
            if(!file.name.includes('_3600') && file.name.toLowerCase().endsWith('.jpg')) {
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
        modalContent.innerHTML = "<div style='color:white;text-align:center;'>Error loading session photos.</div>";
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

// Initial load
loadGallery();
// Auto refresh every 20 seconds
setInterval(loadGallery, 20000);

