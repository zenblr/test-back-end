FROM node:12.2.0 as builder


WORKDIR /gold
COPY package*.json /gold/

RUN npm install
RUN npm install -g @angular/cli@8.3.13

COPY ./ /gold/
ARG configuration=production

RUN ng build --prod


### STAGE 2: Setup ###

FROM nginx

## Copy our default nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/default.conf /etc/nginx/conf.d

# ## Remove default nginx website
# RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /gold/dist /usr/share/nginx/html


# COPY --from=builder /blueprism/build /usr/share/nginx/html


CMD ["nginx", "-g", "daemon off;"]
