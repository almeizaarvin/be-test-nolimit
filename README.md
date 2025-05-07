# test-be-nolimit

Simple application built with Node.js, Express.js, MySQL, JWT authentication, and bcrypt password hashing.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/almeizaarvin/test-be-nolimit.git
   cd test-be-nolimit

2. **Install dependencies:**
   ```bash
    npm install

3. **Setup Environment:**
    in the .env file, insert your local MySQL environment data. For example: 
    ```bash
    DB_HOST=127.0.0.1
    DB_USER=root
    DB_PASSWORD=password
    DB_DATABASE=blog_db


## Database Setup
1. **Make sure you have MySQL installed locally**
2. **Create a MySQL database and set it to env also**
3. **Create a new table using this query**
    ```bash
    CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
    );

    CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    authorId INT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users(id)
    );

## Starting the app

1. **First build**
    ```bash
    npm run build

1. **Run on dev**
    ```bash
    npm run dev

## API Endpoints

1. **POST /register**: Register a new user.
   - **Body:**
     - name
     - email
     - password
   - **Response:**
     - message

2. **POST /login**: Log in with existing credentials and receive a JWT token.
   - **Body:**
     - email
     - password
   - **Response:**
     - token

3. **GET /posts**: Get all blog posts.
   - **Response:**
     - Array of posts

4. **GET /posts/:id**: Get a specific blog post by ID.
   - **Response:**
     - id
     - title
     - content
     - authorId
     - createdAt

5. **POST /posts**: Create a new blog post (needs authentication).
   - **Header:**
     - Authorization
   - **Body:**
     - title
     - content
   - **Response:**
     - message

6. **PUT /posts/:id**: Update an existing blog post (needs authentication).
   - **Header:**
     - Authorization
   - **Body:**
     - title
     - content
   - **Response:**
     - message

7. **DELETE /posts/:id**: Delete an existing blog post (needs authentication).
   - **Header:**
     - Authorization
   - **Response:**
     - message
