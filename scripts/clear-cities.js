const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Database connected. Deleting from cities and city_monthly_data...");
        await AppDataSource.query("DELETE FROM city_monthly_data");
        await AppDataSource.query("DELETE FROM cities");
        console.log("Deleted successfully.");
        await AppDataSource.destroy();
    })
    .catch((error) => console.log(error));
