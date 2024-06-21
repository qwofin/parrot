FROM node:21.5 as builder

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:21.5 as release
ARG CALIBRE_VERSION="7.7.0"
RUN \
  apt-get update && \
  apt-get install -y --no-install-recommends python3 xdg-utils wget xz-utils libegl1 libopengl0 libxcb-cursor0 libxkbcommon0 libglx0 && \
  wget --no-check-certificate -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin version=${CALIBRE_VERSION}
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public ./public
RUN npm prune --omit=dev
RUN mkdir /app/config
RUN mkdir /app/cache

EXPOSE 3000

CMD ["npm", "run", "start"]
