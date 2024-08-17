import OpenAI from "openai";

class EmbeddingUtil {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        const embedding = await this.openai.embeddings.create({
            input: text,
            model: 'text-embedding-3-small',
            encoding_format: 'float',
            dimensions: 300
        });

        return embedding.data[0].embedding
    }
}

export default Object.freeze(new EmbeddingUtil());
