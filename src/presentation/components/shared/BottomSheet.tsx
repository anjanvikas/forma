import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto bg-bg-elevated rounded-t-sheet z-50 max-h-[85%] overflow-y-auto"
          >
            <div className="sticky top-0 bg-bg-elevated pt-3 pb-2 px-md">
              <div className="w-9 h-1 bg-border-default rounded-full mx-auto mb-3" />
              {title && (
                <h2 className="font-display font-semibold text-display-md uppercase tracking-wide">{title}</h2>
              )}
            </div>
            <div className="px-md pb-[calc(env(safe-area-inset-bottom)+24px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
