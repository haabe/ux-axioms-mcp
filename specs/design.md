# MCP System Design

This document describes the architecture and design of the UX Axioms service, built on the **Model Context Protocol (MCP)** framework.

## 1. Architecture Overview

The system is designed as an **MCP Server** that exposes the UX Axioms database as a `Resource` for consumption by MCP Clients, such as AI assistants and command-line tools. This approach standardizes how context is provided to AI models.

```
+-------------------+      +------------------------+      +--------------------------+
|   MCP Clients     |      |       MCP Server       |      |        Data Source       |
|-------------------|      |------------------------|      |--------------------------|
| - AI Assistant    |<---->|                        |<---->|                          |
| - CLI Tool        |<---->|     MCP Framework      |<---->|  GitHub Repository       |
| - Web Interface   |<---->| (Node.js Application)  |<---->|  (Markdown Axiom Files)  |
+-------------------+      +------------------------+      +--------------------------+
```

The core principle is that the MCP Server is the single gateway for accessing the UX Axiom data, handling all parsing, validation, and interaction according to the Model Context Protocol.

## 2. Data Source

-   **Source:** The `database/` directory within the primary GitHub repository.
-   **Content:** Individual axioms are defined in markdown files (`database/rules/*.md`).
-   **Processing:** The MCP Server will be responsible for reading these files, parsing the markdown, and converting them into a structured format suitable for the AI model.

## 3. Logic Layer (MCP Server)

The heart of the system is an MCP Server built using the official MCP Framework.

-   **Technology:** A **Node.js application** utilizing the `@mcp/framework` library.
-   **Core Components:**
    -   **Resource (`axioms`):** The server will define a primary `Resource` named `axioms`. This resource represents the entire collection of UX Axioms. MCP clients can read or subscribe to this resource to get context.
    -   **Transports:** The server will enable two primary communication layers (transports) for clients to connect through:
        1.  **STDIO:** For direct command-line interaction, enabling CLI-based tools and local scripts.
        2.  **SSE (Server-Sent Events):** For web-based clients. This transport will be protected by API Key authentication and provides a persistent connection for real-time updates.

## 4. Client Layer (MCP Clients)

Clients are any applications that can communicate using the Model Context Protocol.

-   **AI Assistants:** The primary consumers. An assistant could be configured to use the `axioms` resource to gain context about UX principles before answering a question.
-   **CLI Tools:** A custom command-line tool can be built to search and display axioms, interacting with the server via the STDIO transport.
-   **Web Interfaces:** A simple web-based UI could connect to the SSE endpoint to display and search the axioms.
