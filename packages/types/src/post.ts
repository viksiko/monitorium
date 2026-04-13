export interface Post {
    id: string;
    title: string;
    content: string;
    publishedAt: Date; // ISO строка
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    files: PostFile[];
    author: PostAuthor;
    likesCount: number;
    viewsCount: number;
    // comments: PostComment[];
}

export interface PostFile {
    id: string;
    postId: string;
    url: string;
    name: string | null;
    type: string | null;
    size: number | null;
    createdAt: Date;
}

export interface PostAuthor {
    name: string;
    district: {
        id: string;
        name: string;
    } | null;
    representativeProfile?: RepresentativeProfile | null;
}

interface RepresentativeProfile {
    // id: string;
    position: string;
    // party: string | null;
    // bio?: string | null;
    // rating: number;
    // tasksTotal: number;
    // tasksCompleted: number;
    // attendance: number;
    // lastActivity: Date | null;
}
