let StatistikaNekretnina = function () {
    let nekretnine=SpisakNekretnina();
let init=function (listaNekretnina, listaKorisnika){
    nekretnine.init(listaNekretnina, listaKorisnika);
}
let prosjecnaKvadratura=function(kriterij){
    let nekretnineFilter=nekretnine.filtrirajNekretnine(kriterij);
    let ukupnaKvadratura = 0;
    for (let i = 0; i < nekretnineFilter.length; i++) {
        ukupnaKvadratura += nekretnine[i].kvadratura; 
    } 
    console.log(ukupnaKvadratura / nekretnine.length);
}

let outlier=function(kriterij,nazivSvojstva){
    let filtriraneNekretnine=nekretnine.filtrirajNekretnine(kriterij);
    let srednjaVrijednost = 0;
    for (let i = 0; i < filtriraneNekretnine.length; i++) {
        srednjaVrijednost += filtriraneNekretnine[i][nazivSvojstva];
    }
    srednjaVrijednost /= filtriraneNekretnine.length;

    let najveciOutlier = filtriraneNekretnine[0];
    let maxOdstupanje = Math.abs(filtriraneNekretnine[0][nazivSvojstva] - srednjaVrijednost);

    for (let i = 1; i < filtriraneNekretnine.length; i++) {
        let odstupanje = Math.abs(filtriraneNekretnine[i][nazivSvojstva] - srednjaVrijednost);
        if (odstupanje > maxOdstupanje) {
            maxOdstupanje = odstupanje;
            najveciOutlier = filtriraneNekretnine[i];
        }
    }

    return najveciOutlier;
}
let mojeNekretnine = function (korisnik) {
    let kriterij = { upitKorisnika: korisnik };
    let nekretnineSaUpitima = nekretnine.filtrirajNekretnine(kriterij);

    return nekretnineSaUpitima.sort((a, b) => {
        let upitiA = a.upiti.filter(upit => upit.korisnik === korisnik).length;
        let upitiB = b.upiti.filter(upit => upit.korisnik === korisnik).length;
        return upitiB - upitiA;
    });
}
let histogramCijena = function (periodi, rasponiCijena) {
    let rezultat = [];

    periodi.forEach((period, indeksPerioda) => {
        let kriterij = { periodObjave: { od: null, do: null } };
        kriterij.periodObjave.od = period.od;
        kriterij.periodObjave.do = period.do;

        let nekretnineUPeriodu = nekretnine.filtrirajNekretnine(kriterij);

        rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
            let kriterij = { rasponCijene: { od: null, do: null } };
            kriterij.rasponCijene.od = raspon.od;
            kriterij.rasponCijene.do = raspon.do;

            let nekretnineUPerioduPoCijeni = nekretnineUPeriodu.filter(nekretnina => {
                if (
                    nekretnina.cijena <= kriterij.rasponCijene.od ||
                    nekretnina.cijena >= kriterij.rasponCijene.do
                ) {
                    console.log("poredjenjeCijena");
                    return false;
                }
                return true;
            });

            rezultat.push({
                indeksPerioda: indeksPerioda,
                indeksRasponaCijena: indeksRasponaCijena,
                brojNekretnina: nekretnineUPerioduPoCijeni.length
            });
        });
    });

    return rezultat;
};

return {
    init: init,
    prosjecnaKvadratura: prosjecnaKvadratura,
    outlier: outlier,
    mojeNekretnine: mojeNekretnine,
    histogramCijena: histogramCijena
}
};