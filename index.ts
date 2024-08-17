import dotenv from 'dotenv';
dotenv.config();

import express, {Application, Request, Response} from 'express';
import DatabaseClient from "./util/database.util";
import EmbeddingUtil from "./util/embedding.util";
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/post', async (req: Request, res: Response) => {
    const {title, content} = req.body;

    if (!title || !content)
        return res.status(400).json({
            message: 'Title and content are required'
        });

    try {
        const embedding = await EmbeddingUtil.generateEmbedding(title);
        console.log(embedding, embedding.length);
        const post = await DatabaseClient.createPost(title, content, embedding);

        return res.status(201).json({
            message: 'Post created successfully',
            data: post
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.post('/post/recommend', async (req: Request, res: Response) => {
    const {title} = req.body;

    if (!title)
        return res.status(400).json({
            message: 'Title is required'
        });

    try {
        const embedding = await EmbeddingUtil.generateEmbedding(title);
        const posts = await DatabaseClient.getRecommendedPosts(embedding);

        return res.status(200).json({
            message: 'Posts retrieved successfully',
            data: posts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
