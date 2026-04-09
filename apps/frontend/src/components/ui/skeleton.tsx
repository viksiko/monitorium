import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    loading?: boolean;
    size?: 'short' | 'medium' | 'long';
}

/**
 * Skeleton отображает плейсхолдер на время загрузки.
 *
 * - `loading=true` (по умолчанию): рендерит skeleton-обертку с пульсацией.
 * - `loading=false`: возвращает `children` как есть (без обертки).
 * - `asChild=true`: использует Radix Slot и применяет классы/пропсы skeleton
 *   к дочернему элементу вместо создания дополнительного `div`.
 *
 * Примеры использования:
 * - Блочный плейсхолдер: `<Skeleton className="h-4 w-48" />`
 * - Обернуть существующий контент:
 *   `<Skeleton asChild loading={isLoading}><p>Текст</p></Skeleton>`
 * - `asChild` с кнопкой:
 *   `<Skeleton asChild loading={isLoading}><button>Сохранить</button></Skeleton>`
 * - `asChild` со ссылкой:
 *   `<Skeleton asChild loading={isLoading}><a href="/profile">Профиль</a></Skeleton>`
 * - `asChild` с кастомным классом:
 *   `<Skeleton asChild className="rounded-full"><span>Имя пользователя</span></Skeleton>`
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, asChild = true, loading = true, size = 'medium', children, ...props }, ref) => {
        if (!loading) {
            return <>{children}</>;
        }

        const sizeClassMap = {
            short: 'w-16',
            medium: 'w-32',
            long: 'w-48',
        } as const;

        const Comp = asChild ? Slot : 'div';

        return (
            <Comp
                ref={ref}
                aria-hidden
                tabIndex={-1}
                className={cn(
                    'animate-pulse rounded-md bg-muted motion-reduce:animate-none',
                    sizeClassMap[size],
                    className,
                )}
                {...props}>
                {children}
            </Comp>
        );
    },
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
