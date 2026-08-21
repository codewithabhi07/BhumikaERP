'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  Share2, 
  ExternalLink, 
  FileImage, 
  Eye, 
  Sparkles,
  Scissors,
  Truck,
  Receipt
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { BillImageCard } from './BillImageCard';
import { CuttingSlipImageCard } from './CuttingSlipImageCard';
import { ChallanImageCard } from './ChallanImageCard';
import { getWhatsAppUrl } from '@/lib/utils';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'bill' | 'cutting' | 'challan';
  data: any;
  shopSettings?: {
    shopName?: string;
    managerName?: string;
    phone?: string;
    location?: string;
  };
  phone?: string;
  customerName?: string;
  title?: string;
  plainTextMessage?: string;
  onPrint?: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  shopSettings,
  phone: propPhone,
  customerName: propCustomerName,
  title: propTitle,
  plainTextMessage,
  onPrint,
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [shareStepInfo, setShareStepInfo] = useState<string | null>(null);

  const captureCardRef = useRef<HTMLDivElement>(null);

  const mobileNumber = propPhone || data?.mobileNumber || '';
  const customerName = propCustomerName || data?.customerName || 'Customer';
  const docNumber = data?.estNo || data?.challanNo || 'DOC';

  const modalTitle = propTitle || (
    type === 'bill' ? 'Share Invoice Bill on WhatsApp' :
    type === 'cutting' ? 'Share Workshop Cutting Slip on WhatsApp' :
    'Share Delivery Challan on WhatsApp'
  );

  // Generate Image from DOM card whenever modal opens with fresh data
  useEffect(() => {
    let isMounted = true;

    if (!isOpen || !data) {
      setImagePreviewUrl(null);
      setImageBlob(null);
      setShareStepInfo(null);
      return;
    }

    setIsGenerating(true);
    setIsCopied(false);
    setShareStepInfo(null);

    // Give DOM 200ms to render images & fonts properly
    const timer = setTimeout(async () => {
      if (!captureCardRef.current || !isMounted) return;

      try {
        const canvas = await html2canvas(captureCardRef.current, {
          scale: 2.2, // Ultra HD crisp render
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 5000,
        });

        if (!isMounted) return;

        const dataUrl = canvas.toDataURL('image/png');
        setImagePreviewUrl(dataUrl);

        canvas.toBlob((blob) => {
          if (isMounted && blob) {
            setImageBlob(blob);
          }
          setIsGenerating(false);
        }, 'image/png');

      } catch (err) {
        console.error('Error generating bill image:', err);
        toast.error('Failed to generate image preview');
        setIsGenerating(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, data, type]);

  if (!isOpen || !data) return null;

  const cleanPhone = (mobileNumber || '').replace(/\D/g, '');
  const fileName = `${type.toUpperCase()}-${docNumber.replace(/\s+/g, '_')}.png`;

  // 1. Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!imageBlob) {
      toast.error('Image is still preparing, please wait a second...');
      return false;
    }

    try {
      // Standard Clipboard API for Image Blob
      const item = new ClipboardItem({ 'image/png': imageBlob });
      await navigator.clipboard.write([item]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000);
      toast.success('Bill image copied to clipboard!', {
        description: 'You can now paste (Ctrl+V) directly into WhatsApp chat.'
      });
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      // Fallback: Copy data URL or alert
      toast.info('Clipboard access restricted. Use "Download Image" or "Share to WhatsApp".');
      return false;
    }
  };

  // 2. Download Image PNG
  const handleDownloadImage = () => {
    if (!imagePreviewUrl) {
      toast.error('Image preview not ready yet');
      return;
    }
    const link = document.createElement('a');
    link.href = imagePreviewUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${fileName}`);
  };

  // 3. Primary WhatsApp Share Button (Smart detection for Mobile vs Desktop)
  const handleShareToWhatsApp = async () => {
    if (!mobileNumber) {
      toast.error('Please enter customer mobile number');
      return;
    }

    // Default message text
    const textMsg = plainTextMessage || `Hello ${customerName}, please find your official ${type === 'bill' ? 'Estimate Invoice' : type === 'cutting' ? 'Cutting Slip' : 'Delivery Challan'} (${docNumber}) from Bhumika Tiles & Building Material.`;

    // Attempt Mobile Web Share API first
    if (imageBlob && navigator.canShare && navigator.canShare({ files: [new File([imageBlob], fileName, { type: 'image/png' })] })) {
      try {
        const file = new File([imageBlob], fileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: `Bill ${docNumber}`,
          text: textMsg,
        });
        toast.success('Shared via WhatsApp!');
        return;
      } catch (shareErr: any) {
        if (shareErr.name !== 'AbortError') {
          console.warn('Web Share failed, falling back to WhatsApp Web link:', shareErr);
        } else {
          return; // User cancelled share sheet
        }
      }
    }

    // Desktop Workflow: Auto-copy image to clipboard + open WhatsApp Web
    const copied = await handleCopyImage();
    handleDownloadImage();

    setShareStepInfo(
      'Image copied to clipboard & downloaded! In WhatsApp, simply press Ctrl+V (Paste) and Enter to send the image.'
    );

    const waUrl = getWhatsAppUrl(mobileNumber, textMsg);
    window.open(waUrl, '_blank');
  };

  // 4. Send as Plain Text fallback
  const handleSendPlainText = () => {
    if (!mobileNumber) {
      toast.error('Mobile number is missing');
      return;
    }
    const text = plainTextMessage || `*BHUMIKA TILES & BUILDING MATERIAL*\n*${type.toUpperCase()}: ${docNumber}*\nCustomer: ${customerName}\nThank you!`;
    const url = getWhatsAppUrl(mobileNumber, text);
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto no-print">
        {/* Hidden Container for HD Canvas Capture */}
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: -9999, 
            zIndex: -999, 
            opacity: 1, 
            pointerEvents: 'none' 
          }}
        >
          <div ref={captureCardRef}>
            {type === 'bill' && (
              <BillImageCard estimate={data} shopSettings={shopSettings} />
            )}
            {type === 'cutting' && (
              <CuttingSlipImageCard order={data} shopSettings={shopSettings} />
            )}
            {type === 'challan' && (
              <ChallanImageCard challan={data} shopSettings={shopSettings} />
            )}
          </div>
        </div>

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                {type === 'bill' ? <Receipt size={20} /> : type === 'cutting' ? <Scissors size={20} /> : <Truck size={20} />}
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                  {modalTitle}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {docNumber} • {customerName} • {mobileNumber ? `+91 ${mobileNumber}` : 'No phone'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Preview Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 flex flex-col items-center">
            {/* Desktop Helper Banner */}
            {shareStepInfo && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={18} className="text-emerald-600 flex-shrink-0" />
                  <span>{shareStepInfo}</span>
                </div>
                <button 
                  onClick={() => setShareStepInfo(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-black p-1"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* Live High-Res Image Preview Card */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-2xl mb-2 px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileImage size={14} className="text-emerald-600" />
                  Standard WhatsApp Image Format
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isGenerating ? 'Rendering Image...' : 'Ultra HD (300 DPI)'}
                </span>
              </div>

              <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-300 shadow-md p-3 min-h-[300px] flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Generating Standard Bill Graphic...
                    </p>
                  </div>
                ) : imagePreviewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imagePreviewUrl}
                    alt="Standard Bill Image Preview"
                    className="w-full h-auto rounded-xl border border-slate-200 shadow-inner object-contain max-h-[52vh]"
                  />
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    Failed to preview image. You can still print or send text.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            {/* Left Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyImage}
                disabled={isGenerating}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 disabled:opacity-50"
                title="Copy Bill Image to Clipboard (Ctrl+V to paste)"
              >
                {isCopied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{isCopied ? 'Image Copied!' : 'Copy Image'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGenerating}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 disabled:opacity-50"
                title="Download Bill Image PNG"
              >
                <Download size={15} />
                <span>Download PNG</span>
              </button>

              {onPrint && (
                <button
                  onClick={() => {
                    onClose();
                    onPrint();
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
                  title="Print Document"
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>
              )}
            </div>

            {/* Right Action Buttons: WhatsApp Primary Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendPlainText}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors hover:underline"
                title="Send as standard text message"
              >
                Send as Text
              </button>

              <button
                onClick={handleShareToWhatsApp}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <MessageCircle size={17} />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
