# String Manipulation API

This is a Node.js and Express-based RESTful API that allows users to submit strings and retrieve various calculated properties about them. The data is persisted in a MongoDB database.

## Features

-   Submit a string and get back its properties (length, palindrome status, word count, etc.).
-   Retrieve a list of all submitted strings.
-   Filter strings based on properties like length, word count, and palindrome status.
-   Perform a natural language search for specific types of strings.
-   Delete strings from the database.

## Setup and Installation

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [MongoDB](https://www.mongodb.com/try/download/community) (must be installed and running)

### 1. Clone the Repository

First, clone this repository to your local machine.

```bash
git clone <your-github-repo-link>
cd <repository-folder-name>
```

### 2. Install Dependencies

Install the required npm packages by running the following command in the project's root directory.

```bash
npm install
```

This will install all dependencies listed in the `package.json` file, including:
-   `express`: Web framework for Node.js.
-   `mongoose`: Object Data Modeling (ODM) library for MongoDB.
-   `cors`: Middleware to enable Cross-Origin Resource Sharing.
-   `dotenv`: Module to load environment variables from a `.env` file.
-   `nodemon`: Utility that monitors for changes and automatically restarts the server (for development).

### 3. Configure Environment Variables

The application requires a few environment variables to run correctly. Create a file named `.env` in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and ensure the variables are correct for your local setup.

```
# The port the server will run on
PORT=5000

# The connection URI for your MongoDB database
MONGO_URI=mongodb://localhost:27017/stageonetask
```

## Running the Application

To start the server in development mode (with automatic restarts on file changes), run:

```bash
npm start
```

The server will start and listen on the port specified in your `.env` file (default is `5000`). You will see the following message in your console:

```
Server running on port 5000
MongoDB Connected
```

Your API is now ready to accept requests!
