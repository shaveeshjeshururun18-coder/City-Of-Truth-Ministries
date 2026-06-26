import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Share2, Copy, Check, X, Facebook, Twitter, Mail, MessageCircle } from 'lucide-react';
import { Permalink, ViewState } from '../types';

interface PermalinkDisplayProps {
  permalinks: Permalink[];
  currentView: ViewState;
}

export const PermalinkDisplay: React.FC<PermalinkDisplayProps> = ({ permalinks, currentView }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPermalink, setSelectedPermalink] = useState<Permalink | null>(null);
  const [copied, setCopied] = useState(false);

  // Safety checks
  if (!permalinks || !Array.isArray(permalinks) || permalinks.length === 0) {
    return null;
  }

  // Filter permalinks that should be visible on current page
  const visiblePermalinks = permalinks.filter(
    p => p && p.isVisible && (!p.pages || p.pages.length === 0 || p.pages.includes(currentView))
  );

  if (visiblePermalinks.length === 0) {
    return null;
  }

  const handleShare = (permalink: Permalink) => {
    if (!permalink.allowShare) return;
    setSelectedPermalink(permalink);
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    if (!selectedPermalink) return;
    
    try {
      await navigator.clipboard.writeText(selectedPermalink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
    if (!selectedPermalink) return;

    const url = encodeURIComponent(selectedPermalink.url);
    const text = encodeURIComponent(selectedPermalink.shareMessage || `Check out: ${selectedPermalink.label}`);

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
        shareUrl = `mailto:?subject=${encodeURIComponent(selectedPermalink.label)}&body=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <>
      {/* Permalink Display Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 shadow-lg"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {visiblePermalinks.map((permalink) => (
              <div
                key={permalink.id}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-brand-200"
              >
                <Link size={14} className="text-brand-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <a
                    href={permalink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-black text-brand-900 hover:text-brand-600 transition-colors leading-tight"
                  >
                    {permalink.label}
                  </a>
                  <span className="text-[10px] text-brand-500 font-medium truncate max-w-[160px]">
                    {permalink.url}
                  </span>
                </div>
                {permalink.allowShare && (
                  <button
                    onClick={() => handleShare(permalink)}
                    className="p-1 rounded-full hover:bg-brand-50 transition-colors group"
                    title="Share this link"
                  >
                    <Share2 size={14} className="text-brand-500 group-hover:text-brand-700" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedPermalink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white relative">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Share Link</h3>
                    <p className="text-sm text-brand-100 mt-1">{selectedPermalink.label}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Copy Link */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Link URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedPermalink.url}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
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

                {/* Share Message */}
                {selectedPermalink.shareMessage && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Share Message
                    </label>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-700 italic">
                        "{selectedPermalink.shareMessage}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Share Buttons */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Share via
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSocialShare('facebook')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#0C63D4] text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Facebook size={18} />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] hover:bg-[#0C8BD9] text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Twitter size={18} />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleSocialShare('whatsapp')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleSocialShare('email')}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Mail size={18} />
                      Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
