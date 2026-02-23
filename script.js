const GITHUB_REPO = "sirnichemotivation-rgb/justpose-storage";

async function loadGallery() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const gallery = document.getElementById('gallery');
    
    if (!eventId) {
        gallery.innerHTML = "<h2>No Event Selected</h2>";
        return;
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${eventId}`);
        const sessions = await res.json();
        sessions.reverse(); // Newest first

        gallery.innerHTML = "";

        for (let session of sessions) {
            if (session.type === 'dir') {
                const sRes = await fetch(session.url);
                const files = await sRes.json();
                
                // Kunin lang ang mga JPG
                const photos = files.filter(f => f.name.toLowerCase().endsWith('.jpg'));

                photos.forEach((photo, index) => {
                    const card = document.createElement('div');
                    card.className = 'img-card';
                    card.innerHTML = `<img src="${photo.download_url}" alt="Photo">`;
                    
                    // Open Modal on Click
                    card.onclick = () => openModal(photos, index);
                    gallery.appendChild(card);
                });
            }
        }
    } catch (e) {
        gallery.innerHTML = "<h2>Error loading memories...</h2>";
    }
}

function openModal(photos, startIndex) {
    const modal = document.getElementById('photoModal');
    const content = document.getElementById('modalContent');
    modal.style.display = 'flex';
    content.innerHTML = ""; // Reset

    photos.forEach(p => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.innerHTML = `
            <img src="${p.download_url}">
            <button class="mini-download-btn" onclick="downloadImg('${p.download_url}')">↓</button>
        `;
        content.appendChild(item);
    });

    // Jump to the clicked image
    const scrollAmount = window.innerWidth * startIndex;
    content.scrollLeft = scrollAmount;
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
