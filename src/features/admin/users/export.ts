import jsPDF from 'jspdf';
import autoTable, { type HookData } from 'jspdf-autotable';
import { buildCsv, downloadCsv } from '@/lib/utils/csv';
import { formatDateTime } from '@/lib/utils/date';
import { hexToRgb, svgToPngDataUrl } from '@/lib/utils/pdf';
import { BRAND_COLORS, CONTROLLER_NAME, ORM_LOGO_SVG } from '@/lib/utils/branding';
import { ROLE_LABELS, USER_STATUS_LABELS } from './labels';
import type { UserExportRecord } from '@/types/user';

const CSV_HEADERS = [
  'ID',
  'Nome',
  'E-mail',
  'Empresa (ID)',
  'Empresa (Nome)',
  'Permissão',
  'Status atual',
  'Data de cadastro',
  'Última atualização',
  'Data de bloqueio',
  'Bloqueado por',
  'Data de exclusão',
  'Excluído por',
];

export function exportUsersToCsv(records: UserExportRecord[]): void {
  const rows = records.map((record) => ({
    'ID': record.id,
    'Nome': record.name,
    'E-mail': record.email,
    'Empresa (ID)': record.companyId,
    'Empresa (Nome)': record.companyName ?? 'N/A',
    'Permissão': record.role ? ROLE_LABELS[record.role] : 'N/A',
    'Status atual': USER_STATUS_LABELS[record.status],
    'Data de cadastro': formatDateTime(record.createdAt),
    'Última atualização': formatDateTime(record.updatedAt),
    'Data de bloqueio': formatDateTime(record.blockedAt),
    'Bloqueado por': record.blockedBy ?? '',
    'Data de exclusão': formatDateTime(record.deletedAt),
    'Excluído por': record.deletedBy ?? '',
  }));

  const csvContent = buildCsv(CSV_HEADERS, rows);
  const fileName = `usuarios-orm-${buildFileNameSuffix()}.csv`;

  downloadCsv(fileName, csvContent);
}

function buildFileNameSuffix(): string {
  return formatDateTime(new Date().toISOString()).replace(/[/: ]/g, '-');
}

const PDF_MARGIN = 24;
const PDF_LOGO_WIDTH = 60;
const PDF_LOGO_HEIGHT = (102 / 167) * PDF_LOGO_WIDTH;
const PDF_HEADER_HEIGHT = 56;
const PDF_FOOTER_HEIGHT = 24;

export async function exportUsersToPdf(records: UserExportRecord[]): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoDataUrl = await svgToPngDataUrl(ORM_LOGO_SVG, 167, 102);
  const [primaryR, primaryG, primaryB] = hexToRgb(BRAND_COLORS.primary);
  const [accentR, accentG, accentB] = hexToRgb(BRAND_COLORS.accent);
  const generatedAt = formatDateTime(new Date().toISOString());

  function drawBrandedFrame(data: HookData) {
    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(0, 0, pageWidth, PDF_HEADER_HEIGHT, 'F');
    doc.addImage(logoDataUrl, 'PNG', PDF_MARGIN, (PDF_HEADER_HEIGHT - PDF_LOGO_HEIGHT) / 2, PDF_LOGO_WIDTH, PDF_LOGO_HEIGHT);

    doc.setTextColor('#FFFFFF');
    doc.setFontSize(11);
    doc.text(CONTROLLER_NAME, pageWidth - PDF_MARGIN, 24, { align: 'right' });
    doc.setFontSize(8);
    doc.text('Relatório de usuários · Uso interno · Dados protegidos pela LGPD', pageWidth - PDF_MARGIN, 38, { align: 'right' });

    doc.setFillColor(accentR, accentG, accentB);
    doc.rect(0, pageHeight - PDF_FOOTER_HEIGHT, pageWidth, PDF_FOOTER_HEIGHT, 'F');
    doc.setFontSize(8);
    doc.setTextColor('#FFFFFF');
    doc.text(`Gerado em ${generatedAt} · Orm / ${CONTROLLER_NAME}`, PDF_MARGIN, pageHeight - 9);
    doc.text(`Página ${data.pageNumber}`, pageWidth - PDF_MARGIN, pageHeight - 9, { align: 'right' });
  }

  doc.setTextColor(primaryR, primaryG, primaryB);
  doc.setFontSize(16);
  doc.text('Relatório de Usuários', PDF_MARGIN, PDF_HEADER_HEIGHT + 26);
  doc.setFontSize(9);
  doc.setTextColor('#555555');
  doc.text(
    `${records.length} usuário(s) — inclui ativos, bloqueados e excluídos, com histórico de bloqueio/exclusão conforme LGPD.`,
    PDF_MARGIN,
    PDF_HEADER_HEIGHT + 40,
  );

  autoTable(doc, {
    startY: PDF_HEADER_HEIGHT + 52,
    margin: { left: PDF_MARGIN, right: PDF_MARGIN, top: PDF_HEADER_HEIGHT, bottom: PDF_FOOTER_HEIGHT + 8 },
    styles: { fontSize: 7, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [primaryR, primaryG, primaryB], textColor: '#FFFFFF' },
    alternateRowStyles: { fillColor: '#F4F6F8' },
    head: [
      [
        'Nome',
        'E-mail',
        'Empresa',
        'Permissão',
        'Status',
        'Cadastro',
        'Bloqueio',
        'Bloqueado por',
        'Exclusão',
        'Excluído por',
      ],
    ],
    body: records.map((record) => [
      record.name,
      record.email,
      record.companyName ?? 'N/A',
      record.role ? ROLE_LABELS[record.role] : 'N/A',
      USER_STATUS_LABELS[record.status],
      formatDateTime(record.createdAt),
      formatDateTime(record.blockedAt),
      record.blockedBy ?? '',
      formatDateTime(record.deletedAt),
      record.deletedBy ?? '',
    ]),
    didDrawPage: drawBrandedFrame,
  });

  doc.save(`usuarios-orm-${buildFileNameSuffix()}.pdf`);
}
