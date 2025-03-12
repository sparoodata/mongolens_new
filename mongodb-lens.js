#!/usr/bin/env node

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import mongodb from 'mongodb'
import { z } from 'zod'

const { MongoClient, ObjectId } = mongodb

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))
const PACKAGE_VERSION = packageJson.version
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === 'true'

let server = null
let transport = null
let currentDb = null
let mongoClient = null
let currentDbName = null

const instructions = `
# MongoDB Lens MCP Server

**MongoDB Lens** provides full featured access to MongoDB databases to perform queries, run aggregations, optimize performance, and more.

## Core Capabilities

1. **Database Exploration**

  - List all databases: Use the \`mongodb://databases\` resource or \`list-databases\` tool
  - Switch databases: e.g. \`use-database {"database": "myDb"}\`
  - View collections: \`list-collections\` or \`mongodb://collections\`

2. **Data Querying**

  - Find documents: e.g. \`find-documents {"collection": "users", "filter": "{\"age\": {\"$gt\": 30}}", "limit": 5}\`
  - Count documents: e.g. \`count-documents {"collection": "users", "filter": "{\"active\": true}"}\`
  - Aggregate data: e.g. \`aggregate-data {"collection": "orders", "pipeline": "[{\"$group\": {\"_id\": \"$status\", \"total\": {\"$sum\": 1}}}]"}\`

3. **Schema and Performance**  

  - Analyze schemas: e.g. \`analyze-schema {"collection": "products"}\` or \`mongodb://collection/products/schema\`
  - Create indexes: e.g. \`create-index {"collection": "users", "keys": "{\"email\": 1}", "options": "{\"unique\": true}"}\`
  - Explain queries: e.g. \`explain-query {"collection": "orders", "filter": "{\"total\": {\"$gt\": 100}}}"}\`

4. **Data Management**

  - Modify documents: e.g. \`modify-document {"collection": "users", "operation": "insert", "document": "{\"name\": \"Alice\", \"age\": 25}"}\`
  - Bulk operations: e.g. \`bulk-operations {"collection": "users", "operations": "[{\"insertOne\": {\"document\": {\"name\": \"Bob\"}}}]"}\`
  - Export data: e.g. \`export-data {"collection": "users", "format": "csv", "fields": "name,age"}\`

5. **Server Insights**

  - Check status: \`mongodb://server/status\` or \`get-stats {"target": "database"}\`
  - View replica info: \`mongodb://server/replica\`
  - List users: \`mongodb://database/users\`

6. **Advanced Assistance**

  - Build queries: Use the \`query-builder\` prompt: e.g. \`{"collection": "users", "condition": "age over 30"}\`
  - Optimize queries: e.g. \`query-optimizer {"collection": "orders", "query": "{\"total\": {\"$gt\": 100}}}"}\`
  - Audit security: \`security-audit {}\`

## Getting Started

1. Connect to the server and run \`list-databases\` to see available databases.
2. Select a database e.g. \`use-database {"database": "yourDb"}\`.
3. Explore collections via \`list-collections\` or fetch schemas with \`mongodb://collection/{name}/schema\`.
4. Query data using \`find-documents\` or analyze with prompts like \`schema-analysis\`.
5. Manage data with tools like \`modify-document\` or \`create-index\`.

## Tips

- Use templated resources (e.g. \`mongodb://collection/{name}/stats\`) with autocompletion support.
- Leverage prompts like \`aggregation-builder\` for complex pipelines.
- Check logs with \`VERBOSE_LOGGING=true\` for debugging.
- Combine tools and resources for workflows, e.g. schema analysis → index creation.
`

const main = async (mongoUri) => {
  log(`MongoDB Lens v${PACKAGE_VERSION} starting…`, true)
  
  const connected = await connect(mongoUri)
  if (!connected) {
    log('Failed to connect to MongoDB database.', true)
    return false
  }
  
  log('Initializing MCP server…')
  server = new McpServer({
    name: 'MongoDB Lens',
    version: PACKAGE_VERSION,
  }, 
  {
    instructions
  })
  
  log('Registering MCP resources…')
  registerResources(server)
  
  log('Registering MCP tools…')
  registerTools(server)
  
  log('Registering MCP prompts…')
  registerPrompts(server)
  
  log('Connecting MCP server transport…')
  transport = new StdioServerTransport()
  await server.connect(transport)
  
  log('MongoDB Lens server running.', true)
  return true
}

const connect = async (uri = 'mongodb://localhost:27017') => {
  try {
    log(`Connecting to MongoDB at: ${uri}`)
    mongoClient = new MongoClient(uri, { useUnifiedTopology: true })
    await mongoClient.connect()
    currentDbName = extractDbNameFromConnectionString(uri)
    currentDb = mongoClient.db(currentDbName)
    log(`Connected to MongoDB successfully, using database: ${currentDbName}`)
    return true
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    return false
  }
}

const extractDbNameFromConnectionString = (uri) => {
  const pathParts = uri.split('/').filter(part => part)
  const lastPart = pathParts[pathParts.length - 1]?.split('?')[0]
  currentDbName = (lastPart && !lastPart.includes(':')) ? lastPart : 'admin'
  return currentDbName
}

const registerResources = (server) => {
  server.resource(
    'databases',
    'mongodb://databases',
    { description: 'List of all accessible MongoDB databases' },
    async () => {
      log('Resource: Retrieving list of databases…')
      const dbs = await listDatabases()
      log(`Resource: Found ${dbs.length} databases.`)
      return {
        contents: [{
          uri: 'mongodb://databases',
          text: formatDatabasesList(dbs)
        }]
      }
    }
  )
  
  server.resource(
    'collections',
    'mongodb://collections',
    { description: 'List of collections in the current database' },
    async () => {
      log(`Resource: Retrieving collections from database '${currentDbName}'…`)
      const collections = await listCollections()
      log(`Resource: Found ${collections.length} collections.`)
      return {
        contents: [{
          uri: 'mongodb://collections',
          text: formatCollectionsList(collections)
        }]
      }
    }
  )
  
  server.resource(
    'collection-schema',
    new ResourceTemplate('mongodb://collection/{name}/schema', { 
      list: async () => {
        try {
          log('Resource: Listing collection schemas…')
          const collections = await listCollections()
          log(`Resource: Preparing schema resources for ${collections.length} collections.`)
          return {
            resources: collections.map(coll => ({
              uri: `mongodb://collection/${coll.name}/schema`,
              name: `${coll.name} Schema`,
              description: `Schema for ${coll.name} collection`
            }))
          }
        } catch (error) {
          console.error('Error listing collection schemas:', error)
          return { resources: [] }
        }
      },
      complete: {
        name: async (value) => {
          try {
            log(`Resource: Autocompleting collection name with prefix '${value}'…`)
            const collections = await listCollections()
            const matches = collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
            log(`Resource: Found ${matches.length} matching collections.`)
            return matches
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Schema information for a MongoDB collection' },
    async (uri, { name }) => {
      log(`Resource: Inferring schema for collection '${name}'…`)
      const schema = await inferSchema(name)
      log(`Resource: Schema inference complete for '${name}', identified ${Object.keys(schema.fields).length} fields.`)
      return {
        contents: [{
          uri: uri.href,
          text: formatSchema(schema)
        }]
      }
    }
  )
  
  server.resource(
    'collection-stats',
    new ResourceTemplate('mongodb://collection/{name}/stats', { 
      list: async () => {
        try {
          log('Resource: Listing collection stats resources…')
          const collections = await listCollections()
          log(`Resource: Preparing stats resources for ${collections.length} collections.`)
          return {
            resources: collections.map(coll => ({
              uri: `mongodb://collection/${coll.name}/stats`,
              name: `${coll.name} Stats`,
              description: `Statistics for ${coll.name} collection`
            }))
          }
        } catch (error) {
          console.error('Error listing collections for stats:', error)
          return { resources: [] }
        }
      },
      complete: {
        name: async (value) => {
          try {
            log(`Resource: Autocompleting collection name for stats with prefix '${value}'…`)
            const collections = await listCollections()
            const matches = collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
            log(`Resource: Found ${matches.length} matching collections for stats.`)
            return matches
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Performance statistics for a MongoDB collection' },
    async (uri, { name }) => {
      log(`Resource: Retrieving stats for collection '${name}'…`)
      const stats = await getCollectionStats(name)
      log(`Resource: Retrieved stats for collection '${name}'.`)
      return {
        contents: [{
          uri: uri.href,
          text: formatStats(stats)
        }]
      }
    }
  )
  
  server.resource(
    'collection-indexes',
    new ResourceTemplate('mongodb://collection/{name}/indexes', { 
      list: async () => {
        try {
          log('Resource: Listing collection indexes resources…')
          const collections = await listCollections()
          log(`Resource: Preparing index resources for ${collections.length} collections.`)
          return {
            resources: collections.map(coll => ({
              uri: `mongodb://collection/${coll.name}/indexes`,
              name: `${coll.name} Indexes`,
              description: `Indexes for ${coll.name} collection`
            }))
          }
        } catch (error) {
          console.error('Error listing collections for indexes:', error)
          return { resources: [] }
        }
      },
      complete: {
        name: async (value) => {
          try {
            log(`Resource: Autocompleting collection name for indexes with prefix '${value}'…`)
            const collections = await listCollections()
            const matches = collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
            log(`Resource: Found ${matches.length} matching collections for indexes.`)
            return matches
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Index information for a MongoDB collection' },
    async (uri, { name }) => {
      log(`Resource: Retrieving indexes for collection '${name}'…`)
      const indexes = await getCollectionIndexes(name)
      log(`Resource: Retrieved ${indexes.length} indexes for collection '${name}'.`)
      return {
        contents: [{
          uri: uri.href,
          text: formatIndexes(indexes)
        }]
      }
    }
  )

  server.resource(
    'server-status',
    'mongodb://server/status',
    { description: 'MongoDB server status information' },
    async () => {
      log('Resource: Retrieving server status…')
      const status = await getServerStatus()
      log('Resource: Retrieved server status information.')
      return {
        contents: [{
          uri: 'mongodb://server/status',
          text: formatServerStatus(status)
        }]
      }
    }
  )

  server.resource(
    'replica-status',
    'mongodb://server/replica',
    { description: 'MongoDB replica set status and configuration' },
    async () => {
      log('Resource: Retrieving replica set status…')
      const status = await getReplicaSetStatus()
      log('Resource: Retrieved replica set status information.')
      return {
        contents: [{
          uri: 'mongodb://server/replica',
          text: formatReplicaSetStatus(status)
        }]
      }
    }
  )

  server.resource(
    'collection-validation',
    new ResourceTemplate('mongodb://collection/{name}/validation', {
      list: async () => {
        try {
          log('Resource: Listing collection validation resources…')
          const collections = await listCollections()
          log(`Resource: Preparing validation resources for ${collections.length} collections.`)
          return {
            resources: collections.map(coll => ({
              uri: `mongodb://collection/${coll.name}/validation`,
              name: `${coll.name} Validation`,
              description: `Validation rules for ${coll.name} collection`
            }))
          }
        } catch (error) {
          console.error('Error listing collections for validation:', error)
          return { resources: [] }
        }
      },
      complete: {
        name: async (value) => {
          try {
            log(`Resource: Autocompleting collection name for validation with prefix '${value}'…`)
            const collections = await listCollections()
            const matches = collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
            return matches
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Validation rules for a MongoDB collection' },
    async (uri, { name }) => {
      log(`Resource: Retrieving validation rules for collection '${name}'…`)
      const validation = await getCollectionValidation(name)
      log(`Resource: Retrieved validation rules for collection '${name}'.`)
      return {
        contents: [{
          uri: uri.href,
          text: formatValidationRules(validation)
        }]
      }
    }
  )

  server.resource(
    'database-users',
    'mongodb://database/users',
    { description: 'MongoDB database users and roles' },
    async () => {
      log('Resource: Retrieving database users…')
      const users = await getDatabaseUsers()
      log(`Resource: Retrieved user information.`)
      return {
        contents: [{
          uri: 'mongodb://database/users',
          text: formatDatabaseUsers(users)
        }]
      }
    }
  )

  server.resource(
    'stored-functions',
    'mongodb://database/functions',
    { description: 'MongoDB stored JavaScript functions' },
    async () => {
      log('Resource: Retrieving stored JavaScript functions…')
      const functions = await getStoredFunctions()
      log(`Resource: Retrieved stored functions.`)
      return {
        contents: [{
          uri: 'mongodb://database/functions',
          text: formatStoredFunctions(functions)
        }]
      }
    }
  )
}

const registerPrompts = (server) => {
  server.prompt(
    'query-builder',
    'Help construct MongoDB query filters',
    {
      collection: z.string().min(1).describe('Collection name to query'),
      condition: z.string().describe('Describe the condition in natural language (e.g. "users older than 30")')
    },
    ({ collection, condition }) => {
      log(`Prompt: Initializing queryBuilder for collection '${collection}' with condition: "${condition}".`)
      return {
        description: `MongoDB Query Builder for ${collection}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please help me create a MongoDB query for the '${collection}' collection based on this condition: "${condition}".

I need both the filter object and a complete example showing how to use it with the findDocuments tool.

Guidelines:
1. Create a valid MongoDB query filter as a JSON object
2. Show me how special MongoDB operators work if needed (like $gt, $in, etc.)
3. Provide a complete example of using this with the findDocuments tool
4. Suggest any relevant projections or sort options

Remember: I'm working with the ${currentDbName} database and the ${collection} collection.`
            }
          }
        ]
      }
    }
  )
  
  server.prompt(
    'aggregation-builder',
    'Help construct MongoDB aggregation pipelines',
    {
      collection: z.string().min(1).describe('Collection name for aggregation'),
      goal: z.string().describe('What you want to calculate or analyze')
    },
    ({ collection, goal }) => {
      log(`Prompt: Initializing aggregationBuilder for collection '${collection}' with goal: "${goal}".`)
      return {
        description: `MongoDB Aggregation Pipeline Builder for ${collection}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need to create a MongoDB aggregation pipeline for the '${collection}' collection to ${goal}.

Please help me create:
1. A complete aggregation pipeline as a JSON array
2. An explanation of each stage in the pipeline
3. How to execute this with the aggregateData tool

Remember: I'm working with the ${currentDbName} database and the ${collection} collection.`
            }
          }
        ]
      }
    }
  )
  
  server.prompt(
    'schema-analysis',
    'Analyze collection schema and recommend improvements',
    {
      collection: z.string().min(1).describe('Collection name to analyze')
    },
    async ({ collection }) => {
      log(`Prompt: Initializing schemaAnalysis for collection '${collection}'…`)
      const schema = await inferSchema(collection)
      log(`Prompt: Retrieved schema for '${collection}' with ${Object.keys(schema.fields).length} fields.`)
      return {
        description: `MongoDB Schema Analysis for ${collection}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please analyze the schema of the '${collection}' collection and provide recommendations:

Here's the current schema:
${formatSchema(schema)}

Could you help with:
1. Identifying any schema design issues or inconsistencies
2. Suggesting schema improvements for better performance
3. Recommending appropriate indexes based on the data structure
4. Best practices for this type of data model
5. Any potential MongoDB-specific optimizations`
            }
          }
        ]
      }
    }
  )
  
  server.prompt(
    'index-recommendation',
    'Get index recommendations for query patterns',
    {
      collection: z.string().min(1).describe('Collection name'),
      queryPattern: z.string().describe('Common query pattern or operation')
    },
    ({ collection, queryPattern }) => {
      log(`Prompt: Initializing indexRecommendation for collection '${collection}' with query pattern: "${queryPattern}".`)
      return {
        description: `MongoDB Index Recommendations for ${collection}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need index recommendations for the '${collection}' collection to optimize this query pattern: "${queryPattern}".

Please provide:
1. Recommended index(es) with proper key specification
2. Explanation of why this index would help
3. The exact command to create this index using the createIndex tool
4. How to verify the index is being used
5. Any potential trade-offs or considerations for this index

Remember: I'm working with the ${currentDbName} database and the ${collection} collection.`
            }
          }
        ]
      }
    }
  )
  
  server.prompt(
    'mongo-shell',
    'Generate MongoDB shell commands',
    {
      operation: z.string().describe('Operation you want to perform'),
      details: z.string().optional().describe('Additional details about the operation')
    },
    ({ operation, details }) => {
      log(`Prompt: Initializing mongoShell for operation: "${operation}" with${details ? ' details: "' + details + '"' : 'out details'}.`)
      return {
        description: 'MongoDB Shell Command Generator',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please generate MongoDB shell commands to ${operation}${details ? ` with these details: ${details}` : ''}.

I need:
1. The exact MongoDB shell command(s)
2. Explanation of each part of the command
3. How this translates to using MongoDB Lens tools
4. Any important considerations or variations

Current database: ${currentDbName}`
            }
          }
        ]
      }
    }
  )
  
  server.prompt(
    'inspector-guide',
    'Get help using MongoDB Lens with MCP Inspector',
    {},
    () => {
      log('Prompt: Initializing inspectorGuide.')
      return {
        description: 'MongoDB Lens Inspector Guide',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I'm using the MCP Inspector with MongoDB Lens. How can I best use these tools together?

Please provide:
1. An overview of the most useful Inspector features for MongoDB
2. Tips for debugging MongoDB queries
3. Common workflows for exploring a database
4. How to use the Inspector features with MongoDB Lens resources and tools`
            }
          }
        ]
      }
    }
  )

  server.prompt(
    'data-modeling',
    'Get MongoDB data modeling advice for specific use cases',
    {
      useCase: z.string().describe('Describe your application or data use case'),
      requirements: z.string().describe('Key requirements (performance, access patterns, etc.)'),
      existingData: z.string().optional().describe('Optional: describe any existing data structure')
    },
    ({ useCase, requirements, existingData }) => {
      log(`Prompt: Initializing dataModeling for use case: "${useCase}".`)
      return {
        description: 'MongoDB Data Modeling Guide',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need help designing a MongoDB data model for this use case: "${useCase}".

Key requirements:
${requirements}

${existingData ? `Existing data structure:\n${existingData}\n\n` : ''}
Please provide:
1. Recommended data model with collection structures
2. Sample document structures in JSON format
3. Explanation of design decisions and trade-offs
4. Appropriate indexing strategy
5. Any MongoDB-specific features or patterns I should consider
6. How this model addresses the stated requirements`
            }
          }
        ]
      }
    }
  )

  server.prompt(
    'query-optimizer',
    'Get optimization advice for slow queries',
    {
      collection: z.string().min(1).describe('Collection name'),
      query: z.string().describe('The slow query (as a JSON filter)'),
      performance: z.string().optional().describe('Optional: current performance metrics')
    },
    async ({ collection, query, performance }) => {
      log(`Prompt: Initializing queryOptimizer for collection '${collection}' with query: ${query}.`)
      const stats = await getCollectionStats(collection)
      const indexes = await getCollectionIndexes(collection)
      return {
        description: 'MongoDB Query Optimization Advisor',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I have a slow MongoDB query on the '${collection}' collection and need help optimizing it.

Query filter: ${query}

${performance ? `Current performance: ${performance}\n\n` : ''}
Collection stats:
${formatStats(stats)}

Current indexes:
${formatIndexes(indexes)}

Please provide:
1. Analysis of why this query might be slow
2. Recommend index changes (additions or modifications)
3. Suggest query structure improvements
4. Explain how to verify performance improvements
5. Other optimization techniques I should consider`
            }
          }
        ]
      }
    }
  )

  server.prompt(
    'security-audit',
    'Get MongoDB security recommendations',
    {},
    async () => {
      log('Prompt: Initializing securityAudit.')
      const serverStatus = await getServerStatus()
      const users = await getDatabaseUsers()
      return {
        description: 'MongoDB Security Audit',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please help me perform a security audit on my MongoDB deployment.

Server information:
${formatServerStatus(serverStatus)}

User information:
${formatDatabaseUsers(users)}

Please provide:
1. Potential security vulnerabilities in my current setup
2. Recommendations for improving security
3. Authentication and authorization best practices
4. Network security considerations
5. Data encryption options
6. Audit logging recommendations
7. Backup security considerations`
            }
          }
        ]
      }
    }
  )

  server.prompt(
    'backup-strategy',
    'Get advice on MongoDB backup and recovery approaches',
    {
      databaseSize: z.string().optional().describe('Optional: database size information'),
      uptime: z.string().optional().describe('Optional: uptime requirements (e.g. "99.9%")'),
      rpo: z.string().optional().describe('Optional: recovery point objective'),
      rto: z.string().optional().describe('Optional: recovery time objective')
    },
    ({ databaseSize, uptime, rpo, rto }) => {
      log('Prompt: Initializing backupStrategy.')
      return {
        description: 'MongoDB Backup & Recovery Strategy',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need recommendations for a MongoDB backup and recovery strategy.

${databaseSize ? `Database size: ${databaseSize}\n` : ''}${uptime ? `Uptime requirement: ${uptime}\n` : ''}${rpo ? `Recovery Point Objective (RPO): ${rpo}\n` : ''}${rto ? `Recovery Time Objective (RTO): ${rto}\n` : ''}
Current database: ${currentDbName}

Please provide:
1. Recommended backup methods for my scenario
2. Backup frequency and retention recommendations
3. Storage considerations and best practices
4. Restoration procedures and testing strategy
5. Monitoring and validation approaches
6. High availability considerations
7. Tools and commands for implementing the strategy`
            }
          }
        ]
      }
    }
  )

  server.prompt(
    'migration-guide',
    'Generate MongoDB migration steps between versions',
    {
      sourceVersion: z.string().describe('Source MongoDB version'),
      targetVersion: z.string().describe('Target MongoDB version'),
      features: z.string().optional().describe('Optional: specific features you use')
    },
    ({ sourceVersion, targetVersion, features }) => {
      log(`Prompt: Initializing migrationGuide from ${sourceVersion} to ${targetVersion}.`)
      return {
        description: 'MongoDB Version Migration Guide',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I need to migrate my MongoDB deployment from version ${sourceVersion} to ${targetVersion}.

${features ? `Key features I'm using: ${features}\n\n` : ''}
Please provide:
1. Step-by-step migration plan
2. Pre-migration checks and preparations
3. Breaking changes and deprecated features to be aware of
4. New features or improvements I can leverage
5. Common pitfalls and how to avoid them
6. Performance considerations
7. Rollback strategy in case of issues`
            }
          }
        ]
      }
    }
  )
}

async function generateExampleFilter(collectionName) {
  try {
    log(`Generating example filter for collection '${collectionName}'…`)
    const schema = await inferSchema(collectionName, 5)
    const fields = Object.entries(schema.fields)
    
    if (fields.length === 0) return '{}'
    
    const fieldEntry = fields.find(([name, info]) => 
      info.types.includes('string') || 
      info.types.includes('number') || 
      info.types.includes('boolean')
    )
    
    if (!fieldEntry) return '{}'
    
    const [fieldName, info] = fieldEntry
    log(`Found suitable field for example filter: ${fieldName} (${info.types.join(', ')}).`)
    
    if (info.types.includes('string')) {
      return JSON.stringify({ [fieldName]: { $regex: "example" } })
    } else if (info.types.includes('number')) {
      return JSON.stringify({ [fieldName]: { $gt: 0 } })
    } else if (info.types.includes('boolean')) {
      return JSON.stringify({ [fieldName]: true })
    }
    
    return '{}'
  } catch (error) {
    console.error('Error generating example filter:', error)
    return '{}'
  }
}

async function getFieldsForCollection(collectionName) {
  try {
    log(`Retrieving fields for collection '${collectionName}'…`)
    const schema = await inferSchema(collectionName, 5)
    const fields = Object.keys(schema.fields)
    log(`Retrieved ${fields.length} fields from collection '${collectionName}'.`)
    return fields
  } catch (error) {
    console.error(`Error getting fields for ${collectionName}:`, error)
    return []
  }
}

function isValidFieldName(field) {
  return typeof field === 'string' && field.length > 0 && !field.startsWith('$')
}

const registerTools = (server) => {
  server.tool(
    'list-databases',
    'List all accessible MongoDB databases',
    async () => {
      try {
        log('Tool: Listing databases…')
        const dbs = await listDatabases()
        log(`Tool: Found ${dbs.length} databases.`)
        return {
          content: [{
            type: 'text',
            text: formatDatabasesList(dbs)
          }]
        }
      } catch (error) {
        console.error('Error listing databases:', error)
        return {
          content: [{
            type: 'text',
            text: `Error listing databases: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'current-database',
    'Get the name of the current database',
    async () => {
      try {
        log('Tool: Getting current database name…')
        return {
          content: [{
            type: 'text',
            text: `Current database: ${currentDbName}`
          }]
        }
      } catch (error) {
        console.error('Error getting current database:', error)
        return {
          content: [{
            type: 'text',
            text: `Error getting current database: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'use-database',
    'Switch to a specific database',
    {
      database: z.string().min(1).describe('Database name to use')
    },
    async ({ database }) => {
      try {
        log(`Tool: Switching to database '${database}'…`)
        await switchDatabase(database)
        log(`Tool: Successfully switched to database '${database}'.`)
        return {
          content: [{
            type: 'text',
            text: `Switched to database: ${database}`
          }]
        }
      } catch (error) {
        console.error('Error switching database:', error)
        return {
          content: [{
            type: 'text',
            text: `Error switching database: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'list-collections',
    'List collections in the current database',
    async () => {
      try {
        log(`Tool: Listing collections in database '${currentDbName}'…`)
        const collections = await listCollections()
        log(`Tool: Found ${collections.length} collections in database '${currentDbName}'.`)
        return {
          content: [{
            type: 'text',
            text: formatCollectionsList(collections)
          }]
        }
      } catch (error) {
        console.error('Error listing collections:', error)
        return {
          content: [{
            type: 'text',
            text: `Error listing collections: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'find-documents',
    'Run queries with filters and projections',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().default('{}').describe('MongoDB query filter (JSON string)'),
      projection: z.string().optional().describe('Fields to include/exclude (JSON string)'),
      limit: z.number().int().min(1).default(10).describe('Maximum number of documents to return'),
      skip: z.number().int().min(0).default(0).describe('Number of documents to skip'),
      sort: z.string().optional().describe('Sort specification (JSON string)')
    },
    async ({ collection, filter, projection, limit, skip, sort }) => {
      try {
        log(`Tool: Finding documents in collection '${collection}'…`)
        log(`Tool: Using filter: ${filter}`)
        if (projection) log(`Tool: Using projection: ${projection}`)
        if (sort) log(`Tool: Using sort: ${sort}`)
        log(`Tool: Using limit: ${limit}, skip: ${skip}`)
        
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const parsedProjection = projection ? JSON.parse(projection) : null
        const parsedSort = sort ? JSON.parse(sort) : null
        
        const documents = await findDocuments(collection, parsedFilter, parsedProjection, limit, skip, parsedSort)
        log(`Tool: Found ${documents.length} documents in collection '${collection}'.`)
        return {
          content: [{
            type: 'text',
            text: formatDocuments(documents, limit)
          }]
        }
      } catch (error) {
        console.error('Error finding documents:', error)
        return {
          content: [{
            type: 'text',
            text: `Error finding documents: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'count-documents',
    'Count documents with optional filter',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().default('{}').describe('MongoDB query filter (JSON string)')
    },
    async ({ collection, filter }) => {
      try {
        log(`Tool: Counting documents in collection '${collection}'…`)
        log(`Tool: Using filter: ${filter}`)
        
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const count = await countDocuments(collection, parsedFilter)
        log(`Tool: Count result: ${count} documents.`)
        return {
          content: [{
            type: 'text',
            text: `Count: ${count} document(s)`
          }]
        }
      } catch (error) {
        console.error('Error counting documents:', error)
        return {
          content: [{
            type: 'text',
            text: `Error counting documents: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'aggregate-data',
    'Run aggregation pipelines',
    {
      collection: z.string().min(1).describe('Collection name'),
      pipeline: z.string().describe('Aggregation pipeline as JSON string array')
    },
    async ({ collection, pipeline }) => {
      try {
        log(`Tool: Running aggregation on collection '${collection}'…`)
        log(`Tool: Using pipeline: ${pipeline}`)
        
        const parsedPipeline = JSON.parse(pipeline)
        const results = await aggregateData(collection, parsedPipeline)
        log(`Tool: Aggregation returned ${results.length} results.`)
        return {
          content: [{
            type: 'text',
            text: formatDocuments(results, 100)
          }]
        }
      } catch (error) {
        console.error('Error running aggregation:', error)
        return {
          content: [{
            type: 'text',
            text: `Error running aggregation: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'get-stats',
    'Get database or collection statistics',
    {
      target: z.enum(['database', 'collection']).describe('Target type'),
      name: z.string().optional().describe('Collection name (for collection stats)')
    },
    async ({ target, name }) => {
      try {
        let stats
        if (target === 'database') {
          log(`Tool: Getting statistics for database '${currentDbName}'…`)
          stats = await getDatabaseStats()
          log(`Tool: Retrieved database statistics.`)
        } else if (target === 'collection') {
          if (!name) throw new Error('Collection name is required for collection stats')
          log(`Tool: Getting statistics for collection '${name}'…`)
          stats = await getCollectionStats(name)
          log(`Tool: Retrieved collection statistics.`)
        }
        
        return {
          content: [{
            type: 'text',
            text: formatStats(stats)
          }]
        }
      } catch (error) {
        console.error('Error getting stats:', error)
        return {
          content: [{
            type: 'text',
            text: `Error getting stats: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'analyze-schema',
    'Automatically infer schema from collection',
    {
      collection: z.string().min(1).describe('Collection name'),
      sampleSize: z.number().int().min(1).default(100).describe('Number of documents to sample')
    },
    async ({ collection, sampleSize }) => {
      try {
        log(`Tool: Analyzing schema for collection '${collection}' with sample size ${sampleSize}…`)
        const schema = await inferSchema(collection, sampleSize)
        log(`Tool: Schema analysis complete for '${collection}', found ${Object.keys(schema.fields).length} fields.`)
        return {
          content: [{
            type: 'text',
            text: formatSchema(schema)
          }]
        }
      } catch (error) {
        console.error('Error inferring schema:', error)
        return {
          content: [{
            type: 'text',
            text: `Error inferring schema: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'create-index',
    'Create new index on collection',
    {
      collection: z.string().min(1).describe('Collection name'),
      keys: z.string().describe('Index keys as JSON object'),
      options: z.string().optional().describe('Index options as JSON object')
    },
    async ({ collection, keys, options }) => {
      try {
        log(`Tool: Creating index on collection '${collection}'…`)
        log(`Tool: Index keys: ${keys}`)
        if (options) log(`Tool: Index options: ${options}`)
        
        const parsedKeys = JSON.parse(keys)
        const parsedOptions = options ? JSON.parse(options) : {}
        
        const result = await createIndex(collection, parsedKeys, parsedOptions)
        log(`Tool: Index created successfully: ${result}`)
        return {
          content: [{
            type: 'text',
            text: `Index created: ${result}`
          }]
        }
      } catch (error) {
        console.error('Error creating index:', error)
        return {
          content: [{
            type: 'text',
            text: `Error creating index: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
  
  server.tool(
    'explain-query',
    'Analyze query performance',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().describe('MongoDB query filter (JSON string)'),
      verbosity: z.enum(['queryPlanner', 'executionStats', 'allPlansExecution']).default('executionStats').describe('Explain verbosity level')
    },
    async ({ collection, filter, verbosity }) => {
      try {
        log(`Tool: Explaining query on collection '${collection}'…`)
        log(`Tool: Filter: ${filter}`)
        log(`Tool: Verbosity level: ${verbosity}`)
        
        const parsedFilter = JSON.parse(filter)
        const explanation = await explainQuery(collection, parsedFilter, verbosity)
        log(`Tool: Query explanation generated.`)
        return {
          content: [{
            type: 'text',
            text: formatExplanation(explanation)
          }]
        }
      } catch (error) {
        console.error('Error explaining query:', error)
        return {
          content: [{
            type: 'text',
            text: `Error explaining query: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'distinct-values',
    'Get unique values for a field',
    {
      collection: z.string().min(1).describe('Collection name'),
      field: z.string().min(1).describe('Field name to get distinct values for'),
      filter: z.string().default('{}').describe('Optional filter as JSON string')
    },
    async ({ collection, field, filter }) => {
      try {
        log(`Tool: Getting distinct values for field '${field}' in collection '${collection}'…`)
        log(`Tool: Using filter: ${filter}`)
        
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const values = await getDistinctValues(collection, field, parsedFilter)
        log(`Tool: Found ${values.length} distinct values.`)
        return {
          content: [{
            type: 'text',
            text: formatDistinctValues(field, values)
          }]
        }
      } catch (error) {
        console.error('Error getting distinct values:', error)
        return {
          content: [{
            type: 'text',
            text: `Error getting distinct values: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'validate-collection',
    'Run validation on a collection to check for inconsistencies',
    {
      collection: z.string().min(1).describe('Collection name'),
      full: z.boolean().default(false).describe('Perform full validation (slower but more thorough)')
    },
    async ({ collection, full }) => {
      try {
        log(`Tool: Validating collection '${collection}'…`)
        log(`Tool: Full validation: ${full}`)
        
        const results = await validateCollection(collection, full)
        log(`Tool: Validation complete.`)
        return {
          content: [{
            type: 'text',
            text: formatValidationResults(results)
          }]
        }
      } catch (error) {
        console.error('Error validating collection:', error)
        return {
          content: [{
            type: 'text',
            text: `Error validating collection: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'create-collection',
    'Create a new collection with options',
    {
      name: z.string().min(1).describe('Collection name'),
      options: z.string().default('{}').describe('Collection options as JSON string (capped, size, etc.)')
    },
    async ({ name, options }) => {
      try {
        log(`Tool: Creating collection '${name}'…`)
        log(`Tool: Using options: ${options}`)
        
        const parsedOptions = options ? JSON.parse(options) : {}
        const result = await createCollection(name, parsedOptions)
        log(`Tool: Collection created successfully.`)
        return {
          content: [{
            type: 'text',
            text: `Collection '${name}' created successfully.`
          }]
        }
      } catch (error) {
        console.error('Error creating collection:', error)
        return {
          content: [{
            type: 'text',
            text: `Error creating collection: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'drop-collection',
    'Remove a collection',
    {
      name: z.string().min(1).describe('Collection name')
    },
    async ({ name }) => {
      try {
        log(`Tool: Dropping collection '${name}'…`)
        
        const result = await dropCollection(name)
        log(`Tool: Collection dropped successfully.`)
        return {
          content: [{
            type: 'text',
            text: `Collection '${name}' dropped successfully.`
          }]
        }
      } catch (error) {
        console.error('Error dropping collection:', error)
        return {
          content: [{
            type: 'text',
            text: `Error dropping collection: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'rename-collection',
    'Rename an existing collection',
    {
      oldName: z.string().min(1).describe('Current collection name'),
      newName: z.string().min(1).describe('New collection name'),
      dropTarget: z.boolean().default(false).describe('Whether to drop target collection if it exists')
    },
    async ({ oldName, newName, dropTarget }) => {
      try {
        log(`Tool: Renaming collection from '${oldName}' to '${newName}'…`)
        log(`Tool: Drop target if exists: ${dropTarget}`)
        
        const result = await renameCollection(oldName, newName, dropTarget)
        log(`Tool: Collection renamed successfully.`)
        return {
          content: [{
            type: 'text',
            text: `Collection '${oldName}' renamed to '${newName}' successfully.`
          }]
        }
      } catch (error) {
        console.error('Error renaming collection:', error)
        return {
          content: [{
            type: 'text',
            text: `Error renaming collection: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'modify-document',
    'Insert, update, or delete specific documents',
    {
      collection: z.string().min(1).describe('Collection name'),
      operation: z.enum(['insert', 'update', 'delete']).describe('Operation type'),
      document: z.string().describe('Document as JSON string (for insert)'),
      filter: z.string().optional().describe('Filter as JSON string (for update/delete)'),
      update: z.string().optional().describe('Update operations as JSON string (for update)'),
      options: z.string().optional().describe('Options as JSON string')
    },
    async ({ collection, operation, document, filter, update, options }) => {
      try {
        log(`Tool: Modifying documents in collection '${collection}' with operation '${operation}'…`)
        
        let result
        const parsedOptions = options ? JSON.parse(options) : {}
        
        if (operation === 'insert') {
          if (!document) throw new Error('Document is required for insert operation')
          const parsedDocument = JSON.parse(document)
          result = await insertDocument(collection, parsedDocument, parsedOptions)
          log(`Tool: Document inserted successfully.`)
        } else if (operation === 'update') {
          if (!filter) throw new Error('Filter is required for update operation')
          if (!update) throw new Error('Update is required for update operation')
          const parsedFilter = JSON.parse(filter)
          const parsedUpdate = JSON.parse(update)
          result = await updateDocument(collection, parsedFilter, parsedUpdate, parsedOptions)
          log(`Tool: Document(s) updated successfully.`)
        } else if (operation === 'delete') {
          if (!filter) throw new Error('Filter is required for delete operation')
          const parsedFilter = JSON.parse(filter)
          result = await deleteDocument(collection, parsedFilter, parsedOptions)
          log(`Tool: Document(s) deleted successfully.`)
        }
        
        return {
          content: [{
            type: 'text',
            text: formatModifyResult(operation, result)
          }]
        }
      } catch (error) {
        console.error(`Error in ${operation} operation:`, error)
        return {
          content: [{
            type: 'text',
            text: `Error in ${operation} operation: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'export-data',
    'Export query results to formatted JSON or CSV',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().default('{}').describe('Filter as JSON string'),
      format: z.enum(['json', 'csv']).default('json').describe('Export format'),
      fields: z.string().optional().describe('Comma-separated list of fields to include (for CSV)'),
      limit: z.number().int().min(1).default(1000).describe('Maximum documents to export'),
      sort: z.string().optional().describe('Sort specification as JSON string (e.g. {"date": -1} for descending)')
    },
    async ({ collection, filter, format, fields, limit, sort }) => {
      try {
        log(`Tool: Exporting data from collection '${collection}' in ${format} format…`)
        log(`Tool: Using filter: ${filter}`)
        if (sort) log(`Tool: Using sort: ${sort}`)
        log(`Tool: Max documents: ${limit}`)
        
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const parsedSort = sort ? JSON.parse(sort) : null
        let fieldsArray = fields ? fields.split(',').map(f => f.trim()) : null
        
        const documents = await findDocuments(collection, parsedFilter, null, limit, 0, parsedSort)
        log(`Tool: Found ${documents.length} documents to export.`)
        
        const exportData = await formatExport(documents, format, fieldsArray)
        log(`Tool: Data exported successfully in ${format} format.`)
        
        return {
          content: [{
            type: 'text',
            text: exportData
          }]
        }
      } catch (error) {
        console.error('Error exporting data:', error)
        return {
          content: [{
            type: 'text',
            text: `Error exporting data: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'map-reduce',
    'Run MapReduce operations',
    {
      collection: z.string().min(1).describe('Collection name'),
      map: z.string().describe('Map function as string'),
      reduce: z.string().describe('Reduce function as string'),
      options: z.string().optional().describe('Options as JSON string (query, limit, etc.)')
    },
    async ({ collection, map, reduce, options }) => {
      try {
        log(`Tool: Running MapReduce on collection '${collection}'…`)
        
        const mapFunction = new Function('function() {' + map + '}')()
        const reduceFunction = new Function('function(key, values) {' + reduce + '}')()
        const parsedOptions = options ? JSON.parse(options) : {}
        
        const results = await runMapReduce(collection, mapFunction, reduceFunction, parsedOptions)
        log(`Tool: MapReduce operation complete.`)
        
        return {
          content: [{
            type: 'text',
            text: formatMapReduceResults(results)
          }]
        }
      } catch (error) {
        console.error('Error running MapReduce:', error)
        return {
          content: [{
            type: 'text',
            text: `Error running MapReduce: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )

  server.tool(
    'bulk-operations',
    'Perform bulk inserts, updates, or deletes',
    {
      collection: z.string().min(1).describe('Collection name'),
      operations: z.string().describe('Array of operations as JSON string'),
      ordered: z.boolean().default(true).describe('Whether operations should be performed in order')
    },
    async ({ collection, operations, ordered }) => {
      try {
        log(`Tool: Performing bulk operations on collection '${collection}'…`)
        log(`Tool: Ordered: ${ordered}`)
        
        const parsedOperations = JSON.parse(operations)
        const result = await bulkOperations(collection, parsedOperations, ordered)
        log(`Tool: Bulk operations complete.`)
        
        return {
          content: [{
            type: 'text',
            text: formatBulkResult(result)
          }]
        }
      } catch (error) {
        console.error('Error in bulk operations:', error)
        return {
          content: [{
            type: 'text',
            text: `Error in bulk operations: ${error.message}`
          }],
          isError: true
        }
      }
    }
  )
}

const listDatabases = async () => {
  log('DB Operation: Listing databases…')
  const adminDb = mongoClient.db('admin')
  const result = await adminDb.admin().listDatabases()
  log(`DB Operation: Found ${result.databases.length} databases.`)
  return result.databases
}

const switchDatabase = async (dbName) => {
  log(`DB Operation: Switching to database '${dbName}'…`)
  try {
    const dbs = await listDatabases()
    const dbExists = dbs.some(db => db.name === dbName)
    if (!dbExists) throw new Error(`Database '${dbName}' does not exist`)
    currentDbName = dbName
    currentDb = mongoClient.db(dbName)
    log(`DB Operation: Successfully switched to database '${dbName}'.`)
    return currentDb
  } catch (error) {
    log(`DB Operation: Failed to switch to database '${dbName}': ${error.message}`)
    throw error
  }
}

const listCollections = async () => {
  log(`DB Operation: Listing collections in database '${currentDbName}'…`)
  try {
    if (!currentDb) throw new Error("No database selected")
    const collections = await currentDb.listCollections().toArray()
    log(`DB Operation: Found ${collections.length} collections.`)
    return collections
  } catch (error) {
    log(`DB Operation: Failed to list collections: ${error.message}`)
    throw error
  }
}

const findDocuments = async (collectionName, filter = {}, projection = null, limit = 10, skip = 0, sort = null) => {
  log(`DB Operation: Finding documents in collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    let query = collection.find(filter)
    
    if (projection) query = query.project(projection)
    if (skip) query = query.skip(skip)
    if (limit) query = query.limit(limit)
    if (sort) query = query.sort(sort)
    
    const results = await query.toArray()
    log(`DB Operation: Found ${results.length} documents.`)
    return results
  } catch (error) {
    log(`DB Operation: Failed to find documents: ${error.message}`)
    throw error
  }
}

const countDocuments = async (collectionName, filter = {}) => {
  log(`DB Operation: Counting documents in collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    const count = await collection.countDocuments(filter)
    log(`DB Operation: Count result: ${count} documents.`)
    return count
  } catch (error) {
    log(`DB Operation: Failed to count documents: ${error.message}`)
    throw error
  }
}

const aggregateData = async (collectionName, pipeline) => {
  log(`DB Operation: Running aggregation on collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    log(`DB Operation: Pipeline has ${pipeline.length} stages.`)
    const collection = currentDb.collection(collectionName)
    const results = await collection.aggregate(pipeline).toArray()
    log(`DB Operation: Aggregation returned ${results.length} results.`)
    return results
  } catch (error) {
    log(`DB Operation: Failed to run aggregation: ${error.message}`)
    throw error
  }
}

const getDatabaseStats = async () => {
  log(`DB Operation: Getting statistics for database '${currentDbName}'…`)
  const stats = await currentDb.stats()
  log(`DB Operation: Retrieved database statistics.`)
  return stats
}

const getCollectionStats = async (collectionName) => {
  log(`DB Operation: Getting statistics for collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const stats = await currentDb.collection(collectionName).stats()
    log(`DB Operation: Retrieved statistics for collection '${collectionName}'.`)
    return stats
  } catch (error) {
    log(`DB Operation: Failed to get statistics for collection '${collectionName}': ${error.message}`)
    throw error
  }
}

const getCollectionIndexes = async (collectionName) => {
  log(`DB Operation: Getting indexes for collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const indexes = await currentDb.collection(collectionName).indexes()
    log(`DB Operation: Retrieved ${indexes.length} indexes for collection '${collectionName}'.`)
    return indexes
  } catch (error) {
    log(`DB Operation: Failed to get indexes for collection '${collectionName}': ${error.message}`)
    throw error
  }
}

const inferSchema = async (collectionName, sampleSize = 100) => {
  log(`DB Operation: Inferring schema for collection '${collectionName}' with sample size ${sampleSize}…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    const documents = await collection.find({}).limit(sampleSize).toArray()
    log(`DB Operation: Retrieved ${documents.length} sample documents for schema inference.`)
    
    if (documents.length === 0) throw new Error(`Collection '${collectionName}' is empty`)
    
    const schema = {}
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => {
        if (!schema[key]) {
          schema[key] = {
            types: new Set(),
            count: 0,
            sample: doc[key]
          }
        }
        
        schema[key].types.add(getTypeName(doc[key]))
        schema[key].count++
      })
    })

    for (const key in schema) {
      schema[key].types = Array.from(schema[key].types)
    }
    
    log(`DB Operation: Schema inference complete, identified ${Object.keys(schema).length} fields.`)
    return { 
      collectionName,
      sampleSize: documents.length,
      fields: schema
    }
  } catch (error) {
    log(`DB Operation: Failed to infer schema: ${error.message}`)
    throw error
  }
}

const createIndex = async (collectionName, keys, options = {}) => {
  log(`DB Operation: Creating index on collection '${collectionName}'…`)
  log(`DB Operation: Index keys: ${JSON.stringify(keys)}`)
  if (Object.keys(options).length > 0) log(`DB Operation: Index options: ${JSON.stringify(options)}`)
  
  try {
    const collection = currentDb.collection(collectionName)
    const result = await collection.createIndex(keys, options)

    if (!result || typeof result !== 'string') {
      const errorMsg = "Index creation did not return a valid index name"
      log(`DB Operation: Index creation failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }

    log(`DB Operation: Index created successfully: ${result}`)
    return result
  } catch (error) {
    log(`DB Operation: Index creation failed: ${error.message}`)
    throw error
  }
}

const explainQuery = async (collectionName, filter, verbosity = 'executionStats') => {
  log(`DB Operation: Explaining query on collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    const explanation = await collection.find(filter).explain(verbosity)
    if (!explanation) throw new Error(`Explain operation returned no result`)
    log(`DB Operation: Query explanation generated.`)
    return explanation
  } catch (error) {
    log(`DB Operation: Query explanation failed: ${error.message}`)
    throw error
  }
}

const getServerStatus = async () => {
  log('DB Operation: Getting server status…')
  try {
    const adminDb = mongoClient.db('admin')
    const status = await adminDb.command({ serverStatus: 1 })
    log('DB Operation: Retrieved server status.')
    return status
  } catch (error) {
    log(`DB Operation: Error getting server status: ${error.message}`)
    return {
      host: mongoClient.s.options.host || 'unknown',
      port: mongoClient.s.options.port || 'unknown',
      version: 'Information unavailable',
      error: error.message
    }
  }
}

const getReplicaSetStatus = async () => {
  log('DB Operation: Getting replica set status…')
  try {
    const adminDb = mongoClient.db('admin')
    const status = await adminDb.command({ replSetGetStatus: 1 })
    log('DB Operation: Retrieved replica set status.')
    return status
  } catch (error) {
    log(`DB Operation: Error getting replica set status: ${error.message}`)
    return {
      isReplicaSet: false,
      info: 'This server is not part of a replica set or you may not have permissions to view replica set status.',
      error: error.message
    }
  }
}

const getCollectionValidation = async (collectionName) => {
  log(`DB Operation: Getting validation rules for collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collections = await currentDb.listCollections({ name: collectionName }, { validator: 1 }).toArray()
    log(`DB Operation: Retrieved validation information for collection '${collectionName}'.`)
    if (collections.length === 0) return { hasValidation: false }
    return {
      hasValidation: !!collections[0].options?.validator,
      validator: collections[0].options?.validator || {},
      validationLevel: collections[0].options?.validationLevel || 'strict',
      validationAction: collections[0].options?.validationAction || 'error'
    }
  } catch (error) {
    log(`DB Operation: Error getting validation for ${collectionName}: ${error.message}`)
    throw error
  }
}

const getDatabaseUsers = async () => {
  log(`DB Operation: Getting users for database '${currentDbName}'…`)
  try {
    const users = await currentDb.command({ usersInfo: 1 })
    log(`DB Operation: Retrieved user information.`)
    return users
  } catch (error) {
    log(`DB Operation: Error getting users: ${error.message}`)
    return { 
      users: [],
      info: 'Could not retrieve user information. You may not have sufficient permissions.',
      error: error.message
    }
  }
}

const getStoredFunctions = async () => {
  log(`DB Operation: Getting stored JavaScript functions…`)
  try {
    const system = currentDb.collection('system.js')
    const functions = await system.find({}).toArray()
    log(`DB Operation: Retrieved ${functions.length} stored functions.`)
    return functions
  } catch (error) {
    log(`DB Operation: Error getting stored functions: ${error.message}`)
    return []
  }
}

const getDistinctValues = async (collectionName, field, filter = {}) => {
  log(`DB Operation: Getting distinct values for field '${field}' in collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    if (!isValidFieldName(field)) throw new Error(`Invalid field name: ${field}`)
    const collection = currentDb.collection(collectionName)
    const values = await collection.distinct(field, filter)
    log(`DB Operation: Found ${values.length} distinct values.`)
    return values
  } catch (error) {
    log(`DB Operation: Failed to get distinct values: ${error.message}`)
    throw error
  }
}

const validateCollection = async (collectionName, full = false) => {
  log(`DB Operation: Validating collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)    
    const result = await currentDb.command({ validate: collectionName, full })
    if (!result) throw new Error(`Validation returned no result`)
    log(`DB Operation: Collection validation complete.`)
    return result
  } catch (error) {
    log(`DB Operation: Collection validation failed: ${error.message}`)
    throw error
  }
}

const createCollection = async (name, options = {}) => {
  log(`DB Operation: Creating collection '${name}'…`)
  try {
    const result = await currentDb.createCollection(name, options)
    
    if (!result || !result.collectionName || result.collectionName !== name) {
      const errorMsg = "Collection creation did not return a valid collection"
      log(`DB Operation: Collection creation failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    log(`DB Operation: Collection created successfully.`)
    return { success: true, name }
  } catch (error) {
    log(`DB Operation: Collection creation failed: ${error.message}`)
    throw error
  }
}

const dropCollection = async (name) => {
  log(`DB Operation: Dropping collection '${name}'…`)
  try {
    const result = await currentDb.collection(name).drop()

    if (result !== true) {
      const errorMsg = "Collection drop operation did not return success"
      log(`DB Operation: Collection drop failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }

    log(`DB Operation: Collection dropped successfully.`)
    return { success: result, name }
  } catch (error) {
    log(`DB Operation: Collection drop failed: ${error.message}`)
    throw error
  }
}

const renameCollection = async (oldName, newName, dropTarget = false) => {
  log(`DB Operation: Renaming collection from '${oldName}' to '${newName}'…`)
  try {
    const result = await currentDb.collection(oldName).rename(newName, { dropTarget })

    if (!result || !result.collectionName || result.collectionName !== newName) {
      const errorMsg = "Collection rename did not return a valid collection"
      log(`DB Operation: Collection rename failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }

    log(`DB Operation: Collection renamed successfully.`)
    return { success: true, oldName, newName }
  } catch (error) {
    log(`DB Operation: Collection rename failed: ${error.message}`)
    throw error
  }
}

const insertDocument = async (collectionName, document, options = {}) => {
  log(`DB Operation: Inserting document into collection '${collectionName}'…`)
  try {
    const collection = currentDb.collection(collectionName)
    const result = await collection.insertOne(document, options)
    
    if (!result || !result.acknowledged) {
      const errorMsg = "Insert operation was not acknowledged by MongoDB"
      log(`DB Operation: Document insertion failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    log(`DB Operation: Document inserted successfully.`)
    return result
  } catch (error) {
    log(`DB Operation: Document insertion failed: ${error.message}`)
    throw error
  }
}

const updateDocument = async (collectionName, filter, update, options = {}) => {
  log(`DB Operation: Updating document(s) in collection '${collectionName}'…`)
  try {
    const collection = currentDb.collection(collectionName)
    const hasUpdateOperators = Object.keys(update).some(key => key.startsWith('$'))
    
    let result
    if (options.multi === true || options.many === true) {
      if (!hasUpdateOperators) {
        update = { $set: update }
      }
      result = await collection.updateMany(filter, update, options)
    } else {
      if (!hasUpdateOperators) {
        update = { $set: update }
      }
      result = await collection.updateOne(filter, update, options)
    }
    
    if (!result || !result.acknowledged) {
      const errorMsg = "Update operation was not acknowledged by MongoDB"
      log(`DB Operation: Document update failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    log(`DB Operation: Document(s) updated successfully.`)
    return result
  } catch (error) {
    log(`DB Operation: Document update failed: ${error.message}`)
    throw error
  }
}

const deleteDocument = async (collectionName, filter, options = {}) => {
  log(`DB Operation: Deleting document(s) from collection '${collectionName}'…`)
  try {
    const collection = currentDb.collection(collectionName)
    
    let result
    if (options.many === true) {
      result = await collection.deleteMany(filter, options)
    } else {
      result = await collection.deleteOne(filter, options)
    }
    
    if (!result || !result.acknowledged) {
      const errorMsg = "Delete operation was not acknowledged by MongoDB"
      log(`DB Operation: Document deletion failed: ${errorMsg}`)
      throw new Error(errorMsg)
    }
    
    log(`DB Operation: Document(s) deleted successfully.`)
    return result
  } catch (error) {
    log(`DB Operation: Document deletion failed: ${error.message}`)
    throw error
  }
}

const formatExport = async (documents, format, fields = null) => {
  log(`DB Operation: Formatting ${documents.length} documents for export in ${format} format…`)
  try {
    if (format === 'json') {
      return JSON.stringify(documents, (key, value) => serializeForExport(value), 2)
    } else if (format === 'csv') {
      if (!fields || !fields.length) {
        if (documents.length > 0) {
          fields = Object.keys(documents[0])
        } else {
          return 'No documents found for export'
        }
      }
      
      let csv = fields.join(',') + '\n'
      
      for (const doc of documents) {
        const row = fields.map(field => {
          const value = getNestedValue(doc, field)
          return formatCsvValue(value)
        })
        csv += row.join(',') + '\n'
      }
      
      return csv
    }
    
    throw new Error(`Unsupported export format: ${format}`)
  } catch (error) {
    log(`DB Operation: Export formatting failed: ${error.message}`)
    throw error
  }
}

const runMapReduce = async (collectionName, map, reduce, options = {}) => {
  log(`DB Operation: Running MapReduce on collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    const results = await collection.mapReduce(map, reduce, options)
    if (!results) throw new Error(`MapReduce operation returned no result`)
    log(`DB Operation: MapReduce operation complete.`)
    return results.toArray()
  } catch (error) {
    log(`DB Operation: MapReduce operation failed: ${error.message}`)
    throw error
  }
}

const bulkOperations = async (collectionName, operations, ordered = true) => {
  log(`DB Operation: Performing bulk operations on collection '${collectionName}'…`)
  try {
    await throwIfCollectionNotExists(collectionName)
    const collection = currentDb.collection(collectionName)
    const bulk = ordered ? collection.initializeOrderedBulkOp() : collection.initializeUnorderedBulkOp()
    
    for (const op of operations) {
      if (op.insertOne) {
        bulk.insert(op.insertOne.document)
      } else if (op.updateOne) {
        bulk.find(op.updateOne.filter).updateOne(op.updateOne.update)
      } else if (op.updateMany) {
        bulk.find(op.updateMany.filter).update(op.updateMany.update)
      } else if (op.deleteOne) {
        bulk.find(op.deleteOne.filter).deleteOne()
      } else if (op.deleteMany) {
        bulk.find(op.deleteMany.filter).delete()
      } else if (op.replaceOne) {
        bulk.find(op.replaceOne.filter).replaceOne(op.replaceOne.replacement)
      }
    }

    const result = await bulk.execute()

    if (!result || !result.acknowledged) {
      throw new Error("Bulk operations were not acknowledged by MongoDB")
    }
    
    log(`DB Operation: Bulk operations complete.`)
    return result
  } catch (error) {
    log(`DB Operation: Bulk operations failed: ${error.message}`)
    throw error
  }
}

const throwIfCollectionNotExists = async (collectionName) => {
  if (!await collectionExists(collectionName)) {
    throw new Error(`Collection '${collectionName}' does not exist`)
  }
}

const collectionExists = async (collectionName) => {
  if (!currentDb) throw new Error('No database selected')
  const collections = await currentDb.listCollections().toArray()
  return collections.some(coll => coll.name === collectionName)
}

const formatDatabasesList = (databases) => {
  return `Databases (${databases.length}):\n` + 
    databases.map(db => `- ${db.name} (${formatSize(db.sizeOnDisk)})`).join('\n')
}

const formatCollectionsList = (collections) => {
  if (!collections || collections.length === 0) {
    return `No collections found in database '${currentDbName}'`
  }
  
  return `Collections in ${currentDbName} (${collections.length}):\n` +
    collections.map(coll => `- ${coll.name} (${coll.type})`).join('\n')
}

const formatDocuments = (documents, limit) => {
  if (!documents || documents.length === 0) {
    return 'No documents found'
  }
  
  const count = documents.length
  let result = `${count} document${count === 1 ? '' : 's'}`
  if (count === limit) {
    result += ` (limit: ${limit})`
  }
  result += ':\n'
  
  result += documents.map(doc => JSON.stringify(serializeDocument(doc), null, 2)).join('\n\n')
  return result
}

const formatSchema = (schema) => {
  const { collectionName, sampleSize, fields } = schema
  let result = `Schema for '${collectionName}' (sampled ${sampleSize} documents):\n`
  
  for (const [field, info] of Object.entries(fields)) {
    const types = info.types.join(' | ')
    const coverage = Math.round((info.count / sampleSize) * 100)
    let sample = ''
    
    if (info.sample !== null && info.sample !== undefined) {
      if (typeof info.sample === 'object') {
        sample = JSON.stringify(serializeDocument(info.sample))
      } else {
        sample = String(info.sample)
      }
      
      if (sample.length > 50) {
        sample = sample.substring(0, 47) + '…'
      }
      
      sample = ` (example: ${sample})`
    }
    
    result += `- ${field}: ${types} (${coverage}% coverage)${sample}\n`
  }
  
  return result
}

const formatStats = (stats) => {
  if (!stats) return 'No statistics available'
  
  const keyMetrics = [
    ['ns', 'Namespace'],
    ['count', 'Document Count'],
    ['size', 'Data Size'],
    ['avgObjSize', 'Average Object Size'],
    ['storageSize', 'Storage Size'],
    ['totalIndexSize', 'Total Index Size'],
    ['nindexes', 'Number of Indexes']
  ]
  
  let result = 'Statistics:\n'
  
  for (const [key, label] of keyMetrics) {
    if (stats[key] !== undefined) {
      let value = stats[key]
      if (key.toLowerCase().includes('size')) {
        value = formatSize(value)
      }
      result += `- ${label}: ${value}\n`
    }
  }
  
  return result
}

const formatIndexes = (indexes) => {
  if (!indexes || indexes.length === 0) {
    return 'No indexes found'
  }
  
  let result = `Indexes (${indexes.length}):\n`
  
  for (const idx of indexes) {
    const keys = Object.entries(idx.key)
      .map(([field, direction]) => `${field}: ${direction}`)
      .join(', ')
    
    result += `- ${idx.name}: { ${keys} }`
    
    if (idx.unique) result += ' (unique)'
    if (idx.sparse) result += ' (sparse)'
    if (idx.background) result += ' (background)'
    
    result += '\n'
  }
  
  return result
}

const formatExplanation = (explanation) => {
  let result = 'Query Explanation:\n'
  
  if (explanation.queryPlanner) {
    result += '\nQuery Planner:\n'
    result += `- Namespace: ${explanation.queryPlanner.namespace}\n`
    result += `- Index Filter: ${JSON.stringify(explanation.queryPlanner.indexFilterSet) || 'None'}\n`
    result += `- Winning Plan: ${JSON.stringify(explanation.queryPlanner.winningPlan, null, 2)}\n`
  }
  
  if (explanation.executionStats) {
    result += '\nExecution Stats:\n'
    result += `- Execution Success: ${explanation.executionStats.executionSuccess}\n`
    result += `- Documents Examined: ${explanation.executionStats.totalDocsExamined}\n`
    result += `- Keys Examined: ${explanation.executionStats.totalKeysExamined}\n`
    result += `- Execution Time: ${explanation.executionStats.executionTimeMillis}ms\n`
  }
  
  return result
}

const formatServerStatus = (status) => {
  if (!status) return 'Server status information not available'
  
  let result = 'MongoDB Server Status:\n'
  
  if (status.error) {
    result += `Note: Limited information available. ${status.error}\n\n`
  }

  result += '## Server Information\n'
  result += `- Host: ${status.host || 'Unknown'}\n`
  result += `- Version: ${status.version || 'Unknown'}\n`
  result += `- Process: ${status.process || 'Unknown'}\n`
  result += `- Uptime: ${formatUptime(status.uptime)}\n`

  if (status.connections) {
    result += '\n## Connections\n'
    result += `- Current: ${status.connections.current}\n`
    result += `- Available: ${status.connections.available}\n`
    result += `- Total Created: ${status.connections.totalCreated}\n`
  }

  if (status.mem) {
    result += '\n## Memory Usage\n'
    result += `- Resident: ${formatSize(status.mem.resident * 1024 * 1024)}\n`
    result += `- Virtual: ${formatSize(status.mem.virtual * 1024 * 1024)}\n`
    result += `- Page Faults: ${status.extra_info?.page_faults || 'N/A'}\n`
  }

  if (status.opcounters) {
    result += '\n## Operation Counters\n'
    result += `- Insert: ${status.opcounters.insert}\n`
    result += `- Query: ${status.opcounters.query}\n`
    result += `- Update: ${status.opcounters.update}\n`
    result += `- Delete: ${status.opcounters.delete}\n`
    result += `- Getmore: ${status.opcounters.getmore}\n`
    result += `- Command: ${status.opcounters.command}\n`
  }

  return result
}

const formatReplicaSetStatus = (status) => {
  if (!status) return 'Replica set status information not available'
  
  if (status.error) {
    return `Replica Set Status: Not available (${status.info})\n\n${status.error}`
  }
  
  let result = `Replica Set: ${status.set}\n`
  result += `Status: ${status.myState === 1 ? 'PRIMARY' : status.myState === 2 ? 'SECONDARY' : 'OTHER'}\n`
  result += `Current Time: ${new Date(status.date.$date || status.date).toISOString()}\n\n`
  
  result += '## Members:\n'
  if (status.members) {
    for (const member of status.members) {
      result += `- ${member.name} (${member.stateStr})\n`
      result += `  Health: ${member.health}\n`
      result += `  Uptime: ${formatUptime(member.uptime)}\n`
      if (member.syncingTo) {
        result += `  Syncing to: ${member.syncingTo}\n`
      }
      result += '\n'
    }
  }
  
  return result
}

const formatValidationRules = (validation) => {
  if (!validation) return 'Validation information not available'
  
  if (!validation.hasValidation) {
    return 'This collection does not have any validation rules configured.'
  }
  
  let result = 'Collection Validation Rules:\n'
  result += `- Validation Level: ${validation.validationLevel}\n`
  result += `- Validation Action: ${validation.validationAction}\n\n`
  
  result += 'Validator:\n'
  result += JSON.stringify(validation.validator, null, 2)
  
  return result
}

const formatDatabaseUsers = (usersInfo) => {
  if (!usersInfo) return 'User information not available'
  
  if (usersInfo.error) {
    return `Users: Not available\n\n${usersInfo.info}\n${usersInfo.error}`
  }
  
  const users = usersInfo.users || []
  if (users.length === 0) {
    return 'No users found in the current database.'
  }
  
  let result = `Users in database '${currentDbName}' (${users.length}):\n\n`
  
  for (const user of users) {
    result += `## ${user.user}${user.customData ? ' (' + JSON.stringify(user.customData) + ')' : ''}\n`
    result += `- User ID: ${user._id || 'N/A'}\n`
    result += `- Database: ${user.db}\n`
    
    if (user.roles && user.roles.length > 0) {
      result += '- Roles:\n'
      for (const role of user.roles) {
        result += `  - ${role.role} on ${role.db}\n`
      }
    } else {
      result += '- Roles: None\n'
    }
    
    result += '\n'
  }
  
  return result
}

const formatStoredFunctions = (functions) => {
  if (!functions || !Array.isArray(functions)) return 'Stored functions information not available'
  
  if (functions.length === 0) {
    return 'No stored JavaScript functions found in the current database.'
  }
  
  let result = `Stored Functions in database '${currentDbName}' (${functions.length}):\n\n`
  
  for (const func of functions) {
    result += `## ${func._id}\n`
    
    if (typeof func.value === 'function') {
      result += `${func.value.toString()}\n\n`
    } else {
      result += `${func.value}\n\n`
    }
  }
  
  return result
}

const formatDistinctValues = (field, values) => {
  if (!values || !Array.isArray(values)) return `No distinct values found for field '${field}'`
  let result = `Distinct values for field '${field}' (${values.length}):\n`
  for (const value of values) result += `- ${formatValue(value)}\n`
  return result
}

const formatValidationResults = (results) => {
  if (!results) return 'Validation results not available'
  
  let result = 'Collection Validation Results:\n'
  result += `- Collection: ${results.ns}\n`
  result += `- Valid: ${results.valid}\n`
  
  if (results.errors && results.errors.length > 0) {
    result += `- Errors: ${results.errors}\n`
  }
  
  if (results.warnings && results.warnings.length > 0) {
    result += `- Warnings: ${results.warnings}\n`
  }
  
  if (results.nrecords !== undefined) {
    result += `- Records Validated: ${results.nrecords}\n`
  }
  
  if (results.nInvalidDocuments !== undefined) {
    result += `- Invalid Documents: ${results.nInvalidDocuments}\n`
  }
  
  if (results.advice) {
    result += `- Advice: ${results.advice}\n`
  }
  
  return result
}

const formatModifyResult = (operation, result) => {
  if (!result) return `${operation} operation result not available`
  
  let output = ''
  
  switch (operation) {
    case 'insert':
      output = `Document inserted successfully\n`
      output += `- ID: ${result.insertedId}\n`
      output += `- Acknowledged: ${result.acknowledged}\n`
      break
    case 'update':
      output = `Document update operation complete\n`
      output += `- Matched: ${result.matchedCount}\n`
      output += `- Modified: ${result.modifiedCount}\n`
      output += `- Acknowledged: ${result.acknowledged}\n`
      if (result.upsertedId) {
        output += `- Upserted ID: ${result.upsertedId}\n`
      }
      break
    case 'delete':
      output = `Document delete operation complete\n`
      output += `- Deleted: ${result.deletedCount}\n`
      output += `- Acknowledged: ${result.acknowledged}\n`
      break
    default:
      output = `Operation ${operation} completed\n`
      output += JSON.stringify(result, null, 2)
  }
  
  return output
}

const formatMapReduceResults = (results) => {
  if (!results || !Array.isArray(results)) return 'MapReduce results not available'
  let output = `MapReduce Results (${results.length} entries):\n`
  for (const result of results) {
    output += `- Key: ${formatValue(result._id)}\n`
    output += `  Value: ${formatValue(result.value)}\n`
  }
  return output
}

const formatBulkResult = (result) => {
  if (!result) return 'Bulk operation results not available'
  
  let output = 'Bulk Operations Results:\n'
  output += `- Acknowledged: ${result.acknowledged}\n`
  
  if (result.insertedCount) output += `- Inserted: ${result.insertedCount}\n`
  if (result.matchedCount) output += `- Matched: ${result.matchedCount}\n`
  if (result.modifiedCount) output += `- Modified: ${result.modifiedCount}\n`
  if (result.deletedCount) output += `- Deleted: ${result.deletedCount}\n`
  if (result.upsertedCount) output += `- Upserted: ${result.upsertedCount}\n`
  
  if (result.insertedIds && Object.keys(result.insertedIds).length > 0) {
    output += '- Inserted IDs:\n'
    for (const [index, id] of Object.entries(result.insertedIds)) {
      output += `  - Index ${index}: ${id}\n`
    }
  }
  
  if (result.upsertedIds && Object.keys(result.upsertedIds).length > 0) {
    output += '- Upserted IDs:\n'
    for (const [index, id] of Object.entries(result.upsertedIds)) {
      output += `  - Index ${index}: ${id}\n`
    }
  }
  
  return output
}

const formatSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`
  if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const formatUptime = (seconds) => {
  if (seconds === undefined) return 'Unknown'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)
  
  return parts.join(' ')
}

const formatValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  
  return String(value)
}

const formatCsvValue = (value) => {
  if (value === null || value === undefined) return ''
  
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
  
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

const getTypeName = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'array'
  if (value instanceof ObjectId) return 'ObjectId'
  if (value instanceof Date) return 'Date'
  return typeof value
}

const serializeDocument = (doc) => {
  const result = {}
  
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      result[key] = `ObjectId("${value.toString()}")`
    } else if (value instanceof Date) {
      result[key] = `ISODate("${value.toISOString()}")`
    } else if (typeof value === 'object' && value !== null) {
      result[key] = serializeDocument(value)
    } else {
      result[key] = value
    }
  }
  
  return result
}

const serializeForExport = (value) => {
  if (value instanceof ObjectId) {
    return value.toString()
  } else if (value instanceof Date) {
    return value.toISOString()
  }
  return value
}

const getNestedValue = (obj, path) => {
  const parts = path.split('.')
  let current = obj
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[part]
  }
  
  return current
}

const log = (message, forceLog = false) => {
  if (forceLog || VERBOSE_LOGGING) console.error(message)
}

process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down…')
  await cleanup()
  exit()
})

process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down…')
  await cleanup()
  exit()
})

const cleanup = async () => {
  if (server) {
    try {
      log('Closing MCP server…')
      await server.close()
      log('MCP server closed.')
    } catch (error) {
      console.error('Error closing MCP server:', error)
    }
  }
  
  if (transport) {
    try {
      log('Closing transport…')
      await transport.close()
      log('Transport closed.')
    } catch (error) {
      console.error('Error closing transport:', error)
    }
  }
  
  if (mongoClient) {
    try {
      log('Closing MongoDB client…')
      await mongoClient.close()
      log('MongoDB client closed.')
    } catch (error) {
      console.error('Error closing MongoDB client:', error)
    }
  }
}

const exit = (exitCode = 1) => {
  log('Exiting…', true)
  process.exit(exitCode)
}

main(process.argv[2])
