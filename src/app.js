import express from 'express';
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import passport from 'passport';
import { initializePassport } from './config/config.passport.js';
import { engine } from 'express-handlebars';
import { registerHandlebarsHelpers } from './utils/handlebarsHelpers.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocket } from './utils/socketioServer.js';
import { config } from './config/config.dotenv.js';
import { errorHandler } from './middleware/errorHandler.js';
import { loggerMiddleware, logger } from './middleware/logger.js';
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title: "Javi Ecommerce",
            version: "1.0.0",
            description: "Ecommerce API documentation"
        }
    },
    apis: [path.join(__dirname, "./docs/*.yaml")]
}

const specs=swaggerJsdoc(options)



const app = express();
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));

initializePassport()
app.use(passport.initialize())
app.use(loggerMiddleware)

const port = config.PORT;
import productsRouter from './routes/products-router.js';
import cartRouter from './routes/carts-router.js';
import homeRouter from './routes/home-router.js';
import chatRouter from './routes/chat-router.js';
import realTimeProductRouter from './routes/realTimeProduct-router.js';
import productsviewRouter from './routes/products-view-router.js';
import specificCart from './routes/specificCart-router.js';
import sessionRouter from './routes/session-router.js';
import productsMocks from './routes/productsMocks-router.js';
import loggerTest from './routes/loggerTest-router.js';
import usersRouter from './routes/users-router.js';



app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));
registerHandlebarsHelpers();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/users', usersRouter);
app.use('/', homeRouter);
app.use('/chat', chatRouter);
app.use('/realtimeproducts', realTimeProductRouter);
app.use('/products', productsviewRouter);
app.use('/carts', specificCart);
app.use('/mockingproducts', productsMocks);
app.use('/loggertest', loggerTest);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});

const server = app.listen(port, () => {
    logger.info(`Server turned on and listening on the port ${port}`);
});

try {
    await mongoose.connect(config.MONGO_URL, { dbName: config.DBNAME })
    logger.info('DataBase Online!')
} catch (error) {
    logger.fatal(error.message)
}

initializeSocket(server, app, logger);