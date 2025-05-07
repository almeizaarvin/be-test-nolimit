"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const JWT_SECRET = 'SECRET';
//TEST
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized');
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded || typeof decoded.id !== 'number') {
            throw new Error('Invalid token');
        }
        req.userId = decoded.id.toString();
        next();
    }
    catch (error) {
        return res.status(403).send('Invalid token');
    }
};
// USER REGISTRATION
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const query = `INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`;
        db_1.default.query(query, (error, results) => {
            if (error) {
                return res.status(500).send('Error registering user');
            }
            res.status(201).send('User registered successfully');
        });
    }
    catch (error) {
        res.status(500).send('Error registering user');
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const query = `SELECT * FROM users WHERE email = '${email}'`;
        db_1.default.query(query, (error, results) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return res.status(500).send('Error logging in');
            }
            if (results.length === 0) {
                return res.status(401).send('Invalid email or password');
            }
            const user = results[0];
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send('Invalid email or password');
            }
            const tokenPayload = { id: user.id };
            jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    return res.status(500).send('Error generating token');
                }
                res.send({ token });
            });
        }));
    }
    catch (error) {
        res.status(500).send('Error logging in');
    }
}));
//   CREATE POST
app.post('/posts', verifyToken, (req, res) => {
    try {
        const { content } = req.body;
        const authorId = req.userId;
        db_1.default.query('INSERT INTO posts (content, authorId) VALUES (' + "'" + content + "', '" + authorId + "')", (error, results) => {
            if (error) {
                return res.status(500).send('Error creating post');
            }
            res.status(201).send('Post created successfully');
        });
    }
    catch (error) {
        res.status(500).send('Error creating post');
    }
});
// GET POSTS  
app.get('/posts', (req, res) => {
    try {
        db_1.default.query('SELECT * FROM posts', (error, results) => {
            if (error) {
                return res.status(500).send('Error fetching posts');
            }
            res.send(results);
        });
    }
    catch (error) {
        res.status(500).send('Error fetching posts');
    }
});
app.get('/posts/:id', (req, res) => {
    try {
        const postId = req.params.id;
        db_1.default.query('SELECT * FROM posts WHERE id = ' + postId, (error, results) => {
            if (error) {
                return res.status(500).send('Error fetching post');
            }
            res.send(results[0]);
        });
    }
    catch (error) {
        res.status(500).send('Error fetching post');
    }
});
//   UPDATE POST
app.put('/posts/:id', verifyToken, (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const authorId = req.userId;
        db_1.default.query('UPDATE posts SET content = ' + "'" + content + "'" + ' WHERE id = ' + postId + ' AND authorId = ' + authorId, (error, results) => {
            if (error) {
                return res.status(500).send('Error updating post');
            }
            res.send('Post updated successfully');
        });
    }
    catch (error) {
        res.status(500).send('Error updating post');
    }
});
//   DELETE POST
app.delete('/posts/:id', verifyToken, (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.userId;
        db_1.default.query('DELETE FROM posts WHERE id = ' + postId + ' AND authorId = ' + authorId, (error, results) => {
            if (error) {
                return res.status(500).send('Error deleting post');
            }
            res.send('Post deleted successfully');
        });
    }
    catch (error) {
        res.status(500).send('Error deleting post');
    }
});
