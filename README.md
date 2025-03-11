# MongoDB Lens

**MongoDB Lens** is a local Model Context Protocol (MCP) server with full featured access to MongoDB databases using natural language via LLMs to perform queries, run aggregations, optimize performance, and more.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Client Setup](#client-setup)
- [Tutorial](#tutorial)
- [Disclaimer](#disclaimer)

## Quick Start

- Clone repository
- [Install](#installation) dependencies
- [Configure](#configuration) MongoDB Lens
- [Set up](#client-setup) your MCP Client (e.g. [Claude Desktop](#client-setup-claude-desktop))
- Start exploring your MongoDB databases with [natural language queries](#tu

## Features

MongoDB Lens exposes the following capabilities through MCP:

- [Resources](#resources)
- [Tools](#tools)
- [Prompts](#prompts)

### Resources

- Collection metadata
- Collection statistics
- Collection validation rules
- Database listings
- Database users and roles
- Index information
- Replica set configuration
- Schema inference
- Server status and metrics
- Stored JavaScript functions

### Tools

- `aggregate-data`: Execute aggregation pipelines
- `analyze-schema`: Automatically infer collection schemas
- `bulk-operations`: Perform multiple operations efficiently
- `count-documents`: Count documents matching specified criteria
- `create-collection`: Create new collections with custom options
- `create-index`: Create new indexes for performance optimization
- `current-database`: Show the current database context
- `distinct-values`: Extract unique values for any field
- `drop-collection`: Remove collections from the database
- `explain-query`: Analyze query execution plans
- `export-data`: Export query results in JSON or CSV format
- `find-documents`: Run queries with filters, projections, and sorting
- `get-stats`: Retrieve database or collection statistics
- `list-collections`: Explore collections in the current database
- `list-databases`: View all accessible MongoDB databases
- `map-reduce`: Run MapReduce operations for complex data processing
- `modify-document`: Insert, update, or delete specific documents
- `rename-collection`: Rename existing collections
- `use-database`: Switch to a specific database context
- `validate-collection`: Check for data inconsistencies

### Prompts

- `aggregation-builder`: Step-by-step creation of aggregation pipelines
- `backup-strategy`: Customized backup and recovery recommendations
- `data-modeling`: Expert advice on MongoDB schema design for specific use cases
- `index-recommendation`: Get personalized index suggestions based on query patterns
- `inspector-guide`: Get help using MongoDB Lens with MCP Inspector
- `migration-guide`: Step-by-step MongoDB version migration plans
- `mongo-shell`: Generate MongoDB shell commands with explanations
- `query-builder`: Interactive guidance for constructing MongoDB queries
- `query-optimizer`: Optimization recommendations for slow queries
- `schema-analysis`: Detailed collection schema analysis with recommendations
- `security-audit`: Database security analysis and improvement recommendations

## Installation

MongoDB Lens can run via Docker or Node.js.

Depending on your preference, follow the installation instructions below:

- [Docker Installation](#docker-installation)
- [Node.js Installation](#nodejs-installation)
- [Installation Verification](#installation-verification)

### Docker Installation

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
    # Using default connection string mongodb://localhost:27017
    docker run --rm -i --network=host mongodb-lens

    # Using custom connection string
    docker run --rm -i --network=host mongodb-lens mongodb://your-connection-string
    ```
1. Verify the server installation by sending a [test message](#installation-verification).

### Node.js Installation

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Ensure [Node](https://nodejs.org/en/download) running (tip: use [Volta](https://volta.sh)):<br>`$ node -v` >= `22.*`
1. Install Node.js dependencies:<br>
    ```console
    npm ci
    ```
1. Start the server (tip: press <kbd>Ctrl</kbd>+<kbd>C</kbd> to exit):<br>
    ```console
    # Using default connection string mongodb://localhost:27017
    node mongodb-lens.js

    # Using custom connection string
    node mongodb-lens.js mongodb://your-connection-string
    ```
1. Verify the server installation by sending a [test message](#installation-verification).

### Installation Verification

To verify the installation, paste and run the following jsonrpc message into the server's stdio:
    
```json
{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"mongodb://databases"}}
```

The server should respond with a list of databases in your MongoDB instance, e.g.:<br>

```json
{"jsonrpc":"2.0","id":1, "result":{"contents":[{"uri":"mongodb://databases","text":"Databases (12):\n- admin (40.00 KB)\n- config (108.00 KB)\n- local (40.00 KB)\n- sample_airbnb (51.88 MB)\n- sample_analytics (9.46 MB)\n- sample_geospatial (980.00 KB)\n- sample_guides (40.00 KB)\n- sample_mflix (108.90 MB)\n- sample_restaurants (5.92 MB)\n- sample_supplies (968.00 KB)\n- sample_training (40.85 MB)\n- sample_weatherdata (2.39 MB)"}]}}
```

MongoDB Lens is now installed and ready to accept MCP requests.

## Configuration

- [MongoDB Connection String](#configuration-mongodb-connection-string)
- [Logging](#configuration-logging)

### Configuration: MongoDB Connection String

The server accepts a MongoDB connection string as its only argument:

```txt
mongodb://[username:password@]host[:port][/database][?options]
```

Example URIs:

- Local connection: `mongodb://localhost:27017`
- Connection with credentials and DB name: `mongodb://username:password@hostname:27017/mydatabase`
- Connection with DB name and options: `mongodb://hostname:27017/mydatabase?retryWrites=true&w=majority`

If no connection string is provided, the server will attempt to connect to a local MongoDB instance on the default port i.e. `mongodb://localhost:27017`.

### Configuration: Logging

To enable verbose MCP Server logging, set environment variable `VERBOSE_LOGGING` to `true`.

Example Node.js usage:

```console
VERBOSE_LOGGING=true node mongodb-lens.js mongodb://your-connection-string
```

Example Docker usage:

```console
docker run --rm -i --network=host -e VERBOSE_LOGGING='true' mongodb-lens mongodb://your-connection-string
```

## Client Setup

- [Claude Desktop](#client-setup-claude-desktop)
- [MCP Inspector](#client-setup-mcp-inspector)
- [Other MCP Clients](#client-setup-other-mcp-clients)

### Client Setup: Claude Desktop

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
                "-e",
                "VERBOSE_LOGGING=[true|false]",
                "mongodb-lens",
                "mongodb://your-connection-string"
              ]
            }
          }
        }
        ```
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
      - Set `VERBOSE_LOGGING` to `true` for verbose MCP Server logs
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
      - Set `VERBOSE_LOGGING` to `true` for verbose MCP Server logs
1. Restart Claude Desktop
1. Start a conversation with Claude and ask about your MongoDB data
    - Claude will show a hammer icon indicating available tools
    - Ask questions like "What databases do I have?" or "Show me the schema for the users collection"

### Client Setup: MCP Inspector

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

### Client Setup: Other MCP Clients

MongoDB Lens can be used with any MCP-compatible client.

For more, see: [MCP Documentation: Example Clients](https://modelcontextprotocol.io/clients)

## Tutorial

This tutorial will guide you through setting up a MongoDB container with sample data, then using MongoDB Lens to interact with it through natural language queries:

- [Setting Up Sample Data Container](#tutorial-setting-up-sample-data-container)
- [Importing Sample Data](#tutorial-importing-sample-data)
- [Connecting MongoDB Lens](#tutorial-connecting-mongodb-lens)
- [Example Queries](#tutorial-example-queries)

### Tutorial: Setting Up Sample Data Container

1. Run MongoDB Docker container:<br>
   ```console
   docker run --name mongodb-sampledata -d -p 27017:27017 mongo:6
   ```
1. Verify the container is running:
   ```console
   docker ps | grep mongodb-sampledata
   ```

### Tutorial: Importing Sample Data

MongoDB provides several sample datasets, which we'll use to explore MongoDB Lens.

1. Download the sample dataset:
   ```console<br>
   curl -LO https://atlas-education.s3.amazonaws.com/sampledata.archive
   ```
2. Copy the sample data into your MongoDB container:<br>
   ```console
   docker cp sampledata.archive mongodb-sampledata:/tmp/
   ```
3. Restore the sample data:<br>
   ```console
   docker exec -it mongodb-sampledata mongorestore --archive=/tmp/sampledata.archive
   ```

This will import several sample databases including:

- `sample_airbnb` - Airbnb listings and reviews
- `sample_analytics` - Customer and account data
- `sample_geospatial` - Geographic data
- `sample_mflix` - Movie data
- `sample_restaurants` - Restaurant data
- `sample_supplies` - Supply chain data
- `sample_training` - Training data for various applications
- `sample_weatherdata` - Weather measurements

### Tutorial: Connecting MongoDB Lens

Download and [install](#installation) MongoDB Lens as per the [Quick Start](#quick-start) instructions.

Set your [MCP Client](#client-setup) to connect to MongoDB Lens with the connection string:

```txt
mongodb://localhost:27017
```

For example, if using Claude Desktop set `claude_desktop_config.json` to:

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
        "-e",
        "VERBOSE_LOGGING=true",
        "mongodb-lens",
        "mongodb://localhost:27017"
      ]
    }
  }
}
```

### Tutorial: Example Queries

With your MCP Client running and connected to MongoDB Lens, try these queries on the sample dataset.

- [Movie Data Queries (sample_mflix)](#movie-data-queries-sample_mflix)
- [Airbnb Data Analysis (sample_airbnb)](#airbnb-data-analysis-sample_airbnb)
- [Weather Data Queries (sample_weatherdata)](#weather-data-queries-sample_weatherdata)
- [Advanced Operations](#advanced-operations)

#### Movie Data Queries (sample_mflix)

- "List all available databases"
- "What's in the sample_mflix database? Switch to it"
- "How many documents are in the movies collection?
- "Find the top 5 movies by IMDB rating"
- "What are the most common movie genres?"
- "Show me movies directed by Christopher Nolan"
- "Find movies released in the 1990s with a rating above 8.5"
- "What's the average runtime of action movies?"
- "Who are the top 10 most prolific actors in the database?"

#### Airbnb Data Analysis (sample_airbnb)

- "Switch to sample_airbnb database"
- "What types of properties are listed on Airbnb?"
- "What's the average price of listings in Brooklyn?"
- "Find the top 5 most reviewed listings"
- "What neighborhoods have the most listings?"
- "Analyze the distribution of prices across different property types"

#### Weather Data Queries (sample_weatherdata)

- "Switch to sample_weatherdata database"
- "What's the schema of the data collection?"
- "Find the highest temperature recorded in the dataset"
- "What's the average pressure reading across all measurements?"
- "Show me readings where callLetters is 'SHIP'"

#### Advanced Operations

- "Switch back to the sample_mflix database"
- "Create an index on the title field in the movies collection"
- "Analyze the schema of the movies collection and suggest improvements"
- "Build an aggregation pipeline to show the count of movies by year and genre"
- "Find distinct countries where movies were produced"
- "Export a CSV with the top 50 rated movies including title, year, and rating"

#### Admin Queries

- "Switch to the admin database, and show me the server status"
- "Show me the users defined in this database"
- "Switch to the config database"
- "Report on anything interesting about the collections in this database"
- "Switch to the local database"
- "Analyze the startup log entries"

## Disclaimer

MongoDB Lens:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
