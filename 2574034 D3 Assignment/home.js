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

    // Add a variable to store the selected town data
    let selectedTown = null;

    // Function to load JSON data for towns
    function loadTownsData(numTowns) {
        const apiUrl = `http://34.38.72.236/Circles/Towns/${numTowns}`;
        console.log("API URL:", apiUrl);
        d3.json(apiUrl).then(function(data) {
            console.log(data);
            townsData = data;
            updateCircles();
        });
        
    }

    // Function to update the circles based on the data
    function updateCircles() {
        console.log("Towns Data:", townsData);
        // Remove existing circles
        svg.selectAll("circle").remove();
        svg.selectAll("text").remove();


        // Bind town data to circles
        svg.selectAll("circle")
            .data(townsData)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.lng, d.lat])[0])
            .attr("cy", d => projection([d.lng, d.lat])[1])
            .attr("r", 4) // Radius of the circles
            .style("fill", "#ff91af")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on('click', function (event, d) {
                // Save the selected town data
                selectedTown = d;
                openModal();
                // Handle click event to highlight the selected town
                svg.selectAll('circle')
                  .attr('fill', '#ff91af') // Reset color for all circles
                  .attr('r', 4); // Reset radius for all circles
          
                d3.select(this)
                  .attr('fill', 'red') // Change color for the selected circle
                  .attr('r', 6); // Increase radius for the selected circle
              });
            
        // Function to open the modal
        function openModal() {
            const modal = document.getElementById("townModal");
            const modalContent = document.getElementById("modal-content");

            // Display detailed information in the modal
            modalContent.innerHTML = `
                <h2>${selectedTown.Town}</h2>
                <p><strong>County:</strong> ${selectedTown.County}</p>
                <p><strong>Population:</strong> ${selectedTown.Population}</p>
            `;

            modal.style.display = "block";
        }

        // Function to close the modal
        function closeModal() {
            const modal = document.getElementById("townModal");
            modal.style.display = "none";
        }

        // Event binding for the close button
        document.getElementById("modalCloseBtn").addEventListener("click", closeModal);

        // Add text elements with town names
        svg.selectAll("text")
        .data(townsData)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lng, d.lat])[0])
        .attr("y", d => projection([d.lng, d.lat])[1])
        .text(d => d.Town)
        .attr("color", "black")
        .attr("dy", -10) // Adjust the vertical position of the text
        .attr("text-anchor", "middle") // Center the text horizontally
        .attr("font-size", "10px") // Set the font size
        .style("fill", "#000000"); // Set the text color to black

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
            loadTownsData(slider.value);
        });
});
    // Gideon Samuel 2574034@dundee.ac.uk MSc Data Science & Engineering