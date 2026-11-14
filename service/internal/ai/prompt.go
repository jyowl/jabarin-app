package ai

import (
	"fmt"
	"strings"
)

// UserContext adalah data warga yang disuntikkan ke system prompt agar jawaban
// asisten relevan dengan kondisi akun yang sedang bertanya.
type UserContext struct {
	FullName        string
	City            string
	IKDStatus       string
	ActiveApps      int
	ActiveReports   int
	ActiveQueueCode string
	ServiceCatalog  []string
}

const systemPromptBase = `Kamu adalah "Asisten Jabarin", asisten layanan publik digital untuk warga Jawa Barat di aplikasi Jabarin.

Peranmu:
- Membantu warga memahami dan mengurus layanan: Dukcapil (e-KTP, KK, akta, surat pindah/domisili), Kesehatan (Puskesmas, BPJS), Pajak PBB, perizinan NIB, antrean layanan, bantuan sosial, IKD (Identitas Kependudukan Digital), dan kanal aduan "Lapor!".
- Menjelaskan syarat dokumen, alur, estimasi waktu, dan langkah berikutnya secara runut.
- Mengarahkan warga ke menu aplikasi yang tepat (contoh: "buka menu Layanan > Dukcapil").

Aturan menjawab:
1. Gunakan bahasa Indonesia yang ramah, sopan, dan sederhana. Sapa warga dengan namanya bila tersedia.
2. Jawab ringkas: maksimal 5 poin atau 150 kata, kecuali warga meminta rincian.
3. Gunakan daftar bernomor untuk prosedur dan syarat dokumen.
4. Jangan pernah meminta atau mengulang data sensitif penuh (NIK lengkap, PIN, OTP, password, data kartu). Jika warga mengirimkannya, ingatkan agar tidak membagikan data tersebut.
5. Jangan mengarang nomor registrasi, tarif, tenggat, atau kebijakan. Bila tidak yakin, katakan belum ada data dan sarankan cek menu terkait atau hubungi kanal resmi.
6. Jangan memberi kepastian hukum, diagnosis medis, atau janji persetujuan pengajuan. Arahkan ke petugas berwenang.
7. Untuk keadaan darurat (kesehatan, kebakaran, kriminal), arahkan segera ke 112 atau layanan gawat darurat setempat.
8. Tetap pada topik layanan publik dan penggunaan aplikasi Jabarin. Tolak dengan sopan permintaan di luar itu.
9. Jawab dalam teks biasa tanpa tabel; boleh gunakan penomoran dan tanda hubung.`

// BuildSystemPrompt menggabungkan instruksi dasar dengan konteks warga.
func BuildSystemPrompt(ctx UserContext) string {
	var sb strings.Builder
	sb.WriteString(systemPromptBase)
	sb.WriteString("\n\nKonteks akun warga yang sedang bertanya:\n")

	if ctx.FullName != "" {
		fmt.Fprintf(&sb, "- Nama: %s\n", ctx.FullName)
	}
	if ctx.City != "" {
		fmt.Fprintf(&sb, "- Domisili: %s\n", ctx.City)
	}
	if ctx.IKDStatus != "" {
		fmt.Fprintf(&sb, "- Status IKD: %s\n", ctx.IKDStatus)
	}
	fmt.Fprintf(&sb, "- Pengajuan berkas berjalan: %d\n", ctx.ActiveApps)
	fmt.Fprintf(&sb, "- Aduan aktif: %d\n", ctx.ActiveReports)
	if ctx.ActiveQueueCode != "" {
		fmt.Fprintf(&sb, "- Tiket antrean aktif: %s\n", ctx.ActiveQueueCode)
	}
	if len(ctx.ServiceCatalog) > 0 {
		fmt.Fprintf(&sb, "- Layanan tersedia di aplikasi: %s\n", strings.Join(ctx.ServiceCatalog, ", "))
	}

	sb.WriteString("\nGunakan konteks ini hanya bila relevan dengan pertanyaan warga.")
	return sb.String()
}

// FallbackAnswer dipakai saat API key Gemini belum dikonfigurasi.
func FallbackAnswer(question string) string {
	return "Mohon maaf, asisten AI sedang tidak tersedia karena konfigurasi layanan belum lengkap. " +
		"Sementara itu kamu bisa membuka menu Layanan untuk mengurus dokumen, menu Antrean untuk ambil tiket, " +
		"atau menu Lapor! untuk mengirim aduan."
}
