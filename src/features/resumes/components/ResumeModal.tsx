'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, X } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { formatPhoneNumber, getDDI, getLocalNumber } from '@/lib/utils/phone';
import type { ResumeSummary } from '@/types/resumes';

export interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeSummary | null;
}

export function ResumeModal({ isOpen, onClose, resume }: ResumeModalProps) {
  const [alert, setAlert] = useState<string | null>(null);

  if (!resume) {
    return null;
  }

  const data = resume.dataJson ?? {};

  async function handleCopy(text: string | undefined, label: string) {
    if (!text || text === '—') {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setAlert(`${label} copiado!`);
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert(`Não foi possível copiar ${label.toLowerCase()}.`);
    }
  }

  function openWhatsApp(phone: string | undefined) {
    if (!phone) {
      setAlert('Telefone inválido ou ausente.');
      return;
    }

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length < 10) {
      setAlert('Número de telefone inválido.');
      return;
    }

    window.open(`https://wa.me/${getDDI(phone)}${getLocalNumber(phone)}`, '_blank');
  }

  function openEmailClient(email: string | undefined) {
    if (!email || email === 'N/A') {
      setAlert('E-mail inválido ou ausente.');
      return;
    }

    const subject = encodeURIComponent('Contato via Orm');
    const body = encodeURIComponent(`Olá ${data.fullName ?? ''},\n\n`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-surface rounded-3xl shadow-2xl w-full md:max-w-3xl max-w-sm max-h-[85vh] flex flex-col text-left relative overflow-hidden"
            >
              <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-accent transition">
                <X size={24} />
              </button>

              <div className="w-full flex flex-row flex-wrap justify-between items-center md:px-10 px-5 pt-10 border-b border-border">
                <div className="pb-4 flex-shrink-0 bg-surface z-10">
                  <h2 className="text-2xl font-semibold text-accent mb-2">{data.fullName ?? resume.fullName}</h2>

                  <p className="text-muted flex flex-row justify-start items-center gap-4">
                    <span className="cursor-pointer" onClick={() => openEmailClient(data.email)}>
                      <strong>Email:</strong> {data.email ?? 'N/A'}
                    </span>
                    <Copy className="text-accent cursor-pointer" size={20} onClick={() => handleCopy(data.email, 'E-mail')} />
                  </p>

                  <p className="text-muted flex flex-row justify-start items-center gap-4 mt-2">
                    <strong>Telefone:</strong> {data.phones?.length ? data.phones.map(formatPhoneNumber).join(', ') : 'N/A'}
                    <Copy
                      className="text-accent cursor-pointer"
                      size={20}
                      onClick={() => handleCopy(data.phones?.join(', '), 'Telefone')}
                    />
                  </p>
                </div>

                <button
                  className="flex flex-row h-12 max-w-[156px] px-4 rounded-full bg-success mb-2 md:mb-0 text-white gap-2 justify-center items-center"
                  onClick={() => openWhatsApp(data.phones?.[0])}
                >
                  <Image src="/whatsapp.svg" alt="whatsapp" width={20} height={20} className="w-5 h-5" />
                  <span className="text-base font-semibold">WhatsApp</span>
                </button>
              </div>

              <div className="overflow-y-auto md:px-10 px-5 py-2 flex-1 bg-surface rounded-b-3xl">
                <div className="pb-8 md:text-base text-sm">
                  <ResumeSection title="Resumo Profissional">
                    <p className="text-foreground whitespace-pre-line">{data.summary ?? 'N/A'}</p>
                  </ResumeSection>

                  <ResumeSection title="Habilidades">
                    <div className="flex flex-wrap gap-2">
                      {data.skills?.length ? (
                        data.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full md:text-sm text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p>N/A</p>
                      )}
                    </div>
                  </ResumeSection>

                  <ResumeSection title="Experiências Profissionais">
                    {data.experience?.length ? (
                      data.experience.map((experience, index) => (
                        <div key={`${experience.role}-${index}`} className="border-b border-border/50 py-2 text-foreground">
                          <p className="font-semibold">{experience.role}</p>
                          <p>{experience.company}</p>
                          <p className="text-muted">{experience.period}</p>

                          {experience.description?.length ? (
                            <ul className="list-disc list-inside text-muted mt-2">
                              {experience.description.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </ResumeSection>

                  <ResumeSection title="Qualificações">
                    <p className="text-foreground whitespace-pre-line">{data.qualifications ?? 'N/A'}</p>
                  </ResumeSection>

                  <ResumeSection title="Formação Acadêmica">
                    {data.education?.length ? (
                      data.education.map((course, index) => (
                        <div key={`${course.course}-${index}`} className="border-b border-border/50 py-2 text-foreground">
                          <p className="font-semibold">{course.course}</p>
                          <p>{course.status}</p>
                          <p>{course.institution}</p>
                          <p className="text-muted">{course.period}</p>
                        </div>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </ResumeSection>

                  <ResumeSection title="Idiomas">
                    {data.language?.length ? (
                      data.language.map((language, index) => (
                        <div key={index} className="border-b border-border/50 py-2 text-foreground">
                          <p className="font-semibold">{typeof language === 'string' ? language : language.name}</p>
                        </div>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </ResumeSection>

                  <ResumeSection title="Cursos e Certificações">
                    {data.courses?.length ? (
                      data.courses.map((course, index) => (
                        <div key={index} className="border-b border-border/50 py-2 text-foreground">
                          <p className="font-medium">{course}</p>
                        </div>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </ResumeSection>
                </div>
              </div>

              {alert && <div className="fixed top-5 right-5 bg-accent text-white px-4 py-2 rounded-lg shadow-lg transition-all">{alert}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="md:text-lg text-base font-semibold text-accent mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
