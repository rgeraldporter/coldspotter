function $_GET(q,s)	{

    s = s ? s : window.location.search;
    var re = new RegExp('&'+q+'(?:=([^&]*))?(?=&|$)','i');
    
    return (s=s.replace(/^\?/,'&').match(re)) ? (typeof s[1] == 'undefined' ? '' : decodeURIComponent(s[1])) : undefined;
    
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

	var hotspots, warmspots, coolspots, coldspots;

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
	coldspots.cache 				= {};
	coldspotter.dom 				= {};
	coldspotter.dom.hotspotsHTML 	= document.getElementById( "coldspotter-hotspots" );
	coldspotter.dom.warmspotsHTML 	= document.getElementById( "coldspotter-warmspots" );
	coldspotter.dom.coolspotsHTML 	= document.getElementById( "coldspotter-coolspots" );
	coldspotter.dom.coldspotsHTML 	= document.getElementById( "coldspotter-coldspots" );
	coldspotter.dom.alertsHTML 		= document.getElementById( "coldspotter-alerts" );
	coldspotter.dom.summaryHTML 	= document.getElementById( "coldspotter-summary" );

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

			if( !! warmspots.cache[coldspot.locID] || !! hotspots.cache[coldspot.locID] || !! coolspots.cache[coldspot.locID] )
				return;

			me.htmlResult += "<tr><td>" + coldspot.locName + "</td><td><a target='_blank' href='https://www.google.ca/maps/preview?q=" + coldspot.lat + "%2C" + coldspot.lng + "'>Map</a></td></tr>";

		});

		me.htmlResult += "</table>";

		coldspotter.dom.coldspotsHTML.innerHTML = me.htmlResult;

		coldspotter.dom.summaryHTML.innerHTML += "<span style='color:red;'>" + Object.keys(hotspots.cache).length + " hot,</span> <span style='color:orange;'>" + Object.keys(warmspots.cache).length + " warm,</span> <span style='color:teal;'>" + Object.keys(coolspots.cache).length + " cool,</span> <span style='color:blue;'>" + allHotspots.results.length + " cold</span>"

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
			coldspotter.dom.alertsHTML.innerHTML += "<b style='color:red;'>Cold county alert</b> No observation reports in the last week!"

		}

		me.htmlResult += "</table>";

		coldspotter.dom.hotspotsHTML.innerHTML = me.htmlResult;

		J50Npi.getJSON( warmspots.url, warmspots.data, warmspots.callback );

	};

	J50Npi.getJSON( hotspots.url, hotspots.data, hotspots.callback );

}