// Data Soal Farmasi (Generik vs Dagang)
const pharmaData = [
    { generik: "Paracetamol", dagang: "Feverin" },
    { generik: "Amoxicillin", dagang: "Moxilex" },
    { generik: "Captopril", dagang: "Tensicap" },
    { generik: "Ibuprofen", dagang: "Proris" },
    // Anda bisa menambahkan lebih banyak data di sini
];

const gameArea = document.getElementById('game-area');
const scoreBoard = document.getElementById('score-board');
const resetButton = document.getElementById('reset-button');
const messageElement = document.getElementById('message');

let cards = [];
let cardsFlipped = [];
let matchesFound = 0;
let score = 0;

// Fungsi untuk mengacak array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Fungsi untuk Inisialisasi Game
function initGame() {
    // Gabungkan Generik dan Dagang menjadi satu array
    let allItems = [];
    pharmaData.forEach(item => {
        allItems.push({ name: item.generik, type: 'generik', match: item.dagang });
        allItems.push({ name: item.dagang, type: 'dagang', match: item.generik });
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
        cardElement.dataset.index = index; // Menyimpan index di array
        cardElement.dataset.type = cardData.type; // Menyimpan tipe (generik/dagang)
        cardElement.dataset.match = cardData.match; // Menyimpan pasangan yang benar

        cardElement.addEventListener('click', handleCardClick);
        gameArea.appendChild(cardElement);
    });
}

// Fungsi ketika Kartu di-klik
function handleCardClick(event) {
    const clickedCard = event.target;

    // Abaikan jika kartu sudah match atau sudah dipilih
    if (clickedCard.classList.contains('matched') || clickedCard.classList.contains('selected') || cardsFlipped.length >= 2) {
        return;
    }

    clickedCard.classList.add('selected');
    cardsFlipped.push(clickedCard);

    if (cardsFlipped.length === 2) {
        // Cek kecocokan
        checkMatch();
    }
}

// Fungsi Cek Kecocokan Kartu
function checkMatch() {
    const [card1, card2] = cardsFlipped;

    // Syarat match: Nama kartu 1 cocok dengan match kartu 2, DAN sebaliknya
    const isMatch = (
        card1.textContent === card2.dataset.match &&
        card2.textContent === card1.dataset.match
    );

    if (isMatch) {
        // Match Benar
        messageElement.textContent = '✅ Cocok! Pasangan Ditemukan.';
        score += 10;
        scoreBoard.textContent = `Skor: ${score}`;
        
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('selected');
        card2.classList.remove('selected');
        
        matchesFound++;

        if (matchesFound === pharmaData.length) {
            // Game Selesai
            messageElement.textContent = `🎉 Selamat! Anda menyelesaikan tantangan dengan skor ${score}.`;
            resetButton.style.display = 'block';
        }
    } else {
        // Match Salah
        messageElement.textContent = '❌ Tidak Cocok. Coba lagi!';
        
        // Kembalikan kartu setelah 1 detik
        setTimeout(() => {
            card1.classList.remove('selected');
            card2.classList.remove('selected');
            messageElement.textContent = '';
        }, 1000);
    }

    // Reset kartu yang dipilih
    cardsFlipped = [];
}

// Event Listener untuk tombol reset
resetButton.addEventListener('click', initGame);

// Mulai Game saat halaman dimuat
initGame();
