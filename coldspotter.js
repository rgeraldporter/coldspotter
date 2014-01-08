function $_GET( q, s )	{

    s 		= s ? s : window.location.search;
    var re 	= new RegExp( '&' + q + '(?:=([^&]*))?(?=&|$)', 'i' );
    
    return ( s = s.replace(/^\?/, '&').match(re) ) ? ( typeof s[1] == 'undefined' ? '' : decodeURIComponent(s[1]) ) : undefined;
    
}

var coldspotter, allHotspots, regionCode, regionType;

coldspotter 		= {};
regionCode 			= $_GET("region") || "CA-ON-HA";
regionType 			= $_GET("type") || "subnational2";
allHotspots			= {};
allHotspots.url		= "http://ebird.org/ws1.1/ref/hotspot/region",
allHotspots.data 	= { rtype: regionType, r: regionCode, fmt: 'json' };
allHotspots.results = [];

allHotspots.callback = function( results ) {

	allHotspots.results = results;

}



J50Npi.getJSON( allHotspots.url, allHotspots.data, allHotspots.callback );

window.onload = function() {

	var hotspots, warmspots, coolspots, coldspots, geocallback;

	hotspots 						= {};
	hotspots.url 					= "http://ebird.org/ws1.1/ref/hotspot/region",
	hotspots.data 					= { rtype: regionType, r: regionCode, fmt: 'json', back: 7 };
	hotspots.cache 					= {};
	warmspots 						= {};
	warmspots.url 					= "http://ebird.org/ws1.1/ref/hotspot/region",
	warmspots.data 					= { rtype: regionType, r: regionCode, fmt: 'json', back: 14 };
	warmspots.cache 				= {};
	coolspots 						= {};
	coolspots.url 					= "http://ebird.org/ws1.1/ref/hotspot/region",
	coolspots.data 					= { rtype: regionType, r: regionCode, fmt: 'json', back: 21 };
	coolspots.cache					= {};
	coldspots 						= {};
	coldspots.url 					= "http://ebird.org/ws1.1/ref/hotspot/region",
	coldspots.data 					= { rtype: regionType, r: regionCode, fmt: 'json', back: 28 };
	coldspots.locations				= [];
	coldspotter.dom 				= {};
	coldspotter.dom.hotspotsHTML 	= document.getElementById( "coldspotter-hotspots" );
	coldspotter.dom.warmspotsHTML 	= document.getElementById( "coldspotter-warmspots" );
	coldspotter.dom.coolspotsHTML 	= document.getElementById( "coldspotter-coolspots" );
	coldspotter.dom.coldspotsHTML 	= document.getElementById( "coldspotter-coldspots" );
	coldspotter.dom.alertsHTML 		= document.getElementById( "coldspotter-alerts" );
	coldspotter.dom.summaryHTML 	= document.getElementById( "coldspotter-summary" );
	coldspotter.dom.suggestHTML 	= document.getElementById( "coldspotter-suggest" );
	coldspotter.dom.suggestHTMLH1 	= document.getElementById( "coldspotter-summary-h1" );

	
	geocallback 					= function( geo ) {

		var nearest 	= null,
			farthest	= null,
			distanceN	= 1000,
			distanceF	= 0;

		allHotspots.results.forEach( function(coldspot) {

			Number.prototype.toRad = function() { return this * (Math.PI / 180); };

			lat2 	= geo.coords.latitude;
			lon2 	= geo.coords.longitude;
			lat1 	= coldspot.lat;
			lon1 	= coldspot.lng;

			var R 		= 6371; // km
			var dLat 	= (lat2-lat1).toRad();
			var dLon 	= (lon2-lon1).toRad();
			var lat1 	= lat1.toRad();
			var lat2 	= lat2.toRad();
			var a 		= Math.sin(dLat/2) * Math.sin(dLat/2) +
							Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c 		= 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d 		= R * c;

			/*if( d < distanceN ) {

				distanceN 			= d;
				nearest 			= coldspot;
				nearest.distance 	= d;

			}

			if( d > distanceF ) {

				distanceF 			= d;
				farthest 			= coldspot;
				farthest.distance 	= d;

			}*/

			coldspot.distance = d;

		});

		allHotspots.results.sort( function( a, b ) {

			if( a.distance < b.distance )
				return -1;

			else 
				return 1;

		});

		/*coldspotter.dom.suggestHTML.innerHTML += "<table><tr><td><b style='color:green;'>Suggested nearest coldspot</b>: " + nearest.locName + " (" + nearest.distance.toFixed(2) + " km)</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + nearest.lat + "%2C" + nearest.lng + "'>Map</a></td></tr></table>";

		coldspotter.dom.suggestHTML.innerHTML += "<table><tr><td><b style='color:green;'>Suggested farthest coldspot</b>: " + farthest.locName + " (" + farthest.distance.toFixed(2) + " km)</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + farthest.lat + "%2C" + farthest.lng + "'>Map</a></td></tr></table>";

		var randomnumber = Math.floor(Math.random() * (allHotspots.results.length - 1)) + 0;

		coldspotter.dom.suggestHTML.innerHTML += "<table><tr><td><b style='color:green;'>Suggested random coldspot</b>: " + allHotspots.results[randomnumber].locName + " </td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + allHotspots.results[randomnumber].lat + "%2C" + allHotspots.results[randomnumber].lng + "'>Map</a></td></tr></table>";*/

		var summaryTable	= "";

		summaryTable += "<div class='bg-teal pvl black'><h1 class='title'>Suggested closest coldspots</h1>";

		for( var i = 0; i < 3; i++ ) {

			summaryTable += "<p class='thin'><a target='_blank' href='https://www.google.ca/maps/preview?q=" + allHotspots.results[i].lat + "%2C" + allHotspots.results[i].lng + "'>" + allHotspots.results[i].locName + " (" + allHotspots.results[i].distance.toFixed(2) + " km)</a></p>";

		}

		summaryTable += "</div>";

		summaryTable += "<div class='bg-aqua pvl black'><h1 class='title'>Suggested random coldspots</h1>";

		for( var i = 0; i < 3; i++ ) {

			randomnumber 	= Math.floor(Math.random() * (allHotspots.results.length - 1)) + 3;

			if( !!! allHotspots.results[randomnumber] )
				continue;

			summaryTable 	+= "<p class='thin'><a target='_blank' href='https://www.google.ca/maps/preview?q=" + allHotspots.results[randomnumber].lat + "%2C" + allHotspots.results[randomnumber].lng + "'>" + allHotspots.results[randomnumber].locName + " (" + allHotspots.results[randomnumber].distance.toFixed(2) + " km)</a></p>";

		}

		summaryTable += "</div>";

		coldspotter.dom.suggestHTML.innerHTML = summaryTable;



	};

	coolspots.callback 				= function( coolspotResults ) {

		var me = this;

		me.htmlResult = "<table>";

		coolspotResults.forEach( function(coolspot) {

			if( !! warmspots.cache[coolspot.locID] || !! hotspots.cache[coolspot.locID] )
				return;

			coolspots.cache[ coolspot.locID ] = true;

			me.htmlResult += "<tr><td>" + coolspot.locName + "</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + coolspot.lat + "%2C" + coolspot.lng + "'>Map</a></td></tr>";

			for( var i = 0; i < allHotspots.results.length; i++ ) {

				if( allHotspots.results[i].locID == coolspot.locID )
					allHotspots.results.splice( i, 1 );

			}

		});

		me.htmlResult += "</table>";

		coldspotter.dom.coolspotsHTML.innerHTML = me.htmlResult;

		// start over...
		me.htmlResult = "<table>";

		allHotspots.results.forEach( function(coldspot) {

			me.htmlResult += "<tr><td>" + coldspot.locName + "</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + coldspot.lat + "%2C" + coldspot.lng + "'>Map</a></td></tr>";

		});

		me.htmlResult += "</table>";

		coldspotter.dom.coldspotsHTML.innerHTML = me.htmlResult;

		var totals = {

			hot: 	Object.keys(hotspots.cache).length,
			warm: 	Object.keys(warmspots.cache).length,
			cool: 	Object.keys(coolspots.cache).length,
			cold: 	allHotspots.results.length

		};

		var allTotal 	= totals.hot + totals.warm + totals.cool + totals.cold;

		var summaryTable = "";

		summaryTable += "<div class='bg-red pvl white' style='display:inline-block;width:25%;overflow:hidden;'><h1 class='title'>" + totals.hot + " hot</h1></div>";

		summaryTable += "<div class='bg-orange pvl white' style='display:inline-block;width:25%;overflow:hidden;'><h1 class='title'>" + totals.warm + " warm</h1></div>";

		summaryTable += "<div class='bg-aqua pvl white' style='display:inline-block;width:25%;overflow:hidden;'><h1 class='title'>" + totals.cool + " cool</h1></div>";

		summaryTable += "<div class='bg-blue pvl white' style='display:inline-block;width:25%;overflow:hidden;'><h1 class='title'>" + totals.cold + " cold</h1></div>";

		//summaryTable += "<div class='bg-olive pvl black' style='display:inline-block;width:100%;overflow:hidden;'><p class='title'>Total hotspots: 100</p></div>";

		/*summaryTable += "<div class='bg-red pvl white' style='float:left;width:" + (( totals.hot / allTotal ) * 100).toFixed(0) + "%;'><h1 class='title'>" + totals.hot + " hot</h1></div>";

		summaryTable += "<div class='bg-orange pvl white' style='float:left;width:" + ((totals.warm / allTotal) * 100).toFixed(0) + "%;'><h1 class='title'>" + totals.warm + " warm</h1></div>";

		summaryTable += "<div class='bg-aqua pvl white' style='float:left;width:" + ((totals.cool / allTotal) * 100).toFixed(0) + "%;'><h1 class='title'>" + totals.cool + " cool</h1></div>";

		summaryTable += "<div class='bg-blue pvl white' style='float:left;width:" + ((totals.cold / allTotal) * 100).toFixed(0) + "%;'><h1 class='title'>" + totals.cold + " cold</h1></div>";*/

		coldspotter.dom.suggestHTMLH1.innerHTML		= "Summary for: " + regionCode;
		coldspotter.dom.summaryHTML.innerHTML 		+= summaryTable;//"<span style='color:red;'>" + Object.keys(hotspots.cache).length + " hot,</span> <span style='color:orange;'>" + Object.keys(warmspots.cache).length + " warm,</span> <span style='color:teal;'>" + Object.keys(coolspots.cache).length + " cool,</span> <span style='color:blue;'>" + allHotspots.results.length + " cold</span>";

		navigator.geolocation.getCurrentPosition( geocallback );

	}

	warmspots.callback 				= function( warmspotResults ) {

		var me = this;

		me.htmlResult = "<table>";

		warmspotResults.forEach( function(warmspot) {

			if( !! hotspots.cache[warmspot.locID] )
				return;

			warmspots.cache[ warmspot.locID ] = true;

			me.htmlResult += "<tr><td>" + warmspot.locName + "</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + warmspot.lat + "%2C" + warmspot.lng + "'>Map</a></td></tr>";

			for( var i = 0; i < allHotspots.results.length; i++ ) {

				if( allHotspots.results[i].locID == warmspot.locID )
					allHotspots.results.splice( i, 1 );

			}

		});

		me.htmlResult += "</table>";

		coldspotter.dom.warmspotsHTML.innerHTML = me.htmlResult;

		J50Npi.getJSON( coolspots.url, coolspots.data, coolspots.callback );

	}

	hotspots.callback 				= function( hotspotResults ) { 

		var me = this;

		me.htmlResult = "<table>";

		hotspotResults.forEach( function(hotspot) {

			hotspots.cache[ hotspot.locID ] = true;

			me.htmlResult += "<tr><td>" + hotspot.locName + "</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + hotspot.lat + "%2C" + hotspot.lng + "'>Map</a></td></tr>";

			for( var i = 0; i < allHotspots.results.length; i++ ) {

				if( allHotspots.results[i].locID == hotspot.locID )
					allHotspots.results.splice( i, 1 );

			}	

		});

		if( hotspotResults.length == 0 ) {

			me.htmlResult += "<tr><td>No recent reports at any hotspots!</td></tr>";
			coldspotter.dom.alertsHTML.innerHTML += "<div class='bg-blue pvl white'><h1 class='title' id=\"coldspotter-summary-h1\">Cold County Alert!</h1><p class='thin'>No observations have been posted for hotspot locations in this county for the past week.</p></div>";

		}

		me.htmlResult += "</table>";

		coldspotter.dom.hotspotsHTML.innerHTML = me.htmlResult;

		J50Npi.getJSON( warmspots.url, warmspots.data, warmspots.callback );

	};

	J50Npi.getJSON( hotspots.url, hotspots.data, hotspots.callback );

}