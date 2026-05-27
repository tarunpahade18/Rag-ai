"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfViewerModalProps = {
  fileUrl: string;
  sourceName: string;
  pageNumber?: number;
  paragraphNumber?: number;
  onClose: () => void;
};

export function PdfViewerModal({
  fileUrl,
  sourceName,
  pageNumber,
  paragraphNumber,
  onClose,
}: PdfViewerModalProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageNumber || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const proxyUrl = `/api/pdf?url=${encodeURIComponent(fileUrl)}`;

  function onDocumentLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages);
    setLoading(false);
    setError(false);
  }

  function onDocumentLoadError() {
    setLoading(false);
    setError(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-[90vw] flex-col rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e8dcc8] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#2b1d10]">{sourceName}</span>
            {pageNumber && (
              <span className="text-xs text-[#8c5c2b]">Page {pageNumber}</span>
            )}
            {paragraphNumber && (
              <span className="text-xs text-[#8c5c2b]">
                • Paragraph {paragraphNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#6d6258] hover:bg-[#f4e7d5]"
            >
              <ExternalLink className="h-3 w-3" />
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-[#6d6258] hover:bg-[#f4e7d5]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {error ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[#8c5c2b]">
              <div className="text-center">
                <p>Could not load PDF.</p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[#2b1d10] underline"
                >
                  Open in new tab instead
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-start justify-center overflow-auto bg-[#f5f0e8] p-4">
                {loading && (
                  <div className="flex items-center gap-2 py-20 text-sm text-[#6d6258]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading PDF...
                  </div>
                )}
                <Document
                  file={proxyUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className={loading ? "hidden" : ""}
                    width={Math.min(window.innerWidth * 0.8, 900)}
                  />
                </Document>
              </div>

              {numPages > 0 && (
                <div className="flex items-center justify-between border-t border-[#e8dcc8] px-4 py-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#6d6258] hover:bg-[#f4e7d5] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </button>
                  <span className="text-xs text-[#6d6258]">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    disabled={currentPage >= numPages}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#6d6258] hover:bg-[#f4e7d5] disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
