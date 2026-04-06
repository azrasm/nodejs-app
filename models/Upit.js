const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Korisnik = require('./Korisnik');
const Nekretnina = require('./Nekretnina');

const Upit = sequelize.define('Upit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tekst_upita: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'Upit'
});

Upit.belongsTo(Korisnik, { foreignKey: 'korisnikId', as: 'korisnik' });
Upit.belongsTo(Nekretnina, { foreignKey: 'nekretninaId', as: 'nekretnina' });
Nekretnina.hasMany(Upit, { foreignKey: 'nekretninaId', as: 'upiti' });
Korisnik.hasMany(Upit, { foreignKey: 'korisnikId', as: 'upiti' });

module.exports = Upit;
