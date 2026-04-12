"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";

interface BookExportData {
  title: string;
  author: string;
  quotes: string[];
  lessons: string[];
  entries: {
    title: string;
    chapterRange: string | null;
    thoughts: string | null;
    quotes: string[];
    lessons: string[];
    themes: string[];
    characters: string[];
  }[];
}

export function ExportBookNotes({ book }: { book: BookExportData }) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const hasContent =
    book.quotes.length > 0 ||
    book.lessons.length > 0 ||
    book.entries.some((e) => e.thoughts);

  if (!hasContent) return null;

  async function exportAsPdf() {
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 25;

      function checkPage(needed: number) {
        if (y + needed > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 25;
        }
      }

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(book.title, margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`by ${book.author}`, margin, y);
      y += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      doc.setTextColor(30, 30, 30);

      // Book-level quotes
      if (book.quotes.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Favorite Quotes", margin, y);
        y += 7;

        for (const q of book.quotes) {
          checkPage(14);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(`"${q}"`, contentWidth - 6);
          doc.text(lines, margin + 3, y);
          y += lines.length * 4.5 + 4;
        }
        y += 4;
      }

      // Book-level lessons
      if (book.lessons.length > 0) {
        checkPage(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Key Lessons", margin, y);
        y += 7;

        book.lessons.forEach((l, i) => {
          checkPage(10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(`${i + 1}. ${l}`, contentWidth - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4.5 + 3;
        });
        y += 4;
      }

      // Journal entries
      if (book.entries.length > 0) {
        checkPage(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Journal Entries", margin, y);
        y += 8;

        for (const entry of book.entries) {
          checkPage(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(entry.title, margin + 2, y);
          y += 5;

          if (entry.chapterRange) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Chapters ${entry.chapterRange}`, margin + 2, y);
            doc.setTextColor(30, 30, 30);
            y += 5;
          }

          if (entry.thoughts) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const tLines = doc.splitTextToSize(entry.thoughts, contentWidth - 4);
            for (const line of tLines.slice(0, 20)) {
              checkPage(5);
              doc.text(line, margin + 2, y);
              y += 4;
            }
            y += 2;
          }

          if (entry.quotes.length > 0) {
            for (const q of entry.quotes) {
              checkPage(8);
              doc.setFont("helvetica", "italic");
              doc.setFontSize(9);
              const ql = doc.splitTextToSize(`"${q}"`, contentWidth - 12);
              doc.text(ql, margin + 6, y);
              y += ql.length * 3.5 + 2;
            }
          }

          y += 2;
          doc.setDrawColor(230, 230, 230);
          doc.line(margin + 2, y, pageWidth - margin - 2, y);
          y += 6;
        }
      }

      doc.save(`${book.title.replace(/[^a-zA-Z0-9]/g, "-")}-notes.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(null);
    }
  }

  async function exportAsDocx() {
    setExporting("docx");
    try {
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        BorderStyle,
      } = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: InstanceType<typeof Paragraph>[] = [];

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: book.title, bold: true, size: 44, font: "Calibri" }),
          ],
          spacing: { after: 80 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `by ${book.author}`, size: 24, color: "888888", font: "Calibri" }),
          ],
          spacing: { after: 300 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
        })
      );

      if (book.quotes.length > 0) {
        children.push(
          new Paragraph({ text: "Favorite Quotes", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 160 } })
        );
        for (const q of book.quotes) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `"${q}"`, italics: true, size: 22, font: "Calibri" })],
              indent: { left: 360 },
              spacing: { after: 140 },
            })
          );
        }
      }

      if (book.lessons.length > 0) {
        children.push(
          new Paragraph({ text: "Key Lessons", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 160 } })
        );
        book.lessons.forEach((l, i) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${i + 1}. `, bold: true, size: 22, font: "Calibri" }),
                new TextRun({ text: l, size: 22, font: "Calibri" }),
              ],
              spacing: { after: 120 },
            })
          );
        });
      }

      if (book.entries.length > 0) {
        children.push(
          new Paragraph({ text: "Journal Entries", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 160 } })
        );
        for (const entry of book.entries) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: entry.title, bold: true, size: 24, font: "Calibri" })],
              spacing: { after: 60 },
            })
          );
          if (entry.chapterRange) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `Chapters ${entry.chapterRange}`, size: 18, color: "888888", italics: true, font: "Calibri" })],
                spacing: { after: 100 },
              })
            );
          }
          if (entry.thoughts) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: entry.thoughts, size: 20, font: "Calibri" })],
                spacing: { after: 100 },
              })
            );
          }
          for (const q of entry.quotes) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `"${q}"`, italics: true, size: 20, color: "555555", font: "Calibri" })],
                indent: { left: 540 },
                spacing: { after: 80 },
              })
            );
          }
          children.push(
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
              spacing: { after: 200 },
            })
          );
        }
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${book.title.replace(/[^a-zA-Z0-9]/g, "-")}-notes.docx`);
    } catch (err) {
      console.error("DOCX export failed:", err);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportAsPdf}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
      >
        {exporting === "pdf" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5 text-red-400" />
        )}
        PDF
      </button>
      <button
        onClick={exportAsDocx}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
      >
        {exporting === "docx" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-blue-400" />
        )}
        Word
      </button>
    </div>
  );
}
