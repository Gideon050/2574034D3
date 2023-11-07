fetch("http://34.38.72.236/Circles/Towns/500")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.table(data);
        alllng = data.lng;
        alllat = data.lat;
        allTown = data.Town;
        allPopulation = data.Population;
        allCounty = data.County;
    })
    .catch(function (err) {
        console.log(err);
    });
