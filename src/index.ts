import express from 'express';
import { Request, Response } from 'express';
import pool from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const JWT_SECRET = 'SECRET';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// TEST
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decoded || typeof decoded.id !== 'number') {
      throw new Error('Invalid token');
    }

    req.userId = decoded.id.toString();
    next();
  } catch (error) {
    return res.status(403).send('Invalid token');
  }
};

// USER REGISTRATION
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    pool.query(query, [name, email, hashedPassword], (error, results) => {
      if (error) {
        return res.status(500).send('Error registering user');
      }
      res.status(201).send('User registered successfully');
    });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// USER LOGIN
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    pool.query(query, [email], async (error, results) => {
      if (error) {
        return res.status(500).send('Error logging in');
      }
      if (results.length === 0) {
        return res.status(401).send('Invalid email or password');
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send('Invalid email or password');
      }

      const tokenPayload = { id: user.id };
      jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          return res.status(500).send('Error generating token');
        }
        res.send({ token });
      });
    });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// CREATE POST
app.post('/posts', verifyToken, (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const authorId = req.userId;

    const query = `INSERT INTO posts (content, authorId) VALUES (?, ?)`;
    pool.query(query, [content, authorId], (error, results) => {
      if (error) {
        return res.status(500).send('Error creating post');
      }
      res.status(201).send('Post created successfully');
    });
  } catch (error) {
    res.status(500).send('Error creating post');
  }
});

// GET ALL POSTS
app.get('/posts', (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM posts`;
    pool.query(query, (error, results) => {
      if (error) {
        return res.status(500).send('Error fetching posts');
      }
      res.send(results);
    });
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

// GET POST BY ID
app.get('/posts/:id', (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const query = `SELECT * FROM posts WHERE id = ?`;
    pool.query(query, [postId], (error, results) => {
      if (error) {
        return res.status(500).send('Error fetching post');
      }
      res.send(results[0]);
    });
  } catch (error) {
    res.status(500).send('Error fetching post');
  }
});

// UPDATE POST
app.put('/posts/:id', verifyToken, (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const authorId = req.userId;

    const query = `UPDATE posts SET content = ? WHERE id = ? AND authorId = ?`;
    pool.query(query, [content, postId, authorId], (error, results) => {
      if (error) {
        return res.status(500).send('Error updating post');
      }
      res.send('Post updated successfully');
    });
  } catch (error) {
    res.status(500).send('Error updating post');
  }
});

// DELETE POST
app.delete('/posts/:id', verifyToken, (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const authorId = req.userId;

    const query = `DELETE FROM posts WHERE id = ? AND authorId = ?`;
    pool.query(query, [postId, authorId], (error, results) => {
      if (error) {
        return res.status(500).send('Error deleting post');
      }
      res.send('Post deleted successfully');
    });
  } catch (error) {
    res.status(500).send('Error deleting post');
  }
});