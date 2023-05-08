async function readDlogFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

async function readDlogFiles(files) {
    const promises = Array.from(files).map(readDlogFile);
    const results = await Promise.all(promises);
    return results;
}


function refreshData() {
    if (!window.combinedJson) {
        alert('Please select a folder first.');
        return;
    }

    // Update filter keys
    const keys = Array.from(
        window.combinedJson.reduce((acc, entry) => {
            Object.keys(entry).forEach(key => acc.add(key));
            return acc;
        }, new Set())
    ).sort();

    // Display first and last timecodes if "tc" exists in the dataset
    const timecodes = window.combinedJson.filter(entry => 'tc' in entry).map(entry => entry.tc);
    if (timecodes.length > 0) {
        document.getElementById('tcInfoLabel').innerText = `First TC: ${timecodes[0]} - Last TC: ${timecodes[timecodes.length - 1]}`;
    } else {
        document.getElementById('tcInfoLabel').innerText = 'No timecode data in dataset';
    }

    // Enable the "Export CSV" and "Export KML" buttons
    document.getElementById('exportCsvBtn').disabled = false;
    document.getElementById('exportKmlBtn').disabled = false;

    // Update filter keys checkbuttons
    updateFilterKeysCheckbuttons(keys);

    // Check if quick settings div already exists
    let quickSettingsDiv = document.getElementById('quickSettingsDiv');
    if (!quickSettingsDiv) {
        // Create a div for quick settings
        quickSettingsDiv = document.createElement('div');
        quickSettingsDiv.id = 'quickSettingsDiv';
        quickSettingsDiv.innerHTML = '<br><div><strong>Quick Settings</strong></div><br>';
        document.getElementById('filterKeys').before(quickSettingsDiv);

        // Add uncheck all button
        const uncheckAllButton = document.createElement('button');
        uncheckAllButton.innerText = 'Uncheck All';
        uncheckAllButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#filterKeys input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
        });
        quickSettingsDiv.appendChild(uncheckAllButton);

        // Add select all button
        const selectAllButton = document.createElement('button');
        selectAllButton.innerText = 'Select All';
        selectAllButton.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#filterKeys input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
        });
        quickSettingsDiv.appendChild(selectAllButton);

        // Add toggle buttons for each bunch of variables
        const toggleButtons = [
            { label: 'Acceleration', strings: ['xValue', 'yValue', 'zValue'] },
            { label: 'Gyroscope', strings: ['gxValue', 'gyValue', 'gzValue'] },
            { label: 'Magnetometer', strings: ['mxValue', 'myValue', 'mzValue'] },
            { label: 'Barometer', strings: ['barometerValue'] },
            { label: 'Light', strings: ['lightValue'] },
            { label: 'Temperature', strings: ['temperatureValue'] },
            { label: 'GPS', strings: ['altitudeValue','latitudeValue','longitudeValue','gpsTimeInMillis'] },
            { label: 'SystemTime', strings: ['systemTimeInMillis'] },
            { label: 'TC', strings: ['tc'] }
        ];

        toggleButtons.forEach(button => {
            const toggleButton = document.createElement('button');
            toggleButton.innerText = button.label;
            toggleButton.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('#filterKeys input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    const name = checkbox.name;
                    if (button.strings.includes(name)) {
                        checkbox.checked = !checkbox.checked;
                    }
                });
            });
            quickSettingsDiv.appendChild(toggleButton);
       });
        // Add a line break after the quick settings div
        quickSettingsDiv.insertAdjacentHTML('afterend', '<br>');

        document.getElementById('showOnMapBtn').disabled = false;
        document.getElementById('showGraphs').disabled = false;
    }

}

function updateFilterKeysCheckbuttons(keys) {
    const filterKeysContainer = document.getElementById('filterKeys');
    filterKeysContainer.innerHTML = '';

    keys.forEach(key => {
        const checkButton = document.createElement('div');
        checkButton.className = 'form-check form-check-inline';

        const checkbox = document.createElement('input');
        checkbox.className = 'form-check-input';
        checkbox.type = 'checkbox';
        checkbox.id = `filterKeyCheckbox-${key}`;
        checkbox.name = key;
        checkbox.checked = true;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `filterKeyCheckbox-${key}`;
        label.innerText = key;

        checkButton.appendChild(checkbox);
        checkButton.appendChild(label);
        filterKeysContainer.appendChild(checkButton);
    });
}

function handleFolderSelection(event) {
    const filesInput = event.target.files;
    const dlogFiles = Array.from(filesInput).filter(file => file.name.endsWith('.dlog') || file.name.endsWith('.dlog.gz'));

    if (dlogFiles.length === 0) {
        alert('No *.dlog or *.dlog.gz files found in the selected folder.');
        return;
    }

    // Sort files by name
    dlogFiles.sort((a, b) => a.name.localeCompare(b.name));

    // Update the UI with the first file's name and file count
    document.getElementById('fileInfoLabel').innerText = `First file: ${dlogFiles[0].name}, File count: ${dlogFiles.length}`;

    // Read the content of the dlog files
    Promise.all(dlogFiles.map(file => {
        if (file.name.endsWith('.dlog')) {
            return readDlogFile(file);
        } else if (file.name.endsWith('.dlog.gz')) {
            return unzipFile(file).then(decompressedData => readDlogFile(new File([decompressedData], file.name.replace('.gz', ''))));
        }
    })).then((dlogData) => {
        // Combine and parse the dlog data into JSON format
        const combinedJson = dlogData.flatMap(data => JSON.parse(data));

        // Store the combined JSON data
        window.combinedJson = combinedJson;

        // Enable the "Refresh Data" button
        document.getElementById('refreshDataBtn').disabled = false;
    });
}

function unzipFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const gzData = event.target.result;
            const inflatedData = pako.inflate(gzData, { to: 'string' });
            resolve(inflatedData);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}


function fromTimeString() {
    const hours = document.getElementById('fromTimeHh').value.padStart(2, '0');
    const minutes = document.getElementById('fromTimeMm').value.padStart(2, '0');
    const seconds = document.getElementById('fromTimeSs').value.padStart(2, '0');
    const frames = document.getElementById('fromTimeFf').value.padStart(2, '0');

    return `${hours}:${minutes}:${seconds}:${frames}`;
}

function toTimeString() {
    const hours = document.getElementById('toTimeHh').value.padStart(2, '0');
    const minutes = document.getElementById('toTimeMm').value.padStart(2, '0');
    const seconds = document.getElementById('toTimeSs').value.padStart(2, '0');
    const frames = document.getElementById('toTimeFf').value.padStart(2, '0');

    return `${hours}:${minutes}:${seconds}:${frames}`;
}

function exportCsv() {
    // Check if there is data to export
    if (!window.combinedJson) {
        alert('Please select a folder first.');
        return;
    }

    // Get the selected timecode range
    const fromTime = fromTimeString();
    const toTime = toTimeString();

    // Filter the data based on the selected timecode range
    const filteredData = filterData(window.combinedJson, fromTime, toTime);

    const filterKeysContainer = document.getElementById('filterKeys');
    const checkboxes = filterKeysContainer.querySelectorAll('input[type="checkbox"]');
    const checkedNames = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.name);

    // Prompt the user to select a file name and location to save the CSV file
    const csvFileName = prompt('Enter a name for the CSV file:');
    if (!csvFileName) {
        return;
    }

    const csvDownsample =  document.getElementById('csvDownsample').value;

    console.log("CSV Downsample: " + csvDownsample)
    // Create a CSV file in memory
    const csvContent = generateCsvContent(filteredData, checkedNames, csvDownsample);
    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);

    // Create a download link and click it to trigger the download
    const link = document.createElement('a');
    link.download = `${csvFileName}.csv`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateCsvContent(data, keysToInclude, downsample) {
    // Generate the CSV header row
    const headerRow = keysToInclude.map(key => `"${key}"`).join(',');

    // Generate the CSV data rows
    const dataRows = data.reduce((rows, entry, index) => {
        if (index % (downsample + 1) === 0) {
            const row = keysToInclude.map(key => {
                const value = entry[key] || '';
                return `"${value}"`;
            }).join(',');
            rows.push(row);
        }
        return rows;
    }, []).join('\n');

    return `${headerRow}\n${dataRows}`;
}

function showOnMap() {
    if (!window.combinedJson) {
        alert('Please select a folder first.');
        return;
    }

    // Get the selected timecode range
    const fromTime = fromTimeString();
    const toTime = toTimeString();

    // Filter the data based on the selected timecode range
    const filteredData = filterData(window.combinedJson, fromTime, toTime);

    const downsample =  document.getElementById('kmlDownsample').value;

    // Apply downsampling to filteredData
    const downsampledData = filteredData.filter((entry, index) => index % (downsample + 1) === 0);

    // const geojsonData = {
    //     type: 'FeatureCollection',
    //     features: downsampledData
    //         .filter(entry => entry.longitudeValue && entry.latitudeValue && !isNaN(entry.longitudeValue) && !isNaN(entry.latitudeValue))
    //         .map(entry => ({
    //             type: 'Feature',
    //             geometry: {
    //                 type: 'Point',
    //                 coordinates: [parseFloat(entry.longitudeValue), parseFloat(entry.latitudeValue)],
    //             },
    //             properties: entry,
    //         })),
    // };

    const geojsonData = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: downsampledData
                    .filter(entry => entry.longitudeValue && entry.latitudeValue && !isNaN(entry.longitudeValue) && !isNaN(entry.latitudeValue))
                    .map(entry => [parseFloat(entry.longitudeValue), parseFloat(entry.latitudeValue)]),
            },
            properties: {},
        }],
    };




    const kmlData = tokml(geojsonData, {
        name: 'name',
        description: 'description',
        simplestyle: true,
    });

    // You'll need to store kmlData in a global variable so you can access it later in the Leaflet API
    window.kmlData = kmlData;

    // Initialize the Leaflet map and display the KML data
    initLeafletMap();
}

// Initialize the Leaflet map and display the KML data
let map; // Move map variable outside of the function to reuse it
let kmlLayer; // Add a variable to store the existing KML layer

function initLeafletMap() {
    if (!map) {
        // Initialize the map if it doesn't exist
        map = L.map('map').setView([0, 0], 3);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
    } else {
        // Remove any existing KML layers before adding a new one
        if (kmlLayer) {
            map.removeLayer(kmlLayer);
        }
    }

    kmlLayer = omnivore.kml.parse(window.kmlData).addTo(map);

    // Center the map on the data
    const dataBounds = kmlLayer.getBounds();
    map.fitBounds(dataBounds);
}



function exportKml() {
    if (!window.combinedJson) {
        alert('Please select a folder first.');
        return;
    }

    // Get the selected timecode range
    const fromTime = fromTimeString();
    const toTime = toTimeString();

    // Filter the data based on the selected timecode range
    const filteredData = filterData(window.combinedJson, fromTime, toTime);

    const downsample =  document.getElementById('kmlDownsample').value;

    // Apply downsampling to filteredData
    const downsampledData = filteredData.filter((entry, index) => index % (downsample + 1) === 0);

    const geojsonData = {
        type: 'FeatureCollection',
        features: downsampledData.map(entry => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [entry.longitudeValue, entry.latitudeValue],
            },
            properties: entry,
        })),
    };

    const kmlData = tokml(geojsonData, {
        name: 'name',
        description: 'description',
        simplestyle: true,
    });

    const kmlBlob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
    const kmlUrl = URL.createObjectURL(kmlBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = kmlUrl;
    downloadLink.download = 'data.kml';
    downloadLink.click();
}

function convertTimeStringToInt(timeString) {
    const [hours, minutes, seconds, frames] = timeString.split(':').map(Number);
    const totalFrames = frames + seconds * 100 + minutes * 100 * 60 + hours * 100 * 60 * 60;
    return totalFrames;
}

function filterData(data, fromTime, toTime) {
    let fromTimeInt = convertTimeStringToInt(fromTime);
    let toTimeInt = convertTimeStringToInt(toTime);

    if (toTimeInt == 0){
        toTimeInt = convertTimeStringToInt("23:59:59:99")
    }

    let lastTC = 0;
    let tc = 0;

    const filteredData = data.filter(entry => {
        try{
            tc = convertTimeStringToInt(entry['tc']);
            lastTC = tc;
        }
        catch{
            tc = lastTC;
        }
        return (tc >= fromTimeInt && tc <= toTimeInt);
    });
    return filteredData;
}
function checkDownsample(csvDownsample) {
    if (csvDownsample < 30) {
        const message = 'It is not recommended to visualize un-downsampled data as it can crash the application.\n\n' +
            'Press "OK" to continue with the current downsample value.\n' +
            'Press "Cancel" and manually set the downsample value to 30 or higher to avoid potential issues.';
        return confirm(message);
    }
    return true;
}


function showGraphs() {
    if (!window.combinedJson) {
        alert('Please select a folder first.');
        return;
    }

    // Get the selected timecode range
    const fromTime = fromTimeString();
    const toTime = toTimeString();

    // Filter the data based on the selected timecode range
    const filteredData = filterData(window.combinedJson, fromTime, toTime);

    // Get the CSV downsample value
    const csvDownsample = parseInt(document.getElementById('csvDownsample').value);

    // Check the downsample value and confirm with the user if necessary
    const shouldContinue = checkDownsample(csvDownsample);
    if (!shouldContinue) {
        return;
    }

    // Apply downsampling to filteredData
    const downsampledData = filteredData.filter((_, index) => index % (csvDownsample + 1) === 0);

    // Remove the previous charts container if it exists
    const existingContainer = document.getElementById('charts-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Define the data groups
    const dataGroups = [
        {
            name: 'Acceleration',
            variables: ['xValue', 'yValue', 'zValue'],
            colors: ['#ff6384', '#36a2eb', '#cc65fe']
        },
        {
            name: 'Gyroscope',
            variables: ['gxValue', 'gyValue', 'gzValue'],
            colors: ['#4bc0c0', '#9966ff', '#ff9f40']
        },
        {
            name: 'Magnetometer',
            variables: ['mxValue', 'myValue', 'mzValue'],
            colors: ['#ffcd56', '#6c5ce7', '#2d3436']
        },
        {
            name: 'Barometer',
            variables: ['barometerValue'],
            colors: ['#e17055']
        },
        {
            name: 'Light',
            variables: ['lightValue'],
            colors: ['#2ecc71']
        },
        {
            name: 'GPS',
            variables: ['altitudeValue', 'latitudeValue', 'longitudeValue'],
            colors: ['#d63031', '#0984e3', '#b2bec3']
        },
    ];

    // Create a new container for the charts
    const chartsContainer = document.createElement('div');
    chartsContainer.id = 'charts-container';
    chartsContainer.style.display = 'flex';
    chartsContainer.style.flexWrap = 'wrap';
    chartsContainer.style.justifyContent = 'center';
    document.body.appendChild(chartsContainer);

    // Create a separate chart for each data group
    dataGroups.forEach(group => {
        // Create a container for the chart
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '50%';
        chartContainer.style.padding = '10px';
        chartsContainer.appendChild(chartContainer);

        // Create a canvas element for the chart
        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        // Create the line chart using Chart.js
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: downsampledData.map((_, index) => index),
                datasets: group.variables.map((variable, index) => ({
                    label: variable,
                    data: downsampledData.map(entry => entry[variable] || 0),
                    borderColor: group.colors[index],
                    backgroundColor: group.colors[index] + '33',
                    fill: false,
                    tension: 0.4, // Add this line to use smooth lines instead of linear lines
                })),
            },
            options: {
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Index',
                        },
                    },
                    y: {
                        //type: 'logarithmic', // Set the y-axis scale type to logarithmic
                        type: 'linear', // Set the y-axis scale type to linear
                        display: true,
                        title: {
                            display: true,
                            text: group.name,
                        },
                    },
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            drag: true,
                            speed: 10,
                            threshold: 10,
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'xy',
                            rangeMin: {
                                x: 0,
                                y: 0,
                            },
                            rangeMax: {
                                x: null,
                                y: null,
                            },
                            speed: 0.1,
                        },
                    },
                },
            }
        });
    });
}


