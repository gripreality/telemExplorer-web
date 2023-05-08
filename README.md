# TelemLogger-Explorer (telemExplorer-web)

TelemLogger-Explorer (telemExplorer-web) is a web-based telemetry data visualization and analysis tool. It allows users to visualize telemetry data using interactive maps, filter data, and export data in various formats. The tool is designed to be user-friendly, making it easy for both experts and beginners to work with telemetry data. There is a live version running at [TelemLogger.com](https://telemlogger.com/). 

## Features

- Visualize telemetry data on an interactive map using Leaflet.js
- Filter telemetry data by time range and data types
- Export filtered and downsampled telemetry data in CSV and KML formats
- Add placemarks to KML exports
- User-friendly interface

## Getting Started

### Prerequisites

- A web server capable of serving static files, such as Nginx or Apache
- Telemetry data files in the `.dlog.gz` format

### Installation

1. Clone the TelemLogger-Explorer (telemExplorer-web) repository:

git clone https://github.com/gripreality/telemExplorer-web.git

2. Configure your web server to serve the telemExplorer-web folder as the root directory for your domain or subdomain.

3. Upload your telemetry data files (`.dlog.gz` format) to the designated folder on your server.

### Usage

1. Open the TelemLogger-Explorer (telemExplorer-web) website in a web browser.

2. Click 'Select Folder' to choose a folder containing `*.dlog.gz` files.

3. Click 'Refresh Data' to load the telemetry data from the selected folder.

4. Use the checkboxes to filter the data types that will be exported to CSV and KML files.

5. Use the 'CSV Downsample' and 'KML Downsample' fields to reduce the amount of data exported to those formats.

6. Use the 'Add Placemarks' and 'Placemark Downsample' fields to configure KML export settings.

7. Click 'Export CSV' or 'Export KML' to export the filtered and downsampled telemetry data to a file.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Leaflet.js](https://leafletjs.com/) for providing an open-source, interactive mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) for providing free map tiles and data
- [Omnivore](https://github.com/mapbox/leaflet-omnivore) for providing a KML parsing library
- [Bootstrap](https://getbootstrap.com/) for providing a responsive, mobile-first front-end framework
- [jQuery](https://jquery.com/) for providing a fast, small, and feature-rich JavaScript library
- [Popper.js](https://popper.js.org/) for providing positioning utilities for tooltips and popovers
- [pako](https://github.com/nodeca/pako) for providing a high-speed zlib port to JavaScript
- [tokml](https://github.com/mapbox/tokml) for providing a GeoJSON-to-KML conversion library
- [Chart.js](https://www.chartjs.org/) for providing a simple yet flexible JavaScript charting library
- [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom) for providing zoom and pan functionality for Chart.js
- [jQuery UI](https://jqueryui.com/) for providing a curated set of user interface interactions, effects, widgets, and themes
- All other open-source libraries used in this project


## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository: https://github.com/gripreality/telemExplorer-web/issues

## Copyright

Copyright Baraqu LLC 2023 - https://louissilverstein.com - https://github.com/gripreality/telemExplorer-web
