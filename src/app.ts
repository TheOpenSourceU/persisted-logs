import 'reflect-metadata';
import { config } from 'dotenv';
import type { IDBLogger } from './stuff/IDBLogger';
import type { IPersistedLog } from './stuff/IPersistedLog';
import { PersistedLogV2 } from './stuff/PersistedLogV2';

const dotConfigOutput = config();
if (dotConfigOutput.parsed) {
  const reduced = dotConfigOutput.parsed;
  for (const reducedKey in reduced) {
    const val = reduced[reducedKey];
    const redactedWords = ['password', 'pass', 'word', 'pwd'];
    const keyToCheck = reducedKey.toLowerCase();
    const containsRedactedWord = redactedWords.some(word => keyToCheck.includes(word));
    if (!containsRedactedWord) {
      console.debug(`${reducedKey}=${val}`);
    }
  }
}

export default PersistedLogV2;
export { PersistedLogV2, IDBLogger, IPersistedLog };
