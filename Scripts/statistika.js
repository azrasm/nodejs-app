document.addEventListener("DOMContentLoaded", () => {
    const drawButton = document.getElementById("drawButton");

    drawButton.addEventListener("click", () => {
        const periodOdInput = document.getElementById("periodOd").value.trim();
        const periodDoInput = document.getElementById("periodDo").value.trim();
        const cijenaOdInput = document.getElementById("cijenaOd").value.trim();
        const cijenaDoInput = document.getElementById("cijenaDo").value.trim();

        const periodOd = parseInt(periodOdInput, 10);
        const periodDo = parseInt(periodDoInput, 10);
        const cijenaOd = parseInt(cijenaOdInput, 10);
        const cijenaDo = parseInt(cijenaDoInput, 10);

        if (
            isNaN(periodOd) || isNaN(periodDo) ||
            isNaN(cijenaOd) || isNaN(cijenaDo) ||
            periodOd > periodDo || cijenaOd > cijenaDo
        ) {
            alert("Unesite validne vrijednosti za period i cijene.");
            return;
        }else if(periodDo>periodOd){
            alert("Unesite validan period.");
            return;
        }
        else if(cijenaOd<0 || cijenaDo<0 || cijenaOd>cijenaOd){
            alert("Unesite validan period.");
            return;

        }

        const periodi = [{ od: periodOd, do: periodDo }];
        const rasponiCijena = [{ od: cijenaOd, do: cijenaDo }];

        const statistika = StatistikaNekretnina(); 
        statistika.init(listaNekretnina, listaKorisnika);

        const histogramData = statistika.histogramCijena(periodi, rasponiCijena);

        iscrtajHistogram(histogramData, periodi, rasponiCijena);
    });
});

function iscrtajHistogram(data, periodi, rasponiCijena) {
    const canvas = document.getElementById("chartCanvas");
    const ctx = canvas.getContext("2d");

    const labels = rasponiCijena.map(raspon => `${raspon.od} - ${raspon.do}`);
    const datasets = periodi.map((period, index) => {
        const brojNekretnina = rasponiCijena.map((_, idx) => {
            const entry = data.find(
                item => item.indeksPerioda === index && item.indeksRasponaCijena === idx
            );
            return entry ? entry.brojNekretnina : 0;
        });

        return {
            label: `Period: ${period.od} - ${period.do}`,
            data: brojNekretnina,
            backgroundColor: `rgba(${index * 50}, 100, 200, 0.6)`,
        };
    });

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });
}
