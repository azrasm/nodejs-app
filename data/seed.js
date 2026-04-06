const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require('../models');

const loadJSON = (filename) => {
    const filepath = path.join(__dirname, filename);
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
};

const seedDatabase = async () => {
    const transaction = await sequelize.transaction();
    try {
        await sequelize.sync({ alter: true, transaction });

        const korisnici = loadJSON('korisnici.json');
        const nekretnine = loadJSON('nekretnine.json');
        const zahtjevi = loadJSON('zahtjevi.json');
        const ponude = loadJSON('ponude.json');

        for (const korisnikData of korisnici) {
            const hashedPassword = await bcrypt.hash(korisnikData.password, 10);
            await Korisnik.upsert({ ...korisnikData, password: hashedPassword }, { transaction });
        }
        console.log('Korisnici su sinkronizirani.');

        for (const nekretninaData of nekretnine) {
            const [nekretnina] = await Nekretnina.upsert(nekretninaData, { returning: true, transaction });
            if (nekretninaData.upiti) {
                for (const upitData of nekretninaData.upiti) {
                    await Upit.create({ ...upitData, korisnikId: upitData.korisnik_id, nekretninaId: nekretnina.id }, { transaction });
                }
            }
        }
        console.log('Nekretnine i upiti su sinkronizirani.');

        for (const zahtjevData of zahtjevi) {
            await Zahtjev.create(zahtjevData, { transaction });
        }
        console.log('Zahtjevi su sinkronizirani.');

        for (const ponudaData of ponude) {
            await Ponuda.create(ponudaData, { ...ponudaData.vezanaPonudaId && { vezanaPonudaId: ponudaData.vezanaPonudaId } }, { transaction });
        }
        console.log('Ponude su sinkronizirane.');

        await transaction.commit();
        console.log('Seedanje baze podataka je završeno uspješno.');
        process.exit(0);
    } catch (error) {
        await transaction.rollback();
        console.error('Greška prilikom seedanja baze podataka:', error);
        process.exit(1);
    }
};

seedDatabase();