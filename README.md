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
- [Set up](#client-setup) your MCP Client (e.g. [Claude Desktop](#client-setup-claude-desktop), [Cursor](https://docs.cursor.com/context/model-context-protocol#configuring-mcp-servers), etc)
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
- `connect-mongodb`: Connect to a different MongoDB URI
- `connect-original`: Connect back to the original MongoDB URI used at startup
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
- `list-connections`: View all available MongoDB connection aliases
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

- [Overview](#other-features-overview)
- [New Database Metadata](#other-features-new-database-metadata)
- [MongoDB Version Compatibility](#other-features-mongodb-version-compatibility)

#### Other Features: Overview

MongoDB Lens includes several additional features:

- **Configuration File**: Custom configuration via `~/.mongodb-lens.json`
- **Connection Resilience**: Automatic reconnection with exponential backoff
- **Component Disabling**: Selectively disable specific tools, prompts or resources
- **JSONRPC Error Handling**: Comprehensive error handling with proper error codes
- **Smart Caching**: Optimized caching for schemas, indexes, fields, collections and more
- **Memory Management**: Automatic memory monitoring and cleanup for large operations

#### Other Features: New Database Metadata

MongoDB Lens inserts a `metadata` collection into each database it creates.

This `metadata` collection stores a single document containing contextual information serving as a permanent record of the database's origin while ensuring the new and otherwise empty database persists in MongoDB's storage system.

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

Once you've added your own collections to your new database, you can safely remove the `metadata` collection via the `drop-collection` tool:

- _"Drop the new database's metadata collection"_<br>
 <sup>➥ Uses `drop-collection` tool (with confirmation)</sup>

#### Other Features: MongoDB Version Compatibility

MongoDB Lens implements a backward compatibility layer to work reliably with both older MongoDB deployments and latest versions, providing consistent behavior without requiring version-specific configuration.

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

The easiest way to run MongoDB Lens is using `npx`.

First, ensure Node.js is installed:

```console
node --version # Ideally >= v22.x but MongoDB Lens is >= v18.x compatible
```

Then, run MongoDB Lens via NPX:

```console
# Using default connection string mongodb://localhost:27017
npx -y mongodb-lens

# Using custom connection string
npx -y mongodb-lens mongodb://your-connection-string

# Using "@latest" to keep the package up-to-date
npx -y mongodb-lens@latest
```

> [!TIP]<br>
> If you encounter permissions errors with `npx` try running `npx clear-npx-cache` prior to running `npx -y mongodb-lens` (this clears the cache and re-downloads the package).

### Installation: Docker Hub

> [!NOTE]<br>
> Docker Hub requires [Docker](https://docs.docker.com/get-started/get-docker) installed and running on your system.

First, ensure Docker is installed:

```console
docker --version # Ideally >= v27.x
```

Then, run MongoDB Lens via Docker Hub:

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
1. Ensure Docker is installed:<br>
    ```console
    docker --version # Ideally >= v27.x
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
- [Config File](#configuration-config-file)
- [Multiple MongoDB Connections](#configuration-multiple-mongodb-connections)
- [Environment Variable Overrides](#configuration-environment-variable-overrides)

### Configuration: MongoDB Connection String

The server accepts a MongoDB connection string as its only argument.

Example NPX usage:

```console
npx -y mongodb-lens@latest mongodb://your-connection-string
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

### Configuration: Config File

MongoDB Lens supports extensive customization via JSON configuration file.

> [!NOTE]<br>
> The config file is optional. MongoDB Lens will run with default settings if no config file is provided.

> [!TIP]<br>
> MongoDB Lens supports both `.json` and `.jsonc` (JSON with comments) file formats.

<details>
  <summary><strong>Example configuration file</strong></summary>

```jsonc
{
  "mongoUri": "mongodb://localhost:27017",         // Default MongoDB connection string or object of alias-URI pairs
  "connectionOptions": {
    "maxPoolSize": 20,                             // Maximum number of connections in the pool
    "retryWrites": false,                          // Whether to retry write operations
    "useNewUrlParser": true,                       // Use MongoDB's new URL parser
    "connectTimeoutMS": 30000,                     // Connection timeout in milliseconds
    "socketTimeoutMS": 360000,                     // Socket timeout in milliseconds
    "useUnifiedTopology": true,                    // Use the new unified topology engine
    "heartbeatFrequencyMS": 10000,                 // How often to ping servers for status
    "serverSelectionTimeoutMS": 30000              // Timeout for server selection
  },
  "defaultDbName": "admin",                        // Default database if not specified in URI
  "connection": {
    "maxRetries": 5,                               // Maximum number of initial connection attempts
    "maxRetryDelayMs": 30000,                      // Maximum delay between retries
    "reconnectionRetries": 10,                     // Maximum reconnection attempts if connection lost
    "initialRetryDelayMs": 1000                    // Initial delay between retries
  },
  "disabled": {
    "tools": [],                                   // List of tools to disable or true to disable all
    "prompts": [],                                 // List of prompts to disable or true to disable all
    "resources": []                                // List of resources to disable or true to disable all
  },
  "cacheTTL": {
    "stats": 15000,                                // Stats cache lifetime in milliseconds
    "schemas": 60000,                              // Schema cache lifetime in milliseconds
    "indexes": 120000,                             // Index cache lifetime in milliseconds
    "collections": 30000,                          // Collections list cache lifetime in milliseconds
    "serverStatus": 20000                          // Server status cache lifetime in milliseconds
  },
  "enabledCaches": [                               // List of caches to enable
    "stats",                                       // Statistics cache
    "fields",                                      // Collection fields cache
    "schemas",                                     // Collection schemas cache
    "indexes",                                     // Collection indexes cache
    "collections",                                 // Database collections cache
    "serverStatus"                                 // MongoDB server status cache
  ],
  "memory": {
    "enableGC": true,                              // Whether to enable garbage collection
    "warningThresholdMB": 1500,                    // Memory threshold for warnings
    "criticalThresholdMB": 2000                    // Memory threshold for cache clearing
  },
  "logLevel": "info",                              // Log level (info or verbose)
  "disableDestructiveOperationTokens": false,      // Whether to skip confirmation for destructive ops
  "watchdogIntervalMs": 30000,                     // Interval for connection monitoring
  "defaults": {
    "slowMs": 100,                                 // Threshold for slow query detection
    "queryLimit": 10,                              // Default limit for query results
    "allowDiskUse": true,                          // Allow operations to use disk for large datasets
    "schemaSampleSize": 100,                       // Sample size for schema inference
    "aggregationBatchSize": 50                     // Batch size for aggregation operations
  },
  "security": {
    "tokenLength": 4,                              // Length of confirmation tokens
    "tokenExpirationMinutes": 5,                   // Expiration time for tokens
    "strictDatabaseNameValidation": true           // Enforce strict database name validation
  },
  "tools": {
    "transaction": {
      "readConcern": "snapshot",                   // Read concern level for transactions
      "writeConcern": {
        "w": "majority"                            // Write concern for transactions
      }
    },
    "bulkOperations": {
      "ordered": true                              // Whether bulk operations execute in order
    },
    "export": {
      "defaultLimit": -1,                          // Default limit for exports (-1 = no limit)
      "defaultFormat": "json"                      // Default export format (json or csv)
    },
    "watchChanges": {
      "maxDurationSeconds": 60,                    // Maximum duration for change streams
      "defaultDurationSeconds": 10                 // Default duration for change streams
    },
    "queryAnalysis": {
      "defaultDurationSeconds": 10                 // Default duration for query analysis
    }
  }
}
```

</details>

By default, MongoDB Lens looks for the config file at: `~/.mongodb-lens.json`

To customize the config file path, set the environment variable `CONFIG_PATH` to the desired file path.

Example NPX usage:

```console
CONFIG_PATH='/path/to/config.json' npx -y mongodb-lens@latest
```

Example Docker Hub usage:

```console
docker run --rm -i --network=host --pull=always -v /path/to/config.json:/root/.mongodb-lens.json furey/mongodb-lens
```

### Configuration: Environment Variable Overrides

MongoDB Lens supports environment variable overrides for configuration settings.

Environment variables take precedence over [config file](#configuration-config-file) settings.

Config environment variables follow the naming pattern:

```txt
CONFIG_[SETTING PATH, SNAKE CASED, UPPERCASED]
```

Example overrides:

<small><small>

| Config Setting                   | Environment Variable Override             |
| -------------------------------- | ----------------------------------------- |
| `mongoUri`                       | `CONFIG_MONGO_URI`                        |
| `logLevel`                       | `CONFIG_LOG_LEVEL`                        |
| `defaultDbName`                  | `CONFIG_DEFAULT_DB_NAME`                  |
| `connectionOptions.maxPoolSize`  | `CONFIG_CONNECTION_OPTIONS_MAX_POOL_SIZE` |
| `connection.reconnectionRetries` | `CONFIG_CONNECTION_RECONNECTION_RETRIES`  |
| `defaults.queryLimit`            | `CONFIG_DEFAULTS_QUERY_LIMIT`             |
| `tools.export.defaultFormat`     | `CONFIG_TOOLS_EXPORT_DEFAULT_FORMAT`      |

</small></small>

For environment variable values:

- For boolean settings, use string values `'true'` or `'false'`.
- For numeric settings, use string representations.
- For nested objects or arrays, use JSON strings.

Example NPX usage:

```console
CONFIG_DEFAULTS_QUERY_LIMIT='25' npx -y mongodb-lens@latest
```

Example Docker Hub usage:

```console
docker run --rm -i --network=host --pull=always -e CONFIG_DEFAULTS_QUERY_LIMIT='25' furey/mongodb-lens
```

### Configuration: Multiple MongoDB Connections

MongoDB Lens supports defining multiple MongoDB URIs with aliases in your [config file](#configuration-config-file), allowing you to easily switch between different MongoDB instances using simple names.

To configure multiple connections, set the `mongoUri` setting to an object with alias-URI pairs:

```json
{
  "mongoUri": {
    "main": "mongodb://localhost:27017",
    "backup": "mongodb://localhost:27018",
    "atlas": "mongodb+srv://username:password@cluster.mongodb.net/mydb"
  }
}
```

With this configuration:

- The first URI in the list (e.g. `main`) becomes the default connection at startup
- You can switch connections using natural language: `"Connect to backup"` or `"Connect to atlas"`
- The original syntax still works: `"Connect to mongodb://localhost:27018"`
- The `list-connections` tool shows all available connection aliases

> [!NOTE]<br>
> When using the command-line argument to specify a connection, you can use either a full MongoDB URI or an alias defined in your configuration file.

## Client Setup

- [Claude Desktop](#client-setup-claude-desktop)
- [MCP Inspector](#client-setup-mcp-inspector)
- [Other MCP Clients](#client-setup-other-mcp-clients)

### Client Setup: Claude Desktop

To use MongoDB Lens with Claude Desktop:

1. Install [Claude Desktop](https://claude.ai/download)
1. Open `claude_desktop_config.json` (create if it doesn't exist):
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
- To use a custom config file, set [`CONFIG_PATH`](#configuration-config-file) environment variable.
- To include environment variables:
  - For NPX or Node add `"env": {}` with key-value pairs, for example:<br>
    ```json
    "command": "/path/to/npx",
    "args": [
      "-y",
      "mongodb-lens@latest",
      "mongodb://your-connection-string"
    ],
    "env": {
      "CONFIG_LOG_LEVEL": "verbose"
    }
    ```
  - For Docker add `-e` flags, for example:<br>
    ```console
    docker run --rm -i --network=host \
      -e CONFIG_LOG_LEVEL='verbose' \
      furey/mongodb-lens
    ```

##### Option 1: NPX (Recommended)

```json
{
  "mcpServers": {
    "mongodb-lens": {
      "command": "/path/to/npx",
      "args": [
        "-y",
        "mongodb-lens@latest",
        "mongodb://your-connection-string"
      ]
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
      ]
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
    npx -y @modelcontextprotocol/inspector npx -y mongodb-lens@latest

    # Using custom connection string
    npx -y @modelcontextprotocol/inspector npx -y mongodb-lens@latest mongodb://your-connection-string

    # Using custom ports
    SERVER_PORT=1234 CLIENT_PORT=5678 npx -y @modelcontextprotocol/inspector npx -y mongodb-lens@latest
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
- [Disabling Destructive Operations](#data-protection-disabling-destructive-operations)

### Data Protection: Read-Only User Accounts

When connecting MongoDB Lens to your database, the permissions granted to the user in the MongoDB connection string dictate what actions can be performed. When the use case fits, a read-only user can prevent unintended writes or deletes, ensuring MongoDB Lens can query data but not alter it.

To set this up, create a user with the `read` role scoped to the database(s) you're targeting. In MongoDB shell, you'd run something like:

```js
use admin

db.createUser({
  user: 'readonly',
  pwd: 'eXaMpLePaSsWoRd',
  roles: [{ role: 'read', db: 'mydatabase' }]
})
```

Then, apply those credentials to your MongoDB connection string:

```txt
mongodb://readonly:eXaMpLePaSsWoRd@localhost:27017/mydatabase
```

Using read-only credentials is a simple yet effective way to enforce security boundaries, especially when you're poking around schemas or running ad-hoc queries.

### Data Protection: Working with Database Backups

When working with MongoDB Lens, consider connecting to a backup copy of your data hosted on a separate MongoDB instance.

Start by generating the backup with `mongodump`. Next, spin up a fresh MongoDB instance (e.g. on a different port like `27018`) and restore the backup there using `mongorestore`. Once it's running, point MongoDB Lens to the backup instance's connection string (e.g. `mongodb://localhost:27018/mydatabase`).

This approach gives you a sandbox to test complex or destructive operations against without risking accidental corruption of your live data.

### Data Protection: Confirmation for Destructive Operations

MongoDB Lens implements a token-based confirmation system for potentially destructive operations, requiring a two-step process to execute tools that may otherwise result in unchecked data loss:

1. First tool invocation: Returns a 4-digit confirmation token that expires after 5 minutes
1. Second tool invocation: Executes the operation if provided with the valid token

For an example of the confirmation process, see: [Working with Confirmation Protection](#tutorial-5-working-with-confirmation-protection).

Tools that require confirmation include:

- `drop-user`: Remove a database user
- `drop-index`: Remove an index (potential performance impact)
- `drop-database`: Permanently delete a database
- `drop-collection`: Delete a collection and all its documents
- `delete-document`: Delete one or multiple documents
- `bulk-operations`: When including delete operations
- `rename-collection`: When the target collection exists and will be dropped

This protection mechanism aims to prevent accidental data loss from typos and unintended commands. It's a safety net ensuring you're aware of the consequences before proceeding with potentially harmful actions.

> [!NOTE]<br>
> If you're working in a controlled environment where data loss is acceptable, you can configure MongoDB Lens to [bypass confirmation](#bypassing-confirmation-for-destructive-operations) and perform destructive operations immediately.

#### Bypassing Confirmation for Destructive Operations

You might want to bypass the token confirmation system.

Set the environment variable `CONFIG_DISABLE_DESTRUCTIVE_OPERATION_TOKENS` to `true` to execute destructive operations immediately without confirmation:

```console
# Using NPX
CONFIG_DISABLE_DESTRUCTIVE_OPERATION_TOKENS=true npx -y mongodb-lens@latest

# Using Docker
docker run --rm -i --network=host --pull=always -e CONFIG_DISABLE_DESTRUCTIVE_OPERATION_TOKENS='true' furey/mongodb-lens
```

> [!WARNING]<br>
> Disabling confirmation tokens removes an important safety mechanism. It's strongly recommended to only use this option in controlled environments where data loss is acceptable, such as development or testing. Disable at your own risk.

### Data Protection: Disabling Destructive Operations

- [Disabling Tools](#disabling-tools)
- [High-Risk Tools](#high-risk-tools)
- [Medium-Risk Tools](#medium-risk-tools)
- [Read-Only Configuration](#read-only-configuration)

#### Disabling Tools

MongoDB Lens includes several tools that can modify or delete data. To disable specific tools, add them to the `disabled.tools` array in your [configuration file](#configuration-config-file):

```json
{
  "disabled": {
    "tools": [
      "drop-user",
      "drop-index",
      "drop-database",
      "drop-collection",
      "delete-document",
      "bulk-operations",
      "rename-collection"
    ]
  }
}
```

#### High-Risk Tools

These tools can cause immediate data loss and should be considered for disabling in sensitive environments:

- `drop-user`: Removes database users and their access permissions
- `drop-index`: Removes indexes (can impact query performance)
- `drop-database`: Permanently deletes entire databases
- `drop-collection`: Permanently deletes collections and all their documents
- `delete-document`: Removes documents matching specified criteria
- `bulk-operations`: Can perform batch deletions when configured to do so
- `rename-collection`: Can overwrite existing collections when using the drop target option

#### Medium-Risk Tools

These tools can modify data but typically don't cause immediate data loss:

- `create-user`: Creates users with permissions that could enable further changes
- `transaction`: Executes multiple operations in a transaction (potential for complex changes)
- `modify-document`: Inserts or updates documents which could overwrite existing data

#### Read-Only Configuration

For a complete read-only configuration, disable all potentially destructive tools:

```json
{
  "disabled": {
    "tools": [
      "drop-user",
      "drop-index",
      "create-user",
      "transaction",
      "create-index",
      "drop-database",
      "drop-collection",
      "delete-document",
      "modify-document",
      "bulk-operations",
      "create-database",
      "gridfs-operation",
      "create-collection",
      "rename-collection",
      "create-timeseries"
    ]
  }
}
```

This configuration allows MongoDB Lens to query and analyze data while preventing any modifications, providing multiple layers of protection against accidental data loss.

## Tutorial

This following tutorial guides you through setting up a MongoDB container with sample data, then using MongoDB Lens to interact with it through natural language queries:

1. [Start Sample Data Container](#tutorial-1-start-sample-data-container)
1. [Import Sample Data](#tutorial-2-import-sample-data)
1. [Connect MongoDB Lens](#tutorial-3-connect-mongodb-lens)
1. [Example Queries](#tutorial-4-example-queries)
1. [Working With Confirmation Protection](#tutorial-5-working-with-confirmation-protection)

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
1. Copy the sample datasets into your sample data container:<br>
    ```console
    docker cp sampledata.archive mongodb-sampledata:/tmp/
    ```
1. Import the sample datasets into MongoDB:<br>
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
        "mongodb-lens@latest"
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
- [Example Queries: Connection Management](#example-queries-connection-management)

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
 <sup>➥ Uses `drop-database` tool (with confirmation)</sup>

#### Example Queries: Collection Management

- _"What collections are in the current database?"_<br>
 <sup>➥ Uses `list-collections` tool</sup>
- _"Create a new collection named user_logs"_<br>
 <sup>➥ Uses `create-collection` tool</sup>
- _"Drop the user_logs collection"_<br>
 <sup>➥ Uses `drop-collection` tool (with confirmation)</sup>
- _"Rename the user_logs collection to system_logs"_<br>
 <sup>➥ Uses `rename-collection` tool</sup>
- _"Check the data consistency in the movies collection"_<br>
 <sup>➥ Uses `validate-collection` tool</sup>

#### Example Queries: User Management

- _"Create a read-only user for analytics"_<br>
 <sup>➥ Uses `create-user` tool</sup>
- _"Drop the inactive_user account"_<br>
 <sup>➥ Uses `drop-user` tool (with confirmation)</sup>

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
 <sup>➥ Uses `delete-document` tool (with confirmation)</sup>
- _"Run these bulk operations on the movies collection"_<br>
 <sup>➥ Uses `bulk-operations` tool</sup>

#### Example Queries: Performance & Index Management

- _"Create an index on the title field in the movies collection"_<br>
 <sup>➥ Uses `create-index` tool</sup>
- _"Drop the unused ratings_idx index"_<br>
 <sup>➥ Uses `drop-index` tool (with confirmation)</sup>
- _"Explain the execution plan for finding movies from 1995"_<br>
 <sup>➥ Uses `explain-query` tool</sup>
- _"Get statistics for the current database"_<br>
 <sup>➥ Uses `get-stats` tool (database target)</sup>
- _"Show collection stats for the movies collection"_<br>
 <sup>➥ Uses `get-stats` tool (collection target)</sup>

#### Example Queries: Geospatial & Special Operations

- _"Switch to sample_geospatial database, then find all shipwrecks within 10km of coordinates [-80.12, 26.46]"_<br>
 <sup>➥ Uses `geo-query` tool</sup>
- _"Switch to sample_mflix database, then run this Map-Reduce to calculate movie counts by year with map `'function () { emit(this.year, 1) }'` and reduce `'function (key, values) { return Array.sum(values) }'`"_<br>
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

#### Example Queries: Connection Management

- _"Connect to a different MongoDB server at mongodb://localhost:27018"_<br>
 <sup>➥ Uses `connect-mongodb` tool</sup>
- _"Connect to MongoDB Atlas instance at mongodb+srv://username:password@cluster.mongodb.net/mydb"_<br>
 <sup>➥ Uses `connect-mongodb` tool</sup>
- _"Connect back to the original MongoDB server"_<br>
 <sup>➥ Uses `connect-original` tool</sup>
- _"Connect to a MongoDB replica set without validating the connection"_<br>
 <sup>➥ Uses `connect-mongodb` tool with validateConnection=false</sup>

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
1. Confirm the operation by submitting the confirmation token:<br>
    ```
    "9876"
    ```
1. MongoDB Lens executes the operation:<br>
    ```
    Collection 'test_collection' has been permanently deleted.
    ```

This two-step process prevents accidental data loss by requiring explicit confirmation.

> [!NOTE]<br>
> If you're working in a controlled environment where data loss is acceptable, you can configure MongoDB Lens to [bypass confirmation](#bypassing-confirmation-for-destructive-operations) and perform destructive operations immediately.

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
