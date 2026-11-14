export type Scene = {
  id: string;
  /** Screenshot in public/. Absent = full-bleed quote/statement card. */
  img?: string;
  kicker: string;
  title: string;
  /** Narration. Plain text — the neural voice handles prosody from punctuation. */
  vo: string;
  /** edge-tts voice preset, see VOICES. Defaults to the narrator. */
  voice?: keyof typeof VOICES;
  /** Layout accent: which side the phone sits on, and the transition direction. */
  flip?: boolean;
};

export const VOICES = {
  /** Warm male narrator. */
  narrator: { name: "id-ID-ArdiNeural", rate: "+3%", pitch: "-2Hz" },
  /** Older woman, slower and lower. */
  imas: { name: "id-ID-GadisNeural", rate: "-12%", pitch: "-30Hz" },
  /** Tired man, lower and flatter. */
  dadang: { name: "id-ID-ArdiNeural", rate: "-5%", pitch: "-18Hz" },
  /** Younger woman, quicker and brighter. */
  rina: { name: "id-ID-GadisNeural", rate: "+8%", pitch: "+18Hz" },
};

export const scenes: Scene[] = [
  {
    id: "01",
    kicker: "Imas, 52 — Garut",
    title: "“Jam lima pagi saya sudah antre.\nJam sebelas, loketnya tutup.”",
    vo: "Jam lima pagi, saya sudah antre. Jam sebelas... loketnya tutup.",
    voice: "imas",
  },
  {
    id: "02",
    kicker: "Dadang, 41 — Bekasi",
    title: "“Bolak-balik tiga kali.\nSelalu ada satu berkas yang kurang.”",
    vo: "Bolak-balik, tiga kali. Dan selalu ada satu berkas yang kurang.",
    voice: "dadang",
  },
  {
    id: "03",
    kicker: "Rina, 29 — Karawang",
    title: "“Jalan depan rumah rusak dua tahun.\nMau lapor, tidak tahu ke siapa.”",
    vo: "Jalan depan rumah saya rusak dua tahun. Mau lapor, tapi ke siapa?",
    voice: "rina",
  },
  {
    id: "04",
    kicker: "Akar masalahnya",
    title: "Layanannya ada.\nAksesnya yang tidak ada.",
    vo: "Keluhannya beda-beda, penyebabnya satu. Layanannya ada. Yang tidak ada, aksesnya.",
  },
  {
    id: "05",
    img: "Beranda.png",
    kicker: "Jabarin",
    title: "Satu aplikasi untuk layanan\npublik Jawa Barat.",
    vo: "Jadi kami bereskan dari sisi aksesnya. Namanya Jabarin.",
  },
  {
    id: "06",
    img: "Beranda (1).png",
    kicker: "Beranda",
    title: "Yang warga butuh,\nada di layar pertama.",
    vo: "Begitu dibuka, yang paling sering dibutuhkan langsung kelihatan. Tanpa menu bertingkat.",
    flip: true,
  },
  {
    id: "07",
    img: "Layanan.png",
    kicker: "Katalog layanan",
    title: "Semua loket,\ndalam satu daftar.",
    vo: "Semua layanan ada di satu daftar yang bisa dicari. Tidak perlu hafal nama dinas.",
  },
  {
    id: "08",
    img: "Profil IKD.png",
    kicker: "Identitas Digital",
    title: "Identitas resmi,\nselalu di kantong.",
    vo: "Identitas kependudukan digital tersimpan di sini. Tidak ada lagi fotokopi yang hilang.",
    flip: true,
  },
  {
    id: "09",
    img: "KTP Elektronik Digital.png",
    kicker: "KTP Digital",
    title: "KTP elektronik\nyang bisa diverifikasi.",
    vo: "KTP elektroniknya bisa ditunjukkan, dan diverifikasi petugas di tempat.",
  },
  {
    id: "10",
    img: "Kartu Keluarga Digital.png",
    kicker: "Kartu Keluarga",
    title: "Satu keluarga,\nsatu tarikan data.",
    vo: "Kartu keluarga ikut terbawa. Untuk urusan sekolah atau bantuan sosial, datanya sudah siap.",
    flip: true,
  },
  {
    id: "11",
    img: "Profil IKD · NIK terlihat.png",
    kicker: "Privasi",
    title: "NIK tertutup\nsampai warga membukanya.",
    vo: "Soal privasi, NIK disamarkan secara bawaan. Terbuka hanya kalau warga sendiri menekannya.",
  },
  {
    id: "12",
    img: "Kesehatan & BPJS.png",
    kicker: "Kesehatan",
    title: "Status BPJS,\ntanpa menebak.",
    vo: "Status BPJS bisa dilihat kapan saja. Bukan baru tahu saat sudah di depan pendaftaran.",
    flip: true,
  },
  {
    id: "13",
    img: "Detail BPJS.png",
    kicker: "Detail kepesertaan",
    title: "Kelas, iuran,\nfaskes terdaftar.",
    vo: "Detailnya lengkap. Kelas perawatan, status iuran, dan faskes tempat warga terdaftar.",
  },
  {
    id: "14",
    img: "KIS.png",
    kicker: "Kartu Indonesia Sehat",
    title: "Kartu sehat digital,\nsiap ditunjukkan.",
    vo: "Kartu Indonesia Sehat versi digital, siap ditunjukkan di loket.",
    flip: true,
  },
  {
    id: "15",
    img: "Antrean.png",
    kicker: "Antrean daring",
    title: "Antre dari rumah,\ndatang saat dipanggil.",
    vo: "Dan ini, untuk Bu Imas. Antreannya diambil dari rumah. Datang mendekati waktu dipanggil.",
  },
  {
    id: "16",
    img: "Menu asisten.png",
    kicker: "Asisten",
    title: "Tidak tahu harus mulai\ndari mana? Tanya saja.",
    vo: "Kalau masih bingung harus mulai dari mana, tinggal tanya.",
    flip: true,
  },
  {
    id: "17",
    img: "Asisten AI.png",
    kicker: "Bahasa warga",
    title: "Pakai bahasa sehari-hari,\nbukan bahasa birokrasi.",
    vo: "Asistennya mengerti bahasa sehari-hari. Tidak perlu diterjemahkan jadi istilah birokrasi.",
  },
  {
    id: "18",
    img: "Jawaban AI.png",
    kicker: "Jawaban",
    title: "Syarat, biaya,\nlangkah berikutnya.",
    vo: "Jawabannya langsung ke inti. Syaratnya apa, biayanya berapa, langkah berikutnya ke mana.",
    flip: true,
  },
  {
    id: "19",
    img: "Dasar jawaban.png",
    kicker: "Dapat ditelusuri",
    title: "Setiap jawaban\nmenyebut dasarnya.",
    vo: "Dan setiap jawaban menunjukkan dasar aturannya. Bukan sekadar percaya pada mesin.",
  },
  {
    id: "20",
    img: "Buat laporan.png",
    kicker: "Pengaduan",
    title: "Foto, titik lokasi,\nkirim.",
    vo: "Sekarang, jalan rusaknya Rina. Potret, tandai lokasi, kirim. Tiga langkah.",
    flip: true,
  },
  {
    id: "21",
    img: "Laporan terkirim.png",
    kicker: "Bukti lapor",
    title: "Ada nomor laporan,\nada bukti.",
    vo: "Laporan yang masuk dapat nomor. Jadi ada bukti bahwa aduannya tercatat.",
  },
  {
    id: "22",
    img: "Detail laporan.png",
    kicker: "Transparansi",
    title: "Laporan tidak hilang\ndi meja siapa pun.",
    vo: "Statusnya bisa diikuti sampai selesai. Tidak lagi hilang di meja siapa pun.",
    flip: true,
  },
  {
    id: "23",
    img: "Peta laporan.png",
    kicker: "Peta",
    title: "Masalah wilayah,\nterlihat sebagai pola.",
    vo: "Di peta, aduan yang menumpuk terlihat sebagai pola. Jadi jelas mana yang didahulukan.",
  },
  {
    id: "24",
    img: "Dasbor petugas.png",
    kicker: "Sisi petugas",
    title: "Satu antrean kerja\nuntuk semua aduan.",
    vo: "Di sisi petugas, semuanya masuk ke satu antrean kerja, dengan prioritas yang jelas.",
    flip: true,
  },
  {
    id: "25",
    img: "Tinjau laporan.png",
    kicker: "Verifikasi",
    title: "Ditinjau manusia,\ndibantu sistem.",
    vo: "Setiap laporan tetap ditinjau manusia. Sistemnya hanya membantu menyiapkan data.",
  },
  {
    id: "26",
    img: "Tinjau & teruskan.png",
    kicker: "Penugasan",
    title: "Diteruskan ke dinas\nyang berwenang.",
    vo: "Dari situ, diteruskan ke dinas yang berwenang, lengkap dengan catatan penanganannya.",
    flip: true,
  },
  {
    id: "27",
    img: "Jejak audit.png",
    kicker: "Akuntabilitas",
    title: "Siapa mengakses apa,\ntercatat semua.",
    vo: "Dan semuanya meninggalkan jejak audit. Siapa mengakses data apa, kapan, untuk apa.",
  },
  {
    id: "28",
    img: "Beranda · Teks besar.png",
    kicker: "Aksesibilitas",
    title: "Teks besar untuk\nyang paling butuh.",
    vo: "Ada juga mode teks besar. Karena yang paling sering mengurus layanan publik, justru warga lanjut usia.",
    flip: true,
  },
  {
    id: "29",
    kicker: "Jabarin",
    title: "Hak warga tidak boleh\nberhenti di antrean.",
    vo: "Bu Imas tidak perlu antre dari jam lima pagi. Pak Dadang tidak perlu bolak-balik. Rina tahu harus melapor ke mana. Jabarin. Hak warga tidak boleh berhenti di antrean.",
  },
];
