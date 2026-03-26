# Quick Start Guide

## Development Setup
1. Clone the repository:
   ```
   git clone https://github.com/support371/gem-enterprise.git
   cd gem-enterprise
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the environment variables:
   - Create a `.env` file based on `.env.example` and populate it with your configurations.

## Routes
- **GET /** - Home route
- **POST /api/login** - Authenticate user
- **GET /api/user** - Get user data

## Authentication Flow
1. User navigates to the login page.
2. User enters credentials and submits.
3. Backend verifies credentials and returns a token if successful.
4. Token is stored in local storage for subsequent requests.

## Deployment on Vercel
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and login.
3. Import your GitHub repository.
4. Vercel will automatically build and deploy your application.

## Troubleshooting
- Ensure you have the correct node version installed (Check .nvmrc).
- Check the console for any error messages during the build or runtime.

## Project Structure
- **/src** - Contains all the source code.
- **/public** - Contains static files.
- **/tests** - Contains all test files.

This quick start guide should get you up and running with the project quickly!