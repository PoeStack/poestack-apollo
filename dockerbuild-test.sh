docker build . -t poestack/poestack-apollo-test:LATEST --progress=plain
docker tag poestack/poestack-apollo-test:LATEST registry.digitalocean.com/poestack/poestack/poestack-apollo-test:LATEST
docker push registry.digitalocean.com/poestack/poestack/poestack-apollo-test:LATEST