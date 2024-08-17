import {PrismaClient} from '@prisma/client';
import cuid from 'cuid';

class DatabaseUtil {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async connect() {
        await this.prisma.$connect();
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }

    async createPost(title: string, content: string, embedding: number[]) {
        const result = await this.prisma.$queryRaw<
            {
                id: string;
                title: string;
                content: string | null;
                embedding: number[];
                created_at: Date;
                updated_at: Date
            }[]
        >`
            INSERT INTO "Post" ("id", "title", "content", "embedding", "created_at", "updated_at")
            VALUES (${cuid()}, ${title}, ${content}, ${embedding}, NOW(), NOW())
            RETURNING "id", "title", "content", "created_at", "updated_at";
        `;
        return result[0];
    }

    async getRecommendedPosts(embedding: number[]) {
        const embeddingArray = embedding.map(num => num.toFixed(6)).join(',');

        const query = `
            SELECT "id", "title", "created_at", "updated_at"
            FROM "Post"
            ORDER BY "embedding" <-> CAST(ARRAY[${embeddingArray}] AS vector(300))
            LIMIT 3;
        `;

        return this.prisma.$queryRawUnsafe<{
            id: string;
            title: string;
            created_at: Date;
            updated_at: Date;
        }[]>(query);
    }
}

export default Object.freeze(new DatabaseUtil());
