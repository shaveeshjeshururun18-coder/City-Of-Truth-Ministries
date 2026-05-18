import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';
import { api } from '../services/api';

interface TestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({ isOpen, onClose, user }) => {
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    // Check if user is approved
    const isApproved = user.status === 'Active';

    const handleSubmit = async () => {
        if (!content.trim() || !isApproved) return;

        setIsSubmitting(true);
        try {
            await api.createTestimonial({
                userId: user.id || '',
                userName: user.name || 'Anonymous',
                content,
                date: new Date().toISOString(),
                status: 'Pending',
                rating: rating,
                userPhoto: user.photo,
                location: user.location,
                role: user.role,
                senderType: 'Registered',
                senderStatus: user.status
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setContent('');
                setRating(5);
            }, 2000);
        } catch (error) {
            console.error('Failed to submit testimonial:', error);
            alert('Failed to submit testimonial. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="h-24 bg-gradient-to-br from-brand-600 to-brand-800 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-500/30 rounded-full blur-2xl"></div>

                    <div className="z-10 text-center flex flex-col items-center">
                        <h2 className="text-2xl font-serif text-white font-bold tracking-tight flex items-center gap-2">
                            <MessageSquare size={24} /> Share Testimony
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-1 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-4">
                    {!isApproved ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-950">Account Pending Approval</h3>
                            <p className="text-slate-600 mt-2">
                                Only approved members can submit testimonials. Please wait for your account to be approved by an administrator.
                            </p>
                            <Button onClick={onClose} variant="outline" className="mt-6">
                                Close
                            </Button>
                        </div>
                    ) : !submitted ? (
                        <>
                            <p className="text-slate-600 text-sm text-center">
                                Has God done something amazing in your life? Share your testimony to encourage others!
                            </p>

                            {/* Rating Stars */}
                            <div className="flex flex-col items-center gap-2 py-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Rate Your Experience
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors ${star <= (hoveredRating || rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-slate-200 text-slate-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                </p>
                            </div>

                            <textarea
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors resize-none"
                                placeholder="Write your testimony here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Button
                                fullWidth
                                onClick={handleSubmit}
                                disabled={isSubmitting || !content.trim()}
                                className="shadow-brand-500/25"
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Testimony'} <Send size={18} className="ml-2" />
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-950">Thank You!</h3>
                            <p className="text-slate-600 mt-2">Your testimony has been submitted for review.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
