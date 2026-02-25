# MCP Task List

This document outlines the necessary tasks to build and deploy the UX Axioms **Model Context Protocol (MCP)** service.

## Milestone 1: MCP Server Setup & Resource Implementation

*The goal of this milestone is to have a functional MCP server that can load and serve the axiom data as a resource.*

-   [ ] **Task 1.1:** Initialize a new Node.js project and install the `@mcp/framework`.
-   [ ] **Task 1.2:** Use the MCP CLI to scaffold a new MCP Server project structure.
-   [ ] **Task 1.3:** Define the data structure (e.g., interface/type) for a single structured axiom.
-   [ ] **Task 1.4:** Implement the logic to read all markdown files from the `database/rules/` directory.
-   [ ] **Task 1.5:** Implement the parsing and transformation logic to convert the markdown content into the defined axiom data structure.
-   [ ] **Task 1.6:** Create an MCP `Resource` named `axioms`.
-   [ ] **Task 1.7:** Implement the `read` handler for the `axioms` resource to return the full list of structured axioms.
-   [ ] **Task 1.8:** Implement basic query handling for the `read` handler to allow filtering axioms by keyword.

## Milestone 2: Transports and Authentication

*The goal of this milestone is to enable clients to connect to the server using different protocols.*

-   [ ] **Task 2.1:** Configure and enable the **STDIO** transport in the MCP server.
-   [ ] **Task 2.2:** Configure and enable the **SSE (Server-Sent Events)** transport.
-   [ ] **Task 2.3:** Secure the SSE transport by enabling and configuring the built-in **API Key authentication** mechanism.
-   [ ] **Task 2.4:** Generate initial API keys for testing and client use.

## Milestone 3: Client Implementation & Testing

*The goal of this milestone is to build example clients to validate the server and transports.*

-   [ ] **Task 3.1:** Create a simple Node.js script that acts as a CLI client.
-   [ ] **Task 3.2:** Implement logic in the CLI client to connect to the server via the STDIO transport and read the `axioms` resource.
-   [ ] **Task 3.3:** Create a simple web application (e.g., using vanilla HTML/JS or a framework).
-   [ ] **Task 3.4:** Implement logic in the web app to connect to the server's SSE endpoint using a valid API key.
-   [ ] **Task 3.5:** Implement UI in the web app to display the list of axioms retrieved from the `axioms` resource.

## Milestone 4: Documentation & Deployment

*The goal of this milestone is to prepare the project for public use.*

-   [ ] **Task 4.1:** Write clear, public-facing documentation for the MCP service.
-   [ ] **Task 4.2:** Document the `axioms` resource, its data structure, and available query parameters.
-   [ ] **Task 4.3:** Document how to connect via the SSE transport and use an API key.
-   [ ] **Task 4.4:** Create a `Dockerfile` to containerize the Node.js application.
-   [ ] **Task 4.5:** Write a deployment guide for a target platform (e.g., Render, Heroku, or AWS).
