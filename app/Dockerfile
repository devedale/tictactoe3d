# Use Node.js 18 base image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install necessary dependencies for Puppeteer, including Google Chrome
# Official Puppeteer documentation recommends installing Chrome for headless browser support
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
RUN npm install

# Copy application source code to container
COPY . .

# Copy and set execute permissions for the database migration and seeding script
COPY migrate_seed.sh /usr/local/bin/migrate_seed.sh
RUN chmod +x /usr/local/bin/migrate_seed.sh

# Expose application port
EXPOSE 3000

# Set entrypoint to run the migration and seeding script
# The script ends with 'exec "$@"', which allows the CMD instruction
# in the Dockerfile to be executed as the final command, ensuring that
# the main application process replaces the shell and handles signals properly.
ENTRYPOINT ["/usr/local/bin/migrate_seed.sh"]

# Conditional command: run npm in dev mode (HOT-RELOAD con tsx watch) if NODE_ENV=development, otherwise start the app normally
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'development' ]; then npm run dev; else npm run start; fi"]
