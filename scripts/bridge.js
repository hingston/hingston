function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else // code for IE5 and IE6
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", filename, false);
    xhttp.send();
    return xhttp.responseXML;
}

function intialize() {
    var mapOptions = {
        center: new google.maps.LatLng(46.7, 4.0),
        zoom: 6
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var markersXML = loadXMLDoc("xml/iabsemarkers.xml");

    var markers = markersXML.getElementsByTagName("marker");

    var description = "";

    for (var i = 0; i < markers.length; i++) {

        if (markers[i].getAttribute("text") == "") {
            description = markers[i].getAttribute("location")
        } else {
            description = markers[i].getAttribute("location") + " - " + markers[i].getAttribute("text")
        }

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(markers[i].getAttribute("lat")), parseFloat(markers[i].getAttribute("lng"))),
            map: map,
            title: description
        });
    }
}
google.maps.event.addDomListener(window, 'load', intialize);