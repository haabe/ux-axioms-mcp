# Requirements

This document outlines the functional and non-functional requirements for the UX Axioms service, based on the **Model Context Protocol (MCP)**.

## Functional Requirements

1.  **Data Source:** The MCP Server will use the markdown files located in the `database/rules` directory as its primary source of truth.
2.  **MCP Server:**
    *   An MCP Server will be implemented using the `@mcp/framework`.
    *   The server must expose the collection of UX axioms as a readable/subscribable `Resource` named `axioms`.
3.  **Data Processing:**
    *   The server must automatically read all `*.md` files from the data source directory.
    *   It must parse the markdown content and convert it into a structured format.
4.  **Transports:**
    *   The server must support the **STDIO** transport to allow interaction from local command-line tools.
    *   The server must support the **SSE (Server-Sent Events)** transport for web-based clients.
5.  **Search and Querying:** The `axioms` resource should support basic querying to allow clients to filter or search for axioms by keyword.

## Non-Functional Requirements

1.  **Hosting:**
    *   The markdown data source will be hosted in a public GitHub repository.
    *   The MCP Server will be packaged as a Node.js application, suitable for deployment on platforms like Heroku, Render, or a VPS.
2.  **Security:**
    *   The SSE transport must be secured using the MCP Framework's built-in **API Key authentication** mechanism.
    *   The server must perform input sanitization and validation on any query parameters.
3.  **Performance:** The server must efficiently parse and serve the axiom data with low latency.
4.  **Scalability:** The Node.js application should be scalable horizontally by running multiple instances.
5.  **Documentation:** The project must include comprehensive documentation covering:
    *   Instructions for how MCP clients can connect to the server.
    *   A detailed reference for the `axioms` resource, including its data structure and query capabilities.
    *   An overview of the MCP Server architecture.
