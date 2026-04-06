window.onload =function() {
    const listaNekretnina = []

    const listaKorisnika = []
    const divStan = document.getElementById("stan");
    const divKuca = document.getElementById("kuca");
    const divPp = document.getElementById("pp");

    function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
        console.log(divReferenca.innerHTML);
        console.log(instancaModula);
        const filtriraneNekretnine = instancaModula.filtrirajNekretnine({tip_nekretnine: tip_nekretnine});
         divReferenca.innerHTML = '';
        if (filtriraneNekretnine.length === 0) {
            divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
        } else {
            filtriraneNekretnine.forEach(nekretnina => {
                const nekretninaElement = document.createElement('div');
                if (tip_nekretnine === "Stan") {
                    nekretninaElement.classList.add('nekretnina', 'stan');
                    nekretninaElement.id = `${nekretnina.id}`;
                } else if (tip_nekretnine === "Kuća") {
                    nekretninaElement.classList.add('nekretnina', 'kuca');
                    nekretninaElement.id = `${nekretnina.id}`;
                } else {
                    console.log("postoji " + filtriraneNekretnine.length + "pp-ora")
                    nekretninaElement.classList.add('nekretnina', 'pp');
                    nekretninaElement.id = `${nekretnina.id}`;
                }
                const pretrageDiv = document.createElement('div');
                pretrageDiv.id = `pretrage-${nekretnina.id}`;
                pretrageDiv.textContent = `pretrage: ${nekretnina.pretrage || 0}`;
                nekretninaElement.appendChild(pretrageDiv);

                const klikoviDiv = document.createElement('div');
                klikoviDiv.id = `klikovi-${nekretnina.id}`;
                klikoviDiv.textContent = `klikovi: ${nekretnina.klikovi || 0}`;
                nekretninaElement.appendChild(klikoviDiv);

                const slikaElement = document.createElement('img');
                slikaElement.classList.add('slika-nekretnine');
                slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
                slikaElement.alt = nekretnina.naziv;
                nekretninaElement.appendChild(slikaElement);

                const detaljiElement = document.createElement('div');
                detaljiElement.classList.add('detalji-nekretnine');
                detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            `;
                nekretninaElement.appendChild(detaljiElement);

                const cijenaElement = document.createElement('div');
                cijenaElement.classList.add('cijena-nekretnine');
                cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
                nekretninaElement.appendChild(cijenaElement);

                const detaljiDugme = document.createElement('a');
                detaljiDugme.classList.add('detalji-dugme');
                detaljiDugme.textContent = 'Detalji';
                detaljiDugme.addEventListener('click', function () {
                    const idNekretnine = nekretnina.id;
                    sessionStorage.setItem('idNekretnine', idNekretnine);
                    MarketingAjax.klikNekretnina(idNekretnine);
                    sessionStorage.setItem("redirectSource", "detalji");
                    window.location.href = "http://localhost:3000/detalji.html";
                });
                nekretninaElement.appendChild(detaljiDugme);
                divReferenca.appendChild(nekretninaElement);
            });
        }
    }


    let nekretnine = SpisakNekretnina();
    let redirectSource = sessionStorage.getItem("redirectSource");

    console.log("redirekcija sa redirectSource: " + redirectSource);
    if (redirectSource === "detalji" && sessionStorage.getItem("lokacija")!=null) {
        console.log("redirekcija sa detalji.html");
        const lokacija = sessionStorage.getItem("lokacija");
        const top5Nekretnina = JSON.parse(sessionStorage.getItem("top5Nekretnine"));

        nekretnine.init(top5Nekretnina, listaKorisnika);
        console.log("Top 5 nekretnine:", nekretnine);

        spojiNekretnine(divStan, nekretnine, "Stan");
        spojiNekretnine(divKuca, nekretnine, "Kuća");
        spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
        sessionStorage.removeItem("redirectSource");
        sessionStorage.removeItem("lokacija");
        sessionStorage.removeItem("top5Nekretnine");
        redirectSource=null;
    } else {
        console.log("sve nekretine vrati");

        PoziviAjax.getNekretnine((error, listaNekretnina) => {
            if (error) {
                console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
            } else {
                // Inicijalizacija modula sa dobavljenim podacima
                console.log("listaNekretnina:", listaNekretnina);
                nekretnine.init(listaNekretnina, listaKorisnika);
                console.log("nekretnine:", nekretnine);
                spojiNekretnine(divStan, nekretnine, "Stan");
                spojiNekretnine(divKuca, nekretnine, "Kuća");
                spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
            }
        });
    }


    function filtrirajNekretnine(filtriraneNekretnine) {
        const filtriraneNekretnineInstance = SpisakNekretnina();
        filtriraneNekretnineInstance.init(filtriraneNekretnine, listaKorisnika);

        spojiNekretnine(document.getElementById("stan"), filtriraneNekretnineInstance, "Stan");
        spojiNekretnine(divKuca, filtriraneNekretnineInstance, "Kuća");
        spojiNekretnine(divPp, filtriraneNekretnineInstance, "Poslovni prostor");
    }

    function filtrirajOnClick() {
        const kriterij = {
            min_cijena: parseFloat(document.getElementById('minCijena').value) || 0,
            max_cijena: parseFloat(document.getElementById('maxCijena').value) || Infinity,
            min_kvadratura: parseFloat(document.getElementById('minKvadratura').value) || 0,
            max_kvadratura: parseFloat(document.getElementById('maxKvadratura').value) || Infinity
        };

        const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);

        MarketingAjax.novoFiltriranje(
            filtriraneNekretnine.map(nekretnina => nekretnina.id)
        );

        filtrirajNekretnine(filtriraneNekretnine);
    }

    document.getElementById('dugmePretraga').addEventListener('click', filtrirajOnClick);

    setInterval(() => {
        //const ids = ['stan', 'kuca', 'pp'];
        //const elementi = ids.map(id => document.getElementById(id)).filter(el => el !== null);
        //console.log(elementi)

        // MarketingAjax.osvjeziPretrage(elementi);
        //MarketingAjax.osvjeziKlikove(elementi);
        // console.log(elementi)
        // Dohvati sadržaje iz elemenata po ID-ju


        MarketingAjax.osvjeziPretrage(document.getElementById('sveNekretnine'));
        MarketingAjax.osvjeziKlikove(document.getElementById('sveNekretnine'));
    }, 500);
}