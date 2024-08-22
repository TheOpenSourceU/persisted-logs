# Persistent Logger

A lightweight, efficient logging system designed for both server environments and command-line interface (CLI) applications. Persistent Logger outputs logs to the console and stores them in a SQLite database for easy retrieval and management. Ideal for developers who value long-term data persistence and the flexibility of SQL for data manipulation.

## Features

- **Console & SQLite Logging**: Seamlessly logs messages to both the console and a SQLite database.
- **Searchable Logs**: Leverage SQL to easily search and filter log data.
- **Data Persistence**: Designed for long-term data storage, making it easier to track historical log data.
- **Configurable Data Retention**: Includes a mechanism to periodically clean up old data, with customizable settings to manage data retention according to your needs.

## Getting Started

### Prerequisites

- Node.js and npm installed on your system.

### Installation

Install Persistent Logger via npm:

```bash
npm install persistent-logger
```

Usage
Server Applications

```javascript

const logger = require('persistent-logger');
```

```
logger.log('Your log message here');
```

## Configuration
Details on how to configure the logger, including setting up the SQLite database and customizing data retention policies.  

## Contributing
We welcome contributions! Please read our CONTRIBUTING.md for details on how to submit pull requests, and the process for submitting pull requests to us.  

## License
This project is open source and available under the MIT License.  

## Acknowledgments
Made with ❤️ by Frank Villasenor (https://www.theOpenSourceU.org). Check out our other projects, like AI Poems at https://poems.theOpenSourceU.org/.  
Support

For support, please open an issue in the GitHub repository or contact the maintainers directly through https://www.theOpenSourceU.org.