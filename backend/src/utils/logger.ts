interface LogMeta {
  [key: string]: any;
}

const logger = {
  info: (message: string, meta: LogMeta = {}) => {
    if (Object.keys(meta).length > 0) {
      console.log(`[INFO] ${message}`, meta);
    } else {
      console.log(`[INFO] ${message}`);
    }
  },
  
  error: (message: string, error: any = {}) => {
    if (error && Object.keys(error).length > 0) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  
  warn: (message: string, meta: LogMeta = {}) => {
    if (Object.keys(meta).length > 0) {
      console.warn(`[WARN] ${message}`, meta);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  
  debug: (message: string, meta: LogMeta = {}) => {
    if (Object.keys(meta).length > 0) {
      console.debug(`[DEBUG] ${message}`, meta);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  }
};

export default logger; 