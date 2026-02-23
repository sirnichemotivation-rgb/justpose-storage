const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const GH_TOKEN = "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"; // Eto ang fix sa 403 Forbidden

async function loadGallery() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const gal = document.getElementById('gallery');
    
    if (!eventId) {
        gal.innerHTML = "<h2 style='text-align:center'>No Event ID sa URL</h2>";
        return;
    }

    try {
        // Nagdagdag ng Authorization header para gumana ang API
        const res = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${eventId}`, {
            headers: { "Authorization": `token ${GH_TOKEN}` }
        });

        if (!res.ok) throw new Error("Folder not found sa GitHub");
        
        const sessions = await res.json();
        sessions.reverse(); // Bagong sessions sa taas

        gal.innerHTML = "";

        for (let s of sessions) {
            if (s.type === 'dir') {
                const sRes = await fetch(s.url, {
                    headers: { "Authorization": `token ${GH_TOKEN}` }
                });
                const files = await sRes.json();
                
                // Kunin lahat ng JPG files sa bawat session folder
                const photos = files.filter(f => f.name.toLowerCase().endsWith('.jpg'));

                photos.forEach((p, index) => {
                    const card = document.createElement('div');
                    card.className = 'img-card';
                    card.innerHTML = `<img src="${p.download_url}" alt="Photo" loading="lazy">`;
                    card.onclick = () => openModal(photos, index);
                    gal.appendChild(card);
                });
            }
        }
    } catch (e) {
        console.error(e);
        gal.innerHTML = "<h2 style='text-align:center'>Error loading images. Check your Token and Path.</h2>";
    }
}

function openModal(photos, startIndex) {
    const modal = document.getElementById('photoModal');
    const cont = document.getElementById('modalContent');
    modal.style.display = 'flex';
    cont.innerHTML = ""; // Reset modal

    photos.forEach(p => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.innerHTML = `
            <img src="${p.download_url}">
            <button class="mini-download-btn" onclick="downloadImg('${p.download_url}')">↓</button>
        `;
        cont.appendChild(item);
    });

    // Jump to clicked image index
    setTimeout(() => {
        cont.scrollLeft = window.innerWidth * startIndex;
    }, 10);
}

function closeModal() {
    document.getElementById('photoModal').style.display = 'none';
}

function downloadImg(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = "Justpose_Photo.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

window.onload = loadGallery;
