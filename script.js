// --- CONFIGURATION ---
const GITHUB_REPO = "sirnichemotivation-rgb/justpose-storage";
const GITHUB_TOKEN = "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"; 

async function loadGallery() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const galleryContainer = document.getElementById('gallery');
    
    // Check kung may event ID sa URL
    if (!eventId) {
        galleryContainer.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>No Event ID Found in URL</h2>";
        return;
    }

    try {
        // 1. Kunin ang listahan ng sessions sa loob ng event folder
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${eventId}`, {
            headers: { "Authorization": `token ${GITHUB_TOKEN}` }
        });

        if (res.status === 403) throw new Error("GitHub Rate Limit Hit. Check Token.");
        if (res.status === 404) throw new Error("Event Folder Not Found.");

        const sessions = await res.json();
        
        // Isort para ang pinakabagong upload ay nasa unahan
        sessions.reverse(); 

        galleryContainer.innerHTML = ""; // Linisin ang "Loading" text

        // 2. Isa-isahin ang bawat session folder
        for (let session of sessions) {
            if (session.type === 'dir') {
                const sRes = await fetch(session.url, {
                    headers: { "Authorization": `token ${GITHUB_TOKEN}` }
                });
                const files = await sRes.json();
                
                // Kunin lahat ng JPG files sa session na ito (isinasama lahat kahit lumampas sa 4)
                const photos = files.filter(f => f.name.toLowerCase().endsWith('.jpg'));

                photos.forEach((photo, index) => {
                    // Gumawa ng card para sa Grid
                    const card = document.createElement('div');
                    card.className = 'img-card';
                    card.innerHTML = `<img src="${photo.download_url}" alt="Justpose Photo" loading="lazy">`;
                    
                    // Kapag clinick, bubukas ang Swipeable Modal
                    card.onclick = () => openModal(photos, index);
                    galleryContainer.appendChild(card);
                });
            }
        }
    } catch (e) {
        console.error("Gallery Error:", e);
        galleryContainer.innerHTML = `<h2 style='text-align:center; color:red; margin-top:50px;'>Error: ${e.message}</h2>`;
    }
}

// --- MODAL & SWIPE LOGIC ---

function openModal(photos, startIndex) {
    const modal = document.getElementById('photoModal');
    const content = document.getElementById('modalContent');
    
    modal.style.display = 'flex';
    content.innerHTML = ""; // Reset ang laman ng modal

    // I-load lahat ng photos sa session para pwedeng i-swipe pakaliwa/pakanan
    photos.forEach(p => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.innerHTML = `
            <img src="${p.download_url}">
            <button class="mini-download-btn" onclick="downloadImage('${p.download_url}')">↓</button>
        `;
        content.appendChild(item);
    });

    // Italon ang scroll sa index ng ni-click na photo (Scroll-snap focus)
    setTimeout(() => {
        content.scrollLeft = window.innerWidth * startIndex;
    }, 10);
}

function closeModal() {
    document.getElementById('photoModal').style.display = 'none';
}

function downloadImage(url) {
    // Kinakailangan ang fetch para ma-download talaga ang file imbes na i-open lang sa browser
    fetch(url)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Justpose_${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('Download failed. Try long-pressing the image.'));
}

// I-close ang modal kapag pinindot ang 'Esc' key
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});

// Simulan ang pag-load pagkabukas ng page
window.onload = loadGallery;
