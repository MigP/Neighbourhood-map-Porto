
// Global variables
	var	map, bounds, infoWindow, selectedMarker = null, originalZoom, originalCenter;

// Resets the map view
	function resetMap() {
	    map.setCenter(originalCenter);
	    map.setZoom(originalZoom);
	}

// Fetches data from Foursquare and Flickr
	function getFlickrAndFoursquare(place) {
		var photo_str = [],
			html_title = "<h5>"+place.marker.title+"</h5>",
			flickr_error = "";
			flickr_str = "";
			foursquare_error = "";
			foursquare_desc = "";
			foursquare_url = "";
			foursquare_rating = "";
			foursquare_ratingSignals = "";
			foursquare_contact = "";
			foursquare_location = "";

		var makeFlickrRequest = function(options, callback) { // Flickr request
			var url, request, item, first;

			url = "https://api.flickr.com/services/rest/";
			first = true;

			for (item in options) { // Iterates through all the options to include on the request
				if (options.hasOwnProperty(item)) {
					url += (first ? "?" : "&") + item + "=" + options[item];
					first = false;
				}
			}

			request = new XMLHttpRequest();
			request.onload = function() {
				callback(this.response);
			};
			request.open('get', url, true);
			request.onreadystatechange = function(event) {
			    if (request.readyState === 4) {
			        if (request.status === 200) {
		          		// console.log(request.responseText)
			        } else {
			           console.log("Error", request.statusText);

		    			if (request.statusText === "") {
		    				flickr_error = "Sorry. Unable to reach Flickr - Check your connection and try again.";
		    			} else {
		    				flickr_error = "Sorry. Unable to reach Flickr - " + request.statusText;	
		    			}
			        }
			    }
			};
			request.onerror = function() {
				callback(this.response);
			};
		  	request.send();
		};

		var options = { // Options for the Flickr request
		  "api_key": "908c80b99103349f54347722c904accb",
		  "method": "flickr.photos.search",
		  "format": "json",
		  "nojsoncallback": "1",
		  "per_page": "6",
		  "sort": "relevance",
		  "text": place.name + place.tags
		};

		makeFlickrRequest(options, function(data) { // Makes the actual request to Flickr
			if (data) {
				var jsonData = JSON.parse(data);

			    for (i = 0; i < jsonData.photos.photo.length; i++) {
			    	photo_str.push({"src": "https://farm"+ jsonData.photos.photo[i].farm +".static.flickr.com/"+ jsonData.photos.photo[i].server +"/"+ jsonData.photos.photo[i].id +"_"+ jsonData.photos.photo[i].secret +"_m.jpg",
			    					"title": jsonData.photos.photo[i].title,
			    					"link": "https://www.flickr.com/photos/"+ jsonData.photos.photo[i].owner+ "/" + jsonData.photos.photo[i].id});
			    	flickr_str += "<a href='" + photo_str[i].link + "' target='_blank'><img class='flickr_pic img-responsive' src='" + photo_str[i].src + "' alt='" + photo_str[i].title +"' title='" + photo_str[i].title + "'></a>";
			    }

			    if (jsonData.photos.photo.length === 0) {
			    	flickr_str += "<span>Sorry, no photos of " + place.name + " were found on Flickr.</span>";
			    }
			}

			var makeFoursquareRequest = function(options2, callback2) { // First Foursquare request - gets list of places
				var url2, request2, item2, first2;
				var str = "";

				url2 = "https://api.foursquare.com/v2/venues/search";
				first2 = true;

				for (item2 in options2) { // Iterates through all the options to include on the request
					if (options2.hasOwnProperty(item2)) {
						url2 += (first2 ? "?" : "&") + item2 + "=" + options2[item2];
						first2 = false;
					}
				}

				request2 = new XMLHttpRequest();
				request2.onload = function() {
					callback2(this.response);
				};
				request2.open('get', url2, true);
				request2.onreadystatechange = function(event) {
				    if (request2.readyState === 4) {
				        if (request2.status === 200) {
			          		// console.log(request2.responseText)
				        } else {
				           console.log("Error", request2.statusText);

			    			if (request2.statusText === "") {
			    				foursquare_error = "Sorry. Unable to reach Foursquare - Check your connection and try again.";
			    			} else {
			    				foursquare_error = "Sorry. Unable to reach Foursquare - " + request2.statusText;	
			    			}
				        }
				    }
				};
				request2.onerror = function() {
					callback2(this.response);
				};
			  	request2.send();
			};

			var makeFoursquareRequest2 = function(options3, callback3) { // Second Foursquare request - gets the information on the most relevant place
				var url3, request3, item3, first3;

				url3 = "https://api.foursquare.com/v2/venues/" + options3.venueId + "/";
				first3 = true;

				for (item3 in options3) { // Iterates through all the options to include on the request
					if (options3.hasOwnProperty(item3)) {
						url3 += (first3 ? "?" : "&") + item3 + "=" + options3[item3];
						first3 = false;
					}
				}

				request3 = new XMLHttpRequest();
				request3.onload = function() {
					callback3(this.response);
				};
				request3.open('get', url3, true);
				request3.onreadystatechange = function(event) {
				    if (request3.readyState === 4) {
				        if (request3.status === 200) {
			          		// console.log(request3.responseText)
				        } else {
				           console.log("Error", request3.statusText);

			    			if (request3.statusText === "") {
			    				foursquare_error = "Sorry. Unable to reach Foursquare - Check your connection and try again.";
			    			} else {
			    				foursquare_error = "Sorry. Unable to reach Foursquare - " + request3.statusText;	
			    			}
				        }
				    }
				};
				request3.onerror = function() {
					callback3(this.response);
				};
			  	request3.send();

			};

			var options2 = { // Options for the first Foursquare request
			  "client_id": "MU0EVKMOPGNQTNJ1YUDKIEAF0FBEFNX1I0QQWKJR3U0D2B13",
			  "client_secret": "RKEWTTPR0WFRRICPBJHZ4D01X0QIK541EMP44JVTJHYFUUBC",
			  "ll": place.location.lat + "," + place.location.lng,
			  "intent": "checkin",
			  "v": "20170723",
			  "m": "foursquare",
			  "query": place.name
			};

			makeFoursquareRequest(options2, function(data) { // Makes the actual first request to Foursquare
				function noFoursquareData(passedPlace) {
					// Organises the content to be displayed in the infowindow when there is no information on Foursquare, and displays it
			            var html_str = html_title;
			            html_str += "<div id='info'>Sorry, no information about " + passedPlace.name + " was found on Foursquare.</div>";

			        	if (flickr_error === "") {
			            	html_str += "</br><em><a href = 'https://www.flickr.com/search?text='" + passedPlace.marker.title + "'&structured=yes' target = '_blank'>Photos by Flickr</a></em></br><div id='photos'>" + flickr_str + "</div>";
			            } else {
			            	html_str += "<div id='photos'>" + flickr_error + "</div>";
			            }

						infowindow.setContent("<div id='info_window'>" + html_str + "</div>");
						map.setCenter(passedPlace.marker.getPosition());
						infowindow.open(map,passedPlace.marker);
				}

				if (data) {
					var jsonData = JSON.parse(data);
					if (typeof jsonData.response.venues !== "undefined") {
						if (jsonData.response.venues.length !== 0) {
							var options3 = { // Options for the second Foursquare request
							  "client_id": "MU0EVKMOPGNQTNJ1YUDKIEAF0FBEFNX1I0QQWKJR3U0D2B13",
							  "client_secret": "RKEWTTPR0WFRRICPBJHZ4D01X0QIK541EMP44JVTJHYFUUBC",
							  "venueId": jsonData.response.venues[0].id,
							  "v": "20170723"
							};

							makeFoursquareRequest2(options3, function(data) { // Makes the actual second request to Foursquare
								if (data) {
									var jsonData2 = JSON.parse(data);
									if (typeof jsonData2.response.venue !== "undefined") {
										// Organises the content to be displayed in the infowindow and displays it
										    if (typeof jsonData2.response.venue.description != "undefined") {
										    	foursquare_desc = "<div>" + jsonData2.response.venue.description + "</div>";
										    }

										    if (typeof jsonData2.response.venue.url != "undefined") {
										    	foursquare_url = "<span><a href='" + jsonData2.response.venue.url + "?ref=" + options3.client_id + "' target='_blank'>" + jsonData2.response.venue.url + "</a></span>";
										    }

										    if (typeof jsonData2.response.venue.rating != "undefined") {
										    	foursquare_rating = "<span class='venueScore' title='" + (jsonData2.response.venue.rating).toFixed(1) + "/10 - People like this place' style='background-color: #" + jsonData2.response.venue.ratingColor + ";'><span class='ratingValue'>" + (jsonData2.response.venue.rating).toFixed(1) + "</span><sup>/<span class='bestRating'>10</span></sup></span>";
										    }

										    if (typeof jsonData2.response.venue.ratingSignals != "undefined") {
										    	foursquare_ratingSignals = "<div class='numRatingsBlock'><div class='numRatings' id='ratingCount'>" + jsonData2.response.venue.ratingSignals + "</div><div class='numRatingsLabel'>ratings</div></div>";
										    }

										    if (typeof jsonData2.response.venue.contact.formattedPhone != "undefined") {
										    	foursquare_contact = "<span>Contact: " + jsonData2.response.venue.contact.formattedPhone + "</span>";
										    }

										    if (typeof jsonData2.response.venue.location.formattedAddress != "undefined") {
										    	foursquare_location += "<span>Address: \n</span>";
										    	for (var i = 0; i < jsonData2.response.venue.location.formattedAddress.length; i++) {
										    		foursquare_location += "<span>" + jsonData2.response.venue.location.formattedAddress[i] + "</span>";
										    	}
										    }

								            var html_str = html_title;
								            if (foursquare_error === "") {
								            	if (foursquare_desc + foursquare_rating + foursquare_ratingSignals + foursquare_url + foursquare_contact + foursquare_location === "") {
								            		html_str += "<div id='info'>Sorry, no information about " + place.name + " was found on Foursquare.</div>";
								            	} else {
								            		html_str += "<div id='info'><em><a href = '" + jsonData2.response.venue.canonicalUrl + "' target = '_blank'>Info by Foursquare</a></em></br>" + foursquare_desc + "<div id='rating_data'>" + foursquare_rating + foursquare_ratingSignals + "</div>" + foursquare_url + foursquare_contact + foursquare_location + "</div>";
								            	}
								            } else {
								            	html_str += "<div id='info'>" + foursquare_error + "</div>";
								            }
								        	if (flickr_error === "") {
								            	html_str += "</br><em><a href = 'https://www.flickr.com/search?text='" + place.marker.title + "'&structured=yes' target = '_blank'>Photos by Flickr</a></em></br><div id='photos'>" + flickr_str + "</div>";
								            } else {
								            	html_str += "<div id='photos'>" + flickr_error + "</div>";
								            }

											infowindow.setContent("<div id='info_window'>" + html_str + "</div>");
											map.setCenter(place.marker.getPosition());
											infowindow.open(map,place.marker);
									} else {
										noFoursquareData(place);
									}
								} else {
									noFoursquareData(place);
								}
							});
						} else {
							noFoursquareData(place);
						}
					} else {
						noFoursquareData(place);
					}
				} else {
					noFoursquareData(place);
				}
			});
		});
	}

// Initialises the application
	function init() {
		var chosenStyles = [ // Map styles
			{"featureType": "administrative.locality",
			"elementType": "geometry.stroke",
			"stylers": [{
				"color": "#ff00ff"},
				{"weight": 2}
			]},
			{"featureType": "administrative.locality",
			"elementType": "geometry.fill",
			"stylers": [{
				"visibility": "on"},
				{"color": "#fa61fa"},
				{"weight": 2}
			]},
			{"featureType": "administrative.neighborhood",
			"elementType": "geometry.fill",
			"stylers": [{
				"visibility": "on"},
				{"color": "#57c95b"},
				{"weight": 2}
			]},
			{"featureType": "administrative.neighborhood",
			"elementType": "geometry.stroke",
			"stylers": [{
				"color": "#188018"},
				{"weight": 2}
			]},
			{"featureType": "administrative.province",
			"elementType": "geometry.stroke",
			"stylers": [{
				"visibility": "on"},
				{"color": "#824313"},
				{"weight": 2}
			]},
			{"featureType": "landscape.man_made",
			"elementType": "geometry.fill",
			"stylers": [{
				"color": "#ccc8cc"}
			]}
		],
		mapOptions = {
	        mapTypeId: google.maps.MapTypeId.ROADMAP,
	        disableDefaultUI: true,
	        zoomControl: true,
	        mapTypeControl: false,
	        scaleControl: true,
	        streetViewControl: false,
	        rotateControl: false,
	        fullscreenControl: false,
	        zoom: 13,
	        center: {lat: 41.146467, lng: -8.611382},
	        styles: chosenStyles
	    };

	    map = new google.maps.Map(document.getElementById('map'), mapOptions);
	    bounds = new google.maps.LatLngBounds();
	    infowindow = new google.maps.InfoWindow();

		function addClickListener(placeToAddListenerTo) { // Adds a click listener to each marker which toggles selections
			return function() {
		    	if(selectedMarker) {
		    		placesViewModel.blurMarker(selectedMarker);
		    	}
		        placesViewModel.focusMarker(placeToAddListenerTo);
		        selectedMarker = placeToAddListenerTo;
		        placesViewModel.closeNav;
		    };

		}

		for (var i = 0; i < placesViewModel.places.length; i++) { // Creates the markers and adds them to the placesViewModel
			var iteratedPlace = placesViewModel.places[i];

		    iteratedPlace.marker = new google.maps.Marker({
		        position: {lat: iteratedPlace.location.lat, lng: iteratedPlace.location.lng},
		        map: map,
		        icon: {url: 'images/' + iteratedPlace.type + '.png',
		    		size: new google.maps.Size(25, 25),
		    		scaledSize: new google.maps.Size(25, 25),
		    		origin: new google.maps.Point(0, 0),
		    		anchor: new google.maps.Point(12.5, 25)
		    	},
		    	optimized: false,
		        title: iteratedPlace.name
		    });

			iteratedPlace.marker.addListener('click', (addClickListener(iteratedPlace)));

			bounds.extend(iteratedPlace.marker.position); // Extends the map bounds to include each newly created marker
		}

		google.maps.event.addListener(infowindow, 'closeclick',function(){ // Adds a closeclick listener to the infowindow which deselects the selected marker
    		placesViewModel.blurMarker(selectedMarker);
	        selectedMarker = null;
		});

	    google.maps.event.addListenerOnce(map, 'idle', function(){
		    placesViewModel.mapLoading(false);
		    placesViewModel.visibleSideNav(true);
		    placesViewModel.searchBox_focus(true);
		    originalZoom = map.getZoom();
		    originalCenter =  map.getCenter();
		});

		map.fitBounds(bounds);
	    ko.applyBindings(placesViewModel);
	}

	function mapLoadingError() { // Handles a map loading error by displaying a message to which this boolean is bound
        placesViewModel.mapLoading(false);
		alert('Sorry. Unable to load the map. Check your connection and try again.');
    }

    // Keyboard shortcuts
	    document.addEventListener ("keydown", function (ev) {
		    if (ev.altKey  &&  ev.code === "KeyA") { // Ctrl + a -- Selects all filters
		        placesViewModel.checkAllFilters();
		    } else if (ev.altKey  &&  ev.code === "KeyC") { // Alt + c -- Closes side navigation panel
		        placesViewModel.closeNav();
		    } else if (ev.altKey  &&  ev.code === "KeyN") { // Alt + n -- Deselects all finters
		        placesViewModel.uncheckAllFilters();
		    } else if (ev.altKey  &&  ev.code === "KeyO") { // Alt + o -- Opens side navigation panel
		        placesViewModel.openNav();
		    } else if (ev.altKey  &&  ev.code === "KeyR") { // Alt + r -- Resets map zoom and center
		        resetMap();
		    } else if (ev.altKey  &&  ev.code === "KeyS") { // Alt + s -- Clears search box
		        placesViewModel.clearSearch();
		        placesViewModel.searchBox_focus(true);
		    } else if (ev.altKey  &&  ev.code === "KeyT") { // Alt + t -- Toggles visibility of filters sections
		        placesViewModel.toggleFilters();
		    }
		});
