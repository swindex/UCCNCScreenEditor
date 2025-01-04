const express = require('express');
const knex = require('./knex_');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const adminAuth = require('./middleware/adminAuth');
const cors = require('cors');
const version = require('./version');

//console.log(`Start API in ${process.env.NODE_ENV} mode`)

if (process.env.NODE_ENV=="test"){
    require('dotenv').config({path:__dirname+"/.env.test"});
    if (!process.env.JEST)
        (async function cleanDatabase(){
            await knex.migrate.latest();
            await knex.seed.run();
        })().then(()=>console.log("Test Database Loaded"))
}else
    require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/healthcheck", async (req, res) => {
    let database = "FAIL"
    let error = null;
    try {
        if (await knex('roles'))
            database = "OK";
    } catch (err) {
        error = err.message
    }
    res.status(error ? 500 : 200).json({
        "api": "OK",
        "database": database,
        "error": error,
        "version": version.version
    })
});
app.use('/api', userRoutes);
app.use('/admin', adminAuth, adminRoutes);

process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    await knex.destroy();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server }