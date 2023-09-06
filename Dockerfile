FROM --platform=linux/amd64 node:18 as deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY pob ./pob

FROM --platform=linux/amd64 node:18 as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pob ./pob
COPY . .

RUN yarn generate
RUN yarn build

FROM --platform=linux/amd64 node:18 as runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/pob ./pob
COPY --from=builder /app/data ./data
COPY data data

RUN apt-get update
RUN apt-get install -y luajit

EXPOSE 4000
CMD [ "node", "dist/index.js"]