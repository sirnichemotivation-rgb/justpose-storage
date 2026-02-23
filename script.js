const GITHUB_REPO = "sirnichemotivation-rgb/justpose-storage";

async function loadGallery() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const container = document.getElementById('gallery-container');
    
    if (!eventId) {
        container.innerHTML = "<h2>No Event Selected</h2>";
        return;
    }

    document.getElementById('event-title').innerText = eventId.replace(/_/g, ' ').toUpperCase();

    try {
        // 1. Get Sessions
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${eventId}`);
        const sessions = await res.json();
        sessions.reverse(); // Newest session first

        container.innerHTML = "";

        for (let session of sessions) {
            if (session.type === 'dir') {
                const sRes = await fetch(session.url);
                const files = await sRes.json();
                
                const sBlock = document.createElement('div');
                sBlock.className = 'session-block';
                sBlock.innerHTML = `<div class="session-title">${session.name}</div>`;
                
                const grid = document.createElement('div');
                grid.className = 'photos-grid';

                files.forEach(file => {
                    if (file.name.toLowerCase().endsWith('.jpg')) {
                        const img = document.createElement('img');
                        img.src = file.download_url;
                        img.onclick = () => window.open(file.download_url, '_blank');
                        grid.appendChild(img);
                    }
                });

                sBlock.appendChild(grid);
                container.appendChild(sBlock);
            }
        }
    } catch (e) {
        container.innerHTML = "<h2>Error loading gallery. Check your GitHub files.</h2>";
    }
}
loadGallery();
