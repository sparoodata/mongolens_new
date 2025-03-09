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
    version: '1.0.0'
  })
  
  registerResources(server)
  registerTools(server)
  
  const transport = new StdioServerTransport()
  await server.connect(transport)
  return true
}

const registerResources = (server) => {
  server.resource(
    'databases',
    'mongodb://databases',
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
    new ResourceTemplate('mongodb://collection/{name}/schema', { list: undefined }),
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
    new ResourceTemplate('mongodb://collection/{name}/stats', { list: undefined }),
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
    new ResourceTemplate('mongodb://collection/{name}/indexes', { list: undefined }),
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
