/**
 * OWNER: P1 (Frontend)
 * PDF drag-drop OR text paste with a tab switcher. Calls api.uploadNotesPdf / uploadNotesPaste.
 */
import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface Props {
  lectureId: string;
  onUploaded?: () => void;
}

export function NoteUploader({ lectureId, onUploaded }: Props) {
  const [tab, setTab] = useState<'pdf' | 'paste'>('paste');
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      await api.uploadNotesPdf(lectureId, file);
      toast.success('Notlar yüklendi.');
      onUploaded?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handlePaste() {
    if (!text.trim()) return;
    setUploading(true);
    try {
      await api.uploadNotesPaste(lectureId, text);
      toast.success('Notlar yüklendi.');
      setText('');
      onUploaded?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') void handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border border-[hsl(var(--border))] p-0.5 text-xs">
        <button
          className={`px-3 py-1.5 rounded-sm ${tab === 'paste' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : ''}`}
          onClick={() => setTab('paste')}
        >
          <ClipboardPaste className="h-3 w-3 inline mr-1" />
          {t('teacher.detail.upload.paste')}
        </button>
        <button
          className={`px-3 py-1.5 rounded-sm ${tab === 'pdf' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : ''}`}
          onClick={() => setTab('pdf')}
        >
          <Upload className="h-3 w-3 inline mr-1" />
          {t('teacher.detail.upload.pdf')}
        </button>
      </div>

      {tab === 'paste' ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Ders notlarınızı buraya yapıştırın..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
          <Button disabled={uploading || !text.trim()} onClick={handlePaste}>
            {uploading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`rounded-lg border-2 border-dashed p-8 text-center text-sm ${dragOver ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : 'border-[hsl(var(--border))]'}`}
        >
          <Upload className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--muted-foreground))]" />
          PDF dosyasını buraya sürükleyin veya
          <label className="ml-1 text-[hsl(var(--primary))] cursor-pointer underline">
            dosya seçin
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
          {uploading && <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Yükleniyor...</p>}
        </div>
      )}
    </div>
  );
}
