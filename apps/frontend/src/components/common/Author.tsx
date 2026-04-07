import { Role } from '@/lib/generated/models';
import { User, UserCog, UserStar } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';

export type AuthorSize = 'tiny' | 'small' | 'medium' | 'large';

const sizeStyles: Record<
    AuthorSize,
    {
        rootGap: string;
        nameGap: string;
        nameText: string;
        iconPx: number;
        iconBox: string;
    }
> = {
    tiny: {
        rootGap: 'gap-0.5',
        nameGap: 'gap-0.5',
        nameText: 'text-xs font-medium',
        iconPx: 12,
        iconBox: 'w-3 h-3 shrink-0',
    },
    small: {
        rootGap: 'gap-0.5',
        nameGap: 'gap-0.5',
        nameText: 'text-sm font-medium',
        iconPx: 14,
        iconBox: 'w-3.5 h-3.5 shrink-0',
    },
    medium: {
        rootGap: 'gap-1',
        nameGap: 'gap-2',
        nameText: 'text-sm font-medium',
        iconPx: 16,
        iconBox: 'w-4 h-4 shrink-0',
    },
    large: {
        rootGap: 'gap-1',
        nameGap: 'gap-2',
        nameText: 'text-base font-medium',
        iconPx: 20,
        iconBox: 'w-5 h-5 shrink-0',
    },
};

const AuthorSizeContext = createContext<AuthorSize>('medium');

function useAuthorSize(override?: AuthorSize): AuthorSize {
    const fromContext = useContext(AuthorSizeContext);
    return override ?? fromContext;
}

export const AuthorRoot = ({ children, size = 'medium' }: { children: ReactNode; size?: AuthorSize }) => {
    const styles = sizeStyles[size];
    return (
        <AuthorSizeContext.Provider value={size}>
            <div className={`flex flex-col ${styles.rootGap}`}>{children}</div>
        </AuthorSizeContext.Provider>
    );
};

export const AuthorName = ({ name, children, size }: { name: string; children?: ReactNode; size?: AuthorSize }) => {
    const resolved = useAuthorSize(size);
    const styles = sizeStyles[resolved];
    return (
        <div className={`flex flex-row ${styles.nameGap}`}>
            <p className={styles.nameText}>{name}</p>
            {children}
        </div>
    );
};

export const AuthorRoleIcon = ({ role, size }: { role: Role; size?: AuthorSize }) => {
    const resolved = useAuthorSize(size);
    const { iconPx, iconBox } = sizeStyles[resolved];
    let icon = null;
    switch (role) {
        case 'REPRESENTATIVE':
            icon = <UserStar size={iconPx} />;
            break;
        case 'VOTER':
            icon = <User size={iconPx} />;
            break;
        case 'ADMIN':
            icon = <UserCog size={iconPx} />;
            break;
    }

    return <div className={iconBox}>{icon}</div>;
};

export const Author = Object.assign(AuthorRoot, {
    Name: AuthorName,
    RoleIcon: AuthorRoleIcon,
});
