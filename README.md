# MongoDB Lens

**MongoDB Lens** is a local Model Context Protocol (MCP) server with full featured access to MongoDB databases using natural language via LLMs to perform queries, run aggregations, optimize performance, and more.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Configuration](#configuration)
- [Example Prompts](#example-prompts)
- [Disclaimer](#disclaimer)

## Quick Start

- Clone repository
- [Install](#installation) dependencies
- [Configure](#client-setup) your MCP Client (e.g. [Claude Desktop](#usage-with-claude-desktop))
- Start exploring your MongoDB databases with natural language queries

## Features

MongoDB Lens exposes the following capabilities through MCP:

- [Resources](#resources)
- [Tools](#tools)
- [Prompts](#prompts)

### Resources

- Database listings
- Collection metadata
- Collection statistics
- Schema inference
- Index information
- Server status and metrics
- Replica set configuration
- Collection validation rules
- Database users and roles
- Stored JavaScript functions

### Tools

- **list-databases**: View all accessible MongoDB databases
- **current-database**: Show the current database context
- **use-database**: Switch to a specific database context
- **list-collections**: Explore collections in the current database
- **find-documents**: Run queries with filters, projections, and sorting
- **count-documents**: Count documents matching specified criteria
- **aggregate-data**: Execute aggregation pipelines
- **get-stats**: Retrieve database or collection statistics
- **analyze-schema**: Automatically infer collection schemas
- **create-index**: Create new indexes for performance optimization
- **explain-query**: Analyze query execution plans
- **distinct-values**: Extract unique values for any field
- **validate-collection**: Check for data inconsistencies
- **create-collection**: Create new collections with custom options
- **drop-collection**: Remove collections from the database
- **rename-collection**: Rename existing collections
- **modify-document**: Insert, update, or delete specific documents
- **export-data**: Export query results in JSON or CSV format
- **map-reduce**: Run MapReduce operations for complex data processing
- **bulk-operations**: Perform multiple operations efficiently

### Prompts

- **query-builder**: Interactive guidance for constructing MongoDB queries
- **aggregation-builder**: Step-by-step creation of aggregation pipelines
- **schema-analysis**: Detailed collection schema analysis with recommendations
- **index-recommendation**: Get personalized index suggestions based on query patterns
- **mongo-shell**: Generate MongoDB shell commands with explanations
- **inspector-guide**: Get help using MongoDB Lens with MCP Inspector
- **data-modeling**: Expert advice on MongoDB schema design for specific use cases
- **query-optimizer**: Optimization recommendations for slow queries
- **security-audit**: Database security analysis and improvement recommendations
- **backup-strategy**: Customized backup and recovery recommendations
- **migration-guide**: Step-by-step MongoDB version migration plans

## Configuration

- [Installation](#installation)
- [MongoDB Connection String](#mongodb-connection-string)
- [Verbose Logging](#verbose-logging)
- [Client Setup](#client-setup)

### Installation

Depending on whether you want to run with Node.js or Docker, follow the appropriate instructions below:

- [Docker Installation](#docker-installation)
- [Node.js Installation](#nodejs-installation)

#### Docker Installation

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Build the Docker image:<br>
    ```console
    docker build -t mongodb-lens .
    ```
1. Check the installation runs (tip: press <kbd>Ctrl</kbd>+<kbd>C</kbd> to exit):<br>
    ```console
    docker run --rm -i --network=host mongodb-lens
    ```

#### Node.js Installation

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Ensure [Node](https://nodejs.org/en/download) running (tip: use [Volta](https://volta.sh)):<br>`$ node -v` >= `22.*`
1. Install Node.js dependencies:<br>
    ```console
    npm ci
    ```
1. Check the installation runs (tip: press <kbd>Ctrl</kbd>+<kbd>C</kbd> to exit):<br>
    ```console
    node mongodb-lens.js
    ```

### MongoDB Connection String

The server accepts a MongoDB connection string as its only argument:

```txt
mongodb://[username:password@]host[:port][/database][?options]
```

Example URIs:

- Local connection: `mongodb://localhost:27017`
- Connection with credentials: `mongodb://username:password@hostname:27017/mydatabase`
- Connection with options: `mongodb://hostname:27017/mydatabase?retryWrites=true&w=majority`

Example Node.js usage:

```console
node mongodb-lens.js mongodb://your-connection-string
```

Example Docker usage:

```console
docker run --rm -i --network=host mongodb-lens mongodb://your-connection-string
```

If no connection string is provided, the server will attempt to connect to a local MongoDB instance on the default port i.e. `mongodb://localhost:27017`.

## Verbose Logging

To enable verbose logging for debugging purposes, set the environment variable `VERBOSE_LOGGING` to `true`.

Example Node.js usage:

```console
VERBOSE_LOGGING=true node mongodb-lens.js mongodb://your-connection-string
```

Example Docker usage:

```console
docker run --rm -i --network=host -e VERBOSE_LOGGING='true' mongodb-lens mongodb://your-connection-string
```

## Client Setup

- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Usage with MCP Inspector](#usage-with-mcp-inspector)
- [Usage with Other MCP Clients](#usage-with-other-mcp-clients)

### Usage with Claude Desktop

To use MongoDB Lens with Claude Desktop:

1. Install [Claude Desktop](https://claude.ai/download)
1. Create and/or open `claude_desktop_config.json`:
    - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
    - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
1. Add the MongoDB Lens server configuration:
    - Example Docker configuration:<br>
        ```json
        {
          "mcpServers": {
            "mongodb-lens": {
              "command": "docker",
              "args": [
                "run",
                "--rm",
                "-i",
                "--network=host",
                "mongodb-lens",
                "mongodb://your-connection-string"
              ],
              "env": {
                "VERBOSE_LOGGING": "<true|false>"
              }
            }
          }
        }
        ```
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
    - Example Node.js configuration:<br>
        ```json
        {
          "mcpServers": {
            "mongodb-lens": {
              "command": "/absolute/path/to/node",
              "args": [
                "/absolute/path/to/mongodb-lens.js",
                "mongodb://your-connection-string"
              ],
              "env": {
                "VERBOSE_LOGGING": "<true|false>"
              }
            }
          }
        }
        ```
      - Replace `/absolute/path/to/node` with the full path to `node`
      - Replace `/absolute/path/to/mongodb-lens.js` with the full file path [`mongodb-lens.js`](./mongodb-lens.js)
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
      - Set `VERBOSE_LOGGING` to `true` for verbose Claude MCP Server logs
1. Restart Claude Desktop
1. Start a conversation with Claude and ask about your MongoDB data
    - Claude will show a hammer icon indicating available tools
    - Ask questions like "What databases do I have?" or "Show me the schema for the users collection"

### Usage with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a development tool specifically designed for testing and debugging MCP servers. It provides a visual interface to explore resources, run tools, and via MongoDB Lens understand your MongoDB database.

To use MongoDB Lens with MCP Inspector:

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Run Inspector via `npx`:<br>
    ```console
    npx @modelcontextprotocol/inspector node mongodb-lens.js mongodb://your-connection-string
    ```
1. The Inspector will start both a proxy server (default port 3000) and a web UI (default port 5173)
1. Open your browser to http://localhost:5173 to access the Inspector interface
1. You can customize the ports if needed:<br>
    ```console
    CLIENT_PORT=8080 SERVER_PORT=9000 npx @modelcontextprotocol/inspector node mongodb-lens.js
    ```
1. The Inspector supports the full range of MongoDB Lens capabilities, including autocompletion for collection names and query fields.

For more, see: [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

### Usage with Other MCP Clients

MongoDB Lens can be used with any MCP-compatible client.

For more, see: [MCP Documentation: Example Clients](https://modelcontextprotocol.io/clients)

## Example Prompts

Database and collection management:

- *"List all databases"*
- *"Switch to the sales database"*
- *"Show me all collections in the current database"*
- *"Rename the 'old_products' collection to 'archive_products'"*
- *"Create a new capped collection called 'logs' with a 5MB size limit"*

Querying and data retrieval:

- *"How many documents are in the orders collection?"*
- *"Find all users who haven't logged in for over a year"*
- *"Find the 5 most recent orders for customer with ID 12345"*
- *"Show me distinct values for the 'status' field in the orders collection"*

Aggregation and data analysis:

- *"Sum sales by month"*
- *"Calculate the average order value by product category"*
- *"Create an aggregation pipeline to group sales by region and calculate totals"*

Indexing and performance optimization:

- *"Create an index on the email field in the users collection"*
- *"Analyze the schema of my customers collection and suggest improvements"*
- *"Suggest indexes for queries that frequently filter by status and sort by creation date"*
- *"Why is this query slow: { status: 'completed', date: { $gt: new Date('2023-01-01') } }?"*

Data modification and management:

- *"Delete inactive users who haven't logged in for over a year"*
- *"Update all products where stock is less than 5 to add a 'low_stock' flag"*
- *"Insert a new user document with name 'John Doe' and email 'john@example.com'"*
- *"Export the last 1000 transactions to CSV format with just date, amount, and status fields"*

Security and administration:

- *"Who has access to this database?"*
- *"Generate a migration plan from MongoDB 3.6 to 4.4"*
- *"Audit my database security settings and recommend improvements"*
- *"Plan a backup strategy for my 50GB database with 99.9% uptime requirements"*

And whatever else you can think of:

- *"Generate an interactive tour of my database"*
- *"What’s the best way to shard my growing 'events' collection?"*
- *"Optimize this query for me: { region: 'west', status: 'pending' }"*
- *"Design a data model for a blog application with users, posts, and comments"*

## Disclaimer

This project:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
