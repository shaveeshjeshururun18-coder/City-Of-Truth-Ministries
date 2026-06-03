import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, Facebook, Twitter, Mail, MessageCircle, Link as LinkIcon } from 'lucide-react';

interface SharePageButtonProps {
  pageUrl: string;
  pageTitle: string;
  pageDescription?: string;
  className?: string;
  variant?: 'floating' | 'inline' | 'icon';
}

export const SharePageButton: React.FC<SharePageButtonProps> = ({
  pageUrl,
  pageTitle,
  pageDescription = 'Check out this page from City of Truth Ministries',
  className = '',
  variant = 'floating'
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [widgetSettings, setWidgetSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('cot_widget_settings');
      return saved ? JSON.parse(saved) : { shareVisible: true, shareSize: 1 };
    } catch {
      return { shareVisible: true, shareSize: 1 };
    }
  });

  useEffect(() => {
    const handleWidgetSettingsUpdate = () => {
      try {
        const saved = localStorage.getItem('cot_widget_settings');
        if (saved) setWidgetSettings(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
    return () => window.removeEventListener('widget-settings-updated', handleWidgetSettingsUpdate);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
    const url = encodeURIComponent(pageUrl);
    const text = encodeURIComponent(`${pageTitle} - ${pageDescription}`);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Use native Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: pageDescription,
          url: pageUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const renderButton = () => {
    switch (variant) {
      case 'floating':
        if (widgetSettings && widgetSettings.shareVisible === false) return null;
        
        // Calculate scale: base scale of 0.85 (smaller default) * widget setting
        const effectiveScale = 0.85 * (widgetSettings?.shareSize || 1);
        
        return (
          <motion.button
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 200, bottom: 0 }}
            whileDrag={{ scale: 1.1 * effectiveScale, cursor: 'grabbing' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: effectiveScale, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleNativeShare}
            className={`fixed bottom-24 right-6 z-40 bg-gradient-to-r from-brand-600 to-brand-700 text-white p-3 rounded-full shadow-2xl hover:shadow-brand-500/50 hover:scale-[1.05] transition-all group ${className}`}
            style={{ transformOrigin: 'center', touchAction: 'none' }}
            title="Share this page"
          >
            <Share2 size={20} className="group-hover:rotate-12 transition-transform pointer-events-none" />
          </motion.button>
        );
      
      case 'inline':
        return (
          <button
            onClick={handleNativeShare}
            className={`flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all ${className}`}
          >
            <Share2 size={18} />
            Share Page
          </button>
        );
      
      case 'icon':
        return (
          <button
            onClick={handleNativeShare}
            className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all ${className}`}
            title="Share this page"
          >
            <Share2 size={20} />
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-100 p-2 rounded-xl">
                    <Share2 size={24} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Share Page</h3>
                    <p className="text-sm text-gray-500">{pageTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Copy Link Button */}
              <div className="mb-6">
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <LinkIcon size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={pageUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="inline mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="inline mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Share via:</p>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                >
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Facebook size={20} className="text-white" />
                  </div>
                  <span className="font-semibold text-blue-900 group-hover:translate-x-1 transition-transform">
                    Share on Facebook
                  </span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-4 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors group"
                >
                  <div className="bg-sky-500 p-2 rounded-lg">
                    <Twitter size={20} className="text-white" />
                  </div>
                  <span className="font-semibold text-sky-900 group-hover:translate-x-1 transition-transform">
                    Share on Twitter
                  </span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                >
                  <div className="bg-green-600 p-2 rounded-lg">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="font-semibold text-green-900 group-hover:translate-x-1 transition-transform">
                    Share on WhatsApp
                  </span>
                </button>

                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div className="bg-gray-600 p-2 rounded-lg">
                    <Mail size={20} className="text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:translate-x-1 transition-transform">
                    Share via Email
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
