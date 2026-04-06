const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcryptjs');
const { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require('./models');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));
app.use(express.json());
const authenticateUser = async (req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ greska: 'Neautorizovan pristup' });
};
const isAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next();
  }
  res.status(403).json({ greska: 'Pristup dozvoljen samo administratorima' });
};
///////////
sequelize.sync();
/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/odjava.html', file: 'odjava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/vijesti.html', file: 'vijesti.html' }
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */
app.get('/', (req, res) => {
  res.redirect('/nekretnine.html');
});
// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}
async function logLoginAttempt(username, status) {
  const logMessage = `[${new Date().toISOString()}] - username: "${username}" - status: "${status}"\n`;
  const logPath = path.join(__dirname, 'prijave.txt');
  try {
    await fs.appendFile(logPath, logMessage, 'utf-8');
    console.log('evidentirana prijava');
  } catch (error) {
    console.error('desila se greska prilikom prijave');
  }
}


//const loginAttempts = {};
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ where: { username } });

    if (korisnik && await bcrypt.compare(password, korisnik.password)) {
      req.session.user = korisnik.get({ plain: true }); // Pohrani podatke korisnika u sesiju
      return res.json({ poruka: 'Uspješna prijava' });
    } else {
      return res.status(401).json({ greska: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Greška prilikom prijave:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Greška prilikom odjave:', err);
      return res.status(500).json({ greska: 'Internal Server Error' });
    }
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
// GET /korisnik (za dohvaćanje trenutno ulogovanog korisnika s više detalja)
app.get('/korisnik', authenticateUser, async (req, res) => {
  try {
    const korisnik = await Korisnik.findByPk(req.user.id, {
      attributes: ['id', 'ime', 'prezime', 'username'], // Izaberi koje atribute želiš vratiti (bez passworda)
    });
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen u bazi.' });
    }
    res.json(korisnik);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja korisnika:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
/*
Allows logged user to make a request for a property
*/
app.get('/upiti/moji', authenticateUser, async (req, res) => {
  try {
    if (req.user && req.user.admin === true) {
      console.log(req.user);
      // administrator ima uvid u sve upite
      const sviUpiti = await Upit.findAll({
        include: [{ model: Nekretnina, as: 'nekretnina' }, { model: Korisnik, as: 'korisnik' }],
      });
      res.json(sviUpiti);
    } else {
      console.log(req.user);
      // korisnik vidi samo svoje upite
      const mojiUpiti = await Upit.findAll({
        where: { korisnikId: req.user.id },
        include: [{ model: Nekretnina, as: 'nekretnina' }],
      });
      res.json(mojiUpiti);
    }
  } catch (error) {
    console.error('Greška prilikom dohvaćanja mojih upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// POST /upit (omogućava ulogovanom korisniku da pošalje upit za nekretninu)
app.post('/upit', authenticateUser, async (req, res) => {

  const { nekretnina_id, tekst_upita } = req.body;
  const korisnikId = req.user.id;
  console.log("authenticateUser: "+authenticateUser);

  try {
    const nekretnina = await Nekretnina.findByPk(nekretnina_id);
    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji.` });
    }

    // Broj postojećih upita ovog korisnika za ovu nekretninu
    const brojUpita = await Upit.count({
      where: {
        korisnikId: korisnikId,
        nekretninaId: nekretnina_id,
      },
    });

    const MAX_BROJ_UPITA = 3;

    if (brojUpita >= MAX_BROJ_UPITA) {
      return res.status(429).json({ greska: `Dosegli ste maksimalni broj (${MAX_BROJ_UPITA}) upita za ovu nekretninu.` });
    }

    const noviUpit = await Upit.create({
      tekst_upita,
      korisnikId: korisnikId,
      nekretninaId: nekretnina_id,
    });

    res.status(201).json({ poruka: 'Upit je uspješno dodan.', upit: noviUpit });
  } catch (error) {
    console.error('Greška prilikom kreiranja upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
/*
Updates any user field
*/
app.put('/korisnik', authenticateUser, async (req, res) => {
  const { ime, prezime, username, password } = req.body;

  try {
    const korisnik = await Korisnik.findByPk(req.user.id);
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen.' });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username && username !== korisnik.username) {
      const postojiDrugiKorisnik = await Korisnik.findOne({ where: { username } });
      if (postojiDrugiKorisnik) {
        return res.status(400).json({ greska: 'Korisničko ime već postoji.' });
      }
      korisnik.username = username;
    }
    if (password) {
      korisnik.password = await bcrypt.hash(password, 10);
    }

    await korisnik.save();
    res.json({ poruka: 'Podaci su uspješno ažurirani.' });
  } catch (error) {
    console.error('Greška prilikom ažuriranja korisnika:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.json(nekretnine);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  try {
    const nekretnineData = await readJsonFile('nekretnine');
    const nekretnina = nekretnineData.find(n => String(n.id) === req.params.id);
    if (!nekretnina) {
      console.log(`Nekretnina sa ID-jem ${req.params.id} nije pronađena.`);
      return res.status(404).json({ greska: `Nekretnina sa ID-jem ${req.params.id} nije pronađena.` });
    }
    nekretnina.upiti = nekretnina.upiti.filter((_, index) => index >= nekretnina.upiti.length - 3);
    return res.json(nekretnina);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page || '0', 10);
  const limit = 3;
  const offset = page * limit;

  if (isNaN(page) || page < 0) {
    return res.status(400).json({ greska: 'Neispravan parametar stranice.' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa ID-jem ${id} nije pronađena.` });
    }

    const { rows: upiti, count } = await Upit.findAndCountAll({
      where: { nekretninaId: id },
      order: [['nekretninaId', 'ASC']],
      limit,
      offset,
    });

    res.json({ upiti, total: count, currentPage: page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Greška prilikom dohvaćanja upita za nekretninu:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
  const { lokacija } = req.query;
  try {
    const whereClause = lokacija ? { lokacija } : {};
    const nekretnine = await Nekretnina.findAll({
      where: whereClause,
      order: [['datum_objave', 'DESC']],
      limit: 5,
    });
    res.json(nekretnine.reverse());
  } catch (error) {
    console.error('Greška prilikom dohvaćanja top 5 nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id/interesovanja', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const ulogovaniKorisnik = req.user;

  try {
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res.status(404).json({ message: 'Nekretnina nije pronađena.' });
    }

    const [upiti, zahtjevi, ponude] = await Promise.all([
      Upit.findAll({ where: { nekretninaId: id }, include: [{ model: Korisnik, as: 'korisnik' }] }),
      Zahtjev.findAll({ where: { nekretninaId: id }, include: [{ model: Korisnik, as: 'korisnik' }] }),
      Ponuda.findAll({ where: { nekretninaId: id }, include: [{ model: Korisnik, as: 'korisnik' }, { model: Ponuda, as: 'vezanaPonuda' }] }),
    ]);

    const formatirajPonude = (ponude) => {
      return ponude.map(ponuda => {
        const plainPonuda = ponuda.get({ plain: true });
        if (ulogovaniKorisnik && ulogovaniKorisnik.admin) {
          return plainPonuda;
        } else if (ulogovaniKorisnik && (ulogovaniKorisnik.id === plainPonuda.korisnikId || (plainPonuda.vezanaPonuda && plainPonuda.vezanaPonuda.korisnikId === ulogovaniKorisnik.id))) {
          return plainPonuda;
        } else {
          const { cijenaPonude, ...ponudaBezCijene } = plainPonuda;
          return ponudaBezCijene;
        }
      });
    };

    res.json([...upiti, ...zahtjevi, ...formatirajPonude(ponude)]);

  } catch (error) {
    console.error('Greška prilikom dohvaćanja interesovanja:', error);
    res.status(500).json({ message: 'Došlo je do greške prilikom dohvaćanja interesovanja.' });
  }
});

app.get('/korisnici', authenticateUser, isAdmin, async (req, res) => {
  try {
    const korisnici = await Korisnik.findAll();
    res.json(korisnici);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja svih korisnika:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      console.log("nekretninaData: "+nekretninaData);
      console.log("nekretninaData.klikovi: "+nekretninaData.klikovi);
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports.authenticateUser = authenticateUser;
