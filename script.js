// UPDATE SA FETCH LOGIC NG INDEX.HTML
function loadPhotos() {
    fetch(fbURL).then(res => res.json()).then(sessions => {
        if (sessions) {
            gallery.innerHTML = "";
            // Ang 'sessions' ngayon ay listahan ng Session Folders
            Object.keys(sessions).reverse().forEach(sessId => {
                const files = Object.values(sessions[sessId]);
                
                // Hanapin ang 'Print' para maging main thumbnail
                const mainPrint = files.find(f => f.url.includes('Prints')) || files[0];

                const card = document.createElement('div');
                card.className = "img-card";
                card.onclick = () => openSessionFolder(files); // Buksan lahat ng files sa session na ito
                
                card.innerHTML = `<img src="${mainPrint.url}">`;
                gallery.appendChild(card);
            });
        }
    });
}

function openSessionFolder(fileList) {
    modal.style.display = "flex";
    modalContent.innerHTML = "";
    
    fileList.forEach(file => {
        const div = document.createElement('div');
        div.className = "folder-item";
        
        if (file.url.toLowerCase().endsWith('.mp4')) {
            div.innerHTML = `<video src="${file.url}" controls loop autoplay></video>`;
        } else {
            div.innerHTML = `<img src="${file.url}">`;
        }
        modalContent.appendChild(div);
    });
}
