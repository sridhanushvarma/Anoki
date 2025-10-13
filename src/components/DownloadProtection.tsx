"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface DownloadProtectionProps {
  onDownload: () => void;
  downloadText?: string;
  className?: string;
  disabled?: boolean;
}

export default function DownloadProtection({ 
  onDownload, 
  downloadText = "Download", 
  className = "",
  disabled = false 
}: DownloadProtectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleDownloadClick = () => {
    if (isAuthenticated) {
      onDownload();
    } else {
      setShowLoginPrompt(true);
    }
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={onDownload}
        disabled={disabled}
        className={`px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <div className="flex items-center justify-center">
          <FiDownload className="mr-2" />
          {downloadText}
        </div>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-lg font-medium bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <div className="flex items-center justify-center">
          <FiLock className="mr-2" />
          Sign in to {downloadText}
        </div>
      </button>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Sign in Required
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You need to sign in to download files. Create a free account or sign in to access all features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-md transition-colors"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
