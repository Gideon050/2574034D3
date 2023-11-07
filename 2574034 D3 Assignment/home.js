// Define the dimensions of your map
    const width = 850;
    const height = 650;

    // Create an SVG container for the map
    const svg = d3.select("#map-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a function to handle zoom events
    function zoomed() {
    }

    // Create a zoom behavior for the SVG
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    // Apply the zoom behavior to the SVG
    svg.call(zoom);

    // Initialize the slider and load initial data
    const slider = document.getElementById("towns-slider");
    const sliderValue = document.getElementById("slider-value");

    // Create a group for the map elements that will be scaled with zoom
    const mapGroup = svg.append("g");

    // Load the UK GeoJSON data
    d3.json("UK-No-NI-Postcodes.geojson").then(function(ukData) {
        // Create a projection to convert geographical coordinates to screen coordinates
        const projection = d3.geoMercator().fitSize([width, height], ukData);

        // Create a path generator using the projection
        const path = d3.geoPath().projection(projection);

        // Append the UK map to the SVG
        svg.selectAll("path")
            .data(ukData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#eedfcc")
            .style("fill", "#f0f8ff");

        // Initialize the data variable to store the JSON feed data
        let townsData = [];

        // Function to load JSON data for towns
        function loadTownsData() {
            d3.json("http://34.38.72.236/Circles/Towns/50").then(function(data) {
                console.log(data);
                townsData = data;
                updateCircles();
            });
        }

        // Function to update the circles based on the data
        function updateCircles() {
            // Remove existing circles
            svg.selectAll("circle").remove();

            // Bind town data to circles
            svg.selectAll("circle")
                .data(townsData)
                .enter()
                .append("circle")
                .attr("cx", d => projection([d.lng, d.lat])[0])
                .attr("cy", d => projection([d.lng, d.lat])[1])
                .attr("r", 3) // Radius of the circles
                .style("fill", "#ff91af")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);
        }

        // Handle zoom events
        function zoomed(event) {
            mapGroup.attr("transform", event.transform);
            updateCircles();
        }

        // Handle mouseover event for circles
        function handleMouseOver(event, d) {
            // Display information about the town
            const townInfo = `Town: ${d.Town}<br>County: ${d.County}<br>Population: ${d.Population}`;
            document.getElementById("town-info").innerHTML = townInfo;
        }

        // Handle mouseout event for circles
        function handleMouseOut() {
            // Clear the displayed information
            document.getElementById("town-info").innerHTML = "";
        }

        // Initial data loading
        loadTownsData();

        slider.oninput = function() {
            const numTowns = this.value;
            sliderValue.innerText = numTowns;
            loadTownsData(numTowns);
        };
        // Call the loadTownsData function to load initial data with the default slider value
        loadTownsData(slider.value);


        // Add a button to refresh the JSON feed
        d3.select("#refresh-button")
            .on("click", function() {
                loadTownsData();
            });
    });
    
    // Gideon Samuel 2574034@dundee.ac.uk MSc Data Science & Engineering