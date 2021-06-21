# Break-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that A bot that detect breaking changes in a pull request and displays them

## Setup

```sh
# Install dependencies
npm install

# Build the app
npm run build

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t breakbot-0 .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> breakbot-0
```

## Code details

For more details on the code, see the [code details](DOC_BREAKBOT.md)

## Contributing

If you have suggestions for how breakbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 RIZZO Leonard <leonard.rizzo@gmx.com>
