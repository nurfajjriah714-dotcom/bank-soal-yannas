// =================================================================
// 1. DATA DAN KONFIGURASI
// =================================================================

// ⚠️ WAJIB DIGANTI! GANTI DENGAN URL WEB APP ANDA DARI GOOGLE APPS SCRIPT
const WEB_APP_URL = 'GANTI_DENGAN_URL_WEB_APP_ANDA'; 

// =================================================================
// 2. VARIABEL DOM DAN KONDISI GAME
// =================================================================

const gameArea = document.getElementById('game-area');
const scoreBoard = document.getElementById('score-board');
const resetButton = document.getElementById('reset-button');
const messageElement = document.getElementById('message');

const studentFormDiv = document.getElementById('student-form');
const gameContentDiv = document.getElementById('game-content');
const startGameButton = document.getElementById('start-game-button');
const namaSiswaInput = document.getElementById('namaSiswa');
const kelasInput = document.getElementById('kelas');

let pharmaData = []; // Data soal sekarang akan diisi dari Apps Script
let studentData = {};
let cards = [];
let cardsFlipped = [];
let matchesFound = 0;
let score = 0;

// =================================================================
// 3. FUNGSI UTILITAS
// =================================================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// =================================================================
// 4. PENGAMBILAN SOAL (SISI SISWA)
// =================================================================

// Fungsi: Mengambil data soal dari Apps Script (Metode GET)
function fetchDataSoal() {
    messageElement.textContent = 'Mengambil soal dari server...';
    
    fetch(WEB_APP_URL)
        .then(response => {
             // Pastikan response oke dan tipe konten adalah JSON
             if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                pharmaData = data;
                messageElement.textContent = 'Soal berhasil dimuat! Klik kartu untuk memulai.';
                initGame(); // Inisialisasi Game setelah data dimuat
            } else {
                messageElement.textContent = '❌ Error: Tidak ada soal ditemukan di Spreadsheet. Harap hubungi Admin.';
            }
        })
        .catch(error => {
            messageElement.textContent = '❌ Error koneksi: Gagal mengambil soal. Cek koneksi internet/URL Web App.';
            console.error('Fetch error:', error);
        });
}

// =================================================================
// 5. LOGIKA GAME
// =================================================================

function initGame() {
    if (pharmaData.length === 0) {
        // Jika inisialisasi dipanggil tanpa data, minta data lagi.
        fetchDataSoal();
        return; 
    }
    
    let allItems = [];
    pharmaData.forEach(item => {
        // Buat pasangan kartu untuk Generik dan Dagang
        allItems.push({ name: item.generik, match: item.dagang });
        allItems.push({ name: item.dagang, match: item.generik });
    });

    shuffleArray(allItems);
    cards = allItems;
    
    // Reset kondisi
    gameArea.innerHTML = '';
    cardsFlipped = [];
    matchesFound = 0;
    score = 0;
    scoreBoard.textContent = `Skor: ${score}`;
    messageElement.textContent = '';
    resetButton.style.display = 'none';

    // Render Kartu ke DOM
    cards.forEach((cardData, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.textContent = cardData.name;
        cardElement.dataset.index = index;
        cardElement.dataset.match = cardData.match; 

        cardElement.addEventListener('click', handleCardClick);
        gameArea.appendChild(cardElement);
    });
}

function handleCardClick(event) {
    const clickedCard = event.target;

    if (clickedCard.classList.contains('matched') || clickedCard.classList.contains('selected') || cardsFlipped.length >= 2) {
        return;
    }

    clickedCard.classList.add('selected');
    cardsFlipped.push(clickedCard);

    if (cardsFlipped.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = cardsFlipped;

    const isMatch = (
        card1.textContent === card2.dataset.match &&
        card2.textContent === card1.dataset.match
    );

    if (isMatch) {
        messageElement.textContent = '✅ Cocok! Pasangan Ditemukan.';
        score += 10; // Nilai per match = 10
        scoreBoard.textContent = `Skor: ${score}`;
        
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('selected');
        card2.classList.remove('selected');
        
        matchesFound++;

        if (matchesFound === pharmaData.length) {
            // GAME SELESAI
            messageElement.textContent = `🎉 Selamat! Anda menyelesaikan tantangan dengan skor ${score}. Data Anda sedang dikirim...`;
            resetButton.style.display = 'block';
            
            // PANGGIL FUNGSI KIRIM DATA KE GOOGLE SHEET
            sendScoreToSpreadsheet(studentData.namaSiswa, studentData.kelas, studentData.modul, score);
        }
    } else {
        messageElement.textContent = '❌ Tidak Cocok. Coba lagi!';
        
        setTimeout(() => {
            card1.classList.remove('selected');
            card2.classList.remove('selected');
            messageElement.textContent = '';
        }, 1000);
    }

    cardsFlipped = [];
}

// =================================================================
// 6. LOGIKA FORMULIR SISWA & PENGIRIMAN DATA (SISI SISWA)
// =================================================================

function startGame() {
    const nama = namaSiswaInput.value.trim();
    const kelas = kelasInput.value.trim();

    if (nama === "" || kelas === "") {
        alert("Nama Siswa dan Kelas wajib diisi untuk memulai!");
        return;
    }

    studentData = {
        namaSiswa: nama,
        kelas: kelas,
        modul: "PharmaMatch - Farmasi Klinis"
    };

    studentFormDiv.style.display = 'none';
    gameContentDiv.style.display = 'block';
    
    fetchDataSoal(); // Ambil soal
}

// Fungsi: Mengirim data nilai siswa ke Google Apps Script (Metode POST)
function sendScoreToSpreadsheet(nama, kelas, modul, finalScore) {
    if (WEB_APP_URL === 'GANTI_DENGAN_URL_WEB_APP_ANDA') {
        console.error("URL Web App belum diatur! Data tidak dikirim.");
        return; 
    }
    
    const dataToSend = {
        namaSiswa: nama,
        kelas: kelas,
        modul: modul,
        skorAkhir: finalScore
    };

    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(() => {
        console.log("Pengiriman data ke spreadsheet berhasil (mode no-cors)");
        messageElement.textContent = `✅ Skor ${finalScore} berhasil tercatat di Spreadsheet!`;
    })
    .catch(error => {
        console.error('Error saat mengirim data:', error);
        messageElement.textContent = `⚠️ Error! Skor ${finalScore} tidak tercatat. Cek Apps Script.`;
    });
}


// =================================================================
// 7. EVENT LISTENERS
// =================================================================

startGameButton.addEventListener('click', startGame);
resetButton.addEventListener('click', initGame);
