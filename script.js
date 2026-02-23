const GH_USER = "sirnichemotivation-rgb";
const GH_REPO = "justpose-storage";
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// 1. LOAD MAIN SESSIONS (Latest muna)
if (eventId) {
    const apiURL = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}`;
    
    fetch(apiURL)
        .then(r => r.json())
        .then(folders => {
            gallery.innerHTML = "";
            // I-sort ang folders (timestamps) para latest ang una
            folders.sort((a, b) => b.name.localeCompare(a.name));

            folders.forEach(folder => {
                if (folder.type === 'dir') {
                    const sessId = folder.name;
                    const card = document.createElement('div');
                    card.className = "img-card"; 
                    card.onclick = () => openFolder(sessId);
                    
                    // Thumbnail: Hanapin ang image sa loob ng /Prints/ folder
                    fetch(`${apiURL}/${sessId}/Prints`)
                        .then(res => res.json())
                        .then(files => {
                            if(files && files[0]) {
                                card.innerHTML = `<img src="${files[0].download_url}">`;
                            }
                        });
                    gallery.appendChild(card);
                }
            });
        }).catch(err => {
            gallery.innerHTML = "<p style='text-align:center; padding:50px;'>No photos found.</p>";
        });
}

// 2. OPEN FOLDER (Swipe logic para sa Singles, Prints, at MP4)
async function openFolder(sessId) {
    modal.style.display = "flex"; 
    modalContent.innerHTML = "<div style='color:white; width:100vw; text-align:center;'>Loading session...</div>";

    try {
        const subFolders = ['Prints', 'Singles', 'Animated'];
        let allFiles = [];

        // Isa-isang titingnan ang folders sa GitHub
        for (const sub of subFolders) {
            try {
                const r = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/Events/${eventId}/${sessId}/${sub}`);
                const data = await r.json();
                if (Array.isArray(data)) allFiles = allFiles.concat(data);
            } catch (e) { /* folder not found, okay lang */ }
        }

        modalContent.innerHTML = "";
        allFiles.forEach(file => {
            const div = document.createElement('div'); 
            div.className = "folder-item";
            const isVid = file.name.toLowerCase().endsWith('.mp4');
            
            if (isVid) {
                div.innerHTML = `
                    <a href="${file.download_url}" class="mini-download-btn" target="_blank" download>↓</a>
                    <video src="${file.download_url}" style="max-width:95%; max-height:85%;" controls autoplay loop playsinline></video>
                `;
            } else {
                div.innerHTML = `
                    <a href="${file.download_url}" class="mini-download-btn" target="_blank" download>↓</a>
                    <img src="${file.download_url}">
                `;
            }
            modalContent.appendChild(div);
        });
    } catch (err) {
        modalContent.innerHTML = "<div style='color:red; width:100vw; text-align:center;'>Error loading.</div>";
    }
}

function closeModal() { modal.style.display = "none"; }
