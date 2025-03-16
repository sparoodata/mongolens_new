# MongoDB Lens

[![License](https://img.shields.io/github/license/furey/mongodb-lens)](./LICENSE)
[![Docker Hub Version](https://img.shields.io/docker/v/furey/mongodb-lens)](https://hub.docker.com/r/furey/mongodb-lens)
[![NPM Version](https://img.shields.io/npm/v/mongodb-lens)](https://www.npmjs.com/package/mongodb-lens)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-orange.svg)](https://www.buymeacoffee.com/furey)

**MongoDB Lens** is a local Model Context Protocol (MCP) server with full featured access to MongoDB databases using natural language via LLMs to perform queries, run aggregations, optimize performance, and more.

## Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Client Setup](#client-setup)
- [Data Protection](#data-protection)
- [Tutorial](#tutorial)
- [Disclaimer](#disclaimer)
- [Support](#support)

## Quick Start

- [Install](#installation) MongoDB Lens
- [Configure](#configuration) MongoDB Lens
- [Set up](#client-setup) your MCP Client (e.g. [Claude Desktop](#client-setup-claude-desktop))
- Explore your MongoDB databases with [natural language queries](#tutorial-4-example-queries)

## Features

- [Tools](#tools)
- [Resources](#resources)
- [Prompts](#prompts)
- [Other](#other-features)

### Tools

- `aggregate-data`: Execute aggregation pipelines
- `analyze-query-patterns`: Analyze live queries and suggest optimizations
- `analyze-schema`: Automatically infer collection schemas
- `bulk-operations`: Perform multiple operations efficiently ([requires confirmation](#data-protection-confirmation-for-destructive-operations) for destructive operations)
- `collation-query`: Find documents with language-specific collation rules
- `compare-schemas`: Compare schemas between two collections
- `count-documents`: Count documents matching specified criteria
- `create-collection`: Create new collections with custom options
- `create-database`: Create a new database with option to switch to it
- `create-index`: Create new indexes for performance optimization
- `create-timeseries`: Create time series collections for temporal data
- `create-user`: Create new database users with specific roles
- `current-database`: Show the current database context
- `delete-document`: Delete documents matching specified criteria ([requires confirmation](#data-protection-confirmation-for-destructive-operations))
- `distinct-values`: Extract unique values for any field
- `drop-collection`: Remove collections from the database ([requires confirmation](#data-protection-confirmation-for-destructive-operations))
- `drop-database`: Drop a database ([requires confirmation](#data-protection-confirmation-for-destructive-operations))
- `drop-index`: Remove indexes from collections ([requires confirmation](#data-protection-confirmation-for-destructive-operations))
- `drop-user`: Remove database users ([requires confirmation](#data-protection-confirmation-for-destructive-operations))
- `explain-query`: Analyze query execution plans
- `export-data`: Export query results in JSON or CSV format
- `find-documents`: Run queries with filters, projections, and sorting
- `generate-schema-validator`: Generate JSON Schema validators
- `geo-query`: Perform geospatial queries with various operators
- `get-stats`: Retrieve database or collection statistics
- `gridfs-operation`: Manage large files with GridFS buckets
- `list-collections`: Explore collections in the current database
- `list-databases`: View all accessible databases
- `map-reduce`: Run MapReduce operations for complex data processing
- `modify-document`: Insert or update specific documents
- `rename-collection`: Rename existing collections ([requires confirmation](#data-protection-confirmation-for-destructive-operations) when dropping targets)
- `shard-status`: View sharding configuration for databases and collections
- `text-search`: Perform full-text search across text-indexed fields
- `transaction`: Execute multiple operations in a single ACID transaction
- `use-database`: Switch to a specific database context
- `validate-collection`: Check for data inconsistencies
- `watch-changes`: Monitor real-time changes to collections

### Resources

- `collection-indexes`: Index information for a collection
- `collection-schema`: Schema information for a collection
- `collection-stats`: Performance statistics for a collection
- `collection-validation`: Validation rules for a collection
- `collections`: List of collections in the current database
- `database-triggers`: Database change streams and event triggers configuration
- `database-users`: Database users and roles in the current database
- `databases`: List of all accessible databases
- `performance-metrics`: Real-time performance metrics and profiling data
- `replica-status`: Replica set status and configuration
- `server-status`: Server status information
- `stored-functions`: Stored JavaScript functions in the current database

### Prompts

- `aggregation-builder`: Step-by-step creation of aggregation pipelines
- `backup-strategy`: Customized backup and recovery recommendations
- `data-modeling`: Expert advice on MongoDB schema design for specific use cases
- `database-health-check`: Comprehensive database health assessment and recommendations
- `index-recommendation`: Get personalized index suggestions based on query patterns
- `inspector-guide`: Get help using MongoDB Lens with MCP Inspector
- `migration-guide`: Step-by-step MongoDB version migration plans
- `mongo-shell`: Generate MongoDB shell commands with explanations
- `multi-tenant-design`: Design MongoDB multi-tenant database architecture
- `query-builder`: Interactive guidance for constructing MongoDB queries
- `query-optimizer`: Optimization recommendations for slow queries
- `schema-analysis`: Detailed collection schema analysis with recommendations
- `schema-versioning`: Manage schema evolution in MongoDB applications
- `security-audit`: Database security analysis and improvement recommendations
- `sql-to-mongodb`: Convert SQL queries to MongoDB aggregation pipelines

### Other Features

- [Other Features: Overview](#other-features-overview)
- [Other Features: New Database Metadata](#other-features-new-database-metadata)
- [Other Features: MongoDB Version Compatibility](#other-features-mongodb-version-compatibility)

#### Other Features: Overview

MongoDB Lens includes several additional features:

- **Sanitized Inputs**: Security enhancements for query processing
- **Configuration File**: Custom configuration via `~/.mongodb-lens.json`
- **Connection Resilience**: Automatic reconnection with exponential backoff
- **JSONRPC Error Handling**: Comprehensive error handling with proper error codes
- **Memory Management**: Automatic memory monitoring and cleanup for large operations
- **Smart Caching**: Enhanced caching for schemas, collection lists, and server status

#### Other Features: New Database Metadata

When MongoDB Lens creates a new database via `create-database` or `create-database-and-switch` tools, it automatically adds a `metadata` collection containing a single document. This serves several purposes:

- MongoDB only persists databases containing at least one collection
- Records database creation details (timestamp, tool version, user)
- Captures environment information for diagnostics

<details>
  <summary><strong>Example metadata document</strong></summary>

```js
{
    "_id" : ObjectId("67d5284463788ec38aecee14"),
    "created" : {
        "timestamp" : ISODate("2025-03-15T07:12:04.705Z"),
        "tool" : "MongoDB Lens v5.0.7",
        "user" : "anonymous"
    },
    "mongodb" : {
        "version" : "3.6.23",
        "connectionInfo" : {
            "host" : "unknown",
            "readPreference" : "primary"
        }
    },
    "database" : {
        "name" : "example_database",
        "description" : "Created via MongoDB Lens"
    },
    "system" : {
        "hostname" : "unknown",
        "platform" : "darwin",
        "nodeVersion" : "v22.14.0"
    },
    "lens" : {
        "version" : "5.0.7",
        "startTimestamp" : ISODate("2025-03-15T07:10:06.084Z")
    }
}
```

</details>

You can safely remove this collection once you've added your own collections to the new database.

#### Other Features: MongoDB Version Compatibility

MongoDB Lens aims to work seamlessly across different MongoDB versions without requiring user configuration. It automatically adapts to version-specific APIs and result formats:

- **API Adaptation**: Transparently adjusts to API changes between versions
- **Legacy Operation Support**: Supports both deprecated and current operation patterns
- **Automatic Result Format Detection**: Handles both modern and legacy result formats from MongoDB drivers

Key compatibility features include:

- **Index Operations**: Supports various index creation and management APIs
- **Bulk Operations**: Detects and uses the appropriate bulk API based on availability
- **Aggregation Pipeline**: Handles different cursor implementations and result formats
- **CRUD Operations**: Normalizes results across MongoDB versions for consistent responses
- **Server Status**: Normalizes status information across versions for consistent reporting
- **Collection Management**: Adapts to different collection creation and modification patterns

This backward compatibility layer aims to ensure MongoDB Lens works reliably with both older MongoDB deployments and the latest versions, providing consistent behavior without requiring version-specific configuration.

## Installation

MongoDB Lens can be installed and run in several ways:

- [NPX](#installation-npx) (Easiest)
- [Docker Hub](#installation-docker-hub)
- [Node.js from Source](#installation-nodejs-from-source)
- [Docker from Source](#installation-docker-from-source)
- [Installation Verification](#installation-verification)

### Installation: NPX

> [!NOTE]<br>
> NPX requires [Node.js](https://nodejs.org/en/download) installed and running on your system (suggestion: use [Volta](https://volta.sh)).

The easiest way to run MongoDB Lens is using `npx`:

```console
# Ensure Node.js is installed 
node --version # Ideally >= v22.x but MongoDB Lens is >= v18.x compatible

# Using default connection string mongodb://localhost:27017
npx -y mongodb-lens

# Using custom connection string
npx -y mongodb-lens mongodb://your-connection-string
```

> [!TIP]<br>
> If you encounter permissions errors with `npx` try running `npx clear-npx-cache` prior to running `npx -y mongodb-lens` (this clears the cache and re-downloads the package).

### Installation: Docker Hub

> [!NOTE]<br>
> Docker Hub requires [Docker](https://docs.docker.com/get-started/get-docker) installed and running on your system.

Run MongoDB Lens via Docker Hub:

```console
# Using default connection string mongodb://localhost:27017
docker run --rm -i --network=host furey/mongodb-lens

# Using custom connection string
docker run --rm -i --network=host furey/mongodb-lens mongodb://your-connection-string

# Using "--pull" to keep the Docker image up-to-date
docker run --rm -i --network=host --pull=always furey/mongodb-lens
```

### Installation: Node.js from Source

> [!NOTE]<br>
> Node.js from source requires [Node.js](https://nodejs.org/en/download) installed and running on your system (suggestion: use [Volta](https://volta.sh)).

1. Clone the MongoDB Lens repository:<br>
    ```console
    git clone https://github.com/furey/mongodb-lens.git
    ```
1. Navigate to the cloned repository directory:<br>
    ```console
    cd /path/to/mongodb-lens
    ```
1. Ensure Node.js is installed:<br>
    ```console
    node --version # Ideally >= v22.x but MongoDB Lens is >= v18.x compatible
    ```
1. Install Node.js dependencies:<br>
    ```console
    npm ci
    ```
1. Start the server:<br>
    ```console
    # Using default connection string mongodb://localhost:27017
    node mongodb-lens.js

    # Using custom connection string
    node mongodb-lens.js mongodb://your-connection-string
    ```

### Installation: Docker from Source

> [!NOTE]<br>
> Docker from source requires [Docker](https://docs.docker.com/get-started/get-docker) installed and running on your system.

1. Clone the MongoDB Lens repository:<br>
    ```console
    git clone https://github.com/furey/mongodb-lens.git
    ```
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
{"method":"resources/read","params":{"uri":"mongodb://databases"},"jsonrpc":"2.0","id":1}
```

The server should respond with a list of databases in your MongoDB instance, for example:

```json
{"result":{"contents":[{"uri":"mongodb://databases","text":"Databases (12):\n- admin (180.00 KB)\n- config (108.00 KB)\n- local (40.00 KB)\n- sample_airbnb (51.88 MB)\n- sample_analytics (9.46 MB)\n- sample_geospatial (980.00 KB)\n- sample_guides (40.00 KB)\n- sample_mflix (108.90 MB)\n- sample_restaurants (7.73 MB)\n- sample_supplies (968.00 KB)\n- sample_training (40.85 MB)\n- sample_weatherdata (2.69 MB)"}]},"jsonrpc":"2.0","id":1}
```

MongoDB Lens is now installed and ready to accept MCP requests.

## Configuration

- [MongoDB Connection String](#configuration-mongodb-connection-string)
- [Verbose Logging](#configuration-verbose-logging)
- [Config File](#configuration-config-file)

### Configuration: MongoDB Connection String

The server accepts a MongoDB connection string as its only argument.

Example NPX usage:

```console
npx -y mongodb-lens mongodb://your-connection-string
```

MongoDB connection strings have the following format:

```txt
mongodb://[username:password@]host[:port][/database][?options]
```

Example connection strings:

- Local connection:<br>
  `mongodb://localhost:27017`
- Connection to `mydatabase` with credentials from `admin` database:<br>
  `mongodb://username:password@hostname:27017/mydatabase?authSource=admin`
- Connection to `mydatabase` with various other options:<br>
  `mongodb://hostname:27017/mydatabase?retryWrites=true&w=majority`

If no connection string is provided, the server will attempt to connect via local connection.

### Configuration: Verbose Logging

With verbose logging enabled, the server will output additional information to the console.

To enable verbose logging, set environment variable `VERBOSE_LOGGING` to `true`.

Example NPX usage:

```console
VERBOSE_LOGGING=true npx -y mongodb-lens mongodb://your-connection-string
```

Example Docker Hub usage:

```console
docker run --rm -i --network=host -e VERBOSE_LOGGING='true' furey/mongodb-lens mongodb://your-connection-string
```

### Configuration: Config File

MongoDB Lens can also be configured via JSON config file: `~/.mongodb-lens.json`

Alternatively, set environment variable `CONFIG_PATH` to the path of your custom config file.

Example NPX usage:

```console
CONFIG_PATH='/path/to/config.json' npx -y mongodb-lens
```

Example Docker Hub usage:

```console
docker run --rm -i --network=host -v /path/to/config.json:/root/.mongodb-lens.json furey/mongodb-lens
```

Example configuration file contents:

```json
{
  "mongoUri": "mongodb://username:password@hostname:27017/mydatabase?authSource=admin",
  "connectionOptions": {
    "maxPoolSize": 20,
    "connectTimeoutMS": 30000
  }
}
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

- [Option 1: NPX (Recommended)](#option-1-npx-recommended)
- [Option 2: Docker Hub Image](#option-2-docker-hub-image)
- [Option 3: Local Node.js Installation](#option-3-local-nodejs-installation)
- [Option 4: Local Docker Image](#option-4-local-docker-image)

For each option:

- Replace `mongodb://your-connection-string` with your MongoDB connection string or omit it to use the default `mongodb://localhost:27017`.
- Set `VERBOSE_LOGGING` to `true` or `false`.
- To use a custom config file, see [Configuration: Config File](#configuration-config-file) and adapt option accordingly.

##### Option 1: NPX (Recommended)

```json
{
  "mcpServers": {
    "mongodb-lens": {
      "command": "/path/to/npx",
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

##### Option 2: Docker Hub Image

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
        "--pull=always",
        "-e",
        "VERBOSE_LOGGING=[true|false]",
        "furey/mongodb-lens",
        "mongodb://your-connection-string"
      ]
    }
  }
}
```

##### Option 3: Local Node.js Installation

```json
{
  "mcpServers": {
    "mongodb-lens": {
      "command": "/path/to/node",
      "args": [
        "/path/to/mongodb-lens.js",
        "mongodb://your-connection-string"
      ],
      "env": {
        "VERBOSE_LOGGING": "[true|false]"
      }
    }
  }
}
```

##### Option 4: Local Docker Image

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

> [!NOTE]<br>
> MCP Inspector starts a proxy server on port 3000 and web client on port 5173.

Example NPX usage:

1. Run MCP Inspector:<br>
    ```console
    # Using default connection string mongodb://localhost:27017
    npx -y @modelcontextprotocol/inspector npx -y mongodb-lens

    # Using custom connection string
    npx -y @modelcontextprotocol/inspector npx -y mongodb-lens mongodb://your-connection-string

    # Using verbose logging
    npx -y @modelcontextprotocol/inspector -e VERBOSE_LOGGING=true npx -y mongodb-lens
    
    # Using custom ports
    SERVER_PORT=1234 CLIENT_PORT=5678 npx -y @modelcontextprotocol/inspector npx -y mongodb-lens
    ```
1. Open MCP Inspector: http://localhost:5173

MCP Inspector should support the full range of MongoDB Lens capabilities, including autocompletion for collection names and query fields.

For more, see: [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

### Client Setup: Other MCP Clients

MongoDB Lens should be usable with any MCP-compatible client.

For more, see: [MCP Documentation: Example Clients](https://modelcontextprotocol.io/clients)

## Data Protection

To protect your data while using MongoDB Lens, consider the following:

- [Read-Only User Accounts](#data-protection-read-only-user-accounts)
- [Working with Database Backups](#data-protection-working-with-database-backups)
- [Confirmation for Destructive Operations](#data-protection-confirmation-for-destructive-operations)

### Data Protection: Read-Only User Accounts

When connecting MongoDB Lens to your database, the permissions granted to the user in your connection string dictate what actions can be performed. For exploration and analysis, a read-only user can prevent unintended writes or deletes, ensuring MongoDB Lens can query data but not alter it.

To set this up, create a user with the `'read'` role scoped to the database(s) you're targeting. In MongoDB shell, you'd run something like:

```js
use admin

db.createUser({
  user: 'readonly',
  pwd: 'eXaMpLePaSsWoRd',
  roles: [{ role: 'read', db: 'mydatabase' }]
})
```

Then, plug those credentials into your MongoDB Lens connection string (e.g. `mongodb://readonly:eXaMpLePaSsWoRd@localhost:27017/mydatabase`). This restricts MongoDB Lens to read-only operations, safeguarding your data during development or testing. It's a simple yet effective way to enforce security boundaries, especially when you're poking around schemas or running ad-hoc queries.

### Data Protection: Working with Database Backups

To keep your production data unmodified while leveraging MongoDB Lens for analysis, its suggested to use a backup copy hosted on a separate MongoDB instance. This setup isolates your live environment, letting you experiment with queries or aggregations without risking accidental corruption.

Start by generating a backup with `mongodump`. Next, spin up a fresh MongoDB instance (e.g. on a different port like `27018`) and restore the backup there using `mongorestore`. Once it's running, point MongoDB Lens to the backup instance's connection string (e.g. `mongodb://localhost:27018/mydatabase`).

This approach gives you a sandbox to test complex operations—like pipeline-heavy aggregations or schema tweaks—without touching your production data. It's a practical choice when you need to dig into your dataset safely, especially in scenarios where live modifications aren't an option.

### Data Protection: Confirmation for Destructive Operations

MongoDB Lens implements a token-based confirmation system for potentially destructive operations. This system requires a two-step process for executing commands that could result in data loss:

1. First command invocation: Returns a 4-digit confirmation token that expires after 5 minutes
2. Second command invocation: Executes the operation if provided with the valid token

Operations that require confirmation include:

- `bulk-operations`: When including delete operations
- `delete-document`: Delete one or multiple documents
- `drop-collection`: Delete a collection and all its documents
- `drop-database`: Permanently delete a database
- `drop-index`: Remove an index (potential performance impact)
- `drop-user`: Remove a database user
- `rename-collection`: When the target collection exists and will be dropped

This protection mechanism prevents accidental data loss from typos and unintended commands. It's a safety net ensuring you're aware of the consequences before proceeding with potentially harmful actions.

#### Bypassing Confirmation for Destructive Operations

You might want to bypass the token confirmation system.

Set the environment variable `DISABLE_DESTRUCTIVE_OPERATION_TOKENS` to `true` to execute destructive operations immediately without confirmation:

```console
# Using NPX
DISABLE_DESTRUCTIVE_OPERATION_TOKENS=true npx -y mongodb-lens

# Using Docker
docker run --rm -i --network=host -e DISABLE_DESTRUCTIVE_OPERATION_TOKENS='true' furey/mongodb-lens
```

> [!WARNING]<br>
> Disabling confirmation tokens removes an important safety mechanism. It's strongly recommended to only use this option in controlled environments where data loss is acceptable, such as development or testing. Disable at your own risk.

## Tutorial

This following tutorial guides you through setting up a MongoDB container with sample data, then using MongoDB Lens to interact with it through natural language queries:

1. [Start Sample Data Container](#tutorial-1-start-sample-data-container)
2. [Import Sample Data](#tutorial-2-import-sample-data)
3. [Connect MongoDB Lens](#tutorial-3-connect-mongodb-lens)
4. [Example Queries](#tutorial-4-example-queries)
5. [Working With Confirmation Protection](#tutorial-5-working-with-confirmation-protection)

### Tutorial: 1. Start Sample Data Container

> [!NOTE]<br>
> This tutorial assumes you have [Docker](https://docs.docker.com/get-started/get-docker/) installed and running on your system.

> [!IMPORTANT]<br>
> If Docker is already running a container on port 27017, stop it before proceeding.

1. Initialise the sample data container:<br>
    ```console
    docker run --name mongodb-sampledata -d -p 27017:27017 mongo:6
    ```
1. Verify the container is running without issue:<br>
    ```console
    docker ps | grep mongodb-sampledata
    ```

### Tutorial: 2. Import Sample Data

MongoDB provides several [sample datasets](https://www.mongodb.com/docs/atlas/sample-data/#available-sample-datasets) which we'll use to explore MongoDB Lens.

1. Download the sample datasets:
    ```console<br>
    curl -LO https://atlas-education.s3.amazonaws.com/sampledata.archive
    ```
2. Copy the sample datasets into your sample data container:<br>
    ```console
    docker cp sampledata.archive mongodb-sampledata:/tmp/
    ```
3. Import the sample datasets into MongoDB:<br>
    ```console
    docker exec -it mongodb-sampledata mongorestore --archive=/tmp/sampledata.archive
    ```

This will import several databases:

- `sample_airbnb`: Airbnb listings and reviews
- `sample_analytics`: Customer and account data
- `sample_geospatial`: Geographic data
- `sample_mflix`: Movie data
- `sample_restaurants`: Restaurant data
- `sample_supplies`: Supply chain data
- `sample_training`: Training data for various applications
- `sample_weatherdata`: Weather measurements

### Tutorial: 3. Connect MongoDB Lens

[Install](#installation) MongoDB Lens as per the [Quick Start](#quick-start) instructions.

Set your [MCP Client](#client-setup) to connect to MongoDB Lens via: `mongodb://localhost:27017`

> [!TIP]<br>
> Omitting the connection string from your MCP Client configuration will default the connection string to `mongodb://localhost:27017`.

Example [Claude Desktop configuration](#client-setup-claude-desktop):

```json
{
  "mcpServers": {
    "mongodb-lens": {
      "command": "/path/to/npx",
      "args": [
        "-y",
        "mongodb-lens"
      ]
    }
  }
}
```

### Tutorial: 4. Example Queries

With your MCP Client running and connected to MongoDB Lens, try the following example queries:

- [Example Queries: Basic Database Operations](#example-queries-basic-database-operations)
- [Example Queries: Collection Management](#example-queries-collection-management)
- [Example Queries: User Management](#example-queries-user-management)
- [Example Queries: Querying Data](#example-queries-querying-data)
- [Example Queries: Schema Analysis](#example-queries-schema-analysis)
- [Example Queries: Data Modification](#example-queries-data-modification)
- [Example Queries: Performance & Index Management](#example-queries-performance--index-management)
- [Example Queries: Geospatial & Special Operations](#example-queries-geospatial--special-operations)
- [Example Queries: Export, Administrative & Other Features](#example-queries-export-administrative--other-features)

#### Example Queries: Basic Database Operations

- _"List all available databases"_<br>
 <sup>➥ Uses `list-databases` tool</sup>
- _"What database am I currently using?"_<br>
 <sup>➥ Uses `current-database` tool</sup>
- _"Switch to the sample_mflix database"_<br>
 <sup>➥ Uses `use-database` tool</sup>
- _"Create a new database called test_db"_<br>
 <sup>➥ Uses `create-database` tool</sup>
- _"Create another database called analytics_db and switch to it"_<br>
 <sup>➥ Uses `create-database` tool with switch=true</sup>
- _"Drop the test_db database"_<br>
 <sup>➥ Uses `drop-database` tool</sup>
- _"Drop test_db with token 1234"_<br>
 <sup>➥ Uses `drop-database` tool (with token)</sup>

#### Example Queries: Collection Management

- _"What collections are in the current database?"_<br>
 <sup>➥ Uses `list-collections` tool</sup>
- _"Create a new collection named user_logs"_<br>
 <sup>➥ Uses `create-collection` tool</sup>
- _"Drop the user_logs collection"_<br>
 <sup>➥ Uses `drop-collection` tool</sup>
- _"Drop user_logs collection with token 5678"_<br>
 <sup>➥ Uses `drop-collection` tool (with token)</sup>
- _"Rename the user_logs collection to system_logs"_<br>
 <sup>➥ Uses `rename-collection` tool</sup>
- _"Check the data consistency in the movies collection"_<br>
 <sup>➥ Uses `validate-collection` tool</sup>

#### Example Queries: User Management

- _"Create a read-only user for analytics"_<br>
 <sup>➥ Uses `create-user` tool</sup>
- _"Drop the inactive_user account"_<br>
 <sup>➥ Uses `drop-user` tool</sup>
- _"Drop inactive_user with token 7890"_<br>
 <sup>➥ Uses `drop-user` tool (with token)</sup>

#### Example Queries: Querying Data

- _"Count all documents in the movies collection"_<br>
 <sup>➥ Uses `count-documents` tool</sup>
- _"Find the top 5 movies with the highest IMDB rating"_<br>
 <sup>➥ Uses `find-documents` tool</sup>
- _"Show me aggregate data for movies grouped by decade"_<br>
 <sup>➥ Uses `aggregate-data` tool</sup>
- _"List all unique countries where movies were produced"_<br>
 <sup>➥ Uses `distinct-values` tool</sup>
- _"Search for movies containing 'godfather' in their title"_<br>
 <sup>➥ Uses `text-search` tool</sup>
- _"Find German users with last name 'müller' using proper collation"_<br>
 <sup>➥ Uses `collation-query` tool</sup>

#### Example Queries: Schema Analysis

- _"What's the schema structure of the movies collection?"_<br>
 <sup>➥ Uses `analyze-schema` tool</sup>
- _"Compare the schema between users and comments collections"_<br>
 <sup>➥ Uses `compare-schemas` tool</sup>
- _"Generate a JSON schema validator for the movies collection"_<br>
 <sup>➥ Uses `generate-schema-validator` tool</sup>
- _"Analyze common query patterns for the movies collection"_<br>
 <sup>➥ Uses `analyze-query-patterns` tool</sup>

#### Example Queries: Data Modification

- _"Insert a new movie document"_<br>
 <sup>➥ Uses `modify-document` tool (insert operation)</sup>
- _"Update all movies from 1994 to add a 'classic' flag"_<br>
 <sup>➥ Uses `modify-document` tool (update operation)</sup>
- _"Delete all movies with zero ratings"_<br>
 <sup>➥ Uses `delete-document` tool</sup>
- _"Delete movies with zero ratings using token 9012"_<br>
 <sup>➥ Uses `delete-document` tool (with token)</sup>
- _"Run these bulk operations on the movies collection"_<br>
 <sup>➥ Uses `bulk-operations` tool</sup>

#### Example Queries: Performance & Index Management

- _"Create an index on the title field in the movies collection"_<br>
 <sup>➥ Uses `create-index` tool</sup>
- _"Drop the unused ratings_idx index"_<br>
 <sup>➥ Uses `drop-index` tool</sup>
- _"Drop the ratings_idx index with token 3456"_<br>
 <sup>➥ Uses `drop-index` tool (with token)</sup>
- _"Explain the execution plan for finding movies from 1995"_<br>
 <sup>➥ Uses `explain-query` tool</sup>
- _"Get statistics for the current database"_<br>
 <sup>➥ Uses `get-stats` tool (database target)</sup>
- _"Show collection stats for the movies collection"_<br>
 <sup>➥ Uses `get-stats` tool (collection target)</sup>

#### Example Queries: Geospatial & Special Operations

- _"Switch to sample_geospatial database, then find all shipwrecks within 10km of coordinates [-80.12, 26.46]"_<br>
 <sup>➥ Uses `geo-query` tool</sup>
- _"Switch to sample_mflix database, then run this MapReduce to calculate movie counts by year with map function 'function() { emit(this.year, 1); }' and reduce function 'function(key, values) { return Array.sum(values); }'"_<br>
 <sup>➥ Uses `map-reduce` tool</sup>
- _"Switch to sample_analytics database, then execute a transaction to move funds between accounts"_<br>
 <sup>➥ Uses `transaction` tool</sup>
- _"Create a time series collection for sensor readings"_<br>
 <sup>➥ Uses `create-timeseries` tool</sup>
- _"Watch for changes in the users collection for 30 seconds"_<br>
 <sup>➥ Uses `watch-changes` tool</sup>
- _"List all files in the images GridFS bucket"_<br>
 <sup>➥ Uses `gridfs-operation` tool (list operation)</sup>

#### Example Queries: Export, Administrative & Other Features

- _"Switch to sample_mflix database, then export the top 20 movies based on 'tomatoes.critic.rating' as a CSV with title, year and rating fields, output as raw csv text in a single code block"_<br>
 <sup>➥ Uses `export-data` tool</sup>
- _"Switch to sample_analytics database, then check its sharding status"_<br>
 <sup>➥ Uses `shard-status` tool</sup>
- _"Switch to sample_weatherdata database, and generate an interactive report on its current state"_<br>
  <sup>➥ Uses numerous tools</sup>

### Tutorial: 5. Working With Confirmation Protection

MongoDB Lens includes a safety mechanism for potentially destructive operations. Here's how it works in practice:

1. Request to drop a collection:<br>
    ```
    "Drop the collection named test_collection"
    ```
1. MongoDB Lens responds with a warning and confirmation token:<br>
    ```
    ⚠️ DESTRUCTIVE OPERATION WARNING ⚠️

    You've requested to drop the collection 'test_collection'.

    This operation is irreversible and will permanently delete all data in this collection.

    To confirm, you must type the 4-digit confirmation code EXACTLY as shown below:

    Confirmation code: 9876

    This code will expire in 5 minutes for security purposes.
    ```
1. Confirm the operation by including the confirmation token:<br>
    ```
    "Drop test_collection with token 1234"
    ```
1. MongoDB Lens executes the operation:<br>
    ```
    Collection 'test_collection' has been permanently deleted.
    ```

This two-step process prevents accidental data loss by requiring explicit confirmation.

For development environments, this can be [bypassed](#bypassing-confirmation-for-destructive-operations) by setting the `DISABLE_DESTRUCTIVE_OPERATION_TOKENS` environment variable to `true`.

## Disclaimer

MongoDB Lens:

- is licensed under the [MIT License](./LICENSE).
- is not affiliated with or endorsed by MongoDB, Inc.
- is written with the assistance of AI and may contain errors.
- is intended for educational and experimental purposes only.
- is provided as-is with no warranty—please use at your own risk.

## Support

If you've found MongoDB Lens helpful consider supporting my work through:

[Buy Me a Coffee](https://www.buymeacoffee.com/furey) | [GitHub Sponsorship](https://github.com/sponsors/furey)

Contributions help me continue developing and improving this tool, allowing me to dedicate more time to add new features and ensuring it remains a valuable resource for the community.
