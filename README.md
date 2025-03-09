# mcp-mongodb-lens

**MongoDB Lens** is a Model Context Protocol (MCP) server providing LLMs comprehensive access to MongoDB databases to explore database structures, perform queries, run aggregations, analyze collections, and more.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Configuration](#configuration)
- [Usage](#usage)
- [Examples](#examples)

## Quick Start

- Clone repository
- Install dependencies:<br>
    ```console
    npm install
    ```
- Either run the server with your MongoDB connection string…<br>
    ```console
    node mcp-mongodb-lens.js mongodb://your-connection-string
    ```
  …or configure your MCP Client to start the server (e.g. [Claude Desktop](#usage-with-claude-desktop))
- Start exploring your MongoDB databases with natural language queries

## Features

MongoDB Lens exposes the following capabilities through MCP:

- [Resources](#resources)
- [Tools](#tools)

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

## Configuration

- [Connection String](#connection-string)

### Connection String

The server accepts a standard MongoDB connection URI:

```
mongodb://[username:password@]host[:port][/database][?options]
```

Examples:

- Local connection: `mongodb://localhost:27017`
- Connection with credentials: `mongodb://username:password@hostname:27017/mydatabase`
- Connection with options: `mongodb://hostname:27017/mydatabase?retryWrites=true&w=majority`

The connection string can be passed as a command-line argument (e.g. when running your own server) or set in the MCP client configuration (e.g. via Claude Desktop's config file).

## Usage

- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Usage with Other MCP Clients](#usage-with-other-mcp-clients)

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
              "/absolute/path/to/mcp-mongodb-lens.js",
              "mongodb://your-connection-string"
            ]
          }
        }
      }
      ```
      - Replace `/absolute/path/to/node` with the actual file path
      - Replace `/absolute/path/to/mcp-mongodb-lens.js` with the actual file path
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
3. Restart Claude Desktop
4. Start a conversation with Claude and ask about your MongoDB data
    - Claude will show a hammer icon indicating available tools
    - Ask questions like "What databases do I have?" or "Show me the schema for the users collection"

### Usage with Other MCP Clients

MongoDB Lens can be used with any MCP-compatible client:

- **Cursor**: Configure as an MCP server in settings
- **Continue**: Add MongoDB Lens as a custom MCP server
- **Cline**: Add via the `/mcp add` command
- **Zed**: Configure in MCP server settings

See the [MCP documentation](https://modelcontextprotocol.io/clients) for client-specific integration details.

## Examples

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

## License

This project is licensed under the [MIT License](./LICENSE).
