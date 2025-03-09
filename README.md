# MongoDB Lens

**MongoDB Lens** is a Model Context Protocol (MCP) server with full featured access to MongoDB databases using natural language via LLMs to perform queries, run aggregations, optimize performance, and more.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Configuration](#configuration)
- [Usage](#usage)
- [Prompts](#prompts)
- [Smithery](#smithery)
- [Disclaimer](#disclaimer)

## Quick Start

- Clone repository
- Install dependencies:<br>
    ```console
    npm install
    ```
- Either run the server with your MongoDB connection string…<br>
    ```console
    node mongodb-lens.js mongodb://your-connection-string
    ```
  …or configure your MCP Client to start the server (e.g. [Claude Desktop](#usage-with-claude-desktop))
- Start exploring your MongoDB databases with natural language queries

## Features

MongoDB Lens exposes the following capabilities through MCP:

- [Resources](#resources)
- [Tools](#tools)
- [Prompts](#prompts)

### Resources

- Database listings
- Collection metadata
- Schema inference
- Index information
- Collection statistics

### Tools

- **listDatabases**: View all accessible MongoDB databases
- **useDatabase**: Switch to a specific database context
- **listCollections**: Explore collections in the current database
- **findDocuments**: Run queries with filters, projections, and sorting
- **countDocuments**: Count documents matching specified criteria
- **aggregateData**: Execute aggregation pipelines
- **getStats**: Retrieve database or collection statistics
- **analyzeSchema**: Automatically infer collection schemas
- **createIndex**: Create new indexes for performance optimization
- **explainQuery**: Analyze query execution plans

### Prompts

- **queryBuilder**: Interactive guidance for constructing MongoDB queries
- **aggregationBuilder**: Step-by-step creation of aggregation pipelines
- **schemaAnalysis**: Detailed collection schema analysis with recommendations
- **indexRecommendation**: Get personalized index suggestions based on query patterns
- **mongoShell**: Generate MongoDB shell commands with explanations
- **inspectorGuide**: Get help using MongoDB Lens with MCP Inspector

## Configuration

- [Connection String](#connection-string)

### Connection String

The server accepts a standard MongoDB connection URI:

```txt
mongodb://[username:password@]host[:port][/database][?options]
```

Examples:

- Local connection: `mongodb://localhost:27017`
- Connection with credentials: `mongodb://username:password@hostname:27017/mydatabase`
- Connection with options: `mongodb://hostname:27017/mydatabase?retryWrites=true&w=majority`

The connection string can be passed as a command-line argument (e.g. when running your own server) or set in the MCP client configuration (e.g. via Claude Desktop's config file).

If no connection string is provided, the server will attempt to connect to a local MongoDB instance on the default port (27017) i.e. `mongodb://localhost:27017`.

## Usage

- [Usage with Docker](#usage-with-docker)
- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Usage with MCP Inspector](#usage-with-mcp-inspector)
- [Usage with Other MCP Clients](#usage-with-other-mcp-clients)

### Usage with Docker

To run MongoDB Lens in a Docker container:

1. Build the Docker image:<br>
    ```console
    docker build -t mongodb-lens .
    ```
2. Run the Docker container with your MongoDB connection string:<br>
    ```console
    $ docker run -p 3000:3000 mongodb-lens mongodb://your-connection-string
    ```
3. The server will be accessible at http://localhost:3000 (or the host/port you specified)

### Usage with Claude Desktop

To use MongoDB Lens with Claude Desktop:

1. Install [Claude Desktop](https://claude.ai/download)
2. Configure Claude Desktop to use MongoDB Lens:<br>
    - Create or edit the Claude Desktop configuration file:
      - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
      - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
    - Add the MongoDB Lens server configuration:<br>
      ```json
      {
        "mcpServers": {
          "mongodb-lens": {
            "command": "/absolute/path/to/node",
            "args": [
              "/absolute/path/to/mongodb-lens.js",
              "mongodb://your-connection-string"
            ]
          }
        }
      }
      ```
      - Replace `/absolute/path/to/node` with the actual file path
      - Replace `/absolute/path/to/mongodb-lens.js` with the actual file path
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
3. Restart Claude Desktop
4. Start a conversation with Claude and ask about your MongoDB data
    - Claude will show a hammer icon indicating available tools
    - Ask questions like "What databases do I have?" or "Show me the schema for the users collection"

### Usage with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a development tool specifically designed for testing and debugging MCP servers. It provides a visual interface to explore resources, run tools, and via MongoDB Lens understand your MongoDB database.

To use MongoDB Lens with MCP Inspector:

1. Run Inspector via `npx`:<br>
    ```console
    npx @modelcontextprotocol/inspector node mongodb-lens.js mongodb://your-connection-string
    ```
2. The Inspector will start both a server (default port 3000) and a web UI (default port 5173)
3. Open your browser to http://localhost:5173 to access the Inspector interface
4. The interface provides several tabs:
    - **Resources**: View available resources like database listings and collection schemas
    - **Tools**: Execute MongoDB operations directly and see results
    - **Prompts**: Access guided templates for common MongoDB tasks
    - **Debug**: See the full message exchange between the client and server

5. You can customize the ports if needed:<br>
    ```console
    CLIENT_PORT=8080 SERVER_PORT=9000 npx @modelcontextprotocol/inspector node mongodb-lens.js
    ```

6. The Inspector supports the full range of MongoDB Lens capabilities, including autocompletion for collection names and query fields.

For more detailed information about using the Inspector, refer to the [MCP Inspector documentation](https://modelcontextprotocol.io/docs/tools/inspector).

### Usage with Other MCP Clients

MongoDB Lens can be used with any MCP-compatible client:

- **Cursor**: Configure as an MCP server in settings
- **Continue**: Add MongoDB Lens as a custom MCP server
- **Cline**: Add via the `/mcp add` command
- **Zed**: Configure in MCP server settings

See the [MCP documentation](https://modelcontextprotocol.io/clients) for client-specific integration details.

## Prompts

Here are some example prompts to use with MongoDB Lens:

- _"List all databases in my MongoDB instance"_
- _"Show me all collections in the current database"_
- _"What's the schema of the users collection?"_
- _"How many documents are in the orders collection?"_
- _"Find the 5 most recent orders for customer with ID 12345"_
- _"Run an aggregation to calculate the average order value by product category"_
- _"Show me the indexes on the products collection"_
- _"Create an index on the email field in the users collection"_
- _"Analyze the performance of this query: { status: 'completed', date: { $gt: new Date('2023-01-01') } }"_
- _"Help me build a MongoDB query to find active users who haven't logged in for 30 days"_
- _"Create an aggregation pipeline to group sales by region and calculate totals"_
- _"Analyze the schema of my customers collection and suggest improvements"_
- _"What indexes should I create for queries that frequently filter by status and sort by date?"_
- _"Show me the MongoDB shell commands to create a new collection with validation"_

## Smithery

[Smithery](https://smithery.ai) is a platform for discovering, sharing, and deploying MCP servers. This repository includes a [`smithery.yaml`](./smithery.yaml) configuration file for deployment to Smithery.

## Disclaimer

This project:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
