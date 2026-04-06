const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Korisnik = require('./Korisnik');

const Nekretnina = sequelize.define('Nekretnina', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tip_nekretnine: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    naziv: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    kvadratura: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cijena: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    tip_grijanja: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lokacija: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    godina_izgradnje: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    datum_objave: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    opis: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'Nekretnina'
});

Nekretnina.belongsTo(Korisnik, { foreignKey: 'korisnikId', as: 'vlasnik' });
Korisnik.hasMany(Nekretnina, { foreignKey: 'korisnikId', as: 'nekretnine' });

module.exports = Nekretnina;
