"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";

interface ExportableData {
  quotes: { text: string; book: string; author: string }[];
  lessons: { text: string; book: string }[];
  themes: { name: string; books: string[] }[];
  characters: { name: string; book: string }[];
  recaps: {
    title: string;
    bookTitle: string;
    author: string;
    chapterRange: string | null;
    thoughts: string;
    themes: string[];
    quotes: string[];
    lessons: string[];
    characters: string[];
  }[];
}

export function ExportNotes({ data }: { data: ExportableData }) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

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
      doc.setFontSize(22);
      doc.text("Reading Journal — Highlights", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        margin,
        y
      );
      y += 4;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      doc.setTextColor(30, 30, 30);

      // Quotes
      if (data.quotes.length > 0) {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Favorite Quotes", margin, y);
        y += 8;

        for (const q of data.quotes) {
          checkPage(20);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          const quoteLines = doc.splitTextToSize(`"${q.text}"`, contentWidth - 6);
          doc.text(quoteLines, margin + 3, y);
          y += quoteLines.length * 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`— ${q.book} by ${q.author}`, margin + 3, y);
          doc.setTextColor(30, 30, 30);
          y += 7;
        }
        y += 4;
      }

      // Key Lessons
      if (data.lessons.length > 0) {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Key Lessons", margin, y);
        y += 8;

        data.lessons.forEach((l, i) => {
          checkPage(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${i + 1}.`, margin + 2, y);

          doc.setFont("helvetica", "normal");
          const lessonLines = doc.splitTextToSize(l.text, contentWidth - 12);
          doc.text(lessonLines, margin + 10, y);
          y += lessonLines.length * 4.5;

          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(l.book, margin + 10, y);
          doc.setTextColor(30, 30, 30);
          y += 7;
        });
        y += 4;
      }

      // Themes
      if (data.themes.length > 0) {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Recurring Themes", margin, y);
        y += 8;

        for (const t of data.themes) {
          checkPage(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`• ${t.name}`, margin + 3, y);

          if (t.books.length > 1) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`  (${t.books.join(", ")})`, margin + 3 + doc.getTextWidth(`• ${t.name}`), y);
            doc.setTextColor(30, 30, 30);
          }
          y += 6;
        }
        y += 4;
      }

      // Journal Recaps
      if (data.recaps.length > 0) {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Journal Recaps", margin, y);
        y += 8;

        for (const recap of data.recaps) {
          checkPage(25);

          // Entry title
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(recap.title, margin + 2, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          let subline = `${recap.bookTitle} by ${recap.author}`;
          if (recap.chapterRange) subline += ` — Ch. ${recap.chapterRange}`;
          doc.text(subline, margin + 2, y);
          doc.setTextColor(30, 30, 30);
          y += 6;

          // Thoughts
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const thoughtLines = doc.splitTextToSize(recap.thoughts, contentWidth - 4);
          const maxLines = Math.min(thoughtLines.length, 12);
          for (let li = 0; li < maxLines; li++) {
            checkPage(5);
            doc.text(thoughtLines[li], margin + 2, y);
            y += 4;
          }
          if (thoughtLines.length > maxLines) {
            doc.text("...", margin + 2, y);
            y += 4;
          }

          // Entry quotes
          if (recap.quotes.length > 0) {
            y += 2;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            for (const q of recap.quotes.slice(0, 3)) {
              checkPage(8);
              const ql = doc.splitTextToSize(`"${q}"`, contentWidth - 10);
              doc.text(ql, margin + 6, y);
              y += ql.length * 3.5;
              y += 2;
            }
          }

          // Separator
          y += 3;
          doc.setDrawColor(230, 230, 230);
          doc.line(margin + 2, y, pageWidth - margin - 2, y);
          y += 6;
        }
      }

      doc.save("reading-journal-highlights.pdf");
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
        AlignmentType,
        BorderStyle,
      } = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: InstanceType<typeof Paragraph>[] = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Reading Journal — Highlights",
              bold: true,
              size: 44,
              font: "Calibri",
            }),
          ],
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
              size: 18,
              color: "888888",
              font: "Calibri",
            }),
          ],
          spacing: { after: 300 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
        })
      );

      // Quotes section
      if (data.quotes.length > 0) {
        children.push(
          new Paragraph({
            text: "Favorite Quotes",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          })
        );

        for (const q of data.quotes) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `"${q.text}"`,
                  italics: true,
                  size: 22,
                  font: "Calibri",
                }),
              ],
              indent: { left: 360 },
              spacing: { after: 60 },
            })
          );
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `— ${q.book}`,
                  bold: true,
                  size: 18,
                  color: "555555",
                  font: "Calibri",
                }),
                new TextRun({
                  text: ` by ${q.author}`,
                  size: 18,
                  color: "888888",
                  font: "Calibri",
                }),
              ],
              indent: { left: 360 },
              spacing: { after: 200 },
            })
          );
        }
      }

      // Key Lessons
      if (data.lessons.length > 0) {
        children.push(
          new Paragraph({
            text: "Key Lessons",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          })
        );

        data.lessons.forEach((l, i) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${i + 1}. `,
                  bold: true,
                  size: 22,
                  font: "Calibri",
                }),
                new TextRun({
                  text: l.text,
                  size: 22,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 60 },
            })
          );
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: l.book,
                  size: 18,
                  color: "888888",
                  italics: true,
                  font: "Calibri",
                }),
              ],
              indent: { left: 360 },
              spacing: { after: 160 },
            })
          );
        });
      }

      // Themes
      if (data.themes.length > 0) {
        children.push(
          new Paragraph({
            text: "Recurring Themes",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          })
        );

        for (const t of data.themes) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${t.name}`,
                  bold: true,
                  size: 22,
                  font: "Calibri",
                }),
                ...(t.books.length > 1
                  ? [
                      new TextRun({
                        text: `  (${t.books.join(", ")})`,
                        size: 18,
                        color: "888888",
                        font: "Calibri",
                      }),
                    ]
                  : []),
              ],
              spacing: { after: 100 },
            })
          );
        }
      }

      // Journal Recaps
      if (data.recaps.length > 0) {
        children.push(
          new Paragraph({
            text: "Journal Recaps",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          })
        );

        for (const recap of data.recaps) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: recap.title,
                  bold: true,
                  size: 24,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 60 },
            })
          );

          let subline = `${recap.bookTitle} by ${recap.author}`;
          if (recap.chapterRange) subline += ` — Ch. ${recap.chapterRange}`;
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: subline,
                  size: 18,
                  color: "888888",
                  italics: true,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 120 },
            })
          );

          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: recap.thoughts,
                  size: 20,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 100 },
            })
          );

          for (const q of recap.quotes.slice(0, 3)) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `"${q}"`,
                    italics: true,
                    size: 20,
                    color: "555555",
                    font: "Calibri",
                  }),
                ],
                indent: { left: 540 },
                spacing: { after: 80 },
              })
            );
          }

          children.push(
            new Paragraph({
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" },
              },
              spacing: { after: 200 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "reading-journal-highlights.docx");
    } catch (err) {
      console.error("DOCX export failed:", err);
    } finally {
      setExporting(null);
    }
  }

  const hasContent =
    data.quotes.length > 0 ||
    data.lessons.length > 0 ||
    data.recaps.length > 0;

  if (!hasContent) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportAsPdf}
        disabled={exporting !== null}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-accent/50 transition-all disabled:opacity-50"
      >
        {exporting === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 text-red-400" />
        )}
        Export PDF
      </button>
      <button
        onClick={exportAsDocx}
        disabled={exporting !== null}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-accent/50 transition-all disabled:opacity-50"
      >
        {exporting === "docx" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 text-blue-400" />
        )}
        Export Word
      </button>
    </div>
  );
}
