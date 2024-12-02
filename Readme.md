# persisted-logs - A Persistent Logger

A unique logging library that records logs 
to both the console and a database of your choice.

From an in-memory Sqlite database to a full-blown RDBMS such as 
MySQL or postgres.
TypedOrm is used to create RDBMS flexibility. 

## Motivation 

Create a queryable log-pool for your application without
the need for specialized APIs, dependencies, or cloud services. 

Just a database connection of some sort.

The Longer term goal is to provide a built-in web-ish UI or REST interface to 
search and filter logs including dynamic `tail`-like functionality. 

## Features

(_pending re-write_)

- **Console & SQLite Logging**: Seamlessly logs messages to both the console and a SQLite database.
- **Searchable Logs**: Leverage SQL to easily search and filter log data.
- **Data Persistence**: Designed for long-term data storage, making it easier to track historical log data.
- **Configurable Data Retention**: (Soon) Includes a mechanism to periodically clean up old data,
  with customizable settings to manage data retention according to your needs.

## Getting Started

(_pending re-write_)

### Targets

Generally node.js applications. Not meant for use in the
browser since browsers are client side.

### Installation

Install persisted-logs via npm:

```bash
npm install persisted-logs
```

```javascript
import BetterLog from "persisted-logs";

(async function() {
  const bl = new BetterLog({ dbName:"unit-test-2.db",silent: false });
  const {debug, info, warn, error, hush, unhush, hushNext} = bl; // Destructure the methods for easier access.
  
  try {
    await bl.info(['demo', 'test', 'alina'], `This is an info message. ${Date.now()}`);

    await bl.debug(['demo', 'debug','test', 'Alina'], 'This is a debug message');
    await bl.error(['demo', 'test', 'error', ' ALL_TAGS_ARE_NORMALIZED_TO_lowercase'], `This is an error message. it gets ${Date.now()} highlighted as an error`);

    await bl.warn(['demo', 'test', 'warn', 'spaces are ok'], `This is a warning message. it gets highlighted as a warning ${Date.now()}`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }

  try {
    bl.hush();
    await bl.info(['demo', 'hush test', 'hush-test'], `This is the hush demo. When you hush, it silences all output to the console. If you call hushNext(), it will only silence the next log message.`);
    await bl.debug(['demo', 'hush test', 'hush-test'], 'The hush method will continue across all log levels until you call unhush().');
    await bl.error(['demo', 'hush test', 'hush-test'], 'This includes error messages. Again, all of these still go to the persistent log.');
    bl.unhush();
    await bl.info(['demo', 'hush test', 'hush-test', 'unhush'], `Since Unhush has been called, this will go to the console.`);
    bl.hushNext();
    await bl.warn(['demo', 'hush test', 'hush-test', 'hushNext'], `This will be hushed since hushNext() was called.`);
    await bl.info(['demo', 'hush test', 'hush-test', 'hushNext'], `This will not be hushed though. It will go to the console.`);
  } catch (er) {
    const _null = "[null]";
    console.error(er?.toString() || _null);
    await bl.error([], er?.toString() || _null);
  }
})();
```

### SQL - The Real Power™

Consider the power of SQL in searching and filtering logs. For example,
to search for logs with the tag "demo". Consider the benefit of using filters
to chase down production bugs and such. Use tags to associate session Ids,
user ids or methods to logs.

```sql
select t.tag, al.log_message, al.created_on, t.id, al.id
from app_log al
join log_tags lt on lt.log_id=al.id
join tags t on lt.tag_id=t.id
where t.tag='demo'
order by t.created_on desc, al.id desc;
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

For support, please open an issue in the GitHub repository or contact the maintainers directly
through https://www.theOpenSourceU.org.
