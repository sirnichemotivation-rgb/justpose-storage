const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

async function loadSessions() {
    if (!eventId) return;
    try {
        const response = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}`);
        const folders = await response.json();
        gallery.innerHTML = "";
        folders.sort((a, b) => b.name.localeCompare(a.name));

        for (const folder of folders) {
            if (folder.type === 'dir') {
                const sessId = folder.name;
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSession(sessId);
                
                // Kunin ang Print bilang thumbnail
                const printRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/Prints`);
                const prints = await printRes.json();
                if (prints[0]) card.innerHTML = `<img src="${prints[0].download_url}">`;
                
                gallery.appendChild(card);
            }
        }
    } catch (e) { gallery.innerHTML = "No sessions found."; }
}

async function openSession(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white;text-align:center;width:100%'>Loading Session...</div>";
    
    const subs = ['Prints', 'Singles', 'Animated'];
    let allMedia = [];
    for (const s of subs) {
        try {
            const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/${s}`);
            const data = await r.json();
            if (Array.isArray(data)) allMedia = allMedia.concat(data);
        } catch (err) {}
    }

    modalContent.innerHTML = "";
    allMedia.forEach(file => {
        const div = document.createElement('div');
        div.className = "folder-item";
        const isVid = file.name.toLowerCase().endsWith('.mp4');
        
        div.innerHTML = `
            <button onclick="downloadFile('${file.download_url}', '${file.name}')" class="mini-download-btn">↓</button>
            ${isVid ? `<video src="${file.download_url}" controls autoplay loop playsinline></video>` : `<img src="${file.download_url}">`}
        `;
        modalContent.appendChild(div);
    });
}

async function downloadFile(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function closeModal() { modal.style.display = "none"; }
loadSessions();
