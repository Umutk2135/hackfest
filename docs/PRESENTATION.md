# Kürsü — Sunum Rehberi & Slayt Üretim Brief'i

> **Amaç:** Bu dosyayı bir slayt üretim AI'ına (Gamma, Beautiful.ai, ChatGPT, Claude, vb.) yükleyerek **5 dakikalık hackathon pitch** slaytlarını üretmek.  
> **Ürün:** Kürsü — canlı ders platformu + çok-ajanlı AI öğretim asistanı.  
> **Dil:** Türkçe (UI ve demo Türkçe; teknik terimler İngilizce kalabilir).  
> **Süre:** 5 dk sunum + 3 dk soru-cevap.

---

## AI slayt üreticisi için talimatlar

Aşağıdaki brief'i kullanarak slayt seti üret:

| Parametre | Değer |
|-----------|--------|
| Slayt sayısı | **10–12** (6 ana bölüm + kapak + yedek mimari + kapanış) |
| Stil | Sıcak kağıt tonu (#faf8f4), lacivert yapı (#3d5a80), terracotta vurgu (#c17f59), canlı yeşil (#3d8f72); serif başlık (Fraunces), sans gövde (DM Sans) |
| Yoğunluk | Slayt başına **en fazla 1 ana mesaj**, 3–5 madde, büyük font |
| Görseller | Mimari için tek blok diyagram; demo için ekran görüntüsü placeholder'ları |
| Dil | Türkçe |
| Format önerisi | **Slayt + Canlı Demo** (aşağıda gerekçe) |

Her slayt için üret: **başlık**, **madde listesi**, **konuşmacı notu (30–45 sn)**, **görsel önerisi**.

---

## Önerilen sunum formatı

**Seçim: Slayt + Canlı Demo** (en güvenli; teknik mimari + çalışan ürün birlikte)

| Zaman | Bölüm | Ortam |
|-------|--------|--------|
| 0:00–0:45 | Hook & Problem | Slayt |
| 0:45–1:30 | Çözüm & Değer | Slayt |
| 1:30–2:15 | Farklılık & AI Gerekçesi | Slayt |
| 2:15–3:15 | Teknik Yaklaşım | Slayt + diyagram |
| 3:15–4:30 | Canlı Demo | Uygulama paylaşımı |
| 4:30–5:00 | Kapanış & Etki | Slayt |

**Prova uyarısı:** Ortalama takım %30 daha uzun sürer — kronometreyle prova edin.

---

## Takım & demo rolleri (sahne)

| Kişi | Rol | Ne zaman konuşur / ne yapar |
|------|-----|------------------------------|
| P4 | Öğretmen laptop + açılış/kapanış | 0:00–0:30, 0:30–1:15, 2:00–2:30, 4:30–5:00 |
| P1 | Öğrenci laptop | 1:15–2:00 (canlı demo) |
| P3 | Mimari kapanış | 2:30–3:00 (slayt) veya demo sonrası kısa teknik |
| P2 | Safety net | Yedek video, hotspot, önceden cache'lenmiş soru |

---

# BÖLÜM 1 — Hook & Problem (0:00 – 0:45)

## Slayt 1: Kapak

**Başlık:** Kürsü  
**Alt başlık:** Derse kulak veren AI öğretim asistanı  

**Konuşmacı notu:**  
"Merhaba, biz [takım]. Kürsü ile çevrim içi ve hibrit derslerde kaybolan iki şeyi geri getiriyoruz: anlık öğrenci sorusu ve öğretmene dönük pedagojik geri bildirim."

**Görsel:** Sade logo / kürsü (podium) silüeti, sıcak kağıt arka plan.

---

## Slayt 2: Problem

**Başlık:** Ders sırasında ne kayboluyor?

**Maddeler:**
- Öğrenci soruyu soramıyor veya geç soruyor → an **kayboluyor**
- Öğretmen "kim anlamadı?"yı **gerçek zamanlı** göremiyor
- Ders bitince **yapılandırılmış geri bildirim** yok — sadece genel his

**Somut senaryo (sözlü, slaytta kısa):**  
*"Dr. Ayşe, 80 kişilik Zoom'da Ridge regresyon anlatıyor. Chat'te 12 soru birikiyor; üçü aynı konuda. Ayşe yarısını görüyor, yarısı kayboluyor. Ders bitince 'anlaşıldı mı?' sorusuna kimse cevap vermiyor."*

**Hedef sorular (cevaplanmış):**
- Hangi problem? → Canlı derste **eşzamanlı Q&A + ölçülebilir öğretmen geri bildirimi** eksikliği
- Kim etkileniyor? → Üniversite öğretmenleri + öğrenciler (hibrit/online ML, istatistik, mühendislik dersleri)
- Neden şimdi? → Hibrit eğitim kalıcı; ChatGPT **ders bağlamını** ve **kaynak doğrulamayı** tek başına çözmüyor

**ODAK:** Tek öğretmen, tek ders, tek an.  
**KAÇININ:** "Milyonlarca öğrenci", "eğitim sistemi çöküyor" gibi soyut iddialar.

---

# BÖLÜM 2 — Çözüm & Değer (0:45 – 1:30)

## Slayt 3: Çözüm (tek cümle)

**Başlık:** Kürsü ne yapar?

**Ana cümle (büyük punto):**  
> Öğretmen konuşur; Kürsü dinler, öğrenci sorularını **ders notu + canlı transkript** üzerinden **kaynaklı** yanıtlar, ders sonunda öğretmene **pedagojik rapor** üretir.

**3 değer sütunu:**

| Öğretmen | Öğrenci | Kurum |
|----------|---------|--------|
| Mikrofon → otomatik transkript | Oturum kodu ile katıl, anında sor | Tek deploy, gizlilik dostu (ses sunucuya gitmez) |
| Şüpheli sorular panele düşer | Cevaplar `[Not]` ve `[Ders]` ile kanıtlı | Ders sonu netlik/tempo/etkileşim skoru |

**Hedef sorular:**
- Ne yapıyor? → Yukarıdaki tek cümle
- Nasıl çözüyor? → (1) Canlı transkript + RAG, (2) Çok-ajanlı pipeline, (3) Otomatik feedback raporu
- Somut değer? → Öğrenci 30 sn içinde kaynaklı cevap; öğretmen hangi kavramın hızlı geçtiğini görür

**ODAK:** Kazanım (zaman, güven, içgörü), özellik listesi değil.  
**KAÇININ:** "İleride mobil app, LMS entegrasyonu…" (roadmap bu slaytta yok).

---

# BÖLÜM 3 — Farklılık & AI Gerekçesi (1:30 – 2:15)

## Slayt 4: Biz vs. alternatifler

**Başlık:** Neden Kürsü?

| | Genel chatbot (ChatGPT vb.) | LMS quiz / anket | **Kürsü** |
|--|---------------------------|------------------|-----------|
| Ders bağlamı | Manuel kopyala-yapıştır | Yok / sınırlı | Otomatik not + transkript RAG |
| Canlı ders | Hayır | Hayır | Evet (transkript akışı) |
| Kaynak gösterimi | Halüsinasyon riski | N/A | Zorunlu citation + sunucu doğrulama |
| Öğretmen geri bildirimi | Yok | Anket, gecikmeli | Yapılandırılmış pedagojik rapor |
| Ses gizliliği | Dosya yükleme | — | Ses tarayıcıda; sunucuya ses yok |

**AI neden zorunlu?**
- **Router:** Soruyu sınıflandırır (RAG / canlı transkript / öğretmene yönlendir / kapsam dışı)
- **Retrieval:** 1024 boyutlu embedding ile not + transkriptten top-K
- **Answer:** Bağlama sadık, araç kullanarak ek arama yapabilen cevap
- **Flagger:** Düşük güven → öğretmen paneline eskalasyon
- **Feedback:** Ders sonu Opus ile yapılandırılmış rapor

**AI olmasa?** Basit anahtar kelime araması transkriptte cevap veremez; pedagojik özet üretemez. AI burada **sınıflandırma + sentez + kalite kontrol** için şart.

**ODAK:** Tek slaytta karşılaştırma matrisi.  
**KAÇININ:** "İlk ve tek" iddiası.

---

# BÖLÜM 4 — Teknik Yaklaşım (2:15 – 3:15)

## Slayt 5: Mimari (tek diyagram)

**Başlık:** Sistem nasıl çalışıyor?

**Diyagram (AI'dan iste: soldan sağa blok diyagram):**

```
[Öğretmen tarayıcı]
  Web Speech API (tr-TR) → metin segmentleri (~3 sn)
        ↓ POST
[Netlify Functions] ←→ [Neon Postgres + pgvector HNSW]
        ↓ debounced
[Background: Voyage voyage-3-large embed] → transcript_chunks

[Öğrenci] soru → SSE ← [question-ask]
        ↓
  Router (Sonnet 4.6) → Retrieval (cosine top-K)
        ↓
  Answer (Opus 4.7, search_more_context tool) → citation validate
        ↓
  Flagger (Sonnet 4.6) → öğretmen paneli (gerekirse)

[Ders bitişi] → Background Feedback (Opus 4.7) → rapor JSON
```

**Stack özeti (küçük punto):**
- **Frontend:** React 18, Vite, Tailwind v4, SSE tüketimi
- **Backend:** Netlify Functions + Background Functions (15 dk limit)
- **DB:** Netlify DB (Neon) + pgvector 1024d
- **Modeller:** Claude Opus 4.7 (Answer, Feedback), Sonnet 4.6 (Router, Flagger)
- **Embedding:** Voyage `voyage-3-large`

**Kritik mühendislik kararı + trade-off:**

| Karar | Neden | Trade-off |
|-------|--------|-----------|
| Ses tarayıcıda, sunucuya değil | Gizlilik, maliyet, latency | Konuşma tanıma kalitesi tarayıcıya bağlı |
| pgvector tek DB'de | Tek deploy, demo'da <50ms recall | Çok büyük ölçekte ayrı vector DB gerekebilir |
| Çok-ajan | Maliyet (ucuz model routing), modüler prompt | Orchestration karmaşıklığı |
| Citation chunk_id doğrulama | Halüsinasyon azaltma | Cevap bazen kısa kalır |

**PRO İPUCU:** Bu slayt 60 sn'den uzun sürmesin — diyagram + bir cümle trade-off yeter.

**KAÇININ:** Kullanılmayan teknoloji listesi.

---

## Slayt 6: Çok-ajan pipeline (opsiyonel, zaman varsa)

**Başlık:** Beş ajan, tek orchestrator

1. **Router** — Soru tipi  
2. **Retrieval** — Not + transkript vektör arama  
3. **Answer** — Kaynaklı yanıt (+ ek arama aracı)  
4. **Flagger** — Öğretmen eskalasyonu  
5. **Feedback** — Ders sonu rapor  

**Konuşmacı notu:** "Her ajanın küçük, test edilebilir prompt'u var; pahalı modeli sadece cevap ve raporda kullanıyoruz."

---

# BÖLÜM 5 — Canlı Demo (3:15 – 4:30)

## Demo hazırlık checklist (slayt veya konuşmacı kartı)

- [ ] Öğretmen laptop: `/teacher` veya seed'li `KRSU-DEMO` açık
- [ ] Öğrenci laptop: `/student` hazır, kod kopyalandı
- [ ] 2 sayfalık Ridge PDF veya yapıştırılmış not metni hazır
- [ ] Mikrofon izni önceden verildi (veya yedek video)
- [ ] Yedek video 30 sn içinde oynatılabilir (P2)
- [ ] İnternet / hotspot test edildi
- [ ] Mock modda ise: amber banner bekleniyor — jüriye "demo ortamı" de

**Demo senaryosu:** Ridge Regresyon dersi (Makine Öğrenmesi)

### Adım A — Öğretmen (≈45 sn) · P4

| # | Ekran | Aksiyon | Söylenecek (örnek) |
|---|--------|---------|---------------------|
| 1 | `/teacher` → Yeni Ders | Başlık: **Ridge Regresyon Nedir?**, Konu: **Makine Öğrenmesi** | "Öğretmen iki dakikada dersi açıyor." |
| 2 | Not yükleme | **Dosya yükle** veya metin yapıştır → chunk sayısı görünsün | "Notlar vektörleştiriliyor — öğrenci sorusu buna dayanacak." |
| 3 | Canlı oturum | **Canlı oturumu başlat** → oturum kodu görünsün | "Kod: KRSU-… — öğrenciler bu kodla katılıyor." |
| 4 | Mikrofon | ~20–30 sn hazır script oku (λ, bias-variance) | "Transkript tarayıcıda; ses sunucuya gitmiyor." |

**Hazır öğretmen scripti (kısa):**  
*"Ridge regresyon, L2 cezasıyla katsayıları küçültür. Lambda büyüdükçe model basitleşir: bias artar, variance düşer. Çok büyük lambda underfitting yapar."*

### Adım B — Öğrenci (≈45 sn) · P1

| # | Ekran | Aksiyon | Söylenecek (örnek) |
|---|--------|---------|---------------------|
| 1 | `/student` | Kod + isim **Zeynep** → Katıl | "Öğrenci telefonundan katılıyor." |
| 2 | Canlı görünüm | Transkript akıyor (polling) | "Ders metni öğrenciye de canlı geliyor." |
| 3 | Soru kutusu | **`Lambda büyürse modele ne olur?`** | "Klasik soru — her ML dersinde gelir." |
| 4 | Cevap | Agent chip'leri → SSE stream → **`[Not: sayfa 2]`** + **`[Ders: 03:42]`** | "Cevap kaynaklı; tıklayınca alıntı görünüyor." |
| 5 | Citation tıkla | Toast / snippet | "Halüsinasyonu sunucu chunk_id ile kesiyoruz." |

### Adım C — Kapanış demo (≈30 sn) · P4

| # | Ekran | Aksiyon | Söylenecek |
|---|--------|---------|------------|
| 1 | Öğretmen canlı | **Oturumu sonlandır** | "Ders bitti." |
| 2 | `/feedback` | 3 skor halkası + rushed concepts + öneriler | "Öğretmene: 'Ridge vs Lasso'u hızlı geçtin' diyor — somut pedagoji." |

**Yedek planlar (P2):**

| Sorun | Aksiyon |
|--------|---------|
| Mikrofon 10 sn sessiz | Yedek video A (transkript replay) |
| SSE 5 sn takılır | Önceden cache'lenmiş soru sayfası |
| Feedback >40 sn | Önceden seed'li `KRSU-DEMO` feedback sayfasına git |

---

# BÖLÜM 6 — Kapanış & Etki (4:30 – 5:00)

## Slayt 7: Etki & yol haritası (kısa)

**Başlık:** Sırada ne var?

**Pilot (1 cümle):**  
Bir üniversite ML/istatistik bölümünde 2–3 hibrit ders, gerçek öğretmen + 30 öğrenci, 4 hafta.

**Benimseme:**  
Öğretmen: 5 dk kurulum (not yükle + kod paylaş). Öğrenci: kod + isim. Kurum: Netlify tek tık deploy.

**Ölçek cümlesi (opsiyonel):**  
"Ayşe'nin 80 kişilik dersinde chat kaosu yerine, her soru kaynaklı cevap ve ders sonu rapor."

---

## Slayt 8: Kapanış (tek cümle)

**Başlık:** Kürsü

**Büyük kapanış cümlesi (slaytta tek satır):**  
> **"Kürsü: Derste sorulan her soru kaybolmaz; öğretmen ders bitince neyin işe yaradığını görür."**

**Konuşmacı notu:** Açılıştaki Dr. Ayşe senaryosuna dön: *"Ayşe artık 12 soruyu kaybetmiyor — hangisinin notta, hangisinin derste geçtiğini görüyor."* — Teşekkür **maksimum 5 sn**.

**KAÇININ:** 30 sn teşekkür konuşması.

---

# Ek slaytlar (isteğe bağlı / yedek)

## Slayt 9: Güven & gizlilik

- Ses **asla** sunucuya yüklenmez (Web Speech API)
- API anahtarları yalnızca sunucu tarafında
- Citation'lar retrieve edilen `chunk_id` kümesiyle doğrulanır
- Hackathon MVP: auth yok; production'da kurum SSO

## Slayt 10: Takım

| İsim | Rol | Katkı |
|------|-----|--------|
| … | P1 Frontend | React UI, SSE, mock demo |
| … | P2 Backend | Netlify functions, DB, pgvector |
| … | P3 AI | 5-agent pipeline, prompts |
| … | P4 DevOps | Deploy, demo script, pitch |

---

# Soru-cevap hazırlığı (3 dk)

| Olası soru | Kısa cevap |
|------------|------------|
| Neden çok ajan? | Maliyet (Sonnet routing), hız, modüler test |
| Hallüsinasyon? | Zorunlu citation + sunucuda chunk_id doğrulama |
| Neden pgvector? | Tek deploy; HNSW demo verisinde hızlı |
| Neden ses yüklemiyorsunuz? | Gizlilik + maliyet + latency |
| ChatGPT yetmez mi? | Ders bağlamı + canlı transkript + öğretmen raporu yok |
| Ölçek? | MVP sınıf ölçeği; vector DB ayrıştırma ileride |
| Türkçe? | tr-TR speech + Türkçe UI; model çok dilli |

---

# Alternatif sunum formatları (referans)

Hackathon rehberindeki üç format — Kürsü için öneri **Slayt + Canlı Demo** (yukarıda). Kısa notlar:

### Ürün üzerinden anlatım
- Güçlü UI/UX demo için uygun; **en az 30 sn mimari** ayırın.
- Risk: Teknik derinlik ve internet aksaklığı.

### Hikâye odaklı (case study)
- "Zeynep, ML finaline hazırlanıyor…" ile açılış; sosyal etki kategorisinde güçlü.
- Risk: Persona yapay hissedilirse güven kaybı — gerçek ders senaryosuna bağlayın.

---

# Slayt üretimi için özet tablo (kopyala-yapıştır)

| # | Süre | Slayt başlığı | Ana mesaj |
|---|------|---------------|-----------|
| 1 | 0:00 | Kürsü — Kapak | Marka + tagline |
| 2 | 0:15 | Problem | Canlı derste Q&A ve geri bildirim kaybı |
| 3 | 0:45 | Çözüm | Tek cümle + 3 değer |
| 4 | 1:30 | Farklılık | Matris + AI gerekçesi |
| 5 | 2:15 | Mimari | Tek diyagram + trade-off |
| 6 | 2:45 | (Opsiyonel) Ajanlar | 5 ajan pipeline |
| 7 | 3:15 | — | **CANLI DEMO** (slayt yok) |
| 8 | 4:30 | Etki | Pilot + benimseme |
| 9 | 4:50 | Kapanış | Tek cümle + Ayşe'ye dönüş |
| 10 | Yedek | Q&A / Güven / Takım | İsteğe bağlı |

---

# Demo veri referansı (geliştirici)

| Alan | Değer |
|------|--------|
| Demo ders | Ridge Regresyon Nedir? |
| Konu | Makine Öğrenmesi |
| Oturum kodu (mock) | `KRSU-DEMO` |
| Örnek öğrenci | Zeynep |
| Örnek soru | Lambda büyürse modele ne olur? |
| Beklenen citation | `[Not: sayfa 2]`, `[Ders: 03:42]` |
| Mock geliştirme | `npm run dev:vite` → localhost:5173 |

---

# Son kontrol listesi (sunum günü)

- [ ] 5 dk prova × 3 (kronometre)
- [ ] Slayt PDF + yedek USB
- [ ] Demo URL / localhost + hotspot
- [ ] Yedek video (30 sn)
- [ ] Öğretmen + öğrenci laptop şarjlı
- [ ] Oturum kodu ekranda büyük punto
- [ ] Kapanış cümlesi ezberde

---

*Bu dosya `docs/demo-script.md`, `docs/architecture.md`, `README.md` ve `src/FE-MOCK.md` ile uyumludur. Slayt görsel dili için `src/DESIGN.md` token'larına bakın.*
