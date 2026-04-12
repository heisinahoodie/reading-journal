import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import { updateBook } from "@/lib/actions/books";
import { extractAndStoreChunks, extractAndStoreEpubChunks, reExtractChunks } from "@/lib/pdf-extract";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bookId = formData.get("bookId") as string;
    const type = formData.get("type") as string; // "pdf" or "cover"

    if (!file || !bookId) {
      return NextResponse.json(
        { error: "Missing file or bookId" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let uploadDir: string;
    let filePath: string;

    if (type === "pdf") {
      uploadDir = path.join(process.cwd(), "data", "uploads", "pdfs", bookId);
      await mkdir(uploadDir, { recursive: true });
      filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      const relativePath = `pdfs/${bookId}/${file.name}`;
      await updateBook(bookId, { pdfPath: relativePath });

      extractAndStoreChunks(bookId, relativePath).catch((err) =>
        console.error("PDF extraction failed:", err)
      );
    } else if (type === "epub") {
      uploadDir = path.join(process.cwd(), "data", "uploads", "epubs", bookId);
      await mkdir(uploadDir, { recursive: true });
      filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      const relativePath = `epubs/${bookId}/${file.name}`;
      await updateBook(bookId, { pdfPath: relativePath });

      // Trigger EPUB text extraction for AI chat (runs in background)
      extractAndStoreEpubChunks(bookId, relativePath).catch((err) =>
        console.error("EPUB extraction failed:", err)
      );
    } else {
      uploadDir = path.join(process.cwd(), "data", "uploads", "covers");
      await mkdir(uploadDir, { recursive: true });
      const ext = path.extname(file.name);
      filePath = path.join(uploadDir, `${bookId}${ext}`);
      await writeFile(filePath, buffer);
      await updateBook(bookId, {
        coverImageUrl: `/api/files/covers/${bookId}${ext}`,
      });
    }

    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { bookId, pdfPath } = await request.json();
    if (!bookId || !pdfPath) {
      return NextResponse.json({ error: "Missing bookId or pdfPath" }, { status: 400 });
    }

    // Remove the file from disk
    const fullPath = path.join(process.cwd(), "data", "uploads", pdfPath);
    await rm(fullPath, { force: true });

    // Also try to remove the parent directory if empty
    const parentDir = path.dirname(fullPath);
    await rm(parentDir, { recursive: true, force: true }).catch(() => {});

    // Clear the pdfPath in the database
    await updateBook(bookId, { pdfPath: null });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { bookId, pdfPath } = await request.json();
    if (!bookId || !pdfPath) {
      return NextResponse.json({ error: "Missing bookId or pdfPath" }, { status: 400 });
    }

    const chunkCount = await reExtractChunks(bookId, pdfPath);
    return NextResponse.json({ success: true, chunks: chunkCount });
  } catch (error) {
    return NextResponse.json({ error: "Re-indexing failed" }, { status: 500 });
  }
}
