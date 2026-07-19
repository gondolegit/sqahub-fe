
# LAMPIRAN X: SPESIFIKASI APPLICATION PROGRAMMING INTERFACE (API)

## 1. API Eksekusi Uji Test Suite (POST /api/v1/testsuite/run)

### A. Spesifikasi Umum Endpoint
*   **Nama Endpoint:** API Run Test Suite
*   **URL / Path:** `/api/v1/testsuite/run`
*   **HTTP Method:** `POST`
*   **Format Data:** `JSON (Application/JSON)`
*   **Keamanan / Autentikasi:** Diperlukan (`Bearer Token JWT`)

### B. Spesifikasi Parameter Request Header
| Key | Value | Deskripsi |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Menentukan format payload kiriman berupa JSON. |
| `Authorization` | `Bearer <JWT_Token>` | Token akses JWT pengguna untuk validasi hak akses keamanan sistem. |

### C. Spesifikasi Parameter Request Body
Berikut adalah struktur parameter data yang dikirimkan oleh klien (*frontend* atau *automation agent*) menuju server:

| Nama Field | Tipe Data | Sifat | Validasi / Batasan Kriptik | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `projectId` | Long | **Mandatory** | `NotNull` | ID referensi dari entitas proyek yang sedang diuji. |
| `name` | String | **Mandatory** | `NotNull`, Max 255 char | Nama penanda eksekusi uji *test suite*. |
| `description` | String | *Optional* | `TEXT` | Deskripsi atau catatan tambahan mengenai eksekusi. |
| `tag` | String | *Optional* | Max 255 char | Label/tag pengelompokan uji (e.g., Smoke, Regresi). |
| `testStage` | String | **Mandatory** | `NotNull`, Max 50 char | Tahapan uji yang berjalan (e.g., `SIT`, `UAT`). |
| `testEnvironment` | String | **Mandatory** | `NotNull`, Max 100 char | Identitas environment/URL server target pengujian. |
| `executionType` | String | **Mandatory** | `NotNull`, Max 50 char | Metode eksekusi pengujian (`Manual` / `Automated`). |
| `hostname` | String | *Optional* | Max 255 char | Nama mesin/node agent yang menjalankan *testing*. |
| `os` | String | *Optional* | Max 100 char | Sistem operasi lingkungan uji (e.g., `Windows 11`). |
| `version` | String | *Optional* | Max 50 char | Versi produk atau build skrip yang sedang diuji. |
| `browser` | String | *Optional* | Max 100 char | Varian browser jika uji berupa web-based UI testing. |
| `statusTotalPassed` | Integer | **Mandatory** | `NotNull`, Default 0 | Total akumulasi skenario yang berhasil (`PASS`). |
| `statusTotalFailed` | Integer | **Mandatory** | `NotNull`, Default 0 | Total akumulasi skenario yang gagal (`FAIL`). |
| `statusTotalError` | Integer | **Mandatory** | `NotNull`, Default 0 | Total akumulasi skenario yang mengalami galat sistem. |
| `statusTotalSkipped`| Integer | **Mandatory** | `NotNull`, Default 0 | Total akumulasi skenario uji yang dilewati. |
| `startDate` | LocalDateTime | **Mandatory** | `NotNull`, ISO 8601 | Waktu jam mulai eksekusi *test suite*. |
| `endDate` | LocalDateTime | *Optional* | ISO 8601 | Waktu jam berakhirnya eksekusi *test suite*. |
| `elapsedTime` | Long | **Mandatory** | `NotNull`, Satuan ms | Total durasi pengerjaan dalam mili-detik. |
| `runDetails` | Array of Object | **Mandatory** | `NotEmpty` | Kumpulan rincian hasil uji tiap *test case*. |

#### Rincian Parameter Object di dalam `runDetails` (Request):
| Nama Field | Tipe Data | Sifat | Validasi / Batasan | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `idTestCase` | Long | **Mandatory** | `NotNull` | ID referensi rancangan skenario *test case*. |
| `status` | String | **Mandatory** | `NotNull`, Max 50 char | Hasil akhir kasus (`PASSED`, `FAILED`, `ERROR`, `SKIPPED`). |
| `actualResult` | String | *Optional* | `TEXT` | Hasil fakta riil yang ditemui di environment. |
| `remarks` | String | *Optional* | `TEXT` | Log eror, *stack trace*, atau alasan *fail/skipped*. |
| `startDate` | LocalDateTime | **Mandatory** | `NotNull`, ISO 8601 | Waktu penanda mulai uji *test case* ini. |
| `endDate` | LocalDateTime | *Optional* | ISO 8601 | Waktu penanda selesai uji *test case* ini. |
| `elapsedTime` | Integer | **Mandatory** | `NotNull`, Satuan ms | Durasi pengerjaan kasus uji dalam mili-detik. |

---

### D. Struktur Spesifikasi Response (HTTP Status 201 - Created)
Berikut merupakan skema objek balikan data transfer (DTO) yang dikirim kembali ke klien setelah data sukses tersimpan di database secara permanen:

| Nama Field | Tipe Data | Keterangan Status Kehadiran | Deskripsi Komponen Data |
| :--- | :--- | :--- | :--- |
| `id` | Long | *Selalu Ada* | ID Unik database (*Primary Key*) entitas `TestSuite`. |
| `projectId` | Long | *Selalu Ada* | ID proyek terkait yang terdaftar. |
| `projectName` | String | *Selalu Ada* | Nama proyek (diambil relasional via *join table*). |
| `name` | String | *Selalu Ada* | Nama penanda eksekusi *test suite*. |
| `description` | String | *Dapat Bernilai Null* | Catatan deskripsi pengujian. |
| `tag` | String | *Dapat Bernilai Null* | Tag pengelompokan pengujian. |
| `testStage` | String | *Selalu Ada* | Tahapan siklus pengujian. |
| `testEnvironment` | String | *Selalu Ada* | Nama lingkungan uji target. |
| `executionType` | String | *Selalu Ada* | Tipe pengujian (Manual / Automation). |
| `hostname` | String | *Dapat Bernilai Null* | Hostname mesin pengeksekusi. |
| `os` | String | *Dapat Bernilai Null* | Sistem operasi mesin pengeksekusi. |
| `version` | String | *Dapat Bernilai Null* | Versi rilis build sistem. |
| `browser` | String | *Dapat Bernilai Null* | Informasi agen browser. |
| `statusTotalPassed` | Integer | *Selalu Ada* | Rekap total item berstatus sukses. |
| `statusTotalFailed` | Integer | *Selalu Ada* | Rekap total item berstatus gagal. |
| `statusTotalError` | Integer | *Selalu Ada* | Rekap total item berstatus galat. |
| `statusTotalSkipped`| Integer | *Selalu Ada* | Rekap total item berstatus dilewati. |
| `startDate` | LocalDateTime | *Selalu Ada* | Waktu cap awal eksekusi. |
| `endDate` | LocalDateTime | *Dapat Bernilai Null* | Waktu cap akhir eksekusi. |
| `elapsedTime` | Long | *Selalu Ada* | Akumulasi waktu proses (ms). |
| `executedById` | Long | *Selalu Ada* | ID User pengeksekusi (didapat dari Token JWT). |
| `executedByUsername`| String | *Selalu Ada* | Nama akun/Username pengguna yang mengeksekusi. |
| `createdById` | Long | *Selalu Ada* | ID Pembuat definisi *test suite*. |
| `createdByUsername` | String | *Selalu Ada* | Nama akun/Username pembuat *test suite*. |
| `createdAt` | LocalDateTime | *Selalu Ada* | Tanggal rekam data dibuat (`PrePersist`). |
| `updatedAt` | LocalDateTime | *Selalu Ada* | Tanggal rekam data diperbarui (`PreUpdate`). |
| `runDetails` | Array of Object | *Selalu Ada (Min. Isi 1)* | Array rincian laporan per baris *test case*. |

#### Rincian Parameter Object di dalam `runDetails` (Response):
| Nama Field | Tipe Data | Keterangan Status Kehadiran | Deskripsi Komponen Data |
| :--- | :--- | :--- | :--- |
| `id` | Long | *Selalu Ada* | ID Unik data rincian eksekusi (*Primary Key* detail). |
| `idTestSuite` | Long | *Selalu Ada* | ID Relasi *Foreign Key* ke entitas parent `TestSuite`. |
| `idTestCase` | Long | *Selalu Ada* | ID entitas acuan *test case*. |
| `testCaseName` | String | *Selalu Ada* | Judul teks rancangan kasus uji yang ditarik otomatis. |
| `status` | String | *Selalu Ada* | Status final hasil pengujian per baris. |
| `actualResult` | String | *Dapat Bernilai Null* | Deskripsi realita hasil uji di sistem. |
| `remarks` | String | *Dapat Bernilai Null* | Informasi tambahan log / catatan eror. |
| `startDate` | LocalDateTime | *Selalu Ada* | Waktu mulai pengujian skenario terkait. |
| `endDate` | LocalDateTime | *Dapat Bernilai Null* | Waktu selesai pengujian skenario terkait. |
| `elapsedTime` | Integer | *Selalu Ada* | Durasi waktu pemrosesan skenario (ms). |
| `executedById` | Long | *Selalu Ada* | ID aktor pengeksekusi skenario uji ini. |
| `executedByUsername`| String | *Selalu Ada* | Username aktor pengeksekusi skenario uji ini. |