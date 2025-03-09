import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import mongodb from 'mongodb'
const { MongoClient, ObjectId } = mongodb

let client = null
let currentDb = null
let currentDbName = null

export const connect = async (uri = 'mongodb://localhost:27017') => {
  try {
    client = new MongoClient(uri, { useUnifiedTopology: true })
    await client.connect()
    currentDbName = 'admin'
    currentDb = client.db(currentDbName)
    return true
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    return false
  }
}

export const main = async (mongoUri) => {
  const connected = await connect(mongoUri)
  if (!connected) return false
  
  const server = new McpServer({
    name: 'MongoDB Lens',
    version: '1.0.0',
    instructions: `
# MongoDB Lens MCP Server

This server provides access to your MongoDB database through MCP. You can:

1. Browse databases and collections
2. Query and count documents
3. Analyze schemas and indexes
4. Run aggregation pipelines
5. Get assistance with queries and database operations

## Getting Started

1. Use \`listDatabases\` to see available databases
2. Use \`useDatabase\` to select a database to work with
3. Use \`listCollections\` to view collections in the current database
4. Explore schemas with \`mongodb://collection/{name}/schema\` resources
5. Query data with the \`findDocuments\` tool
6. Try prompts like \`queryBuilder\` for help building queries
`
  })
  
  registerResources(server)
  registerTools(server)
  registerPrompts(server)
  
  const transport = new StdioServerTransport()
  await server.connect(transport)
  return true
}

const registerResources = (server) => {
  server.resource(
    'databases',
    'mongodb://databases',
    { description: 'List of all accessible MongoDB databases' },
    async () => {
      const dbs = await listDatabases()
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
      const collections = await listCollections()
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
          const collections = await listCollections()
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
            const collections = await listCollections()
            return collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Schema information for a MongoDB collection' },
    async (uri, { name }) => {
      const schema = await inferSchema(name)
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
          const collections = await listCollections()
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
            const collections = await listCollections()
            return collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Performance statistics for a MongoDB collection' },
    async (uri, { name }) => {
      const stats = await getCollectionStats(name)
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
          const collections = await listCollections()
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
            const collections = await listCollections()
            return collections
              .map(coll => coll.name)
              .filter(name => name.toLowerCase().includes(value.toLowerCase()))
          } catch (error) {
            console.error('Error completing collection names:', error)
            return []
          }
        }
      }
    }),
    { description: 'Index information for a MongoDB collection' },
    async (uri, { name }) => {
      const indexes = await getCollectionIndexes(name)
      return {
        contents: [{
          uri: uri.href,
          text: formatIndexes(indexes)
        }]
      }
    }
  )
}

const registerPrompts = (server) => {
  server.prompt(
    'queryBuilder',
    'Help construct MongoDB query filters',
    {
      collection: z.string().min(1).describe('Collection name to query'),
      condition: z.string().describe('Describe the condition in natural language (e.g., "users older than 30")')
    },
    ({ collection, condition }) => ({
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
    })
  )
  
  server.prompt(
    'aggregationBuilder',
    'Help construct MongoDB aggregation pipelines',
    {
      collection: z.string().min(1).describe('Collection name for aggregation'),
      goal: z.string().describe('What you want to calculate or analyze')
    },
    ({ collection, goal }) => ({
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
    })
  )
  
  server.prompt(
    'schemaAnalysis',
    'Analyze collection schema and recommend improvements',
    {
      collection: z.string().min(1).describe('Collection name to analyze')
    },
    async ({ collection }) => {
      // First get the actual schema to make the prompt more informed
      const schema = await inferSchema(collection)
      
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
    'indexRecommendation',
    'Get index recommendations for query patterns',
    {
      collection: z.string().min(1).describe('Collection name'),
      queryPattern: z.string().describe('Common query pattern or operation')
    },
    ({ collection, queryPattern }) => ({
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
    })
  )
  
  server.prompt(
    'mongoShell',
    'Generate MongoDB shell commands',
    {
      operation: z.string().describe('Operation you want to perform'),
      details: z.string().optional().describe('Additional details about the operation')
    },
    ({ operation, details }) => ({
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
    })
  )
  
  server.prompt(
    'inspectorGuide',
    'Get help using MongoDB Lens with MCP Inspector',
    {},
    () => ({
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
    })
  )
}

async function generateExampleFilter(collectionName) {
  try {
    const schema = await inferSchema(collectionName, 5)
    const fields = Object.entries(schema.fields)
    
    if (fields.length === 0) return '{}'
    
    // Find a suitable field for filtering
    const fieldEntry = fields.find(([name, info]) => 
      info.types.includes('string') || 
      info.types.includes('number') || 
      info.types.includes('boolean')
    )
    
    if (!fieldEntry) return '{}'
    
    const [fieldName, info] = fieldEntry
    
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
    const schema = await inferSchema(collectionName, 5)
    return Object.keys(schema.fields)
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
    'listDatabases',
    'List all accessible MongoDB databases',
    async () => {
      try {
        const dbs = await listDatabases()
        return {
          content: [{
            type: 'text',
            text: formatDatabasesList(dbs)
          }]
        }
      } catch (error) {
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
    'useDatabase',
    'Switch to a specific database',
    {
      database: z.string().min(1).describe('Database name to use')
    },
    async ({ database }) => {
      try {
        await switchDatabase(database)
        return {
          content: [{
            type: 'text',
            text: `Switched to database: ${database}`
          }]
        }
      } catch (error) {
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
    'listCollections',
    'List collections in the current database',
    async () => {
      try {
        const collections = await listCollections()
        return {
          content: [{
            type: 'text',
            text: formatCollectionsList(collections)
          }]
        }
      } catch (error) {
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
    'findDocuments',
    'Run queries with filters and projections',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().default('{}').describe('MongoDB query filter (JSON string)'),
      projection: z.string().optional().describe('Fields to include/exclude (JSON string)'),
      limit: z.number().int().min(1).max(100).default(10).describe('Maximum number of documents to return'),
      skip: z.number().int().min(0).default(0).describe('Number of documents to skip'),
      sort: z.string().optional().describe('Sort specification (JSON string)')
    },
    async ({ collection, filter, projection, limit, skip, sort }) => {
      try {
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const parsedProjection = projection ? JSON.parse(projection) : null
        const parsedSort = sort ? JSON.parse(sort) : null
        
        const documents = await findDocuments(collection, parsedFilter, parsedProjection, limit, skip, parsedSort)
        return {
          content: [{
            type: 'text',
            text: formatDocuments(documents, limit)
          }]
        }
      } catch (error) {
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
    'countDocuments',
    'Count documents with optional filter',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().default('{}').describe('MongoDB query filter (JSON string)')
    },
    async ({ collection, filter }) => {
      try {
        const parsedFilter = filter ? JSON.parse(filter) : {}
        const count = await countDocuments(collection, parsedFilter)
        return {
          content: [{
            type: 'text',
            text: `Count: ${count} document(s)`
          }]
        }
      } catch (error) {
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
    'aggregateData',
    'Run aggregation pipelines',
    {
      collection: z.string().min(1).describe('Collection name'),
      pipeline: z.string().describe('Aggregation pipeline as JSON string array')
    },
    async ({ collection, pipeline }) => {
      try {
        const parsedPipeline = JSON.parse(pipeline)
        const results = await aggregateData(collection, parsedPipeline)
        return {
          content: [{
            type: 'text',
            text: formatDocuments(results, 100)
          }]
        }
      } catch (error) {
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
    'getStats',
    'Get database or collection statistics',
    {
      target: z.enum(['database', 'collection']).describe('Target type'),
      name: z.string().optional().describe('Collection name (for collection stats)')
    },
    async ({ target, name }) => {
      try {
        let stats
        if (target === 'database') {
          stats = await getDatabaseStats()
        } else if (target === 'collection') {
          if (!name) throw new Error('Collection name is required for collection stats')
          stats = await getCollectionStats(name)
        }
        
        return {
          content: [{
            type: 'text',
            text: formatStats(stats)
          }]
        }
      } catch (error) {
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
    'analyzeSchema',
    'Automatically infer schema from collection',
    {
      collection: z.string().min(1).describe('Collection name'),
      sampleSize: z.number().int().min(1).max(1000).default(100).describe('Number of documents to sample')
    },
    async ({ collection, sampleSize }) => {
      try {
        const schema = await inferSchema(collection, sampleSize)
        return {
          content: [{
            type: 'text',
            text: formatSchema(schema)
          }]
        }
      } catch (error) {
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
    'createIndex',
    'Create new index on collection',
    {
      collection: z.string().min(1).describe('Collection name'),
      keys: z.string().describe('Index keys as JSON object'),
      options: z.string().optional().describe('Index options as JSON object')
    },
    async ({ collection, keys, options }) => {
      try {
        const parsedKeys = JSON.parse(keys)
        const parsedOptions = options ? JSON.parse(options) : {}
        
        const result = await createIndex(collection, parsedKeys, parsedOptions)
        return {
          content: [{
            type: 'text',
            text: `Index created: ${result}`
          }]
        }
      } catch (error) {
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
    'explainQuery',
    'Analyze query performance',
    {
      collection: z.string().min(1).describe('Collection name'),
      filter: z.string().describe('MongoDB query filter (JSON string)'),
      verbosity: z.enum(['queryPlanner', 'executionStats', 'allPlansExecution']).default('executionStats').describe('Explain verbosity level')
    },
    async ({ collection, filter, verbosity }) => {
      try {
        const parsedFilter = JSON.parse(filter)
        const explanation = await explainQuery(collection, parsedFilter, verbosity)
        return {
          content: [{
            type: 'text',
            text: formatExplanation(explanation)
          }]
        }
      } catch (error) {
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
}

const listDatabases = async () => {
  const adminDb = client.db('admin')
  const result = await adminDb.admin().listDatabases()
  return result.databases
}

const switchDatabase = async (dbName) => {
  currentDbName = dbName
  currentDb = client.db(dbName)
  return currentDb
}

const listCollections = async () => {
  const collections = await currentDb.listCollections().toArray()
  return collections
}

const findDocuments = async (collectionName, filter = {}, projection = null, limit = 10, skip = 0, sort = null) => {
  const collection = currentDb.collection(collectionName)
  let query = collection.find(filter)
  
  if (projection) query = query.project(projection)
  if (skip) query = query.skip(skip)
  if (limit) query = query.limit(limit)
  if (sort) query = query.sort(sort)
  
  return await query.toArray()
}

const countDocuments = async (collectionName, filter = {}) => {
  const collection = currentDb.collection(collectionName)
  return await collection.countDocuments(filter)
}

const aggregateData = async (collectionName, pipeline) => {
  const collection = currentDb.collection(collectionName)
  return await collection.aggregate(pipeline).toArray()
}

const getDatabaseStats = async () => {
  return await currentDb.stats()
}

const getCollectionStats = async (collectionName) => {
  return await currentDb.collection(collectionName).stats()
}

const getCollectionIndexes = async (collectionName) => {
  return await currentDb.collection(collectionName).indexes()
}

const inferSchema = async (collectionName, sampleSize = 100) => {
  const collection = currentDb.collection(collectionName)
  const documents = await collection.find({}).limit(sampleSize).toArray()
  
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
  
  return { 
    collectionName,
    sampleSize: documents.length,
    fields: schema
  }
}

const createIndex = async (collectionName, keys, options = {}) => {
  const collection = currentDb.collection(collectionName)
  const result = await collection.createIndex(keys, options)
  return result
}

const explainQuery = async (collectionName, filter, verbosity = 'executionStats') => {
  const collection = currentDb.collection(collectionName)
  return await collection.find(filter).explain(verbosity)
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
        sample = sample.substring(0, 47) + '...'
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

const formatSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`
  if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
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

if (process.argv.length > 2) {
  main(process.argv[2])
} else {
  main()
}
