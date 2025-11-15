// ... (kode game yang sudah ada) ...

// **Tambahkan di sini:**
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyKvsPux8V1ue-yoNCcm4byRO6dU5k7Fmt9cYs28fWSgUTs7DVztIiK3qqjAUEnrdY7/exec'; // PASTE URL dari Apps Script di sini!

const studentFormDiv = document.getElementById('student-form');
const gameContentDiv = document.getElementById('game-content');
const startGameButton = document.getElementById('start-game-button');
const namaSiswaInput = document.getElementById('namaSiswa');
const kelasInput = document.getElementById('kelas');

let studentData = {}; // Objek untuk menyimpan data siswa
// ... (lanjutkan kode game yang sudah ada) ...

// Fungsi untuk memulai game setelah data siswa diinput
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
        modul: "PharmaMatch - Farmasi Klinis" // Tentukan nama modul
    };

    studentFormDiv.style.display = 'none';
    gameContentDiv.style.display = 'block';
    
    initGame(); // Panggil inisialisasi game yang sudah ada
}

startGameButton.addEventListener('click', startGame);

// ... (lanjutkan kode game yang sudah ada) ...

// ... di dalam fungsi checkMatch()

if (matchesFound === pharmaData.length) {
    // Game Selesai
    messageElement.textContent = `🎉 Selamat! Anda menyelesaikan tantangan dengan skor ${score}. Data Anda sedang dikirim...`;
    resetButton.style.display = 'block';
    
    // **PANGGIL FUNGSI KIRIM DATA**
    sendScoreToSpreadsheet(studentData.namaSiswa, studentData.kelas, studentData.modul, score);
}

// ...

/**
 * Mengirim data nilai siswa ke Google Apps Script (WebHook)
 * @param {string} nama - Nama Siswa
 * @param {string} kelas - Kelas Siswa
 * @param {string} modul - Nama Modul Game
 * @param {number} finalScore - Skor Akhir Game
 */
function sendScoreToSpreadsheet(nama, kelas, modul, finalScore) {
    const dataToSend = {
        namaSiswa: nama,
        kelas: kelas,
        modul: modul,
        skorAkhir: finalScore
    };

    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk Apps Script sebagai WebHook sederhana
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        // Karena mode 'no-cors', response mungkin tidak bisa dibaca, 
        // tapi kita bisa asumsikan pengiriman berhasil jika tidak ada error jaringan
        console.log("Pengiriman data ke spreadsheet berhasil (mode no-cors)");
        messageElement.textContent = `🎉 Selesai! Skor ${finalScore} tercatat!`;
    })
    .catch(error => {
        console.error('Error saat mengirim data:', error);
        messageElement.textContent = `⚠️ Error! Skor ${finalScore} tidak tercatat. Coba lagi atau hubungi admin.`;
    });
}
