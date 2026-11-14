package seed

import (
	"log"

	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/jabarin/service/internal/models"
)

// Services memasukkan katalog layanan default sesuai menu di aplikasi mobile.
func Services(db *gorm.DB) error {
	services := []models.Service{
		{
			Slug: "dukcapil", Title: "Dukcapil", Icon: "🪪", Category: "Kependudukan", Order: 1, SLADays: 5,
			Description:  "Layanan e-KTP, Kartu Keluarga, akta kelahiran, serta surat pindah dan domisili.",
			Requirements: datatypes.JSONSlice[string]([]string{"KTP lama atau surat keterangan hilang", "Kartu Keluarga", "Surat pengantar RT/RW"}),
		},
		{
			Slug: "kesehatan", Title: "Kesehatan", Icon: "🏥", Category: "Kesehatan", Order: 2, SLADays: 1,
			Description:  "Pendaftaran Puskesmas, rujukan, dan pengecekan kepesertaan BPJS Kesehatan.",
			Requirements: datatypes.JSONSlice[string]([]string{"KTP", "Kartu BPJS/KIS bila ada"}),
		},
		{
			Slug: "pajak-pbb", Title: "Pajak PBB", Icon: "🏛️", Category: "Pajak", Order: 3, SLADays: 2,
			Description:  "Cek tagihan, pembayaran, dan riwayat Pajak Bumi dan Bangunan.",
			Requirements: datatypes.JSONSlice[string]([]string{"Nomor Objek Pajak (NOP)", "KTP pemilik"}),
		},
		{
			Slug: "lapor", Title: "Lapor!", Icon: "📣", Category: "Aduan", Order: 4, SLADays: 7,
			Description:  "Kanal aduan warga untuk infrastruktur, kebersihan, dan pelayanan publik.",
			Requirements: datatypes.JSONSlice[string]([]string{"Deskripsi kejadian", "Foto lokasi", "Titik lokasi"}),
		},
		{
			Slug: "izin-nib", Title: "Izin NIB", Icon: "📄", Category: "Perizinan", Order: 5, SLADays: 10,
			Description:  "Pengajuan Nomor Induk Berusaha untuk UMKM melalui sistem OSS.",
			Requirements: datatypes.JSONSlice[string]([]string{"NPWP", "KTP pemilik usaha", "Data lokasi usaha"}),
		},
		{
			Slug: "antrean", Title: "Antrean", Icon: "🎟️", Category: "Antrean", Order: 6, SLADays: 1,
			Description:  "Ambil tiket antrean daring untuk layanan tatap muka di kantor pelayanan.",
			Requirements: datatypes.JSONSlice[string]([]string{"KTP", "Pilih lokasi dan jadwal kunjungan"}),
		},
		{
			Slug: "bansos", Title: "Bansos", Icon: "🤝", Category: "Sosial", Order: 7, SLADays: 14,
			Description:  "Pengecekan status penerima dan pengajuan bantuan sosial.",
			Requirements: datatypes.JSONSlice[string]([]string{"Kartu Keluarga", "Surat keterangan tidak mampu"}),
		},
		{
			Slug: "profil-ikd", Title: "Profil IKD", Icon: "🔐", Category: "Identitas", Order: 8, SLADays: 1,
			Description:  "Aktivasi dan pengelolaan Identitas Kependudukan Digital.",
			Requirements: datatypes.JSONSlice[string]([]string{"NIK terdaftar", "Email aktif", "Verifikasi wajah"}),
		},
	}

	// Slug menjadi kunci idempoten agar seeding aman dijalankan berulang.
	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "slug"}},
		DoUpdates: clause.AssignmentColumns([]string{"title", "icon", "category", "description", "requirements", "sla_days", "order", "updated_at"}),
	}).Create(&services).Error
	if err != nil {
		return err
	}

	log.Printf("seed: %d layanan tersinkron", len(services))
	return nil
}
