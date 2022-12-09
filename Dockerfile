FROM node:18.12.0-bullseye

# Create app directory
WORKDIR /home/app

# Install app dependencies
COPY . .

WORKDIR /home/app/backend
RUN npm install
RUN npm uninstall --save sqlite3 && npm install --save sqlite3@5.0.3 && npm install -g sqlite3@5.0.3 ts-node typescript
RUN npm run seed

WORKDIR /home/app/frontend
RUN npm install
RUN npm run build

# Environment variables
ENV NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
ENV JWT_SECRET=supersecret
ENV DEFAULT_USER_PASSWORD=1111

# Start the app
WORKDIR /home/app/
RUN echo "cd /home/app/backend" >> start.sh
RUN echo "npm start &" >> start.sh
RUN echo "cd /home/app/frontend" >> start.sh
RUN echo "npm start &" >> start.sh
RUN echo "wait" >> start.sh

RUN chmod +x ./start.sh
CMD ./start.sh
