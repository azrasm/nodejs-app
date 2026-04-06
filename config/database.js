const { Sequelize } = require('sequelize');
const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'DBWT24';
const dbUser = process.env.DB_USER || process.env.MYSQL_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'root';
const dbHost = process.env.DB_HOST || process.env.MYSQL_DB || 'localhost';

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        port: Number(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, min: 0, idle: 10000 },
    }
);

module.exports = sequelize;
