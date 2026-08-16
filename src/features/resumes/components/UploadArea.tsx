'use client';

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CircleCheck, CircleFadingArrowUp } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useBulkUploadMutation } from '../hooks/use-bulk-upload-mutation';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE_MB = 25;

export function UploadArea() {
  const bulkUploadMutation = useBulkUploadMutation();

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploading = bulkUploadMutation.isPending;
  const progress = bulkUploadMutation.progress;

  function validateFiles(fileList: FileList): File[] {
    const files = Array.from(fileList);
    const validFiles: File[] = [];

    for (const candidate of files) {
      if (!ALLOWED_TYPES.includes(candidate.type)) {
        setValidationError('Apenas arquivos PDF ou Word são permitidos.');
        continue;
      }

      if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
        setValidationError('O arquivo excede o limite de 25 MB.');
        continue;
      }

      validFiles.push(candidate);
    }

    return validFiles;
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setValidationError(null);

    const validFiles = validateFiles(fileList);

    if (validFiles.length === 0) {
      return;
    }

    setFile(validFiles[0]);

    bulkUploadMutation.mutate(validFiles, {
      onSuccess: () => setFile(null),
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
  }

  function handleDrag(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragging(true);
    } else if (event.type === 'dragleave') {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  const errorMessage = useMemo(() => {
    if (validationError) {
      return validationError;
    }

    if (bulkUploadMutation.isError) {
      return 'Erro ao iniciar processamento em lote.';
    }

    return null;
  }, [validationError, bulkUploadMutation.isError]);

  const resultMessage = useMemo(() => {
    if (!bulkUploadMutation.isSuccess || !bulkUploadMutation.data) {
      return null;
    }

    return bulkUploadMutation.data.errors > 0
      ? `Processamento concluído com ${bulkUploadMutation.data.errors} erro(s).`
      : 'Currículo(s) enviado(s) e processado(s) com sucesso!';
  }, [bulkUploadMutation.isSuccess, bulkUploadMutation.data]);

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col justify-center items-center text-center transition-all md:h-[11.125rem] h-full ${
          dragging ? 'border-accent bg-surface-soft' : 'border-muted bg-surface-soft/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-16 w-full">
          <div className="flex flex-row flex-wrap md:gap-20 gap-10 items-center w-full md:justify-between justify-center">
            <div className="flex flex-row gap-6 text-lg font-medium">
              <CircleFadingArrowUp className="h-16 w-16 text-foreground" />
              <div className="flex flex-col text-left">
                <h3 className="font-semibold text-2xl text-foreground">{file ? 'Arquivo Selecionado' : 'Selecionar arquivo'}</h3>

                {!file && (
                  <p className="text-sm text-muted mt-1 leading-snug">
                    Tipo de Arquivo: PDF ou Word <br />
                    Limite: 25 MB
                  </p>
                )}

                {file && (
                  <p className="text-sm text-muted mt-1 leading-snug">
                    <span className="font-medium text-foreground">{file.name}</span>
                    <br />
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center md:w-auto w-full">
              <label className="bg-accent gap-3 h-[3.125rem] w-[12.5rem] flex flex-row items-center text-white justify-center rounded-full text-base font-medium cursor-pointer transition hover:bg-accent-dark">
                <CircleFadingArrowUp />
                {uploading ? 'Enviando...' : 'Importar'}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <p className="text-base text-muted font-medium mt-4">ou arraste o arquivo nessa área</p>
            </div>
          </div>
        </div>
      </div>

      {(errorMessage || resultMessage) && (
        <p
          className={`mt-6 w-full h-12 flex flex-row items-center justify-center text-sm rounded-2xl text-center font-medium text-foreground ${
            errorMessage ? 'bg-danger/15 border-2 border-danger' : 'bg-accent/15 border-2 border-accent'
          }`}
        >
          <CircleCheck size={22} className="mr-2 text-foreground" />
          {errorMessage || resultMessage}
        </p>
      )}

      {uploading && (
        <ModalPortal>
          <div className="fixed inset-0 flex flex-col -mt-16 items-center justify-center bg-surface/90 backdrop-blur-md z-[9999] animate-fade-in-delayed">
            <img src="/loader.gif" alt="Carregando" className="w-64 h-64" />
            <p className="text-foreground text-xl -mt-8 font-medium">Aguarde, estamos processando o(s) currículo(s)...</p>
            <p className="text-sm text-muted mt-2">
              Processado(s): {progress.processed} / {progress.total}
            </p>
            {progress.errors > 0 && <p className="text-sm text-danger">Erros: {progress.errors}</p>}
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
