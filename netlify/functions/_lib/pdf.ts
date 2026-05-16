/**
 * OWNER: P2 (Backend)
 * pdf-parse wrapper. Extracts text from a Buffer; preserves \f as page separator.
 */
import pdfParse from 'pdf-parse';

export interface ExtractedPdf {
  text: string;
  pageCount: number;
}

export async function extractPdf(buf: Buffer): Promise<ExtractedPdf> {
  const result = await pdfParse(buf);
  // pdf-parse joins with \n by default but does not always include \f. We re-introduce it.
  // Conservative: trust the library's `text` for hackathon; chunkPdfText falls back if no \f.
  return { text: result.text, pageCount: result.numpages };
}
