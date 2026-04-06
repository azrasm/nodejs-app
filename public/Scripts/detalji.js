let sviUpitiDohvaceni=false;
let pageUpita=0;
let sviUpitiNaStranici=false;
window.onload =function() {
    console.log("detalji.js");
    let lokacijaLink = document.getElementById("lokacija-link");
    let indexc=0;

    // let idN=sessionStorage.getItem('idNekretnine') || 0;
    let ucitani_upiti=document.getElementsByClassName('osnovno');
    const osnovno = document.getElementById("osnovno");
    const detaljiKolona1 = document.getElementById("kolona1");
    const detaljiKolona2 = document.getElementById("kolona2");
    const detaljiOpis = document.getElementById("opis");
    const upitiRef = document.getElementById("samoUpiti");
    const formaUpitaDiv = document.getElementById('forma-upita');
    const tekstUpitaInput = document.getElementById('tekst-upita-input');
    const posaljiUpitBtn = document.getElementById('posalji-upit-btn');
    const upitStatusPoruka = document.getElementById('upit-status-poruka');
    const page=0;
    let idN = parseInt(sessionStorage.getItem('idNekretnine'), 10);
    if (isNaN(idN)) {
        idN = 1;
    }
    let upiti = document.getElementsByClassName('upit');
    function spojiOsnovno(divReferencaOsnovno, instanca){
        console.log("U spoji osnovno: "+instanca.innerHTML);
        divReferencaOsnovno.innerHTML = '';
        const slikaElement = document.createElement('img');
        slikaElement.src = `../resources/${instanca.id}.jpg`;
        slikaElement.alt = instanca.naziv;
        divReferencaOsnovno.appendChild(slikaElement);

        const nazivElement = document.createElement('p');
        nazivElement.innerHTML = `<strong>Naziv:</strong> ${instanca.naziv}`;
        divReferencaOsnovno.appendChild(nazivElement);

        const kvadraturaElement = document.createElement('p');
        kvadraturaElement.innerHTML = `<strong>Kvadratura:</strong> ${instanca.kvadratura} m²`;
        divReferencaOsnovno.appendChild(kvadraturaElement);

        const cijenaElement = document.createElement('p');
        cijenaElement.innerHTML = `<strong>Cijena:</strong> ${instanca.cijena.toLocaleString('bs-BA')} KM`;
        divReferencaOsnovno.appendChild(cijenaElement);

    }
    function spojiDetalje(divReferencaKolona1, divReferencaKolona2,divReferencaOpis,instanca){
        divReferencaKolona1.innerHTML = '';
        console.log("divReferencaKolona2.innerHTML: "+divReferencaKolona2.innerHTML);
        divReferencaKolona2.innerHTML = '';
        divReferencaOpis.innerHTML = '';

        const tipGrijanjaElement = document.createElement('p');
        tipGrijanjaElement.innerHTML = `<strong>Tip grijanja:</strong> ${instanca.tip_grijanja}`;
        divReferencaKolona1.appendChild(tipGrijanjaElement);

        const lokacijaElement = document.createElement('p');
        lokacijaElement.innerHTML = `<strong>Lokacija:</strong> <a href="#" id="lokacija-link">${instanca.lokacija}</a>`;
        divReferencaKolona1.appendChild(lokacijaElement);
        lokacijaLink = document.getElementById("lokacija-link");
        lokacijaLink.addEventListener("click", (e) => {

            e.preventDefault();
            const lokacija = lokacijaLink.textContent.trim();
            jeElementAzuriran = false;
            PoziviAjax.getTop5Nekretnina(lokacija, (err, nekretnine) => {
                if (err != null) {
                    window.alert(JSON.parse(err.responseText).greska)
                } else {
                    sessionStorage.setItem("lokacija", lokacija);
                    sessionStorage.setItem("top5Nekretnine", JSON.stringify(nekretnine)); // Sačuvaj nekretnine
                    sessionStorage.setItem("redirectSource", "detalji");
                    console.log('nekretnine redirect');
                    window.location.href = "http://localhost:3000/nekretnine.html";
                }

            });
        });

        const godinaIzgradnjeElement = document.createElement('p');
        godinaIzgradnjeElement.innerHTML = `<strong>Godina izgradnje:</strong> ${instanca.godina_izgradnje}`;
        divReferencaKolona2.appendChild(godinaIzgradnjeElement);

        const datumObjaveElement = document.createElement('p');
        datumObjaveElement.innerHTML = `<strong>Datum objave oglasa:</strong> ${instanca.datum_objave}`;
        divReferencaKolona2.appendChild(datumObjaveElement);

        const opisElement = document.createElement('p');
        opisElement.innerHTML = `<strong>Opis:</strong> ${instanca.opis}`;
        divReferencaOpis.appendChild(opisElement);
    }

    let redirectSource = sessionStorage.getItem("redirectSource");
    console.log("redirectSource "+redirectSource+", idN: "+idN);
    lokacijaLink=null;


    if (idN ) {
        console.log("nova nekretnina id:  "+idN);
        lokacijaLink='';
        PoziviAjax.getNekretnina(idN, (err, trenutnaNekretnina) => {
            if (err != null) {
                console.log("greska, idN je "+ idN);
                //window.alert(JSON.stringify(err));
            } else {
                console.log(osnovno);
                spojiOsnovno(osnovno, trenutnaNekretnina);
                spojiDetalje(detaljiKolona1, detaljiKolona2, detaljiOpis, trenutnaNekretnina);
                provjeriLoginIFormu();

            } //idN=0;
            redirectSource=null;

        });

    }else {
        jeElementAzuriran=true;
        lokacijaLink = document.getElementById("lokacija-link");
    }
    if(lokacijaLink) {
        lokacijaLink.addEventListener("click", (e) => {
            console.log("LOKACIJA KLIKNUTA");
            e.preventDefault();
            console.log('lokacija clicked');
            const lokacija = lokacijaLink.textContent.trim();
            jeElementAzuriran = false;
            PoziviAjax.getTop5Nekretnina(lokacija, (err, nekretnine) => {
                if (err != null) {
                    window.alert(JSON.parse(err.responseText).greska)
                } else {
                    sessionStorage.setItem("lokacija", lokacija);
                    sessionStorage.setItem("top5Nekretnine", JSON.stringify(nekretnine)); // Sačuvaj nekretnine
                    sessionStorage.setItem("redirectSource", "detalji");


                    console.log('nekretnine redirect');
                    window.location.href = "http://localhost:3000/nekretnine.html";
                }

            });
        });
    }

    // --- Funkcija za provjeru logina i prikaz forme ---
    function provjeriLoginIFormu() {
        PoziviAjax.getKorisnik((err, korisnik) => {
            if (err || !korisnik) {
                console.log("Korisnik nije logovan, forma za upit ostaje sakrivena.");
                if (formaUpitaDiv) formaUpitaDiv.style.display = 'none';
            } else {
                console.log(`Korisnik ${korisnik.username} je logovan, prikazujem formu za upit.`);
                if (formaUpitaDiv) formaUpitaDiv.style.display = 'block'; // Prikazi formu
                // Dodaj event listener za dugme tek NAKON što znamo da je korisnik logovan
                // Provjera da li je listener već dodan (opcionalno ali dobra praksa)
                if (posaljiUpitBtn && !posaljiUpitBtn.dataset.listenerAdded) {
                    posaljiUpitBtn.addEventListener('click', handlePosaljiUpit);
                    posaljiUpitBtn.dataset.listenerAdded = 'true'; // Označi da je dodan
                }
            }
        });
    }

    // --- Handler za slanje upita ---
    function handlePosaljiUpit() {
        const tekstUpita = tekstUpitaInput.value.trim();

        // Validacija unosa
        if (!tekstUpita) {
            upitStatusPoruka.textContent = "Greška: Tekst upita ne može biti prazan.";
            upitStatusPoruka.style.color = "red";
            return;
        }
        // Provjera da li imamo ID nekretnine (idN bi trebao biti dostupan u ovom scope-u)
        if (isNaN(idN)) {
            upitStatusPoruka.textContent = "Greška: ID nekretnine nije poznat.";
            upitStatusPoruka.style.color = "red";
            return;
        }

        // Onemogući dugme i prikaži poruku o slanju
        posaljiUpitBtn.disabled = true;
        upitStatusPoruka.textContent = "Slanje upita...";
        upitStatusPoruka.style.color = "orange";

        // === POZIV AJAX FUNKCIJE ===
        PoziviAjax.postUpit(idN, tekstUpita, (err, data) => {
            // Ponovo omogući dugme bez obzira na ishod
            posaljiUpitBtn.disabled = false;

            if (err) {
                console.error("Greška prilikom slanja upita:", err);
                // Pokušaj izvući poruku greške koju server šalje ({greska: "..."})
                let porukaGreske = `Greška (${err.status || 'nepoznat status'}): ${err.statusText || 'Nije moguće poslati upit.'}`;
                try {
                    // Server ruta vraća JSON {greska: "...."} pa je statusText taj JSON string
                    const errObj = JSON.parse(err.statusText);
                    if (errObj && errObj.greska) {
                        porukaGreske = `Greška: ${errObj.greska}`; // Prikazujemo samo serversku poruku
                    }
                } catch (e) { /* Ignore */ }

                upitStatusPoruka.textContent = porukaGreske;
                upitStatusPoruka.style.color = "red";
            } else {
                console.log("Upit uspješno poslan:", data);
                upitStatusPoruka.textContent = data.poruka || "Upit je uspješno poslan!"; // Koristi poruku sa servera
                upitStatusPoruka.style.color = "green";
                tekstUpitaInput.value = ""; // Očisti polje za unos
                console.log("Osvježavam listu upita nakon uspješnog slanja...");
            }
        });
        // ==========================
    }



    /*  const carousel = postapostaviviCarousel(upiti[trenutniIndeks], upiti, trenutniIndeks);

      if (carousel) {
          document.querySelector(".linkovi .prev").addEventListener("click", (e) => {
              console.log("Kliknuto na prev");
              console.log(document.querySelector(".upit .glavni"));
              e.preventDefault();
              carousel.fnLijevo();
          });

          document.querySelector(".linkovi .next").addEventListener("click", (e) => {
              console.log("Kliknuto na next");
              console.log(document.querySelector(".upit .glavni"));
              e.preventDefault();
              carousel.fnDesno();
          });
      }*/

}
