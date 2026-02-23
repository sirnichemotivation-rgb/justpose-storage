// ==========================================
// CONFIGURATION (Madali mong mababago dito)
// ==========================================
const CONFIG = {
    cloudName: "dntrwkexp",
    titleText: "JUSTPOSE GALLERY",
    titleSize: "45px",       // Lakihan mo dito (e.g. 60px)
    titleTopMargin: "30px",  // Baba ng text mula sa taas
    thumbQuality: "q_auto,f_auto,w_500", // Thumbnail setting
    fullQuality: "q_auto,f_auto"         // High quality view
};

// I-apply ang Settings sa UI
const mainTitle = document.getElementById('mainTitle');
mainTitle.innerText = CONFIG.titleText;
mainTitle.style.fontSize = CONFIG.titleSize;
mainTitle.style.marginTop = CONFIG.titleTopMargin;

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('photoModal');
const modalContent = document.getElementById('modalContent');

// 1. LOAD PRINTS (Main Gallery)
if (eventId) {
    fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${eventId}.json`)
        .then(res => res.json())
        .then(data => {
            gallery.innerHTML = "";
            // Latest muna sa taas
            data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            data.resources.forEach(img => {
                // Kunin ang Session ID mula sa Public ID
                const parts = img.public_id.split('/');
                const sessId = parts[parts.length - 2]; 

                const thumbUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/${CONFIG.thumbQuality}/${img.public_id}.${img.format}`;
                
                const card = document.createElement('div');
                card.className = "cursor-pointer bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800";
                card.onclick = () => openFolder(sessId);
                card.innerHTML = `
                    <img src="${thumbUrl}" class="w-full h-auto">
                    <div class="p-2 text-center text-[10px] text-zinc-500 uppercase font-bold">Tap to Open Folder</div>
                `;
                gallery.appendChild(card);
            });
        })
        .catch(err => {
            gallery.innerHTML = `<p class="col-span-full text-center py-20 text-zinc-600">No photos found for ${eventId}.</p>`;
        });
}

// 2. OPEN FOLDER (Singles + Print)
async function openFolder(sessId) {
    modal.style.display = "flex";
    modalContent.innerHTML = "<div class='text-center py-20 text-zinc-500'>Opening folder...</div>";

    try {
        const response = await fetch(`https://res.cloudinary.com/${CONFIG.cloudName}/image/list/${sessId}.json`);
        const data = await response.json();
        modalContent.innerHTML = ""; // Clear loading

        // Sort para mauna yung "1_Print"
        data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        data.resources.forEach(img => {
            const imgUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/${CONFIG.fullQuality}/${img.public_id}.${img.format}`;
            const downloadUrl = `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/fl_attachment/${img.public_id}.${img.format}`;
            
            const wrapper = document.createElement('div');
            wrapper.className = "flex flex-col items-center bg-zinc-900/50 p-2 rounded-xl";
            wrapper.innerHTML = `
                <img src="${imgUrl}" class="w-full h-auto rounded-lg shadow-2xl mb-4">
                <a href="${downloadUrl}" class="w-full bg-white text-black text-center py-4 rounded-lg font-black text-sm uppercase tracking-tighter">Download This Photo</a>
            `;
            modalContent.appendChild(wrapper);
        });
    } catch (err) {
        modalContent.innerHTML = "<div class='text-center py-20 text-red-500 font-bold uppercase'>Error loading folder.</div>";
    }
}

function closeModal() {
    modal.style.display = "none";
}