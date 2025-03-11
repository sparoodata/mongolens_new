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

If no connection string is provided, the server will attempt to connect to MongoDB via local connection:

```txt
mongodb://localhost:27017
```

### Configuration: Logging

To enable verbose server logging, set environment variable `VERBOSE_LOGGING` to `true`.

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
      - Replace `/absolute/path/to/mongodb-lens.js` with the full file path to [`mongodb-lens.js`](./mongodb-lens.js)
      - Replace `mongodb://your-connection-string` with your MongoDB connection string
      - Set `VERBOSE_LOGGING` to `true` for verbose MCP Server logs
1. Restart Claude Desktop
1. Start a conversation with Claude about your MongoDB data
    - Claude will show a hammer icon indicating available tools
    - See [example queries](#tutorial-example-queries) for conversation inspiration

### Client Setup: MCP Inspector

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a tool designed for testing and debugging MCP servers.

To use MongoDB Lens with MCP Inspector:

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Run Inspector via `npx`:<br>
    ```console
    npx @modelcontextprotocol/inspector node mongodb-lens.js mongodb://your-connection-string
    ```
1. Inspector starts a proxy server (default port: 3000) and web UI (default port: 5173)
    - To change the default ports:<br>
      ```console
      CLIENT_PORT=8080 SERVER_PORT=9000 npx @modelcontextprotocol/inspector node mongodb-lens.js
      ```
1. Opten the Inspector web UI: http://localhost:5173
1. Inspector should supports the full range of MongoDB Lens capabilities, including autocompletion for collection names and query fields.

For more, see: [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

### Client Setup: Other MCP Clients

MongoDB Lens can be used with any MCP-compatible client.

For more, see: [MCP Documentation: Example Clients](https://modelcontextprotocol.io/clients)

## Tutorial

This following tutorial guides you through setting up a MongoDB container with sample data, then using MongoDB Lens to interact with it through natural language queries:

- [Setting Up Sample Data Container](#tutorial-setting-up-sample-data-container)
- [Importing Sample Data](#tutorial-importing-sample-data)
- [Connecting MongoDB Lens](#tutorial-connecting-mongodb-lens)
- [Example Queries](#tutorial-example-queries)

### Tutorial: Setting Up Sample Data Container

> [!IMPORTANT]<br>
> If you already have a Docker container running on port 27017, stop it before proceeding.

1. Initialise sample data container (requires [Docker](https://docs.docker.com/get-started/get-docker/)):<br>
   ```console
   docker run --name mongodb-sampledata -d -p 27017:27017 mongo:6
   ```
1. Verify the container is running without issue:<br>
   ```console
   docker ps | grep mongodb-sampledata
   ```

### Tutorial: Importing Sample Data

MongoDB provides several [sample datasets](https://www.mongodb.com/docs/atlas/sample-data/#available-sample-datasets), which we'll use to explore MongoDB Lens.

1. Download the sample datasets:
   ```console<br>
   curl -LO https://atlas-education.s3.amazonaws.com/sampledata.archive
   ```
2. Copy the sample datasets into your sample data container:<br>
   ```console
   docker cp sampledata.archive mongodb-sampledata:/tmp/
   ```
3. Restore the sample data:<br>
   ```console
   docker exec -it mongodb-sampledata mongorestore --archive=/tmp/sampledata.archive
   ```

This will import several sample databases including:

- `sample_airbnb`: Airbnb listings and reviews
- `sample_analytics`: Customer and account data
- `sample_geospatial`: Geographic data
- `sample_mflix`: Movie data
- `sample_restaurants`: Restaurant data
- `sample_supplies`: Supply chain data
- `sample_training`: Training data for various applications
- `sample_weatherdata`: Weather measurements

### Tutorial: Connecting MongoDB Lens

Download and [install](#installation) MongoDB Lens as per the [Quick Start](#quick-start) instructions.

Set your [MCP Client](#client-setup) to connect to MongoDB Lens with the connection string:

```txt
mongodb://localhost:27017
```

> [!TIP]<br>
> As the default connection string is `mongodb://localhost:27017`, simply omit it from the client configuration.

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
        "mongodb-lens"
      ]
    }
  }
}
```

### Tutorial: Example Queries

With your MCP Client running and connected to MongoDB Lens, try these example queries that demonstrate the capabilities of the various tools, resources, and prompts available through MongoDB Lens.

#### Basic Database Operations

- _"List all available databases"_<br>
  &nbsp;&nbsp;↳ Uses `list-databases` tool
- _"What's the current database I'm connected to?"_<br>
  &nbsp;&nbsp;↳ Uses `current-database` tool
- _"Switch to the sample_mflix database"_<br>
  &nbsp;&nbsp;↳ Uses `use-database` tool
- _"What collections are available in this database?"_<br>
  &nbsp;&nbsp;↳ Uses `list-collections` tool
- _"Get statistics for the sample_mflix database"_<br>
  &nbsp;&nbsp;↳ Uses `get-stats` tool with database target
- _"Create the temp_collection collection, then drop it"_<br>
  &nbsp;&nbsp;↳ Uses `drop-collection` tool

#### Movie Data Analysis (using `sample_mflix`)

- _"Count how many movies are in the movies collection"_<br>
  &nbsp;&nbsp;↳ Uses `count-documents` tool
- _"Find the top 5 movies by IMDB rating with a runtime over 120 minutes"_<br>
  &nbsp;&nbsp;↳ Uses `find-documents` tool with sort and filter
- _"What's the schema of the movies collection?"_<br>
  &nbsp;&nbsp;↳ Uses `analyze-schema` tool
- _"Find distinct countries where movies were produced"_<br>
  &nbsp;&nbsp;↳ Uses `distinct-values` tool
- _"Create an index on the title field in the movies collection"_<br>
  &nbsp;&nbsp;↳ Uses `create-index` tool
- _"Why is my query for movies with over 1000 votes slow? Help me optimize it"_<br>
  &nbsp;&nbsp;↳ Uses `query-optimizer` prompt
- _"Run an explain on the query {year: 1995}"_<br>
  &nbsp;&nbsp;↳ Uses `explain-query` tool
- _"Build an aggregation pipeline to show the count of movies by decade and genre"_<br>
  &nbsp;&nbsp;↳ Uses `aggregation-builder` prompt
- _"Execute this aggregation pipeline: [{$group: {_id: {$floor: {$divide: ['$year', 10]}}, count: {$sum: 1}}}]"_<br>
  &nbsp;&nbsp;↳ Uses `aggregate-data` tool
- _"Update all movies from 1994 to add a 'classic' field set to true"_<br>
  &nbsp;&nbsp;↳ Uses `modify-document` tool with update operation

#### Airbnb Data Exploration (using `sample_airbnb`)

- _"Switch to sample_airbnb database"_<br>
  &nbsp;&nbsp;↳ Uses `use-database` tool
- _"Get collection statistics for the listingsAndReviews collection"_<br>
  &nbsp;&nbsp;↳ Uses `get-stats` tool with collection target
- _"What's the validation rules for the listingsAndReviews collection?"_<br>
  &nbsp;&nbsp;↳ Uses `collection-validation` resource
- _"Show me the indexes on the listingsAndReviews collection"_<br>
  &nbsp;&nbsp;↳ Uses `collection-indexes` resource
- _"Find listings with more than 5 bedrooms in Manhattan, limited to 10 results"_<br>
  &nbsp;&nbsp;↳ Uses `find-documents` tool
- _"Get distinct property types in the listings"_<br>
  &nbsp;&nbsp;↳ Uses `distinct-values` tool
- _"Help me create a query filter to find superhosts with pool amenities"_<br>
  &nbsp;&nbsp;↳ Uses `query-builder` prompt
- _"Export the top 20 highest-rated listings in Brooklyn as CSV with name, price, and rating"_<br>
  &nbsp;&nbsp;↳ Uses `export-data` tool
- _"Is my schema optimized for querying by neighborhood? Analyze and give recommendations"_<br>
  &nbsp;&nbsp;↳ Uses `schema-analysis` prompt
- _"Rename the reviews collection to guest_reviews"_<br>
  &nbsp;&nbsp;↳ Uses `rename-collection` tool

#### Weather Data Operations (using `sample_weatherdata`)

- _"Switch to sample_weatherdata database"_<br>
  &nbsp;&nbsp;↳ Uses `use-database` tool
- _"What's in the schema of the data collection?"_<br>
  &nbsp;&nbsp;↳ Uses `collection-schema` resource
- _"Find the highest recorded temperatures with a callLetters of 'SHIP'"_<br>
  &nbsp;&nbsp;↳ Uses `find-documents` tool
- _"Validate the data collection for inconsistencies"_<br>
  &nbsp;&nbsp;↳ Uses `validate-collection` tool
- _"Insert a new weather record for today"_<br>
  &nbsp;&nbsp;↳ Uses `modify-document` tool with insert operation
- _"Create a new collection called weather_summary"_<br>
  &nbsp;&nbsp;↳ Uses `create-collection` tool
- _"Create index recommendation for queries that filter by callLetters and sort by date"_<br>
  &nbsp;&nbsp;↳ Uses `index-recommendation` prompt
- _"Show me how to write a MapReduce operation to get average temperatures by day"_<br>
  &nbsp;&nbsp;↳ Uses `mongo-shell` prompt
- _"Run this MapReduce to calculate average pressure by location"_<br>
  &nbsp;&nbsp;↳ Uses `map-reduce` tool
- _"Delete all weather readings below -50 degrees"_<br>
  &nbsp;&nbsp;↳ Uses `modify-document` tool with delete operation

#### Administrative Operations

- _"Switch to the admin database"_<br>
  &nbsp;&nbsp;↳ Uses `use-database` tool
- _"Show me the server status"_<br>
  &nbsp;&nbsp;↳ Uses `server-status` resource
- _"Display the replica set configuration"_<br>
  &nbsp;&nbsp;↳ Uses `replica-status` resource
- _"List all users in the database"_<br>
  &nbsp;&nbsp;↳ Uses `database-users` resource
- _"Get any stored JavaScript functions"_<br>
  &nbsp;&nbsp;↳ Uses `stored-functions` resource
- _"Perform a security audit on my MongoDB deployment"_<br>
  &nbsp;&nbsp;↳ Uses `security-audit` prompt
- _"What's a good backup strategy for my MongoDB instance?"_<br>
  &nbsp;&nbsp;↳ Uses `backup-strategy` prompt
- _"How would I migrate from MongoDB 4.4 to 6.0?"_<br>
  &nbsp;&nbsp;↳ Uses `migration-guide` prompt

#### Bulk Operations & Data Modeling

- _"Switch to sample_training database"_<br>
  &nbsp;&nbsp;↳ Uses `use-database` tool
- _"Execute a bulk operation to update multiple post documents to add 'edited' flags"_<br>
  &nbsp;&nbsp;↳ Uses `bulk-operations` tool
- _"How should I model a social media application in MongoDB?"_<br>
  &nbsp;&nbsp;↳ Uses `data-modeling` prompt
- _"Perform a bulk insertion of new product records in the supplies database"_<br>
  &nbsp;&nbsp;↳ Uses `bulk-operations` tool
- _"Show me how to use MongoDB Lens with the MCP Inspector"_<br>
  &nbsp;&nbsp;↳ Uses `inspector-guide` prompt
- _"What's the optimal data model for a multi-tenant SaaS application with heavy analytical queries?"_<br>
  &nbsp;&nbsp;↳ Uses `data-modeling` prompt
## Disclaimer

MongoDB Lens:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
