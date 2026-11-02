# Fase 2 — penduduk SP2020 dan geometri administrasi yang masih diperlukan

Pekerjaan tetap pada `feature/geospatial-integration`; commit `d888569` dan desain dwibahasa dipertahankan. **Geometri tiga wilayah nyata yang diunggah dan perbandingan penduduk SP2020 sudah diintegrasikan untuk tinjauan cabang fitur. Validasi geometri/antarmuka lulus; verifikasi snapshot sumber dan atribusi asli belum lengkap.**

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

## Validasi geometri unggahan nyata

Berkas asli tersimpan tanpa perubahan byte pada `docs/source-evidence/uploaded/iui-yogyakarta-boundaries.geojson` (**25.850 byte**).

SHA256: `ba842977bb78f645c1d05a05132a90a0fbfd9a258ba652c6560a89ffd36ff12c`.

Aplikasi menambahkan ID fitur IUI, nama tampilan, dan `sourceShapeId`; properti sumber serta seluruh nilai koordinat dipertahankan. Tidak ada perbaikan, proyeksi ulang, penyederhanaan, atau pembulatan.

| Nama administrasi asli | ID bentuk asli | Geometri | Titik termasuk penutupan |
| --- | --- | --- | ---: |
| Kota Yogyakarta | `22746128B9761158776103` | Polygon | 77 |
| Sleman | `22746128B68764842139539` | Polygon | 263 |
| Bantul | `22746128B15956982783625` | Polygon | 316 |

Semua fitur menyatakan `shapeGroup=IDN`, `shapeType=ADM2`, dan ID berawalan `22746128`. Ini memverifikasi **kesesuaian internal dengan ID batas yang diberikan, `IDN-ADM2-22746128`**. Identitas yang tercantum pada berkas tidak membuktikan secara independen bahwa koordinat sama dengan unduhan sumber tertentu. Metadata API asli, commit repositori, tanggal pengambilan sumber, kutipan, dan pemberitahuan lisensi tidak disertakan. Nilai yang tidak diketahui tidak dikarang.

Berkas tidak memiliki anggota `crs` eksplisit. Sesuai RFC 7946, koordinat diinterpretasikan sebagai bujur/lintang WGS84 (OGC:CRS84). Koordinat 2D berhingga, rentang wilayah Yogyakarta yang masuk akal, urutan sumbu, penutupan cincin, dan arah cincin luar/lubang diperiksa. Cakupan koleksi sekitar 110,204–110,547° BT dan 8,028–7,542° LS. Hasilnya konsisten dengan interpretasi tersebut, tetapi bukan konfirmasi independen CRS asli penyedia. CRS proyeksi atau deklarasi ambigu ditolak.

Shapely **2.1.2** memeriksa berkas nyata: semua poligon valid, tidak kosong, berluas planar positif, dan memuat penanda referensi wilayah terkait. Setiap pasangan memiliki luas tumpang tindih interior nol dan segmen batas bersama. Gabungannya adalah Polygon yang valid. Perhitungan derajat planar hanya dipakai untuk topologi; **luas kilometer persegi dan kepadatan penduduk tidak diturunkan**. Laporan lengkap serta titik interior pengujian tersimpan pada `docs/source-evidence/uploaded/validation-report.json`.

## Sumber, versi, atribusi, dan penggunaan komersial

Sumber dataset yang dinyatakan: **geoBoundaries gbOpen, Indonesia / IDN ADM2**.
https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM2/

Identitas versi yang diberikan: **`IDN-ADM2-22746128`**. Baris indeks metadata resmi yang kini berhasil diambil secara independen mengonfirmasi `boundaryYearRepresented=2020` dan **CC BY 3.0 IGO**:
https://creativecommons.org/licenses/by/3.0/igo/

Peta menampilkan ID/tahun, tautan lisensi, serta kredit geoBoundaries gbOpen dan subset unggahan. Subset dengan geometri/identitas tervalidasi dibedakan dari berkas sumber asli yang sudah ditinjau. Commit sumber, tanggal pengambilan primer, serta hash metadata/kutipan/lisensi yang belum ada ditulis sebagai `null`. Tanggal `2026-11-02` adalah penerimaan unggahan, bukan pengambilan dari penyedia.

CC BY 3.0 IGO mengizinkan penggunaan komersial dengan mengikuti ketentuannya, termasuk kredit pencipta/sumber yang berlaku, rujukan lisensi, pemberitahuan asli, dan keterangan perubahan/adaptasi; tidak menyiratkan dukungan organisasi. **Pemberitahuan atribusi asli dan pengecualian pihak ketiga belum diberikan**, sehingga tinjauan publikasi komersial lengkap masih tertunda. Lisensi repositori CC BY 4.0 tidak menggantikan CC BY 3.0 IGO khusus dataset ini. Data GADM/FAO GAUL tidak digunakan.

Kredit pengembangan menyebut geoBoundaries gbOpen, ID dataset, subset dari pengguna, tahun/lisensi yang dilaporkan, serta atribusi asli yang belum lengkap. Kredit sementara ini **tidak menyatakan seluruh kewajiban lisensi asli sudah dipastikan**. Keterbatasan sumber tampil dalam kedua bahasa. Validasi rilis publik sengaja menolak status tertunda; tidak ada penggabungan atau penerapan ke publik.

Untuk menyelesaikan asal data, berikan **tanggapan API asli untuk `IDN-ADM2-22746128`**, **`CITATION-AND-USE-geoBoundaries.txt` dan pemberitahuan sumber** dari snapshot yang sama, **teks hukum CC BY 3.0 IGO**, serta **catatan unduhan/ekspor yang dapat ditelusuri** (URL/revisi/hash geometri asli, atau geometri sumber untuk perbandingan subset secara persis). Berkas tiga wilayah sudah disimpan dan tidak perlu diunggah ulang. Tidak dilakukan pengulangan permintaan ke sumber yang diblokir.

## Reproduksi pemeriksaan berkas nyata

Node 24+ menjalankan aplikasi/validasi struktur. Python dengan Shapely yang dipatok diperlukan untuk topologi:

```sh
python3 -m venv /tmp/iui-gis-venv
/tmp/iui-gis-venv/bin/pip install -r scripts/requirements-geospatial.txt
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:boundaries:upload
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:validate
npm run typecheck
npm run build
npm test
```

`data:boundaries:upload` hanya mengimpor berkas tiga wilayah yang hash-nya sudah ditetapkan. Pemeriksaan topologi diulang; asal unggahan dan laporan dicatat sebelum aset peta diperbarui. `data:validate` memeriksa hash sumber/bukti, kesamaan mendalam koordinat/properti asli yang dinormalisasi dengan koleksi aplikasi, identitas/CRS/cincin, serta laporan Shapely yang dihitung ulang. Angka SP2020 tetap diperiksa terhadap bukti tinjauannya.

```sh
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:validate:release
```

Perintah rilis sudah dijalankan dan **berakhir nonnol sesuai harapan**, karena atribusi/snapshot sumber asli belum diverifikasi. Ini terpisah dari validator pengembangan dan pengujian peramban yang lulus. `status: ready` berarti data siap dirender untuk pengembangan; `publicationStatus: pending-upstream-attribution` bukan tinjauan sumber/publikasi yang selesai.

Importir `data:boundaries` untuk paket berkas asli lengkap tetap tersedia. Mode `reviewed-originals` masih mensyaratkan metadata asli, kutipan/pemberitahuan lisensi, receipt dan identitas sumber; mode subset unggahan tidak mengarang berkas tersebut atau melonggarkan jalur asli.

## Pengujian peramban dengan data aktual

Seluruh **16 pengujian lulus**, termasuk navigasi dwibahasa, angka penduduk, lebar seluler, penolakan data rusak, dan kasus tepi sintetis. Empat pengujian baru memakai berkas unggahan yang benar-benar disimpan/disajikan aplikasi:

- Hash SHA256, nama/ID bentuk persis, koordinat/properti tanpa perubahan, serta laporan topologi.
- Penolakan nama wilayah keliru, EPSG:3857, ID dataset berubah, dan koordinat di luar cakupan.
- Pengambilan aset batas produksi tanpa penggantian data. Titik interior dari poligon nyata dipakai untuk sorotan, klik/pemilihan, dan pembesaran **ketiga wilayah**; hasil kanvas dibandingkan, cakupan terpilih diperiksa, bahasa tooltip diganti, serta visibilitas/lisensi/pesan tinjauan sumber diuji.
- Poligon nyata pada seluler, mode diperluas/Escape, serta perbandingan SP2020 yang tetap utuh.

Tangkapan yang ditinjau pada `test-results/real-boundary-map.png` memperlihatkan geometri tiga wilayah nyata yang dirender MapLibre. Ubin peta eksternal sengaja diblokir selama pengujian untuk membuktikan poligon lokal tidak bergantung pada ubin daring. Geometri sintetis tidak menggantikan aset produksi pada pengujian berkas nyata ini.

## Lapisan mendatang dan keterbatasan

NDVI/LST tetap berupa rencana dengan kontrol nonaktif. Citra mendatang memerlukan tanggal akuisisi, lisensi asli, penyaringan awan/QA, satuan, skala/offset, konvensi tanpa data, dan pemrosesan yang dapat direproduksi. NDVI tidak bersatuan; LST harus memakai satuan suhu eksplisit dan bukan suhu udara. Warna tampilan bukan pengamatan ilmiah.

Validator kini melaporkan **tiga poligon unggahan dan tiga pengamatan penduduk**. Keterbatasan tersisa: kesamaan snapshot asli dan tinjauan atribusi/lisensi lengkap, konfirmasi CRS asli secara independen, bukti halaman/ketentuan BPS, rekonsiliasi geografi sensus/batas, serta akses peta dasar daring. NDVI/LST, kepadatan, dan statistik turunan lain belum tersedia. Tetap gunakan cabang fitur; pemeriksaan pengembangan tidak mengizinkan penggabungan ke main atau rilis publik.

## Persiapan penerapan

API masih tidak dapat diakses, tetapi CSV repositori resmi menyediakan metadata primer dengan ID yang persis. Sumbernya adalah BPS–Statistics Indonesia, World Food Programme, dan OCHA ROAP. Bukti disimpan dan ditinjau pada [dokumentasi asal data](geoboundaries-provenance.md). Pemberitahuan sumber lengkap serta perbandingan geometri asli masih diperlukan. Paket pratinjau privat tanpa poligon sudah disiapkan untuk situs Hostinger PHP/HTML terpisah; lihat [petunjuk Hostinger](deployment-hostinger.md). Tidak ada penerapan publik atau penggabungan yang dilakukan.
