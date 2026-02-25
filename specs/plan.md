1. Core Architecture
Logic Layer: The heart of the MCP will be a serverless API (ideally using a platform like Cloudflare Workers). This API will be responsible for reading the markdown files from the GitHub repository, processing them, and serving them as structured JSON.
Service Discovery: A mcp.json file will be created. Its purpose is to act as an "address book" for clients. It will contain the URL for the serverless API, allowing clients to dynamically discover where to fetch the data from.
Client Implementation: All clients (VS Code, Figma, etc.) will be built with the following logic:
Read the mcp.json file to find the API endpoint.
Make HTTP requests to that endpoint to get the axiom data.
This approach gives us a robust, universally compatible, and scalable system that fulfills all your requirements.

2. High-Level Tasks
The implementation will proceed in the following order:

Build the Serverless API: Create the core function that serves the axiom data.
Create the mcp.json file: Define the structure and host this configuration file.
Build the VS Code Extension: Create the first client that consumes the API.
Build the Figma Plugin: Create the second client, demonstrating the universal compatibility of the API.
Documentation: Document the API and client usage.
This provides a clear, robust, and scalable path forward. I am ready for your next instruction.