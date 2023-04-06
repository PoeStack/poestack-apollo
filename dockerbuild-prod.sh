docker container prune -f
docker image prune -f

docker build . -t poestack/poestack-apollo-prod:LATEST
docker tag poestack/poestack-apollo-prod:LATEST registry.digitalocean.com/poestack/poestack/poestack-apollo-prod:LATEST
docker push registry.digitalocean.com/poestack/poestack/poestack-apollo-prod:LATEST