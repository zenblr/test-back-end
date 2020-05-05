FROM node:10.16.3

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bun
# Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies
# COPY package.json /usr/src/app/
# RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD npm migrate


EXPOSE 3000
CMD npm start