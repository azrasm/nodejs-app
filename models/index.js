const sequelize = require('../config/database');
const Korisnik = require('./Korisnik');
const Nekretnina = require('./Nekretnina');
const Upit = require('./Upit');
const Zahtjev = require('./Zahtjev');
const Ponuda = require('./Ponuda');

const syncModels = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sinhronizacija svih modela
        await sequelize.sync({ alter: true }); // Koristite { force: true } samo tokom razvoja
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    Korisnik,
    Nekretnina,
    Upit,
    Zahtjev,
    Ponuda,
    syncModels
};
