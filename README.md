# Gem Enterprise Portal Documentation

## Overview
This document provides essential instructions for the gem-enterprise portal, including setup, deployment, environment variables, and production requirements.

## Development Setup
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/support371/gem-enterprise.git
   cd gem-enterprise
   ```

2. Install the necessary dependencies:
   ```bash
   bundle install
   ```

3. Set up the development environment:
   - Ensure you have the required Ruby version (use `.ruby-version` file).
   - Configure your database settings in `config/database.yml`.

## Deployment
1. Build the application:
   ```bash
   bundle exec rake build
   ```

2. Deploy to the server:
   ```bash
   cap production deploy
   ```

3. Monitor the deployment logs for any issues.

## Environment Variables
Ensure the following environment variables are set:
- `DATABASE_URL`: Connection string for the database.
- `SECRET_KEY_BASE`: A random secret key for verification.
- `RAILS_ENV`: Set to `production`.

## Production Requirements
- Use PostgreSQL for the database.
- Ensure Redis is running for caching.
- Set up a web server like Puma or Unicorn behind NGINX.

This documentation should provide all the information needed to work effectively with the gem-enterprise portal.