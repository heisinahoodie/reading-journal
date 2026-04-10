import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { updateBook } from "@/lib/actions/books";
import { extractAndStoreChunks } from "@/lib/pdf-extract";

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
      // Store relative path so the file-serving API can resolve it
      const relativePath = `pdfs/${bookId}/${file.name}`;
      await updateBook(bookId, { pdfPath: relativePath });

      // Extract text from PDF in the background for AI chat
      extractAndStoreChunks(bookId, relativePath).catch((err) =>
        console.error("PDF extraction failed:", err)
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
