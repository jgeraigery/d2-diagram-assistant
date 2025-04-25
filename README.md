# D2 Diagram Assistant MCP Server

This is a Model Context Protocol (MCP) server that provides access to D2 diagram documentation and examples. It's designed to be used with AI assistants that support the MCP protocol, such as Roo Code.

## Features

- Fetch comprehensive D2 diagram documentation
- Search within documentation for specific topics
- Retrieve example D2 diagram code for various diagram types

## Setup

1. Copy the documentation file:
   ```
   node setup.js
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

For stdio mode (used by Roo and other assistants):
```
node index.js --stdio
```

## Available Tools

The MCP server provides the following tools:

### 1. fetch_d2_documentation

Fetches the entire D2 diagram documentation for general questions.

```json
{
  "tool_name": "fetch_d2_documentation",
  "arguments": {}
}
```

### 2. search_d2_documentation

Semantically searches within the documentation for specific queries.

```json
{
  "tool_name": "search_d2_documentation",
  "arguments": {
    "query": "How to create a SQL table diagram"
  }
}
```

### 3. get_d2_examples

Retrieves example D2 diagram code for various diagram types.

```json
{
  "tool_name": "get_d2_examples",
  "arguments": {
    "type": "network"
  }
}
```

Available example types:
- basic
- network
- sketch
- sql
- variables
- globs
- animated

## Using with Roo Code

To use this MCP server with Roo Code:

1. Start the server in stdio mode:
   ```
   node index.js --stdio
   ```

2. Connect Roo to this MCP server
3. Create a new task with the D2 Diagram role

## D2 Diagram Examples

### Basic Diagram
```
# Basic D2 Diagram
x -> y: hello world
```

### Network Diagram
```
network: {
  cell tower: {
    satellites: {
      shape: stored_data
      style.multiple: true
    }

    transmitter

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
```

For more examples, use the `get_d2_examples` tool.