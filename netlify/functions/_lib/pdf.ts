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
  const result = await pdfParse(buf, { pagerender: renderPageWithSeparator });
  return { text: result.text.replace(/\f\s*$/g, '').trim(), pageCount: result.numpages };
}

async function renderPageWithSeparator(pageData: {
  getTextContent: (options: {
    normalizeWhitespace: boolean;
    disableCombineTextItems: boolean;
  }) => Promise<{ items: Array<{ str?: string; transform?: number[] }> }>;
}): Promise<string> {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  });

  let text = '';
  let lastY: number | null = null;
  for (const item of textContent.items) {
    const value = item.str?.trim();
    if (!value) continue;
    const y = item.transform?.[5] ?? null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
      text += '\n';
    } else if (text) {
      text += ' ';
    }
    text += value;
    lastY = y;
  }
  return `${text}\f`;
}
