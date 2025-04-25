# D2 Diagram Assistant MCP Server - Usage Guide

This document explains how to use the D2 Diagram Assistant MCP server with Roo Code to create a specialized role for generating D2 diagrams.

## Overview

The D2 Diagram Assistant MCP server provides tools for:
1. Fetching comprehensive D2 documentation
2. Searching for specific topics within the documentation
3. Retrieving example D2 diagram code for various diagram types

## Connecting to Roo Code

### Step 1: Start the MCP Server

Start the server in stdio mode, which is required for Roo:

```bash
cd d2-diagram-assistant
node index.js --stdio
```

### Step 2: Connect to Roo

Follow the Roo documentation to connect this MCP server using the stdio protocol.

### Step 3: Create a D2 Diagram Role

Use the provided `d2_diagram_role.json` file as a template for creating a new Roo Code role specifically for working with D2 diagrams.

## Available Tools

### 1. fetch_d2_documentation

This tool retrieves the entire D2 documentation as a comprehensive reference. Use this when you need general information about D2 syntax, features, or capabilities.

### 2. search_d2_documentation

This tool performs a semantic search within the D2 documentation for specific queries, returning the most relevant sections. Use this when you need focused information about particular D2 features.

Example query topics:
- "sketch mode"
- "SQL tables"
- "animation"
- "globs"
- "variables"
- "layout engines"
- "themes"

### 3. get_d2_examples

This tool provides example D2 diagram code for various diagram types, helping to understand different diagram patterns and features.

Available example types:
- `basic`: A simple hello world connection
- `network`: A network architecture diagram
- `sketch`: A diagram using sketch mode for hand-drawn aesthetic
- `sql`: Database tables with relationships
- `variables`: Using variables for consistent styling
- `globs`: Using glob patterns to style multiple elements
- `animated`: Creating animated connections

## Example Workflow

1. Start with a question about creating a D2 diagram for a specific use case
2. Use `fetch_d2_documentation` to get general D2 information
3. Use `search_d2_documentation` to find specific syntax or features needed
4. Use `get_d2_examples` to see relevant examples
5. Create or modify D2 diagram code based on the documentation and examples

## Tips for Effective Use

1. Be specific when searching for documentation topics
2. Review multiple examples to understand different approaches
3. Use the sketch mode for more visually appealing diagrams
4. Explore layout engines (elk, dagre, tala) for different diagram layouts
5. Understand containers, nesting, and connections for complex relationships
6. Leverage themes for professional-looking diagrams

## Troubleshooting

If the server doesn't respond:
- Make sure you're using the `--stdio` flag for Roo integration
- Check if the documentation file is properly loaded
- Verify the server is running without errors

If search returns no results:
- Try more general search terms
- Check for typos in your search query
- Try related terms or synonyms