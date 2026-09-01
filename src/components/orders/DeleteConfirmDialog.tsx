import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  orderNo?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  orderNo,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  // Escape 关闭弹窗
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Soft Anime Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-[#4A4450]/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="确认删除订单"
            className="relative w-full max-w-md bg-[#FFFCFB] border border-[#FFCCD7] rounded-3xl p-6 shadow-2xl z-10 text-center space-y-4"
          >
            {/* Alert icon container */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#FFF2F5] to-[#FFE5EC] border border-[#FFCCD7] flex items-center justify-center text-[#FF5277] shadow-[0_2px_8px_0_rgba(255,82,119,0.12)]">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#4A4450] tracking-tight">
                确认删除这笔订单？
              </h3>

              {orderNo && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF2F5] border border-[#FFCCD7] text-xs font-mono text-[#FF5277] font-semibold">
                  <span className="text-[#B86B7E]">订单号</span>
                  <span className="text-[#C4BAC7]">·</span>
                  <span>{orderNo}</span>
                </div>
              )}

              <p className="mt-2.5 text-xs sm:text-sm text-[#8F8795] leading-relaxed">
                删除后该订单的数据及相关结算记录将无法恢复，请仔细核对后确认。
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 rounded-full border-[#FFCCD7] text-[#FF5277] hover:bg-[#FFF2F5]"
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onConfirm}
                isLoading={isDeleting}
                loadingText="正在删除……"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="flex-1 rounded-full bg-[#E05368] hover:bg-[#C94054] text-white"
              >
                确认删除
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
