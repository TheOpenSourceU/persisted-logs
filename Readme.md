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
npm install persisted-logs
```

Usage
Server Applications

```javascript
import BetterLog from "persisted-logs";

(async function() {
  const bl = new BetterLog({ dbName:"unit-test-2.db",silent: false });
  try {
    await bl.info(['test', 'alina'], `This is an info message. ${Date.now()}`);

    await bl.debug(['debug','test', 'Alina'], 'This is a debug message');
    await bl.error(['test', 'error', ' spaces-And-caps-SHOULD-be-lower-case'], `This is an error message. it gets ${Date.now()}` +
      ' highlighted as an' +
      ' error');

    await bl.warn(['test', 'warn', 'spaces are ok'], `This is a warning message. it gets highlighted as a warning ${Date.now()}`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }
})();
```

## Please see the wiki for more information on how to use this package.

[persisted-logs/wiki](https://github.com/TheOpenSourceU/persisted-logs/wiki)

[https://github.com/TheOpenSourceU/persisted-logs/wiki](https://github.com/TheOpenSourceU/persisted-logs/wiki)

## License
This project is open source and available under the MIT License.  

## Acknowledgments
Made with ❤️ by Frank Villasenor (https://www.theOpenSourceU.org) for the heck of it. Check out our other projects, 
like [AI Poems](https://poems.theOpenSourceU.org/) at https://poems.theOpenSourceU.org/.  
Support

For support, please open an issue in the GitHub repository or contact the maintainers directly through https://www.theOpenSourceU.org.
