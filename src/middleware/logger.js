import winston from 'winston';
import { config } from '../config/config.dotenv.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filterInfo=winston.format((info)=>{
    if(info.level==="info"){
        return info
    }
})

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    }
};

export const logger = winston.createLogger(
    {
        levels: customLevels.levels,
        transports: [
            new winston.transports.File(
                {
                    level: "info",
                    filename: path.join(__dirname, "../logs/info.log"),
                    format: winston.format.combine(
                        filterInfo(),
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }
            ),
            new winston.transports.File(
                {
                    level: "error",
                    filename: path.join(__dirname, "../logs/errors.log"),
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }
            ),
        ]
    }
)


const developmentLogger = new winston.transports.Console(
    {
        level: "debug",
        format: winston.format.combine(
            winston.format.colorize({
                colors: { 
                    fatal: "red",
                    error: "red",
                    warning: "yellow",
                    info: "green",
                    http: "cyan",
                    debug: "blue"
                }
            }),
            winston.format.timestamp(),
            winston.format.simple()
        )        
        
    }
)

if (config.MODE === "development") {
    logger.add(developmentLogger)
}


export const loggerMiddleware = (req, res, next) => {
    req.logger = logger

    next()
}