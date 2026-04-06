document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".sviUpitiKorisnika");

    PoziviAjax.getMojiUpiti((error, upiti) => {
        container.innerHTML = "";

        if (error || !upiti || !upiti.length) {
            console.log(
                error.message
            );
            container.innerHTML = "";
            container.innerHTML = `<p>Budite slobodni da postavite upit za bilo koju od naših nekretnina!.</p>`
            return;
        }

        const nekretninaMap = new Map();
        const existingUpitiDivs = container.getElementsByClassName("upiti");

        Array.from(existingUpitiDivs).forEach(upitiDiv => {
            const idElement = upitiDiv.querySelector(".nekretninaUpit p strong");
            if (idElement) {
                const idText = idElement.textContent.trim();
                const idMatch = idText.match(/Id nekretnine:\s*(\d+)/);
                if (idMatch) {
                    const id = idMatch[1];
                    nekretninaMap.set(id, upitiDiv);
                }
            }
        });

        upiti.forEach(upit => {
            const { nekretninaId, tekst_upita } = upit;

            const idKey = nekretninaId.toString();

            if (nekretninaMap.has(idKey)) {
                const upitiDiv = nekretninaMap.get(idKey);
                const newUpitDiv = document.createElement("div");
                newUpitDiv.classList.add("upit");
                newUpitDiv.innerHTML = `<p>${tekst_upita}</p>`;
                upitiDiv.appendChild(newUpitDiv);
            } else {
                // Ne postoji, kreiraj novu strukturu
                const upitiDiv = document.createElement("div");
                upitiDiv.classList.add("upiti");

                const nekretninaUpitDiv = document.createElement("div");
                nekretninaUpitDiv.classList.add("nekretninaUpit");
                nekretninaUpitDiv.innerHTML = `<p><strong>Id nekretnine:</strong> ${nekretninaId}</p>`;
                nekretninaUpitDiv.addEventListener('click', function () {
                    sessionStorage.setItem('idNekretnine', nekretninaId);
                    console.log("nekretninaUpitDiv "+nekretninaId +" clicked");
                    window.location.href = "http://localhost:3000/detalji.html";
                });
                upitiDiv.appendChild(nekretninaUpitDiv);

                const upitDiv = document.createElement("div");
                upitDiv.classList.add("upit");
                upitDiv.innerHTML = `<p>${tekst_upita}</p>`;
                upitiDiv.appendChild(upitDiv);
                container.appendChild(upitiDiv);
                nekretninaMap.set(idKey, upitiDiv);
            }
        });
    });
});
