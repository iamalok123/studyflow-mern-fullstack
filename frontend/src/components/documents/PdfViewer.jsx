import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';
import Spinner from '../common/Spinner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker to use the unpkg CDN for the matching pdfjs version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);

  // Responsive width calculation
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect?.width) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  };

  const onDocumentLoadError = (err) => {
    console.error('Failed to load PDF', err);
    setError(err.message || 'Failed to load the document.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        <FileText size={48} className="mb-4 opacity-50" />
        <p>No document URL provided</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
        <AlertCircle size={48} className="mb-4 opacity-75" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Document</h3>
        <p className="text-sm text-center max-w-md">{error}</p>
        <p className="text-xs mt-4 text-slate-500">
          The document might be too large, corrupted, or unavailable due to CORS policies.
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          View PDF Externally
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-100 rounded-lg border border-slate-200 overflow-hidden w-full h-full min-h-[60vh] max-h-[85vh]">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        
        {/* Pagination */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-xs sm:text-sm font-medium text-slate-700 tabular-nums whitespace-nowrap">
            {pageNumber} <span className="text-slate-400 font-normal">/</span> {numPages || '--'}
          </span>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          
          <span className="text-xs font-medium text-slate-500 w-10 sm:w-12 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        
        {/* External Link */}
        <div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline px-2 py-1"
          >
            Open Original
          </a>
        </div>
      </div>

      {/* PDF Container (Scrollable) */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-100 p-4 custom-scrollbar relative flex justify-center items-start"
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          }
          className="flex flex-col items-center drop-shadow-md"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            width={containerWidth ? Math.min(containerWidth - 32, 1000) : undefined}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="bg-white"
            loading={
              <div className="flex items-center justify-center p-12 bg-white w-full h-full min-h-[400px]">
                <Spinner />
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
