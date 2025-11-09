import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer-interface/payment')({
    validateSearch: (search: Record<string, unknown>): { items?: string } => {
        return {
            items: (search.items as string) || undefined
        }
    }
})