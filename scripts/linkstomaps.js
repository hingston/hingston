
function ukopenmap(locationName) {
//var locationName = $(anchor).text();
//alert("Point 1 '" + locationName + "' being sought.");
  $.ajax({
      type: "GET",
      url: "xml/markers.xml",
//      url: "http://www-civ.eng.cam.ac.uk/cjb/hingston/xml/markers.xml",
      dataType: "xml",
      success: function(xml) {
        var found = 0;
        $(xml).find("marker").each(function () {

          if(strcmp(locationName, $(this).attr("location")) == 0) {
            found = 1;

            //Open in same window.
            //  window.location = createURI(this);
            //Open in new window
			  window.open( createURI(this) );

          }
          
        });
        
        if(!found) {
          alert("Location '" + locationName + "' not found on map.");
        }
        
      }
    });
}

function createURI(marker) {
  var uri = "http://maps.nls.uk/geo/explore/#" +
            "zoom=" + $(marker).attr("maxv") + "&" +
            "lat=" + $(marker).attr("lat") + "&" +
            "lon=" + $(marker).attr("lng") + "&" +
            "layers=171";
  
  return uri;
}

function strcmp ( str1, str2 ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // +      input by: Steve Hilder
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: gorthaur
    // *     example 1: strcmp( 'waldo', 'owald' );
    // *     returns 1: 1
    // *     example 2: strcmp( 'owald', 'waldo' );
    // *     returns 2: -1

    return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
}