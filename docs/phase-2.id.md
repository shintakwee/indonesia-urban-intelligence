# Fase 2 — penduduk SP2020 dan geometri administrasi yang masih diperlukan

Pekerjaan tetap pada `feature/geospatial-integration`; commit `d888569` dan desain dwibahasa dipertahankan. **Perbandingan penduduk sudah diintegrasikan; geometri administrasi nyata belum tersedia.**

## Sumber penduduk, definisi, dan verifikasi

Sumber primer: **Badan Pusat Statistik (BPS), Sensus Penduduk 2020 (SP2020)**.
https://sensus.bps.go.id/topik/tabular/sp2020/1/15/0

| Wilayah pelaporan sensus | Penduduk September 2020 (jiwa) |
| --- | ---: |
| Kota Yogyakarta | 373.589 |
| Kabupaten Sleman | 1.125.804 |
| Kabupaten Bantul | 985.770 |

Pengguna menyediakan angka-angka persis ini sebagai hasil verifikasi tinjauan penelitian independen. Jalur akuisisi/verifikasi yang digunakan aplikasi adalah tinjauan tersebut. Pada 2026-11-02 URL BPS yang disediakan menghasilkan CONNECT 403 dari proksi; tidak ada klaim bahwa tabel primer sudah diunduh. Transkripsi bukti tersimpan pada `docs/source-evidence/bps-sp2020-independent-review.json` dan secara eksplisit diberi label bukti tinjauan dari pengguna, bukan salinan HTML/PDF/CSV BPS.

Ketiga pengamatan menggunakan URL sumber, seri jumlah penduduk sensus SP2020, tahun, bulan, dan satuan yang sama. Ketelitian waktu adalah **September 2020 (`2020-09`)**; tanggal harian tidak diberikan dan tidak dikarang. `recordedAt` adalah tanggal pencatatan tinjauan, bukan tanggal pengambilan sumber primer. Angka ini bersifat historis, bukan estimasi terkini atau registrasi kependudukan. Geografi pelaporan BPS belum direkonsiliasi secara spasial dengan geoBoundaries. Kepadatan, statistik zonal, dan indikator lingkungan belum tersedia.

Grafik memakai dua pengamatan nyata yang dipilih, format angka sesuai bahasa, titik awal nol, dan skala bersama dengan maksimum sebesar jumlah penduduk terbesar yang dipilih. Tabel menggunakan nilai serta periode yang sama. Tautan sumber dan keterbatasan verifikasi ditampilkan di dekat grafik. BPS tetap dicantumkan sebagai sumber. Ketentuan penggunaan/redistribusi BPS terperinci belum diberikan atau diambil; **tidak ada klaim lisensi Creative Commons atau izin komersial menyeluruh atas materi BPS**. Lisensi batas tidak boleh diterapkan ke statistik. Ekspor tabel primer dan pemberitahuan penggunaan BPS dapat diunggah kemudian untuk memperkuat bukti.

## Identitas batas dan koreksi lisensi

Endpoint metadata primer yang ditinjau secara independen:
https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/

Tinjauan melaporkan:

- Negara/tingkat: **IDN / ADM2**.
- `boundaryYearRepresented`: **2020**.
- `boundaryLicense`: **CC BY 3.0 IGO**.
- Lisensi: https://creativecommons.org/licenses/by/3.0/igo/

Ini adalah informasi khusus dataset. **Jangan memberi label CC BY 4.0 pada dataset Indonesia ini.** Lisensi tingkat repositori dan pointer Git LFS v6 yang diperiksa sebelumnya tidak menetapkan identitas/lisensi dataset API ini. Salinan historis tetap disimpan di `docs/source-evidence/` untuk audit; importir baru tidak lagi memakai hash lama atau mengasumsikan rilis v6. Tinjauan field metadata disimpan terpisah pada `geoboundaries-idn-adm2-independent-review.json`; berkas tersebut bukan tanggapan API asli.

CC BY 3.0 IGO mengizinkan penggunaan komersial dengan mematuhi ketentuan sebenarnya: kredit sumber/pencipta yang sesuai, rujukan/tautan lisensi, pemberitahuan sumber yang dipertahankan, dan keterangan perubahan/adaptasi. Lisensi ini tidak mengizinkan kesan dukungan atau penggunaan identitas/logo organisasi tanpa batas. Pengecualian pihak ketiga pada metadata/kutipan juga harus diperiksa. Kredit sumber asli tidak dapat direkonstruksi tanpa metadata dan kutipan asli; karena itu **belum ada geometri yang didistribusikan ulang**. Batas GADM atau FAO GAUL tidak digunakan.

URL metadata tersebut juga menghasilkan CONNECT 403 pada satu percobaan dalam kelanjutan ini. Unduhan terblokir tidak diulang dan tidak dicari dataset alternatif.

## Paket unggahan persis yang diperlukan

Unggah ZIP berisi **berkas asli** berikut dan bukti penerimaan yang sudah ditinjau. Geometri sederhana dipilih agar ukuran unggahan lebih kecil dan harus berasal dari tanggapan API/snapshot yang sama.

| Nama berkas | Asal/persyaratan |
| --- | --- |
| `geoBoundaries-IDN-ADM2-api.json` | Simpan JSON tanggapan API di atas secara lengkap tanpa penyuntingan. Harus memuat ID dataset, ISO/tingkat, tahun representasi, lisensi, sumber batas asli, dan tautan unduhan. Ringkasan yang ditulis ulang tidak cukup. |
| `geoBoundaries-IDN-ADM2_simplified.geojson` | Unduh **berkas persis dari `simplifiedGeometryGeoJSON` pada tanggapan tersebut**, dengan seluruh fitur ADM2 Indonesia, properti, ID bentuk, dan koordinat WGS84. Jangan ganti rilis atau menggambar batas manual. |
| `CITATION-AND-USE-geoBoundaries.txt` | Ambil dari direktori dataset dan snapshot repositori geoBoundaries yang sama dengan geometri. Pertahankan semua kredit/pemberitahuan asli. |
| `CC-BY-3.0-IGO-legalcode.html` | Simpan teks hukum lengkap yang berlaku dari https://creativecommons.org/licenses/by/3.0/igo/legalcode . Sertakan pula pemberitahuan khusus dataset yang dirujuk metadata/kutipan di dalam arsip. |
| `source-receipt.json` | Catat URL/waktu unduhan sebenarnya, SHA256, commit repositori lengkap yang diverifikasi secara eksternal, atribusi persis, serta hasil tinjauan penggunaan komersial dan pemberitahuan pihak ketiga. |

Receipt adalah catatan tinjauan, bukan tanda tangan digital penyedia. Hitung SHA256 dari byte berkas yang benar-benar diunduh; jangan mengisi nilai yang tidak diketahui dengan angka rekaan. Jika URL metadata memakai commit pendek, verifikasi commit lengkap dari repositori resmi dan catat hasilnya. Commit lengkap harus cocok dengan awalan revisi pada URL asli.

Struktur `source-receipt.json` tersedia lengkap pada [dokumentasi bahasa Inggris](phase-2.en.md). Isilah seluruh field berikut berdasarkan bukti, bukan perkiraan:

- `metadataUrl`: endpoint API di atas; `geometryUrl`: nilai asli `simplifiedGeometryGeoJSON`.
- `sourceCommit`: commit penuh 40 karakter; `boundaryID`: ID asli dari tanggapan.
- `retrievedAt`: tanggal pengambilan sebenarnya (`YYYY-MM-DD`).
- `license`: `CC-BY-3.0-IGO`; `licenseUrl`: `https://creativecommons.org/licenses/by/3.0/igo/`.
- `attribution`: kredit geoBoundaries dan sumber asli yang telah diperiksa, termasuk `boundarySource` persis.
- `reviewedForCommercialReuse` dan `thirdPartyNoticesReviewed`: `true` **hanya setelah** seluruh pemberitahuan dan ketentuan memang diperiksa.
- `sha256.metadata`, `sha256.geometry`, `sha256.citation`, `sha256.license`: hash berkas asli.

Jangan menyunting geometri agar lolos validasi. Lisensi tidak didukung, tahun/identitas tidak cocok, wilayah ambigu, geometri rusak, atau pemberitahuan bertentangan harus menghentikan impor untuk ditinjau.

## Impor luring dan validasi

Setelah berkas tersedia, ekstrak di luar checkout dan pertahankan arsip asli untuk audit. Dependensi topologi opsional diisolasi pada lingkungan virtual:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries -- /absolute/path/to/upload-directory
npm run typecheck
npm run data:validate
npm run build
npm test
```

`data:boundaries` kini **sepenuhnya luring**. Tanpa direktori masukan, perintah berhenti dengan daftar berkas dan tidak meminta akses jaringan. Pemeriksaan mencakup identitas API IDN ADM2 tahun 2020, CC BY 3.0 IGO, revisi unduhan resmi yang ditautkan metadata, hash/atribusi receipt, identitas/jumlah fitur sumber, kecocokan wilayah unik, penutupan cincin, dan cakupan geografis. Shapely kemudian memeriksa topologi valid, geometri tidak kosong, dan tidak ada tumpang tindih poligon studi. Geometri disubset tanpa perubahan koordinat dan ID asli dipertahankan. Metadata, kutipan, lisensi, receipt, dan audit geometri disimpan sebelum aset batas diganti secara atomik.

Pemeriksaan tersebut memeriksa struktur/topologi dan rantai bukti yang disediakan; bukan verifikasi sumber jarak jauh yang independen atau pengesahan hukum/kartografis. Kepercayaan pada receipt hash berasal dari tinjauan independen. Jalur impor berkas nyata serta topologi berhasil **belum dijalankan** karena geometri asli belum diberikan. Setelah impor, periksa ketiga cakupan dan perbarui status batas dwibahasa sebelum publikasi. Tahun yang sama tidak membuktikan kesetaraan geografi sensus dan batas.

Sorotan kursor MapLibre, pemilihan klik/papan ketik, tooltip dwibahasa, pembesaran cakupan, kontrol visibilitas, dan tampilan lisensi/atribusi sudah tersedia. Pengujiannya hanya menggunakan geometri sintetis melalui pencegatan permintaan. **Tidak ada poligon sintetis yang disertakan sebagai batas administrasi nyata.**

## Lapisan mendatang dan keterbatasan

NDVI/LST tetap berupa rencana dengan kontrol nonaktif. Citra mendatang memerlukan tanggal akuisisi, lisensi asli, penyaringan awan/QA, satuan, skala/offset, konvensi tanpa data, dan pemrosesan yang dapat direproduksi. NDVI tidak bersatuan; LST harus memakai satuan suhu eksplisit dan bukan suhu udara. Warna tampilan bukan pengamatan ilmiah.

Pemeriksaan saat ini meliputi jumlah penduduk nyata yang disediakan, kesesuaian dengan bukti, ketelitian bulan, penolakan definisi/geografi tidak selaras, grafik dwibahasa beserta nama aksesibelnya, proporsi batang, tautan sumber/lisensi, lebar seluler, navigasi lama, dan interaksi GIS sintetis. Validator melaporkan **tiga pengamatan penduduk dan nol poligon nyata**. Pekerjaan tersisa adalah paket batas asli, validasi/tinjauan visual geometri nyata, rekonsiliasi geografi sensus/batas, serta bukti tabel dan ketentuan penggunaan BPS. Jangan gabungkan ke main tanpa persetujuan.
