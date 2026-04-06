const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Korisnik = require('./Korisnik');
const Nekretnina = require('./Nekretnina');

const Zahtjev = sequelize.define('Zahtjev', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    trazeniDatum: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    odobren: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'Zahtjev'
});

// Definisanje veza
Zahtjev.belongsTo(Korisnik, { foreignKey: 'korisnikId', as: 'korisnik' });
Zahtjev.belongsTo(Nekretnina, { foreignKey: 'nekretninaId', as: 'nekretnina' });
Nekretnina.hasMany(Zahtjev, { foreignKey: 'nekretninaId', as: 'zahtjevi' });
Korisnik.hasMany(Zahtjev, { foreignKey: 'korisnikId', as: 'zahtjevi' });

module.exports = Zahtjev;
