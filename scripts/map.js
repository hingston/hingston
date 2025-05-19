let allMapMarkers = []; // To store all markers for zoom-based visibility
let map; // Make map accessible for zoom listener
let infowindow; // Declare infowindow globally

function loadXMLDoc(filename, callback) {
    let xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else { // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                callback(this.responseXML);
            } else {
                console.error("Error loading XML file: " + filename + " Status: " + this.status);
                callback(null); // Indicate error
            }
        }
    };
    xhttp.open("GET", filename, true); // true for asynchronous
    xhttp.send();
}

function updateMarkerVisibility() {
    if (!map || !allMapMarkers.length) return;
    const currentZoom = map.getZoom();
    for (let i = 0; i < allMapMarkers.length; i++) {
        const marker = allMapMarkers[i];
        if (currentZoom >= marker.minZoom && currentZoom <= marker.maxZoom) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    }
}

function initialize() {
    const mapOptions = {
        center: new google.maps.LatLng(50.305923, -3.860963),
        zoom: 11
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    infowindow = new google.maps.InfoWindow({
        content: ""
    });

    loadXMLDoc("xml/markers.xml", function (xml) {
        if (!xml) {
            document.getElementById("map").innerHTML = "<p style='text-align:center; padding-top: 20px;'>Error: Could not load marker data from XML file.</p>";
            return;
        }

        const markersData = xml.getElementsByTagName("marker");
        allMapMarkers = []; // Clear previous markers if any

        for (let i = 0; i < markersData.length; i++) {
            const lat = parseFloat(markersData[i].getAttribute("lat"));
            const lng = parseFloat(markersData[i].getAttribute("lng"));
            const linkh = markersData[i].getAttribute("linkh");

            // Skip marker if lat or lng is not a valid number (e.g. from an empty marker tag)
            if (isNaN(lat) || isNaN(lng)) {
                console.warn("Skipping marker with invalid lat/lng:", markersData[i]);
                continue;
            }

            let markerTitle = markersData[i].getAttribute("location");
            const textAttr = markersData[i].getAttribute("text");
            const linktAttr = markersData[i].getAttribute("linkt");

            if (textAttr) {
                markerTitle += " - " + textAttr;
            }
            if (linktAttr) {
                markerTitle += "\n" + linktAttr; // Newline for tooltip display
            }

            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map, // Initially add to map, visibility will be controlled by zoom
                title: markerTitle
            });

            // Store custom data with the marker
            marker.minZoom = parseInt(markersData[i].getAttribute("minv"), 10);
            marker.maxZoom = parseInt(markersData[i].getAttribute("maxv"), 10);

            if (linkh) {
                marker.url = "./" + linkh; // Assuming links are relative to a sub-directory or current dir
                google.maps.event.addListener(marker, 'click', function () {
                    window.open(this.url);
                });
            }
            allMapMarkers.push(marker);
        }

        // Initial marker visibility update
        updateMarkerVisibility();

        // Add zoom changed listener to update marker visibility
        google.maps.event.addListener(map, 'zoom_changed', updateMarkerVisibility);
    });

    google.maps.event.addListener(map, 'click', function (event) {
        infowindow.close();
        infowindow.setContent(event.latLng.lat().toFixed(6) + ", " + event.latLng.lng().toFixed(6));
        infowindow.setPosition(event.latLng);
        infowindow.open(map);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
