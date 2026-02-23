const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const fbURL = `https://justposegallery-default-rtdb.asia-southeast1.firebasedatabase.app/events/${eventId}.json`;

if (eventId) {
    async function loadGallery() {
        const res = await fetch(fbURL);
        const sessions = await res.json();
        if (!sessions) return;

        const gal = document.getElementById('gallery');
        gal.innerHTML = "";
        
        Object.keys(sessions).reverse().forEach(sessId => {
            const files = Object.values(sessions[sessId]);
            // Hanapin ang 'Prints' para sa cover
            const cover = files.find(f => f.url.includes('/Prints/')) || files[0];
            
            const card = document.createElement('div');
            card.className = "img-card";
            card.onclick = () => openFolder(files);
            card.innerHTML = `<img src="${cover.url}">`;
            gal.appendChild(card);
        });
    }

    function openFolder(files) {
        const modal = document.getElementById('photoModal');
        const cont = document.getElementById('modalContent');
        modal.style.display = "flex";
        cont.innerHTML = "";

        // Sort: Print ang mauna, tapos Singles, tapos MP4
        files.forEach(file => {
            const div = document.createElement('div');
            div.className = "folder-item";
            
            // DOWNLOAD BUTTON FIX: Gamit ang <a> tag na may 'download' attribute
            const downloadBtn = `<a href="${file.url}" class="mini-download-btn" target="_blank" download>↓</a>`;

            if (file.url.toLowerCase().endsWith('.mp4')) {
                // MP4 PLAYER FIX
                div.innerHTML = `${downloadBtn}<video src="${file.url}" controls autoplay loop playsinline></video>`;
            } else {
                // PHOTO FIX
                div.innerHTML = `${downloadBtn}<img src="${file.url}">`;
            }
            cont.appendChild(div);
        });
    }

    function closeModal() { document.getElementById('photoModal').style.display = "none"; }
    loadGallery();
    setInterval(loadGallery, 5000); // Auto refresh
}
