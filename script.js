// script.js
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const fbURL = `https://justposegallery-default-rtdb.asia-southeast1.firebasedatabase.app/events/${eventId}.json`;

async function loadGallery() {
    try {
        const response = await fetch(fbURL);
        const sessions = await response.json();
        if (!sessions) return;

        const gal = document.getElementById('gallery');
        gal.innerHTML = ""; // Clear muna para hindi patong-patong

        // I-loop lahat ng Session Folders (sess_123, sess_456, etc.)
        Object.keys(sessions).reverse().forEach(sessId => {
            const filesObj = sessions[sessId];
            const filesArray = Object.values(filesObj); // Lahat ng files sa loob ng session

            // Hanapin ang "Print" na file para maging cover ng card
            const printFile = filesArray.find(f => f.url.toLowerCase().includes('print')) || filesArray[0];

            const card = document.createElement('div');
            card.className = "img-card";
            card.onclick = () => openFolder(filesArray); // Pag click, lalabas lahat ng files sa session
            card.innerHTML = `<img src="${printFile.url}">`;
            gal.appendChild(card);
        });
    } catch (e) { console.log("Gallery Error:", e); }
}

function openFolder(files) {
    const modal = document.getElementById('photoModal');
    const cont = document.getElementById('modalContent');
    modal.style.display = "flex";
    cont.innerHTML = ""; // Linisin ang loob ng swipe view

    files.forEach(file => {
        const div = document.createElement('div');
        div.className = "folder-item";
        const isVideo = file.url.toLowerCase().endsWith('.mp4');

        if (isVideo) {
            div.innerHTML = `
                <video src="${file.url}" controls autoplay loop playsinline></video>
                <a href="${file.url}" class="mini-download-btn" target="_blank" download>DOWNLOAD VIDEO</a>`;
        } else {
            div.innerHTML = `
                <img src="${file.url}">
                <a href="${file.url}" class="mini-download-btn" target="_blank" download>DOWNLOAD IMAGE</a>`;
        }
        cont.appendChild(div);
    });
}

function closeModal() {
    document.getElementById('photoModal').style.display = "none";
    document.getElementById('modalContent').innerHTML = ""; // Stop video playback
}

loadGallery();
setInterval(loadGallery, 5000);
