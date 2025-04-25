const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const similarity = require('similarity');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Load the D2 documentation content from file
let d2Documentation = '';

try {
  d2Documentation = fs.readFileSync(path.join(__dirname, 'documentation.txt'), 'utf8');
} catch (error) {
  console.error('Failed to load documentation file:', error);
  console.log('Documentation will be loaded from the source file when server is initialized');
}

// MCP server details
const MCP_SERVER_NAME = 'd2-diagram-documentation';
const MCP_SERVER_VERSION = '1.0.0';

// Parse documentation into sections for better search
const documentationSections = [];

function parseDocumentation() {
  if (!d2Documentation) return;
  
  // Split by headings to create sections
  const sectionPattern = /(?:^|\n)#+\s+([^\n]+)(?:\n|$)/g;
  let match;
  let lastIndex = 0;
  
  while ((match = sectionPattern.exec(d2Documentation)) !== null) {
    const startIndex = match.index;
    if (startIndex > lastIndex) {
      // Add the previous section
      const prevSectionTitle = documentationSections.length > 0 ? 
        documentationSections[documentationSections.length - 1].title : 'Introduction';
      
      documentationSections.push({
        title: prevSectionTitle,
        content: d2Documentation.substring(lastIndex, startIndex).trim()
      });
    }
    
    lastIndex = startIndex;
    
    // Store the heading for the next section
    documentationSections.push({
      title: match[1],
      content: '',
      startIndex: startIndex
    });
  }
  
  // Add the last section
  if (lastIndex < d2Documentation.length) {
    const lastSectionTitle = documentationSections.length > 0 ? 
      documentationSections[documentationSections.length - 1].title : 'Introduction';
      
    documentationSections.push({
      title: lastSectionTitle,
      content: d2Documentation.substring(lastIndex).trim()
    });
  }
  
  console.log(`Parsed ${documentationSections.length} documentation sections`);
}

// Initialize documentation from the original source file
async function initializeDocumentation() {
  try {
    // If we're running in the same directory as the source file
    const sourcePath = path.join(process.cwd(), '..', 'd2lang-llms-full.txt');
    if (fs.existsSync(sourcePath)) {
      d2Documentation = fs.readFileSync(sourcePath, 'utf8');
      // Save a copy in our directory for future use
      fs.writeFileSync(path.join(__dirname, 'documentation.txt'), d2Documentation);
      console.log('Documentation loaded from source file and saved locally');
      parseDocumentation();
    } else {
      console.error('Could not find source documentation file');
    }
  } catch (error) {
    console.error('Error initializing documentation:', error);
  }
}

// Tool handler functions
function fetchD2Documentation() {
  // Return the entire documentation
  return {
    result: d2Documentation || 'Documentation not available',
    status: d2Documentation ? 'success' : 'error'
  };
}

function searchD2Documentation(query) {
  if (!d2Documentation) {
    return {
      result: 'Documentation not available',
      status: 'error'
    };
  }

  // Search for relevant sections based on query
  const results = [];
  
  // Search in section titles and content
  for (const section of documentationSections) {
    const titleSimilarity = similarity(query, section.title);
    const contentMatch = section.content.toLowerCase().includes(query.toLowerCase());
    
    if (titleSimilarity > 0.6 || contentMatch) {
      results.push({
        title: section.title,
        content: section.content,
        relevance: titleSimilarity > 0.6 ? titleSimilarity : 0.5
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  // If no sections match, perform a raw text search
  if (results.length === 0) {
    const regex = new RegExp(`[^.!?]*(?:${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[^.!?]*[.!?]`, 'gi');
    let match;
    const textMatches = [];
    
    while ((match = regex.exec(d2Documentation)) !== null && textMatches.length < 5) {
      textMatches.push(match[0].trim());
    }
    
    if (textMatches.length > 0) {
      return {
        result: {
          type: 'text_matches',
          matches: textMatches
        },
        status: 'success'
      };
    }
    
    return {
      result: `No results found for query: ${query}`,
      status: 'error'
    };
  }
  
  return {
    result: {
      type: 'sections',
      sections: results.slice(0, 3) // Return top 3 matches
    },
    status: 'success'
  };
}

function getD2Examples(type) {
  const examples = {
    basic: `# Basic D2 Diagram
x -> y: hello world`,
    
    network: `# Network Diagram
network: {
  cell tower: {
    satellites: {
      shape: stored_data
      style.multiple: true
    }

    transmitter

    satellites -> transmitter: send
    satellites -> transmitter: send
    satellites -> transmitter: send
  }

  online portal: {
    ui: {shape: hexagon}
  }

  data processor: {
    storage: {
      shape: cylinder
      style.multiple: true
    }
  }

  cell tower.transmitter -> data processor.storage: phone logs
}

user: {
  shape: person
  width: 130
}

user -> network.cell tower: make call
user -> network.online portal.ui: access {
  style.stroke-dash: 3
}

api server -> network.online portal.ui: display
api server -> logs: persist
logs: {shape: page; style.multiple: true}

network.data processor -> api server`,
    
    sketch: `# Sketch Mode Example
vars: {
  d2-config: {
    sketch: true
  }
}

Preprocessing -> Multi-GPU -> Training -> Eval -> Inference
Orchestrator -> "Data Warehouse" -> "Processing Pipeline": Note: we can replace the orchestrator with Kubernetes when we run out of things to do

"Full working pipeline": {
  style.fill: green
  style.opacity: 0.5
  style.border-radius: 10
  label: Primary
}`,
    
    sql: `# SQL Table Example
users: {
  shape: sql_table
  id: int {constraint: primary_key}
  name: varchar
  email: varchar
  age: int
  created_at: timestamp
}

posts: {
  shape: sql_table
  id: int {constraint: primary_key}
  title: varchar
  content: text
  user_id: int {constraint: foreign_key}
  created_at: timestamp
}

users.id <- posts.user_id`,
    
    variables: `# Variables Example
vars: {
  color: aquamarine
  border_width: 2
  highlight_color: orange
}

x.style.fill: \${color}
x.style.stroke-width: \${border_width}

y.style.fill: \${highlight_color}
y.style.stroke-width: \${border_width}

x -> y: connection`,
    
    globs: `# Globs Example
x
y
z

*.style.fill: aquamarine
*: {&shape: circle; style.fill: orange}

x -> y -> z

*->*: {style.stroke: blue; style.stroke-dash: 5}`,
    
    animated: `# Animated Connection Example
vars: {
  d2-config: {
    sketch: true
  }
}
winter.snow -> summer.sun -> trees -> winter.snow: {style.animated: true}`
  };
  
  if (type && examples[type]) {
    return {
      result: examples[type],
      status: 'success'
    };
  }
  
  return {
    result: {
      type: 'example_list',
      available_examples: Object.keys(examples),
      basic_example: examples.basic
    },
    status: 'success'
  };
}

// MCP protocol endpoints
app.post('/use_tool', (req, res) => {
  const { tool_name, arguments: args } = req.body;
  
  let result;
  
  switch (tool_name) {
    case 'fetch_d2_documentation':
      result = fetchD2Documentation();
      break;
    case 'search_d2_documentation':
      result = searchD2Documentation(args.query || '');
      break;
    case 'get_d2_examples':
      result = getD2Examples(args.type || '');
      break;
    default:
      result = {
        status: 'error',
        result: `Unknown tool: ${tool_name}`
      };
  }
  
  res.json(result);
});

app.get('/manifest', (req, res) => {
  res.json({
    schema_version: '1.0.0',
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    description: 'MCP server for retrieving and searching D2 diagram documentation',
    tools: [
      {
        name: 'fetch_d2_documentation',
        description: 'Fetch entire documentation file from D2 diagrams. Useful for general questions. Always call this tool first if asked about D2 diagrams.',
        input_schema: {
          type: 'object'
        }
      },
      {
        name: 'search_d2_documentation',
        description: 'Semantically search within the fetched documentation for D2 diagrams. Useful for specific queries.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to find relevant documentation'
            }
          },
          required: ['query'],
          additionalProperties: false
        }
      },
      {
        name: 'get_d2_examples',
        description: 'Retrieve example D2 diagram code for various diagram types',
        input_schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'The type of example to retrieve (basic, network, sketch, sql, variables, globs, animated)'
            }
          },
          additionalProperties: false
        }
      }
    ],
    resources: []
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`D2 Diagram Documentation MCP server listening on port ${PORT}`);
  
  // Initialize documentation
  if (!d2Documentation) {
    initializeDocumentation();
  } else {
    parseDocumentation();
  }
});

// Handle stdio for MCP stdio protocol mode
if (process.argv.includes('--stdio')) {
  console.log('Starting in stdio mode for MCP protocol');
  
  // Read from stdin
  process.stdin.setEncoding('utf8');
  let stdinBuffer = '';
  
  process.stdin.on('data', (chunk) => {
    stdinBuffer += chunk;
    
    // Try to parse complete JSON messages
    let newlineIndex;
    while ((newlineIndex = stdinBuffer.indexOf('\n')) !== -1) {
      const message = stdinBuffer.slice(0, newlineIndex);
      stdinBuffer = stdinBuffer.slice(newlineIndex + 1);
      
      try {
        const parsed = JSON.parse(message);
        handleStdioMessage(parsed);
      } catch (error) {
        console.error('Error parsing message:', error);
        sendStdioResponse({
          id: 'unknown',
          status: 'error',
          result: 'Invalid JSON message'
        });
      }
    }
  });
}

function handleStdioMessage(message) {
  const { id, type, tool_name, arguments: args } = message;
  
  if (type === 'manifest') {
    sendStdioResponse({
      id,
      status: 'success',
      result: {
        schema_version: '1.0.0',
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
        description: 'MCP server for retrieving and searching D2 diagram documentation',
        tools: [
          {
            name: 'fetch_d2_documentation',
            description: 'Fetch entire documentation file from D2 diagrams. Useful for general questions. Always call this tool first if asked about D2 diagrams.',
            input_schema: {
              type: 'object'
            }
          },
          {
            name: 'search_d2_documentation',
            description: 'Semantically search within the fetched documentation for D2 diagrams. Useful for specific queries.',
            input_schema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query to find relevant documentation'
                }
              },
              required: ['query'],
              additionalProperties: false
            }
          },
          {
            name: 'get_d2_examples',
            description: 'Retrieve example D2 diagram code for various diagram types',
            input_schema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'The type of example to retrieve (basic, network, sketch, sql, variables, globs, animated)'
                }
              },
              additionalProperties: false
            }
          }
        ],
        resources: []
      }
    });
    return;
  }
  
  if (type === 'use_tool') {
    let result;
    
    switch (tool_name) {
      case 'fetch_d2_documentation':
        result = fetchD2Documentation();
        break;
      case 'search_d2_documentation':
        result = searchD2Documentation(args.query || '');
        break;
      case 'get_d2_examples':
        result = getD2Examples(args.type || '');
        break;
      default:
        result = {
          status: 'error',
          result: `Unknown tool: ${tool_name}`
        };
    }
    
    sendStdioResponse({
      id,
      status: result.status,
      result: result.result
    });
    return;
  }
  
  sendStdioResponse({
    id: id || 'unknown',
    status: 'error',
    result: `Unknown message type: ${type}`
  });
}

function sendStdioResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}