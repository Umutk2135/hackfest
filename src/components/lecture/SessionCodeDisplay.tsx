/**
 * OWNER: P1 (Frontend)
 * Big copyable session code with a QR code beside it.
 */
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

export function SessionCodeDisplay({ code, joinUrl }: { code: string; joinUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const url = joinUrl ?? `${typeof window !== 'undefined' ? window.location.origin : ''}/student/lectures/${code}`;

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-6 flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Oturum kodu
        </p>
        <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
          <span className="text-4xl font-bold tracking-widest">{code}</span>
          <Button variant="ghost" size="icon" onClick={copy} aria-label="Kodu kopyala">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="rounded-md bg-white p-2">
        <QRCodeSVG value={url} size={120} />
      </div>
    </div>
  );
}
