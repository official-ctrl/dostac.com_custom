import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  previewClassName?: string;
  testId?: string;
}

export function ImageUploader({
  value,
  onChange,
  previewClassName = "h-24 w-24 rounded object-cover bg-muted border border-border",
  testId,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);

  const handlePick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    try {
      setUploadingProgress(0);
      const formData = new FormData();
      formData.append("file", file);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/uploads");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadingProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText) as { publicUrl: string };
            onChange(result.publicUrl);
            resolve();
          } else {
            const msg = (() => { try { return (JSON.parse(xhr.responseText) as { error: string }).error; } catch { return `업로드 실패 (${xhr.status})`; } })();
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => reject(new Error("네트워크 오류"));
        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploadingProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isUploading = uploadingProgress !== null;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
        data-testid={testId ? `${testId}-input` : undefined}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePick}
          disabled={isUploading}
          data-testid={testId ? `${testId}-button` : undefined}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              업로드 중… {uploadingProgress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              이미지 업로드
            </>
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" />
            제거
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && (
        <img
          src={value}
          alt="preview"
          className={`mt-2 ${previewClassName}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
