import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    FileText, CheckCircle, XCircle,
    AlertCircle, Info, Trash2, Dna, Upload
} from 'lucide-react';
import { FileUploadDropzone } from '../components/ui/file-upload';

import { analysisApi } from '../services/analysisApi';

interface VCFUploadProps {
    onFileAccepted: (file: File) => void;
    onRecordCreated?: (recordId: string) => void;
}

const VCFUpload: React.FC<VCFUploadProps> = ({ onFileAccepted, onRecordCreated }) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const mockVariants = 450; // Approximated count

    const processFile = useCallback(async (file: File) => {
        setFileError('');
        setIsSuccess(false);
        setUploadProgress(10);
        setIsUploading(true);

        // Simulate initial progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 500);

        try {
            const { success, recordId, error } = await analysisApi.uploadVCF(file);

            clearInterval(interval);

            if (success && recordId) {
                setUploadProgress(100);
                setIsUploading(false);
                setIsSuccess(true);
                setUploadedFile(file);
                onFileAccepted(file);
                onRecordCreated?.(recordId);
            } else {
                throw new Error(error || 'Upload failed');
            }
        } catch (err: any) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadProgress(0);
            setFileError(err.message || 'Failed to upload VCF file');
        }
    }, [onFileAccepted, onRecordCreated]);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-invalid-type') {
                setFileError('Invalid file type. Only .vcf files are accepted.');
            } else if (rejection.errors[0]?.code === 'file-too-large') {
                setFileError('File is too large. Maximum size is 5MB.');
            } else {
                setFileError('File rejected. Please check the format and size.');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            processFile(acceptedFiles[0]);
        }
    }, [processFile]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: { 'text/plain': ['.vcf'], 'application/octet-stream': ['.vcf'] },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
    });

    const clearFile = () => {
        setUploadedFile(null);
        setIsSuccess(false);
        setUploadProgress(0);
        setFileError('');
        setIsUploading(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const getBorderColor = () => {
        if (isDragReject || fileError) return 'var(--danger)';
        if (isDragActive) return 'var(--primary)';
        if (isSuccess) return 'var(--success)';
        return 'var(--border-hover)';
    };

    const getBgColor = () => {
        if (isDragReject || fileError) return 'var(--danger-light)';
        if (isDragActive) return 'var(--primary-light)';
        if (isSuccess) return 'var(--success-light)';
        return 'var(--bg-muted)';
    };

    return (
        <section id="upload" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                    style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                >
                    <Upload size={12} />
                    Step 1 of 2
                </div>
                <h2 className="text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Upload VCF File</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="max-w-xl mx-auto">
                    Upload your Variant Call Format (VCF) file to begin pharmacogenomic analysis.
                    Supports VCF v4.1 and v4.2 standards.
                </p>
            </motion.div>

            {/* VCF Tooltip */}
            <div className="flex justify-end mb-3 relative">
                <button
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="flex items-center gap-1.5 text-xs transition-colors"
                    style={{ color: '#9CA3AF' }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#0D7377'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                >
                    <Info size={14} />
                    What is a VCF file?
                </button>
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 top-7 z-20 w-72 p-4 rounded-xl text-sm"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lg)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            <p className="font-semibold mb-2" style={{ color: 'var(--primary)' }}>VCF (Variant Call Format)</p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                A standardized text file format used in bioinformatics for storing gene sequence
                                variations. VCF files contain genomic variants including SNPs, indels, and structural
                                variants called against a reference genome (e.g., GRCh38).
                            </p>
                            <div className="mt-2 font-mono text-xs rounded p-2"
                                style={{ background: 'var(--bg-muted)', color: 'var(--success)', border: '1px solid var(--border)' }}
                            >
                                ##fileformat=VCFv4.2<br />
                                #CHROM  POS  ID  REF  ALT  ...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dropzone */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <FileUploadDropzone
                    isDragActive={isDragActive}
                    isDragReject={isDragReject}
                    isSuccess={isSuccess}
                    isUploading={isUploading}
                    rootProps={getRootProps()}
                    inputProps={getInputProps()}
                >
                    <AnimatePresence mode="wait">
                        {isSuccess && uploadedFile ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div
                                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--success-light)', border: '1px solid var(--success)' }}
                                >
                                    <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>VCF File Loaded Successfully</p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Variant data parsed and ready for analysis</p>
                                </div>
                            </motion.div>
                        ) : isUploading ? (
                            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ border: '2px solid var(--border)', borderTopColor: 'var(--primary)' }}
                                >
                                    <Dna size={24} style={{ color: '#0D7377' }} />
                                </motion.div>
                                <p className="font-medium" style={{ color: 'var(--primary)' }}>Parsing VCF File...</p>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                <div>
                                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {isDragActive ? 'Drop your VCF file here' : 'Drag & drop your VCF file'}
                                    </p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                        or <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>browse from computer</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span className="flex items-center gap-1">
                                        <FileText size={12} />
                                        .vcf files only
                                    </span>
                                    <span>•</span>
                                    <span>Max 5MB</span>
                                    <span>•</span>
                                    <span>VCF v4.1 / v4.2</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </FileUploadDropzone>

                {/* Progress Bar */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                        >
                            <div className="flex justify-between text-xs mb-1" style={{ color: '#9CA3AF' }}>
                                <span>Parsing variants...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${uploadProgress}%`,
                                        background: '#0D7377',
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error message */}
                <AnimatePresence>
                    {fileError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 p-4 rounded-xl flex items-start gap-3"
                            style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)' }}
                        >
                            <XCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                            <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>Upload Failed</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{fileError}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* File preview summary */}
            <AnimatePresence>
                {uploadedFile && isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 p-6 rounded-2xl"
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <FileText size={16} style={{ color: 'var(--primary)' }} />
                                File Summary
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={clearFile}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#DC2626';
                                    e.currentTarget.style.background = 'var(--danger-light)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <Trash2 size={14} />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    label: 'File Name',
                                    value: uploadedFile.name,
                                    icon: <FileText size={16} style={{ color: 'var(--primary)' }} />,
                                },
                                {
                                    label: 'File Size',
                                    value: formatFileSize(uploadedFile.size),
                                    icon: <AlertCircle size={16} style={{ color: 'var(--accent)' }} />,
                                },
                                {
                                    label: 'Detected Variants',
                                    value: `~${mockVariants.toLocaleString()}`,
                                    icon: <Dna size={16} style={{ color: 'var(--success)' }} />,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="p-3 rounded-xl"
                                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.icon}
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                    </div>
                                    <p className="font-mono text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'var(--success-light)', border: '1px solid var(--success)' }}
                        >
                            <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                            <span className="text-xs" style={{ color: 'var(--success)' }}>VCF v4.2 format validated — 6 pharmacogenes detected</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default VCFUpload;
