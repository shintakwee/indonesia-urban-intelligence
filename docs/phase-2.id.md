# Fase 2 — status integrasi geospasial

Cabang ini melanjutkan commit `db62c97` dengan mempertahankan beranda dwibahasa, navigasi, pemilih wilayah, dan desain responsif. **Integrasi data nyata belum selesai.** Belum ada poligon administrasi atau pengamatan penduduk pada data produksi.

## Pemeriksaan sumber dan lisensi (2026-11-02)

| Sumber | Bukti yang diperoleh | Hasil |
| --- | --- | --- |
| BIG, `https://tanahair.indonesia.go.id` | Hasil koneksi proksi | HTTP CONNECT 403; geometri, versi, ketentuan, dan atribusi belum dapat diperiksa. Data BIG tidak didistribusikan ulang. |
| BPS, `https://yogyakarta.bps.go.id` | Hasil koneksi proksi | HTTP CONNECT 403; tabel penduduk dan definisi statistik belum dapat diperiksa. Tidak ada nilai BPS yang disalin. |
| Repositori resmi geoBoundaries di GitHub | Lisensi repositori dan pointer Git LFS v6.0.0 | Identitas sumber, commit rilis, hash objek, dan ukuran dapat ditetapkan. Geometri, metadata khusus dataset, dan kutipan belum tersedia. |
| Unduhan media geoBoundaries | URL media standar yang dipatok | HTTP 403. Importir gagal sebelum mengganti data aplikasi. |
| Git LFS geoBoundaries | Perintah Git LFS smudge standar | `Resource not accessible by integration`. Tidak dilakukan ekstraksi kredensial atau pengelakan kebijakan jaringan. |

Operasi Git hanya-baca menetapkan rilis resmi **v6.0.0** pada commit `1289e40e366c7b320550be1ee0614a9472d572d4`. Target dataset adalah **gbOpen / IDN / ADM2** (kabupaten/kota). Ini adalah rilis yang dipilih, **bukan tahun referensi batas yang sudah diverifikasi**. Tahun referensi dan ID batas khusus dataset belum diketahui sebelum metadata tersedia.

Direktori sumber resmi:
https://github.com/wmgeolab/geoBoundaries/tree/1289e40e366c7b320550be1ee0614a9472d572d4/releaseData/gbOpen/IDN/ADM2

Pointer rilis resmi mencatat:

| Aset | Ukuran (byte) | SHA256 yang diharapkan |
| --- | --- | --- |
| Metadata JSON | 1.049 | `509074e115dcabd5f2a61e525e465af53075c0272f9e0375a031af82d4c78867` |
| GeoJSON sederhana | 9.691.803 | `02244eae72a37d304e68975ff0cabd507881dfa4390cdc7c6738d56ad4274234` |
| Teks kutipan/penggunaan | 4.316 | `f6ea7572bea6036c4cdcacf8c0ca7bf09098d4e600d19546d7432533e9a290d5` |

Hash yang diharapkan mengidentifikasi objek, **bukan bukti bahwa objek sudah diunduh atau diverifikasi**. Salinan pointer tersimpan di `docs/source-evidence/`.

Lisensi repositori yang diperiksa pada commit `8ce2700661a28ee944350e2b329bbabb58d2ff83` adalah CC BY 4.0. Lisensi ini mengizinkan penggunaan komersial dengan kredit yang sesuai, tautan lisensi, keterangan perubahan, tanpa kesan dukungan pemberi lisensi atau pembatasan tambahan. Salinannya ada di `docs/source-evidence/geoboundaries-repository-LICENSE.txt` (SHA256 `c6e6f4f2cc8aa4fe74aa536570af16f0ffafd56c5878822043b4851fb858d1d1`). Bukti tingkat repositori ini **tidak menggantikan** pemeriksaan metadata, sumber asli, dan kutipan khusus dataset. Tidak ada klaim lisensi komersial untuk materi BIG atau BPS yang belum diperiksa.

## Implementasi yang menunggu data terverifikasi

- Sumber GeoJSON MapLibre, lapisan isi/garis poligon, sorotan saat kursor diarahkan, pemilihan lewat klik, tooltip dwibahasa, pembesaran seluruh cakupan Polygon/MultiPolygon, dan kontrol visibilitas batas.
- Penanda referensi dan tombol wilayah yang dapat diakses melalui papan ketik menggunakan jalur pemilihan yang sama. Reset menampilkan seluruh cakupan; Escape menutup mode peta diperluas.
- Aset batas dimuat dari origin aplikasi sendiri, terpisah dari ketersediaan OpenStreetMap. Aset rusak, hilang, atau tanpa asal data ditolak dengan pesan lokal. Kontrol batas pada versi ini dinonaktifkan.
- Skema penduduk memerlukan tiga wilayah berbeda dengan tahun/tanggal/definisi/satuan/versi geografi yang sama, URL HTTPS primer BPS, kutipan tabel, dan referensi berkas bukti. Jumlah penduduk harus bilangan bulat positif dalam jiwa. Nilai kosong tidak diubah menjadi nol.
- Komponen grafik batang responsif dengan titik awal nol dan pengikatan tabel sudah dibuat. Nilai hanya ditampilkan jika seri lengkap lolos validasi. **Belum ada grafik nyata yang ditampilkan atau diverifikasi terhadap data BPS.**
- Registri NDVI/LST menggunakan kontrak tipe terpisah: raster siap harus memiliki URL ubin dan asal pemrosesan; entri rencana tidak dapat memiliki ubin. Keduanya tetap dinonaktifkan. Belum ada pemrosesan raster atau nilai analitis.

## Impor batas yang dapat direproduksi

Memerlukan Node 24+, curl dengan TLS/proksi tepercaya, dan Python dengan dependensi Shapely yang dipatok untuk pemeriksaan topologi:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries
npm run data:validate
npm run typecheck
npm run build
npm test
```

Importir menggunakan HTTPS standar, verifikasi TLS, dan proksi bawaan. Commit resmi dan hash ketiga objek dipatok; lisensi/geografi yang tidak sesuai ditolak. Nama wilayah harus cocok persis dan unik; ID bentuk asli dipertahankan. Cincin dan cakupan koordinat diperiksa, lalu Shapely menolak topologi rusak atau poligon studi tumpang tindih. Geometri tidak diperbaiki atau dikarang. Koordinat sederhana dari sumber tetap utuh. Metadata/kutipan asli disimpan bersama checksum; setelah semua pemeriksaan berhasil, data aplikasi diganti secara atomik. Akurasi hukum/kartografis tetap memerlukan tinjauan independen; topologi yang benar tidak membuktikan batas hukum.

Tahap unduhan sudah dijalankan dan gagal dengan HTTP 403. Jalur unduhan berhasil, pembacaan metadata nyata, dan validasi topologi nyata **belum terverifikasi**. Jalankan kembali setelah akses tersedia. Importir ini belum merupakan akuisisi data yang selesai.

## Persyaratan data penduduk

`src/data/population.json` sengaja berstatus `blocked` dengan daftar kosong. Sebelum mengubahnya menjadi siap:

1. Ambil tabel/publikasi primer BPS yang meliputi ketiga wilayah pada satu tahun referensi dan satu seri statistik, misalnya satu rilis sensus atau versi proyeksi. Catat tanggal referensi, definisi penghitungan, satuan asli, nomor halaman/tabel, URL sumber, tanggal pengambilan, dan versi geografi.
2. Simpan bukti sumber di `docs/source-evidence/` jika ketentuan penggunaan mengizinkan. Verifikasi konversi satuan; ribuan jiwa berbeda dari jiwa. Pastikan kecocokan kode administrasi dan kota/kabupaten, bukan hanya nama yang dapat ambigu.
3. Periksa pengamatan terhadap sumbernya. Skema TypeScript memeriksa kesesuaian, **bukan kebenaran angka yang dimasukkan secara manual**. Jangan campurkan registrasi kependudukan, sensus, dan proyeksi.
4. Isi seluruh atribut pengamatan, jalankan pengujian/build, periksa grafik/tabel nyata, dan perbarui dokumentasi status/sumber dwibahasa. Versi ini belum memiliki adaptor impor BPS yang terverifikasi.

## NDVI dan suhu permukaan lahan mendatang

Lakukan pemrosesan citra di luar peramban. Catat penyedia/ID citra, waktu akuisisi, lisensi, penyaringan awan/QA, versi geometri, nilai tanpa data, skala/offset, waktu pemrosesan, algoritme, dan satuan. NDVI tidak bersatuan dengan rentang yang diharapkan −1 hingga 1. LST harus secara eksplisit mengonversi suhu berskala dari penyedia menjadi °C; LST bukan suhu udara. Proyeksikan ulang ubin tampilan ke Web Mercator, tetapi simpan nilai georeferensi siap analisis secara terpisah untuk statistik zonal. Jangan turunkan nilai ilmiah dari warna ubin. `RasterLayerDefinition` adalah kontrak integrasi; tidak ada citra sintetis atau hasil raster pada aplikasi.

## Validasi dan pekerjaan tersisa

Build produksi, pemeriksaan TypeScript eksplisit, dan validator status data lulus. Delapan pengujian Playwright meliputi perilaku dwibahasa/seluler, tampilan data kosong, penolakan skema, dan interaksi MapLibre. **Pengujian GIS mencegat permintaan batas dengan persegi panjang yang secara eksplisit sintetis pada `tests/fixtures/boundaries.ts`; geometri ini tidak pernah disertakan dalam aplikasi.** Pengujian tersebut memeriksa hubungan antarkomponen, bukan akurasi administrasi nyata. Tidak ada data statistik contoh untuk pengujian atau nilai tiruan pada produksi.

Akses sumber menghalangi poligon dan hasil penduduk nyata. Domain publik yang diperlukan sudah disimpan dalam draf konfigurasi lingkungan. Tinjau/simpan pengaturan tersebut dan publikasikan lingkungan untuk mengaktifkannya; draf tersimpan bukan akses runtime yang sudah diterapkan. Setelah itu, jalankan kembali akuisisi dan verifikasi. Domain lama dan preset pengelola paket tetap dipertahankan. Unduhan batas tidak memerlukan rahasia; kebutuhan API BPS harus ditentukan dari endpoint yang benar-benar dipilih, bukan diasumsikan.
