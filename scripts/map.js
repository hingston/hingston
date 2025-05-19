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
        center: new google.maps.LatLng(50.305923, -3.860963),
        zoom: 11
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //array of markers from xml file
    var markers = loadXMLDoc("xml/markers.xml").getElementsByTagName("marker");

    var description = "";

    for (var i = 0; i < markers.length; i++) {

        if (markers[i].getAttribute("text") == "") {
            description = markers[i].getAttribute("location")
        } else {
            description = markers[i].getAttribute("location") + " - " + markers[i].getAttribute("text")
        }

        if (markers[i].getAttribute("linkh") != "") {
            description += "\n" + markers[i].getAttribute("linkh")
        }

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(markers[i].getAttribute("lat")), parseFloat(markers[i].getAttribute("lng"))),
            url: "./" + markers[i].getAttribute("linkh"),
            title: description,
            map: map
        });

        if (markers[i].getAttribute("linkh") != "") {
            google.maps.event.addListener(marker, 'click', function () {
                window.open(this.url);
            });
        }
    }
    google.maps.event.addListener(map, 'click', function (event) {
        infowindow.close();
        infowindow.setContent(event.latLng.lat() + ", " + event.latLng.lng());
        infowindow.setPosition(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
        infowindow.open(map);
    });
}

google.maps.event.addDomListener(window, 'load', intialize);

var infowindow = new google.maps.InfoWindow({
    content: ""
});