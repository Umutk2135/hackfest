/**
 * OWNER: P1 (Frontend)
 * Shown before the teacher's mic permission is granted.
 */
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SpeechStatus } from '@/hooks/useSpeechRecognition';

interface Props {
  status: SpeechStatus;
  error: string | null;
  onStart: () => void;
}

export function MicPermissionGate({ status, error, onStart }: Props) {
  if (status === 'unsupported') {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        Tarayıcınız sesli transkripti desteklemiyor. Lütfen Chrome / Edge kullanın.
      </div>
    );
  }
  if (status === 'denied') {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm space-y-3">
        <p className="flex items-center gap-2 font-medium">
          <MicOff className="h-4 w-4" />
          Mikrofon erişimi reddedildi
        </p>
        <p className="text-muted-foreground">
          Tarayıcı ayarlarından mikrofon iznini açın, sonra yeniden deneyin.
        </p>
        <Button variant="outline" onClick={onStart}>
          Tekrar dene
        </Button>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm space-y-3">
        <p className="font-medium">Bir hata oluştu</p>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={onStart}>
          Tekrar dene
        </Button>
      </div>
    );
  }
  if (status === 'idle') {
    return (
      <Button size="lg" variant="live" onClick={onStart}>
        <Mic className="h-4 w-4" />
        Mikrofonu aç ve transkripti başlat
      </Button>
    );
  }
  return null;
}
