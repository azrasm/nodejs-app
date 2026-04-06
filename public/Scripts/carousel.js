function postaviCarousel(glavniElement, sviElementi, indeks=0){
    if(glavniElement == null || sviElementi.length == 0 || indeks < 0 || indeks >= sviElementi.length){
        return null;
    }
    sviElementi[indeks].classList.add("glavni");
    function fnDesno(){
        sviElementi[indeks].classList.remove("glavni");
        let noviIndeks=indeks+1;
        if(!sviUpitiNaStranici && (indeks+2)===sviElementi.length-1){
            sviUpitiDohvaceni = true;
           // sviElementi[noviIndeks].classList.add("glavni");
            sviElementi[indeks].classList.remove("glavni");
        }
        else if(noviIndeks === sviElementi.length && (sviUpitiNaStranici ||(sviElementi.length)%3>=1)){
            noviIndeks=0;
            console.log("sviElementi.length)%3<: "+(sviElementi.length)%3);
            console.log("sviUpitiNaStranici: "+sviUpitiNaStranici);
            console.log("RESETUJ UNAPRIJED");
            sviElementi[indeks].classList.remove("glavni");
          //  sviElementi[0].classList.add("glavni");
        }else{
            console.log("dodjela next, "+indeks+"->"+noviIndeks);
            sviElementi[0].classList.remove("glavni");
          //  sviElementi[noviIndeks].classList.add("glavni");
        }

        indeks=noviIndeks;
        console.log("(fnDesno) Novi indeks: ", indeks);
    }
    function fnLijevo(){
        sviElementi[indeks].classList.remove("glavni");
        let noviIndeks=indeks-1;
        if(noviIndeks == -1){
            noviIndeks=sviElementi.length-1;
        } sviElementi[noviIndeks].classList.add("glavni");
        indeks=noviIndeks;
        console.log("(fnLijevo) Novi indeks: ", indeks);
    }
    return {
        fnLijevo,
        fnDesno,
    };

}


/*
function postaviCarousel(glavniElement, sviElementi, indeks = 0, ucitajJosUpitaCallback) {
    if (!glavniElement || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    // Postavi početni glavni element
    sviElementi[indeks].classList.add("glavni");

    let trenutniIndeks = indeks;

    function fnDesno() {
        if (sviElementi[trenutniIndeks]) {
            sviElementi[trenutniIndeks].classList.remove("glavni");
        }

        trenutniIndeks++;

        if (trenutniIndeks === sviElementi.length) {
            trenutniIndeks = 0; // Kružni carousel
        }

        if (sviElementi[trenutniIndeks]) {
            sviElementi[trenutniIndeks].classList.add("glavni");
        }

        console.log("(fnDesno) Novi indeks: ", trenutniIndeks);

        // Provjeri da li treba učitati još upita (ako ima callback funkcija)
        if (ucitajJosUpitaCallback && trenutniIndeks === sviElementi.length - 1) {
            ucitajJosUpitaCallback();
        }
    }

    function fnLijevo() {
        if (sviElementi[trenutniIndeks]) {
            sviElementi[trenutniIndeks].classList.remove("glavni");
        }

        trenutniIndeks--;

        if (trenutniIndeks === -1) {
            trenutniIndeks = sviElementi.length - 1; // Kružni carousel
        }

        if (sviElementi[trenutniIndeks]) {
            sviElementi[trenutniIndeks].classList.add("glavni");
        }

        console.log("(fnLijevo) Novi indeks: ", trenutniIndeks);
    }

    return {
        fnLijevo,
        fnDesno,
    };
}*/