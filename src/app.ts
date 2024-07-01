
import {LogLevelType, AppInterface, AppOptions} from "./types";
import Sqlite3Logger from "./Sqlite3Logger";

function createApp(options: AppOptions): AppInterface {
  let label: string = 'root';
  let logLevel: LogLevelType = 'info';
  const labelStack = [] as string[];
  const {debug, warn, log, error} = console;
  const sql = new Sqlite3Logger(options?.dbPath || "", true);

  return {
    restoreLabel() {
      label = labelStack.pop() || 'root';
    },
    replaceLabel(lbl:string) {
      labelStack.push(label);
      label = lbl;
    },


    setLogLevel(ll: LogLevelType){
      logLevel = ll;
    },
    clearLogLevel(){
      logLevel = 'info';
    },
    log(message: string){

      void sql.Log(logLevel, label, message).catch(console.error)


      switch(logLevel){
        case 'debug':
          debug(message);
          break;
        case 'warn':
          warn(message);
          break;
        case 'error':
          error(message);
          break;
        case 'info':
        default:
          log(message);
      }
    },
    qLog(ll: LogLevelType, message: string){
      const currentLogLevel = logLevel;
      this.setLogLevel(ll);
      this.log(message);
      this.setLogLevel(currentLogLevel);
    },
    qLabelLog(ll: LogLevelType, label: string, message: string){
      const currentLogLevel = logLevel;
      this.replaceLabel(label);
      this.setLogLevel(ll);
      this.log(message);
      this.setLogLevel(currentLogLevel);
      this.restoreLabel();
    }
  }
}

const logger = createApp({});
export default logger;