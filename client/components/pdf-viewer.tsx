"use client"

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl: string
  className?: string
}

export function PDFViewer({ pdfUrl, className = '' }: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // Detect browser zoom level
  useEffect(() => {
    const detectZoom = () => {
      const zoom = Math.round(window.devicePixelRatio * 100);
      setZoomLevel(zoom);
      console.log('🔍 Browser zoom level detected:', zoom + '%');
    };

    // Initial detection
    detectZoom();

    // Listen for zoom changes
    const handleResize = () => {
      setTimeout(detectZoom, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch PDF and create blob URL
  useEffect(() => {
    let objectUrl: string | null = null;
    
    async function fetchPDF() {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        console.log('📄 Fetching PDF from:', pdfUrl);
        
        const response = await fetch(pdfUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('📄 PDF blob created, size:', blob.size);
        
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
        setError(null);
        
        console.log('📄 PDF loaded successfully via blob URL');
      } catch (err) {
        console.error('📄 PDF fetch error:', err);
        setError('Unable to load PDF preview. Please use the View CV button below.');
        setLoading(false);
      }
    }
    
    if (pdfUrl) {
      fetchPDF();
    }
    
    // Cleanup blob URL on unmount
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className={`w-full h-full ${className}`}>
      {/* PDF Display Area */}
      <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 z-20">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Resume...</h3>
              <p className="text-sm text-gray-600">Please wait while we load the PDF preview.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Preview Not Available</h3>
              <p className="text-sm text-gray-600">Unable to load PDF preview. Please use the View CV button below to view the resume.</p>
            </div>
          </div>
        )}

        {!error && !loading && blobUrl && (
          <div className="relative w-full h-full" key={`pdf-${zoomLevel}`}>
            {/* PDF Container with proper sizing and zoom handling */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'white'
              }}
            >
              {/* Object tag for better PDF rendering with zoom support */}
              <object
                data={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoomLevel}`}
                type="application/pdf"
                className="w-full h-full"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '600px',
                  border: 'none',
                  outline: 'none',
                  display: 'block',
                  background: 'white',
                  backgroundColor: 'white',
                  margin: 0,
                  padding: 0
                }}
              >
                {/* Fallback to iframe if object doesn't work */}
                <iframe
                  src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${zoomLevel}`}
                  className="w-full h-full"
                  title="Resume Preview"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    minHeight: '600px',
                    border: 'none',
                    outline: 'none',
                    display: 'block',
                    background: 'white',
                    backgroundColor: 'white',
                    margin: 0,
                    padding: 0
                  }}
                />
              </object>
            </div>
            
            {/* Top overlay to hide PDF toolbar - positioned at the top */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 60%, rgba(255,255,255,0) 100%)',
                zIndex: 10
              }}
            />
            
            {/* Solid white bar for complete hiding of controls */}
            <div 
              className="absolute top-0 left-0 right-0 bg-white pointer-events-none"
              style={{
                height: '35px',
                zIndex: 11,
                borderBottom: '1px solid #e5e7eb'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
