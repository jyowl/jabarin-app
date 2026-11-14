export const exampleQuestion = 'Bagaimana cara cek status BPJS?';

// shortcut: hanya pertanyaan contoh yang memiliki jawaban, ganti dengan layanan AI saat tersedia.
export function hasExampleAnswer(question: string) {
  return question.trim().toLocaleLowerCase('id-ID') === exampleQuestion.toLocaleLowerCase('id-ID');
}

export function exampleTime(date: Date, now = new Date()) {
  const day = date.toDateString() === now.toDateString() ? 'Hari ini' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${day} · ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}
