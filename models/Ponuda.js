const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Korisnik = require('./Korisnik');
const Nekretnina = require('./Nekretnina');

const Ponuda = sequelize.define('Ponuda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cijenaPonude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    datumPonude: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    odbijenaPonuda: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'Ponuda'
});

Ponuda.belongsTo(Korisnik, { foreignKey: 'korisnikId', as: 'korisnik' });
Ponuda.belongsTo(Nekretnina, { foreignKey: 'nekretninaId', as: 'nekretnina' });
Nekretnina.hasMany(Ponuda, { foreignKey: 'nekretninaId', as: 'ponude' });
Korisnik.hasMany(Ponuda, { foreignKey: 'korisnikId', as: 'ponude' });

Ponuda.hasMany(Ponuda, { foreignKey: 'vezanaPonudaId', as: 'vezanePonude' });
Ponuda.belongsTo(Ponuda, { foreignKey: 'vezanaPonudaId', as: 'vezanaPonuda' });

module.exports = Ponuda;
