/**
 * OWNER: P3 (AI)
 * Smoke test: verify the recursive splitter on synthetic Turkish text +
 * synthetic multi-page "PDF-like" text (with \f separators, which is what
 * pdf-parse emits between pages).
 *
 * No DB, no LLM, no network. Run with:  npm run smoke:chunking
 *
 * Optionally pass a real PDF path as the first argv to also test pdf-parse:
 *   npx tsx --env-file=.env.local scripts/smoke-chunking.ts ./path/to/lecture.pdf
 */
import { readFileSync, existsSync } from 'node:fs';
import { chunkText, chunkPdfText } from '../agents/chunking';

// Long Turkish ML paragraph — long enough to force several splits.
const TR_PARAGRAPH = `
Ridge regresyonu, doğrusal regresyonun aşırı uyum (overfitting) sorununu azaltmak için
geliştirilmiş bir regülarizasyon tekniğidir. Modelin kayıp fonksiyonuna katsayıların
karelerinin toplamı eklenir ve bu terim lambda (λ) hiperparametresi ile ölçeklenir.
Lambda sıfır olduğunda Ridge, standart en küçük kareler regresyonuna indirgenir.
Lambda büyüdükçe katsayılar sıfıra doğru çekilir; model daha basit hale gelir, bias
artar ve variance düşer. Çok büyük lambda değerleri ise underfitting riskine yol açar.
Pratikte optimal lambda değeri cross-validation yöntemiyle seçilir; K-fold yaklaşımı
en yaygın kullanılan stratejidir. Ridge regresyonun en önemli sınırlaması, katsayıları
küçültmesine rağmen tam olarak sıfırlayamamasıdır. Bu nedenle özellik seçimi gerekiyorsa
Lasso regresyonu tercih edilir çünkü L1 cezası bazı katsayıları tam sıfıra çekebilir.
Elastic Net ise L1 ve L2 cezalarını birleştirerek her iki yaklaşımın avantajlarını sunar.
`.trim();

const PDF_LIKE = [
  // Page 1
  'Ridge Regresyon — Sayfa 1\n\nGiriş: Doğrusal regresyon ve overfitting problemi. ' +
    'Modelimiz training verisine çok fazla uyum sağladığında, test verisi üzerinde ' +
    'performans düşer. Regülarizasyon bu sorunun klasik çözümüdür. L2 regülarizasyonu ' +
    'katsayıların karelerinin toplamını kayıp fonksiyonuna ekler. Bu sayede aşırı büyük ' +
    'katsayılar cezalandırılmış olur. Ridge regresyonu tam olarak bu mantıkla çalışır.',
  // Page 2
  'Ridge Regresyon — Sayfa 2\n\nLambda hiperparametresi: λ büyüdükçe katsayılara ' +
    'uygulanan ceza artar ve katsayılar sıfıra doğru çekilir. λ = 0 olduğunda Ridge, ' +
    'OLS regresyonuna eşit olur. λ sonsuza giderken tüm katsayılar sıfıra yaklaşır. ' +
    'Bias-variance dengesi açısından: λ büyüdükçe bias artar, variance düşer.',
  // Page 3
  'Ridge Regresyon — Sayfa 3\n\nOptimal λ seçimi: Cross-validation ile yapılır. ' +
    'K-fold yaklaşımı en yaygın stratejidir. Lasso ile karşılaştırma: Ridge L2, ' +
    'Lasso L1 kullanır. Lasso bazı katsayıları tam sıfıra çekebildiği için feature ' +
    'selection özelliği taşır. Elastic Net bu iki yaklaşımı birleştirir.',
].join('\f'); // \f is what pdf-parse emits between pages

const results: Array<{ name: string; ok: boolean; detail: string }> = [];
function check(name: string, cond: boolean, detail: string) {
  results.push({ name, ok: cond, detail });
  console.log(`[${cond ? 'PASS' : 'FAIL'}] ${name} — ${detail}`);
}

async function main() {
  // ── Test 1: empty/whitespace input ─────────────────────────────────
  console.log('\n── Empty input handling ────────────────────────────');
  check('empty string → 0 chunks', chunkText('').length === 0, '');
  check('whitespace-only → 0 chunks', chunkText('   \n\n  ').length === 0, '');

  // ── Test 2: plain text chunking ────────────────────────────────────
  console.log('\n── Plain text chunking ─────────────────────────────');
  const plain = chunkText(TR_PARAGRAPH);
  console.log(`Produced ${plain.length} chunks from ${TR_PARAGRAPH.length}-char input.`);
  console.log('First chunk:', JSON.stringify(plain[0]?.content.slice(0, 100) + '...'));

  check('produces ≥ 2 chunks for long text', plain.length >= 2, `count=${plain.length}`);
  check('every chunk has content', plain.every((c) => c.content.length > 0), 'ok');
  check('every chunk ≤ 700 chars (target 500 + overlap slack)', plain.every((c) => c.content.length <= 700), `max=${Math.max(...plain.map((c) => c.content.length))}`);
  check('indices are sequential 0..n', plain.every((c, i) => c.index === i), 'ok');

  // Turkish characters survive (no mojibake)
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
  check('Turkish characters preserved', plain.every((c) => turkishChars.test(c.content) || c.content.length < 50), 'ok');

  // Overlap check: chunk[i+1] should share some text with chunk[i] tail
  if (plain.length >= 2) {
    const tail = plain[0]!.content.slice(-40);
    const nextHead = plain[1]!.content.slice(0, 120);
    const overlap = tail.split(' ').some((word) => word.length > 4 && nextHead.includes(word));
    check('consecutive chunks share overlap', overlap, `tail="...${tail.slice(-30)}" next="${nextHead.slice(0, 30)}..."`);
  }

  // ── Test 3: PDF-like multi-page chunking ───────────────────────────
  console.log('\n── PDF-like multi-page chunking ────────────────────');
  const pdfChunks = chunkPdfText(PDF_LIKE);
  console.log(`Produced ${pdfChunks.length} chunks from 3-page synthetic input.`);
  pdfChunks.forEach((c) => console.log(`  [${c.index}] ${c.pageReference} → "${c.content.slice(0, 60)}..."`));

  check('PDF chunking produces ≥ 3 chunks', pdfChunks.length >= 3, `count=${pdfChunks.length}`);
  check('every chunk has pageReference', pdfChunks.every((c) => !!c.pageReference), 'ok');
  check('page references are "sayfa N" format', pdfChunks.every((c) => /^sayfa \d+$/.test(c.pageReference ?? '')), 'ok');

  const pageRefs = new Set(pdfChunks.map((c) => c.pageReference));
  check('all 3 pages represented', pageRefs.has('sayfa 1') && pageRefs.has('sayfa 2') && pageRefs.has('sayfa 3'), `pages=${[...pageRefs].join(',')}`);

  // Page 1 content should contain "Sayfa 1" header, page 2 → "Sayfa 2", etc.
  const p1Chunks = pdfChunks.filter((c) => c.pageReference === 'sayfa 1');
  const p2Chunks = pdfChunks.filter((c) => c.pageReference === 'sayfa 2');
  check('page 1 chunks contain page 1 content', p1Chunks.some((c) => /Sayfa 1|overfitting/i.test(c.content)), 'ok');
  check('page 2 chunks contain page 2 content', p2Chunks.some((c) => /Sayfa 2|Lambda hiperparametresi/i.test(c.content)), 'ok');

  // ── Test 4: real PDF (optional, argv-gated) ────────────────────────
  const pdfPath = process.argv[2];
  if (pdfPath && existsSync(pdfPath)) {
    console.log(`\n── Real PDF: ${pdfPath} ────────────────────────────`);
    const pdfParseMod = await import('pdf-parse');
    const pdfParse = pdfParseMod.default;
    const buf = readFileSync(pdfPath);
    const parsed = await pdfParse(buf);
    console.log(`Parsed ${parsed.numpages} pages, ${parsed.text.length} chars of text.`);
    const realChunks = chunkPdfText(parsed.text);
    console.log(`Produced ${realChunks.length} chunks.`);
    console.log('First chunk:', JSON.stringify({ ref: realChunks[0]?.pageReference, snippet: realChunks[0]?.content.slice(0, 100) }));
    check('real PDF produces ≥ 1 chunk', realChunks.length >= 1, `count=${realChunks.length}`);
    check('real PDF chunks all have pageReference', realChunks.every((c) => !!c.pageReference), 'ok');
    check('real PDF chunks ≤ 700 chars', realChunks.every((c) => c.content.length <= 700), `max=${Math.max(...realChunks.map((c) => c.content.length))}`);
  } else if (pdfPath) {
    console.error(`\nPDF path "${pdfPath}" not found — skipping real-PDF test.`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`${results.length - failed.length} / ${results.length} passed`);
  if (failed.length > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log('\nChunker is healthy. Turkish chars preserved, page refs correct.\n');
}

main().catch((err) => {
  console.error('\nSmoke crashed:');
  console.error(err);
  process.exit(1);
});
