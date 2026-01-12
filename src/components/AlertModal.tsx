import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    message: string
    type?: AlertType
    confirmText?: string
    onConfirm?: () => void
}

const alertConfig = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        titleColor: 'text-green-800'
    },
    error: {
        icon: AlertCircle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        titleColor: 'text-red-800'
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        buttonColor: 'bg-amber-600 hover:bg-amber-700',
        titleColor: 'text-amber-800'
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        titleColor: 'text-blue-800'
    }
}

export function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    onConfirm
}: AlertModalProps) {
    if (!isOpen) return null

    const config = alertConfig[type]
    const Icon = config.icon

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm()
        }
        onClose()
    }

    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`px-6 py-4 ${config.bgColor} border-b ${config.borderColor} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${config.iconColor}`} />
                        <h3 className={`text-lg font-bold ${config.titleColor}`}>
                            {title || defaultTitles[type]}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2.5 text-white font-semibold rounded-lg transition-colors ${config.buttonColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
