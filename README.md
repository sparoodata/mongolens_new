# MongoDB Lens

[![License](https://img.shields.io/github/license/furey/mongodb-lens)](./LICENSE)
[![Docker Hub Version](https://img.shields.io/docker/v/furey/mongodb-lens)](https://hub.docker.com/r/furey/mongodb-lens)
[![NPM Version](https://img.shields.io/npm/v/mongodb-lens)](https://www.npmjs.com/package/mongodb-lens)

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
- Start exploring your MongoDB databases with [natural language queries](#tutorial-example-queries)

## Features

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

MongoDB Lens can be installed and run in several ways:

- [NPX](#installation-npx) (Easiest)
- [Docker Hub](#installation-docker-hub)
- [Node.js from Source](#installation-nodejs-from-source)
- [Docker from Source](#installation-docker-from-source)
- [Installation Verification](#installation-verification)

### Installation: NPX

The easiest way to run MongoDB Lens is using `npx` without installing anything:

```console
# Using default connection string mongodb://localhost:27017
npx -y mongodb-lens

# Using custom connection string
npx -y mongodb-lens mongodb://your-connection-string
```

### Installation: Docker Hub

Run MongoDB Lens directly from Docker Hub without building:

```console
# Using default connection string mongodb://localhost:27017
docker run --rm -i --network=host furey/mongodb-lens

# Using custom connection string
docker run --rm -i --network=host furey/mongodb-lens mongodb://your-connection-string
```

### Installation: Node.js from Source

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Ensure [Node](https://nodejs.org/en/download) running (tip: use [Volta](https://volta.sh)):<br>
    `$ node -v` >= `22.*`
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

### Installation: Docker from Source

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Build the Docker image:<br>
    ```console
    docker build -t mongodb-lens .
    ```
1. Run the container:<br>
    ```console
    # Using default connection string mongodb://localhost:27017
    docker run --rm -i --network=host mongodb-lens

    # Using custom connection string
    docker run --rm -i --network=host mongodb-lens mongodb://your-connection-string
    ```

### Installation Verification

To verify the installation, paste and run the following jsonrpc message into the server's stdio:
    
```json
{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"mongodb://databases"}}
```

The server should respond with a list of databases in your MongoDB instance.

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
1. Open `claude_desktop_config.json` (create it if it doesn't exist):
    - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
    - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
1. Add the MongoDB Lens server configuration as per [configuration options](#claude-desktop-configuration-options)
1. Restart Claude Desktop
1. Start a conversation with Claude about your MongoDB data

#### Claude Desktop Configuration Options

- [Option 1: Use NPX (Recommended)](#option-1-use-npx-recommended)
- [Option 2: Use Docker Hub Image](#option-2-use-docker-hub-image)
- [Option 3: Local Node.js Installation](#option-3-local-nodejs-installation)
- [Option 4: Local Docker Image](#option-4-local-docker-image)

For each option:

- Replace `mongodb://your-connection-string` with your MongoDB connection string or omit it to use the default `mongodb://localhost:27017`.
- For `VERBOSE_LOGGING`, set to `true` to enable verbose logging or `false` to disable it.

##### Option 1: Use NPX (Recommended)

```json
{
  "mcpServers": {
    "mongodb-lens": {
      "command": "npx",
      "args": [
        "-y",
        "mongodb-lens",
        "mongodb://your-connection-string"
      ],
      "env": {
        "VERBOSE_LOGGING": "[true|false]"
      }
    }
  }
}
```

#### Option 2: Use Docker Hub Image

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
        "furey/mongodb-lens",
        "mongodb://your-connection-string"
      ]
    }
  }
}
```

#### Option 3: Local Node.js Installation

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
        "VERBOSE_LOGGING": "[true|false]"
      }
    }
  }
}
```

#### Option 4: Local Docker Image

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

### Client Setup: MCP Inspector

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a tool designed for testing and debugging MCP servers.

To use MongoDB Lens with MCP Inspector with Node.js from source:

1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Run Inspector via `npx`:<br>
    ```console
    npx -y @modelcontextprotocol/inspector node mongodb-lens.js mongodb://your-connection-string
    ```
1. Inspector starts a proxy server (default port: 3000) and web app (default port: 5173)
    - To change the default ports:<br>
      ```console
      CLIENT_PORT=8080 SERVER_PORT=9000 npx -y @modelcontextprotocol/inspector node mongodb-lens.js
      ```
1. Open Inspector web app: http://localhost:5173
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

With your MCP Client running and connected to MongoDB Lens, try these example queries that demonstrate the capabilities of the various tools, resources, and prompts available through MongoDB Lens:

- [Example Queries: Basic Database Operations](#example-queries-basic-database-operations)
- [Example Queries: Movie Data Analysis](#example-queries-movie-data-analysis)
- [Example Queries: Airbnb Data Exploration](#example-queries-airbnb-data-exploration)
- [Example Queries: Weather Data Operations](#example-queries-weather-data-operations)
- [Example Queries: Bulk Operations & Data Modeling](#example-queries-bulk-operations--data-modeling)
- [Example Queries: Administrative Operations](#example-queries-administrative-operations)

#### Example Queries: Basic Database Operations

- _"List all available databases"_<br>
  <sup>➥ Uses `list-databases` tool</sup>
- _"What's the current database I'm connected to?"_<br>
  <sup>➥ Uses `current-database` tool</sup>
- _"Switch to the sample_mflix database"_<br>
  <sup>➥ Uses `use-database` tool</sup>
- _"What collections are available in this database?"_<br>
  <sup>➥ Uses `list-collections` tool</sup>
- _"Get statistics for the sample_mflix database"_<br>
  <sup>➥ Uses `get-stats` tool with database target</sup>
- _"Create the temp_collection collection, then drop it"_<br>
  <sup>➥ Uses `create-collection` & `drop-collection` tool</sup>

#### Example Queries: Movie Data Analysis

- _"Count how many movies are in the movies collection"_<br>
  <sup>➥ Uses `count-documents` tool</sup>
- _"Find the top 5 movies by IMDB rating with a runtime over 120 minutes"_<br>
  <sup>➥ Uses `find-documents` tool with sort and filter</sup>
- _"What's the schema of the movies collection?"_<br>
  <sup>➥ Uses `analyze-schema` tool</sup>
- _"Find distinct countries where movies were produced"_<br>
  <sup>➥ Uses `distinct-values` tool</sup>
- _"Create an index on the title field in the movies collection"_<br>
  <sup>➥ Uses `create-index` tool</sup>
- _"Why is my query for movies with over 1000 votes slow? Help me optimize it"_<br>
  <sup>➥ Uses `query-optimizer` prompt</sup>
- _"Run an explain on the query {year: 1995}"_<br>
  <sup>➥ Uses `explain-query` tool</sup>
- _"Build an aggregation pipeline to show the count of movies by decade and genre"_<br>
  <sup>➥ Uses `aggregation-builder` prompt</sup>
- _"Execute this aggregation pipeline: [{$group: {\_id: {$floor: {$divide: ['$year', 10]}}, count: {$sum: 1}}}]"_<br>
  <sup>➥ Uses `aggregate-data` tool</sup>
- _"Update all movies from 1994 to add a 'classic' field set to true"_<br>
  <sup>➥ Uses `modify-document` tool with update operation</sup>

#### Example Queries: Airbnb Data Exploration

- _"Switch to sample_airbnb database"_<br>
  <sup>➥ Uses `use-database` tool</sup>
- _"Get collection statistics for the listingsAndReviews collection"_<br>
  <sup>➥ Uses `get-stats` tool with collection target</sup>
- _"What's the validation rules for the listingsAndReviews collection?"_<br>
  <sup>➥ Uses `collection-validation` resource</sup>
- _"Show me the indexes on the listingsAndReviews collection"_<br>
  <sup>➥ Uses `collection-indexes` resource</sup>
- _"Find listings with more than 5 bedrooms in Manhattan, limited to 10 results"_<br>
  <sup>➥ Uses `find-documents` tool</sup>
- _"Get distinct property types in the listings"_<br>
  <sup>➥ Uses `distinct-values` tool</sup>
- _"Help me create a query filter to find superhosts with pool amenities"_<br>
  <sup>➥ Uses `query-builder` prompt</sup>
- _"Export the top 20 highest-rated listings in Brooklyn as CSV with name, price, and rating"_<br>
  <sup>➥ Uses `export-data` tool</sup>
- _"Is my schema optimized for querying by neighborhood? Analyze and give recommendations"_<br>
  <sup>➥ Uses `schema-analysis` prompt</sup>
- _"Rename the reviews collection to guest_reviews"_<br>
  <sup>➥ Uses `rename-collection` tool</sup>

#### Example Queries: Weather Data Operations

- _"Switch to sample_weatherdata database"_<br>
  <sup>➥ Uses `use-database` tool</sup>
- _"What's in the schema of the data collection?"_<br>
  <sup>➥ Uses `collection-schema` resource</sup>
- _"Find the highest recorded temperatures with a callLetters of 'SHIP'"_<br>
  <sup>➥ Uses `find-documents` tool</sup>
- _"Validate the data collection for inconsistencies"_<br>
  <sup>➥ Uses `validate-collection` tool</sup>
- _"Insert a new weather record for today"_<br>
  <sup>➥ Uses `modify-document` tool with insert operation</sup>
- _"Create a new collection called weather_summary"_<br>
  <sup>➥ Uses `create-collection` tool</sup>
- _"Create index recommendation for queries that filter by callLetters and sort by date"_<br>
  <sup>➥ Uses `index-recommendation` prompt</sup>
- _"Show me how to write a MapReduce operation to get average temperatures by day"_<br>
  <sup>➥ Uses `mongo-shell` prompt</sup>
- _"Run this MapReduce to calculate average pressure by location"_<br>
  <sup>➥ Uses `map-reduce` tool</sup>
- _"Delete all weather readings below -50 degrees"_<br>
  <sup>➥ Uses `modify-document` tool with delete operation</sup>

#### Example Queries: Bulk Operations & Data Modeling

- _"Switch to sample_training database"_<br>
  <sup>➥ Uses `use-database` tool</sup>
- _"Execute a bulk operation to update multiple post documents to add 'edited' flags"_<br>
  <sup>➥ Uses `bulk-operations` tool</sup>
- _"How should I model a social media application in MongoDB?"_<br>
  <sup>➥ Uses `data-modeling` prompt</sup>
- _"Perform a bulk insertion of new product records in the supplies database"_<br>
  <sup>➥ Uses `bulk-operations` tool</sup>
- _"Show me how to use MongoDB Lens with the MCP Inspector"_<br>
  <sup>➥ Uses `inspector-guide` prompt</sup>
- _"What's the optimal data model for a multi-tenant SaaS application with heavy analytical queries?"_<br>
  <sup>➥ Uses `data-modeling` prompt</sup>

#### Example Queries: Administrative Operations

- _"Switch to the admin database"_<br>
  <sup>➥ Uses `use-database` tool</sup>
- _"Show me the server status"_<br>
  <sup>➥ Uses `server-status` resource</sup>
- _"Display the replica set configuration"_<br>
  <sup>➥ Uses `replica-status` resource</sup>
- _"List all users in the database"_<br>
  <sup>➥ Uses `database-users` resource</sup>
- _"Get any stored JavaScript functions"_<br>
  <sup>➥ Uses `stored-functions` resource</sup>
- _"Perform a security audit on my MongoDB deployment"_<br>
  <sup>➥ Uses `security-audit` prompt</sup>
- _"What's a good backup strategy for my MongoDB instance?"_<br>
  <sup>➥ Uses `backup-strategy` prompt</sup>
- _"How would I migrate from MongoDB 4.4 to 6.0?"_<br>
  <sup>➥ Uses `migration-guide` prompt</sup>

## Disclaimer

MongoDB Lens:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty or support—use at your own risk.
