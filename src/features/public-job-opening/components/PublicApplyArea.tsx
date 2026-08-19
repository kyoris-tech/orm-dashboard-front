'use client';

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { isAxiosError } from 'axios';
import { CircleCheck, CircleFadingArrowUp } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { useApplyMutation } from '../hooks/use-apply-mutation';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE_MB = 25;
const DEFAULT_ERROR_MESSAGE = 'Falha ao enviar o currículo. Tente novamente.';

export interface PublicApplyAreaProps {
  code: string;
}

export function PublicApplyArea({ code }: PublicApplyAreaProps) {
  const applyMutation = useApplyMutation(code);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const uploading = applyMutation.isPending;

  function validateFile(candidate: File): boolean {
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setValidationError('Apenas arquivos PDF ou Word são permitidos.');
      return false;
    }

    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError('O arquivo excede o limite de 25 MB.');
      return false;
    }

    setValidationError(null);
    return true;
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setValidationError(null);
    applyMutation.reset();

    const candidate = fileList[0];

    if (!validateFile(candidate)) {
      setFile(null);
      return;
    }

    setFile(candidate);
    applyMutation.mutate(candidate, {
      onSuccess: () => {
        setFile(null);

        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
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

    if (applyMutation.isError) {
      const error = applyMutation.error;
      return isAxiosError<{ message?: string }>(error) ? (error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE) : DEFAULT_ERROR_MESSAGE;
    }

    return null;
  }, [validationError, applyMutation.isError, applyMutation.error]);

  const successMessage = applyMutation.isSuccess ? 'Currículo enviado e processado com sucesso!' : null;

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col justify-center items-center text-center transition-all ${
          dragging ? 'border-accent bg-surface-soft' : 'border-muted bg-surface-soft/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto text-center">
          <CircleFadingArrowUp className="h-14 w-14 text-foreground shrink-0" />

          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-2xl text-foreground">{file ? 'Arquivo selecionado' : 'Selecionar arquivo'}</h3>

            {!file && (
              <p className="text-sm text-muted mt-1 leading-snug">
                Tipo de arquivo: PDF ou Word
                <br />
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

          <label className="bg-accent gap-3 h-[3.125rem] w-[12.5rem] flex flex-row items-center text-white justify-center rounded-full text-base font-medium cursor-pointer transition hover:bg-accent-dark mt-2">
            <CircleFadingArrowUp size={20} />
            {uploading ? 'Enviando...' : 'Importar'}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <p className="text-sm text-muted font-medium">ou arraste o arquivo nessa área</p>
        </div>
      </div>

      {(errorMessage || successMessage) && (
        <p
          className={`mt-6 w-full h-12 flex flex-row items-center justify-center text-sm rounded-2xl text-center font-medium text-foreground ${
            errorMessage ? 'bg-danger/15 border-2 border-danger' : 'bg-accent/15 border-2 border-accent'
          }`}
        >
          <CircleCheck size={22} className="mr-2 text-foreground" />
          {errorMessage || successMessage}
        </p>
      )}

      {uploading && (
        <ModalPortal>
          <div className="fixed inset-0 flex flex-col -mt-16 items-center justify-center bg-surface/90 backdrop-blur-md z-[9999] animate-fade-in-delayed">
            <img src="/loader.gif" alt="Carregando" className="w-64 h-64" />
            <p className="text-foreground text-xl -mt-8 font-medium">Aguarde, estamos processando o currículo...</p>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
