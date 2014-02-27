
function $_GET( q, s )	{

	s		= s ? s :window.location.search;
	var re	= new RegExp( '&' + q + '(?:=([^&]*))?(?=&|$)', 'i' );
	
	return ( s = s.replace(/^\?/, '&').match(re) ) ? ( typeof s[1] === 'undefined' ? '' :decodeURIComponent(s[1]) ) :undefined;
	
}

var coldspotter, allHotspots;

coldspotter			= {};
allHotspots			= {};
allHotspots.results = [];

var CONFIG =	{

	regionType:		$_GET("type") || "subnational2",
	regionUrl:		"http://ebird.org/ws1.1/ref/hotspot/region",
	geoUrl:			"http://ebird.org/ws1.1/ref/hotspot/geo",
	radius:			17,
	hot:			7,
	warm:			14,
	cool:			21,
	cold:			28

};

var coord			= function( data ) {

	this.lat	= data.lat;
	this.lng	= data.lng;

};

var spot		= function( data ) {

	this.regionCode			= [ data.countryCode, data.subnational1Code, data.subnational2Code ];
	this.geo				= new coord({ lat:data.lat,	lng:data.lng });
	this.id					= data.locaID;
	this.name				= data.locName;

};

var hotspotGeoProxy = function( callback, days, geo ) {

	var me				= this;

	this.url			= CONFIG.geoUrl;
	this.cache			= {};
	this.data			= { 

			lat:		geo.coords.latitude, 
			lng:		geo.coords.longitude, 
			dist:		CONFIG.radius, 
			fmt:		'json' 

	};

	this.callback 		= function( results ) {

		callback( results, me );

	};

	if( !!days ) {

		this.data.back = days;

	}

};

var hotspotRegionalProxy	= function( callback, days ) {

	var me				= this;

	this.url			= CONFIG.regionUrl;
	this.data			= { rtype:CONFIG.regionType, r:$_GET("region"), fmt:'json' };
	this.cache			= {};
	this.callback		= function( results ) {

		callback( results, me );

	};

	if( !!days ) {

		this.data.back = days;

	}

};

window.onload = function() {

	"use strict";

	var hotspots, warmspots, coolspots, coldspots, geocallback;

	coolspots						= {};
	hotspots						= {};
	warmspots						= {};
	coldspots						= {};

	geocallback = function( geo ) {

		var assembleList		= function( geo ) {

			var totals = {

				hot:	Object.keys( hotspotProxy.cache ).length,
				warm:	Object.keys( warmspotProxy.cache ).length,
				cool:	Object.keys( coolspotProxy.cache ).length,
				cold:	allHotspots.results.length

			};

			var allTotal	= totals.hot + totals.warm + totals.cool + totals.cold;

			var summaryTable = "";

			summaryTable += "<div class='bg-red pvl white summary-result'><h1 class='title'>" + totals.hot + " hot</h1></div>";

			summaryTable += "<div class='bg-orange pvl white summary-result'><h1 class='title'>" + totals.warm + " warm</h1></div>";

			summaryTable += "<div class='bg-aqua pvl white summary-result'><h1 class='title'>" + totals.cool + " cool</h1></div>";

			summaryTable += "<div class='bg-blue pvl white summary-result'><h1 class='title'>" + totals.cold + " cold</h1></div>";

			summaryTable += "";

			coldspotter.dom.suggestHTMLH1.innerHTML		= "Summary for " + ( $_GET("region") || "20 km radius" );
			coldspotter.dom.summaryHTML.innerHTML			+= summaryTable;

			summaryTable = "";

			summaryTable += "<div class='bg-red pvs white summary-result-top'><h1 class='title'>" + totals.hot + "</h1></div>";

			summaryTable += "<div class='bg-orange pvs white summary-result-top'><h1 class='title'>" + totals.warm + "</h1></div>";

			summaryTable += "<div class='bg-aqua pvs white summary-result-top'><h1 class='title'>" + totals.cool + "</h1></div>";

			summaryTable += "<div class='bg-blue pvs white summary-result-top'><h1 class='title'>" + totals.cold + "</h1></div>";

			coldspotter.dom.summaryTopHTML.innerHTML		= summaryTable;

			var nearest		= null,
				farthest	= null,
				distanceN	= 1000,
				distanceF	= 0;

			allHotspots.results.forEach( function(coldspot) {

				var lat2, lon2, lat1, lon1;

				Number.prototype.toRad = function() { return this * (Math.PI / 180); };

				lat2	= geo.coords.latitude;
				lon2	= geo.coords.longitude;
				lat1	= coldspot.lat;
				lon1	= coldspot.lng;

				var R		= 6371; // km
				var dLat	= (lat2-lat1).toRad();
				var dLon	= (lon2-lon1).toRad();
				lat1		= lat1.toRad();
				lat2		= lat2.toRad();
				var a		= Math.sin(dLat/2) * Math.sin(dLat/2) +
								Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
				var c		= 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
				var d		= R * c;

				coldspot.distance = d;

			});

			allHotspots.results.sort( function( a, b ) {

				if( a.distance < b.distance )
					return -1;

				else 
					return 1;

			});

			summaryTable	= "<div class='bg-navy pvl white'><h1 class='title' id=\"coldspotter-summary-h1\">Coldspots</h1></div>";

			for( var i = 0; i < allHotspots.results.length; i++ ) {

				var distance = allHotspots.results[i].distance > 50 ? "&gt;50" :allHotspots.results[i].distance.toFixed(1);

				summaryTable += "<div class='bg-blue white pvs result distance'>" + distance + "<span class='thin km'>km</span></div><a target='_blank' class='bg-blue white pvs result map-link' href='https://www.google.ca/maps/preview?q=" + allHotspots.results[i].lat + "%2C" + allHotspots.results[i].lng + "'>MAP</a><a target='_blank' class='result-link thin pvs result navy bg-white hotspot' href='http://ebird.org/ebird/canada/hotspot/" + allHotspots.results[i].locID + "'>" + allHotspots.results[i].locName + "</a>";

			}

			coldspotter.dom.suggestHTML.innerHTML = summaryTable;

		};

		var spotProxyCallback = function( results, proxy, callback ) {

			var me = this;

			results.forEach( function(hotspot) {
				proxy.cache[ hotspot.locID ] = true;

				for( var i = 0; i < allHotspots.results.length; i++ ) {

					if( allHotspots.results[i].locID == hotspot.locID )
						allHotspots.results.splice( i, 1 );

				}	

			});

			callback();

		};

		var coldspotProxyCallback = function( results, proxy ) {

			spotProxyCallback( results, proxy, function() {

				assembleList( geo );

			});

		};

		var coolspotProxyCallback = function( results, proxy ) {

			spotProxyCallback( results, proxy, function() {

				J50Npi.getJSON( coldspotProxy.url, coldspotProxy.data, coldspotProxy.callback );

			});

		};

		var warmspotProxyCallback = function( results, proxy ) {

			spotProxyCallback( results, proxy, function() {

				J50Npi.getJSON( coolspotProxy.url, coolspotProxy.data, coolspotProxy.callback );

			});

		};

		var hotspotProxyCallback = function( results, proxy ) {

			spotProxyCallback( results, proxy, function() {

				J50Npi.getJSON( warmspotProxy.url, warmspotProxy.data, warmspotProxy.callback );

			});

			if( results.length === 0 ) {

				coldspotter.dom.alertsHTML.innerHTML += "<div class='bg-blue pvl white'><h1 class='title' id=\"coldspotter-summary-h1\">Cold County Alert!</h1><p class='thin'>No observations have been posted for hotspot locations in this county for the past week.</p></div>";

			}

		};

		var allhotspotProxyCallback = function( results, proxy ) {

			allHotspots.results = results;

			J50Npi.getJSON( hotspotProxy.url, hotspotProxy.data, hotspotProxy.callback );

		};

		var coldspotProxy, coolspotProxy, warmspotProxy, hotspotProxy, allhotspotProxy;

		if( $_GET("region") ) {

			coldspotProxy	= new hotspotRegionalProxy( coldspotProxyCallback, CONFIG.cold );
			coolspotProxy	= new hotspotRegionalProxy( coolspotProxyCallback, CONFIG.cool );
			warmspotProxy	= new hotspotRegionalProxy( warmspotProxyCallback, CONFIG.warm );
			hotspotProxy	= new hotspotRegionalProxy( hotspotProxyCallback, CONFIG.hot );
			allhotspotProxy = new hotspotRegionalProxy( allhotspotProxyCallback );

		} else {

			coldspotProxy	= new hotspotGeoProxy( coldspotProxyCallback, CONFIG.cold, geo );
			coolspotProxy	= new hotspotGeoProxy( coolspotProxyCallback, CONFIG.cool, geo );
			warmspotProxy	= new hotspotGeoProxy( warmspotProxyCallback, CONFIG.warm, geo );
			hotspotProxy	= new hotspotGeoProxy( hotspotProxyCallback, CONFIG.hot, geo );
			allhotspotProxy = new hotspotGeoProxy( allhotspotProxyCallback, null, geo );

		}

		J50Npi.getJSON( allhotspotProxy.url, allhotspotProxy.data, allhotspotProxy.callback );

		coldspotter.dom					= {};
		coldspotter.dom.hotspotsHTML	= document.getElementById( "coldspotter-hotspots" );
		coldspotter.dom.warmspotsHTML	= document.getElementById( "coldspotter-warmspots" );
		coldspotter.dom.coolspotsHTML	= document.getElementById( "coldspotter-coolspots" );
		coldspotter.dom.coldspotsHTML	= document.getElementById( "coldspotter-coldspots" );
		coldspotter.dom.alertsHTML		= document.getElementById( "coldspotter-alerts" );
		coldspotter.dom.summaryHTML		= document.getElementById( "coldspotter-summary" );
		coldspotter.dom.summaryTopHTML	= document.getElementById( "coldspotter-summary-top" );
		coldspotter.dom.suggestHTML		= document.getElementById( "coldspotter-suggest" );
		coldspotter.dom.suggestHTMLH1	= document.getElementById( "coldspotter-summary-h1" );

	};

	navigator.geolocation.getCurrentPosition( geocallback );

};