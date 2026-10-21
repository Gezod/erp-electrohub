// Kutipan motivasi harian untuk halaman Beranda.
// Dipisah dari index.vue supaya gampang ditambah tanpa menyentuh markup.
export const QUOTES = [
  { text: 'Kerja baik hari ini adalah fondasi hasil besar esok hari.', author: 'ElectroHub' },
  { text: 'Konsistensi kecil setiap hari mengalahkan usaha besar yang jarang dilakukan.', author: 'Anonim' },
  { text: 'Tim yang hebat dibangun dari individu yang saling percaya dan saling bantu.', author: 'Anonim' },
  { text: 'Selesaikan yang penting dulu, baru yang mendesak.', author: 'Stephen Covey' },
  { text: 'Detail kecil yang dikerjakan dengan rapi menghasilkan kepercayaan besar.', author: 'Anonim' },
  { text: 'Semangat pagi ini menentukan produktivitas sepanjang hari.', author: 'Anonim' },
  { text: 'Bukan seberapa cepat, tapi seberapa konsisten kita melangkah.', author: 'Anonim' },
  { text: 'Kualitas bukan kebetulan, ia selalu hasil dari niat yang jelas.', author: 'John Ruskin' },
  { text: 'Satu langkah kecil hari ini, satu pencapaian besar di akhir tahun.', author: 'Anonim' },
  { text: 'Kerja tim yang solid membuat pekerjaan berat terasa ringan.', author: 'Anonim' },
];

export function getQuoteOfDay(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return QUOTES[dayIndex % QUOTES.length];
}

export function getRandomQuote(excludeText) {
  const pool = excludeText ? QUOTES.filter((q) => q.text !== excludeText) : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
