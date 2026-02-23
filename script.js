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
        // FIX: Inalis ang 'Events/' dahil wala ito sa repo mo
        const res = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}`);
        if (!res.ok) throw new Error("No sessions");
        
        const folders = await res.json();
        gallery.innerHTML = "";
        folders.sort((a, b) => b.name.localeCompare(a.name, undefined, {numeric: true}));

        for (const folder of folders) {
            if (folder.type === 'dir') {
                const sessId = folder.name;
                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSession(sessId);
                
                const pRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}/Prints`);
                const prints = await pRes.json();
                if (prints[0]) card.innerHTML = `<img src="${prints[0].download_url}">`;
                
                gallery.appendChild(card);
            }
        }
    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center;'>No sessions found. Mag-wait ng 1 min para mag-sync ang GitHub.</p>";
    }
}

async function openSession(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div style='color:white;width:100%;text-align:center;'>Loading...</div>";

    const subs = ['Prints', 'Singles', 'Animated'];
    let media = [];
    for (const s of subs) {
        try {
            const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}/${sessId}/${s}`);
            const data = await r.json();
            if (Array.isArray(data)) media = media.concat(data);
        } catch (err) {}
    }

    modalContent.innerHTML = "";
    media.forEach(file => {
        const div = document.createElement('div');
        div.className = "folder-item";
        const isVid = file.name.toLowerCase().endsWith('.mp4');
        div.innerHTML = `
            <button onclick="forceDownload('${file.download_url}', '${file.name}')" class="mini-download-btn">↓</button>
            ${isVid ? `<video src="${file.download_url}" controls autoplay loop playsinline></video>` : `<img src="${file.download_url}">`}
        `;
        modalContent.appendChild(div);
    });
}

async function forceDownload(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function closeModal() { modal.style.display = "none"; }
loadGallery();
