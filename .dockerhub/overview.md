# MongoDB Lens

[![Docker Pulls](https://img.shields.io/docker/pulls/furey/mongodb-lens)](https://hub.docker.com/r/furey/mongodb-lens)<br>
[![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/furey/mongodb-lens)](https://hub.docker.com/r/furey/mongodb-lens)

- [Overview](#overview)
- [Features](#features)
- [Usage](#usage)
- [Links](#links)
- [Disclaimer](#disclaimer)

## Overview

<strong>MongoDB Lens</strong> is a Model Context Protocol (MCP) server providing full-featured MongoDB database access to LLMs like Claude. It enables natural language interaction with MongoDB databases for querying, aggregation, performance optimization, schema analysis, and more.

## Features

See: [GitHub Documentation → Features](https://github.com/furey/mongodb-lens?tab=readme-ov-file#features)

## Usage

```bash
# Basic usage with local MongoDB
docker run --rm -i --network=host furey/mongodb-lens

# With custom connection string
docker run --rm -i --network=host furey/mongodb-lens mongodb://username:password@hostname:27017/database

# With verbose logging
docker run --rm -i --network=host -e VERBOSE_LOGGING=true furey/mongodb-lens
```

## Links

- [NPM Package](https://www.npmjs.com/package/mongodb-lens)
- [GitHub Repository](https://github.com/furey/mongodb-lens)
- [GitHub Documentation](https://github.com/furey/mongodb-lens/blob/main/README.md)

## Disclaimer

MongoDB Lens:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
