/**
 * OWNER: P1 (Frontend) — session-code-card per DESIGN.md
 */
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

export function SessionCodeDisplay({ code, joinUrl }: { code: string; joinUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    joinUrl ??
    `${typeof window !== 'undefined' ? window.location.origin : ''}/student/lectures/${code}`;

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="kursu-session-code flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1 text-center sm:text-left w-full">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Oturum kodu
        </p>
        <div className="mt-2 flex items-center justify-center sm:justify-start gap-3">
          <span className="font-mono text-3xl sm:text-4xl font-medium tracking-[0.2em] text-foreground">
            {code}
          </span>
          <Button variant="outline" size="icon" onClick={copy} aria-label="Kodu kopyala">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="rounded-lg bg-white p-3 border border-border shadow-sm shrink-0">
        <QRCodeSVG value={url} size={128} />
      </div>
    </div>
  );
}
