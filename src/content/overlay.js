/*
*	AutoBrowse, automatically browsing the net - enjoy :)
*	Copyright (C) 2006 Jan Kechel
*
*	This program is free software; you can redistribute it and/or
*	modify it under the terms of the GNU General Public License
*	as published by the Free Software Foundation; either version 2
*	of the License, or (at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program; if not, write to the Free Software
*	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*
*/

var AutoBrowse = 
{
	// Initialisierung
	onLoad: function() 
	{
		// nur beim starten des browsers einmal
		if( this.initialized != true)
		{
			// ok, also nur einmal
			this.initialized = true;


			// Hole Preferences Server
			// Get the root branch
			ab_prefs = Components.classes["@mozilla.org/preferences-service;1"].
				getService(Components.interfaces.nsIPrefBranch).
				getBranch("extensions.autobrowse.");

				running = false;
			}

	}, // onLoad


	onSettings: function()
	{
		var setdiag = window.openDialog("chrome://autobrowse/content/settings.xul", "AutoBrowse preferences", "chrome,centerscreen,modal");
		setdiag.focus();

	}, // onSettings

	onLicense: function()
	{
		var setdiag = window.openDialog("chrome://autobrowse/content/license.xul", "AutoBrowse License", "chrome,centerscreen,modal");
		setdiag.focus();

	}, // onSettings


	onStart: function(event)
	{
		running = true;
		urllist = new Array();
		visitedlist = new Array();

		pref_searchfor = ab_prefs.getCharPref("settings.searchforkeyword");
		pref_frequency = ab_prefs.getCharPref("settings.frequency");
		pref_stopwords = ab_prefs.getCharPref("settings.stopwords");
		pref_yeswords = ab_prefs.getCharPref("settings.yeswords");
		pref_topleveldomain = ab_prefs.getCharPref("settings.topleveldomain");


		AutoBrowse.myExternSearch(pref_searchfor);
	}, // onStart

	onStop: function(event)
	{
		running = false;
	}, // onStop

	myExternSearch: function(search)
	{
		var pref_searchurl = ab_prefs.getCharPref("settings.searchurl");
		

		externurl = pref_searchurl + search + " " + Math.round(9*Math.random());
		externurlindex = 0;
		urllist.push(externurl);

		// Request erstellen (globale variable)
		xmlhttpext = new XMLHttpRequest();
		// Callback Registrieren wenn der Server fertig ist
		xmlhttpext.onreadystatechange = AutoBrowse.onExternSearchFinished;
		// Request methode, url und asyncron (true/false) definieren
		xmlhttpext.open("GET", externurl, true); 
		// Request senden
		xmlhttpext.send(null);
	}, // myExternSearch

	// Externe suche beendet
	onExternSearchFinished: function()
	{
		/*
		readonly PRInt32 readyState
		The state of the request.
		Possible values: 
		0 UNINITIALIZED open() has not been called yet. 
		1 LOADING send() has not been called yet. 
		2 LOADED send() has been called, headers and status are available. 
		3 INTERACTIVE Downloading, responseText holds the partial data. 
		4 COMPLETED Finished with all operations.
		*/

		if( xmlhttpext.readyState == 2) 
		{
			var ab_regmime = new RegExp("text/html", "gim");
			if( xmlhttpext.getResponseHeader("Content-Type"))
			{
				if( xmlhttpext.getResponseHeader("Content-Type").match(ab_regmime))
				{
					content.location = externurl;
					return;
				}
			}
			xmlhttpext.abort();
			//alert(xmlhttpext.getResponseHeader("Content-Type") + " from " + externurl + " - " + urllist[externurlindex]);
			urllist.splice(externurlindex, 1); // delete this bad link from list
			AutoBrowse.newRequest();
		}

		if( xmlhttpext.readyState == 4) 
		{
			
			// init next load after x secs ;-)
			if( running == true)
			{
				setTimeout("AutoBrowse.newRequest()", 1000 * pref_frequency);
			}

			// determine current base url (e.g. 'google.de')
			base = /(https?:\/\/.*?\/)/.exec(externurl)[0];

			var result = xmlhttpext.responseText;

			// check for stopwords and yeswords
			var ab_stop = false;
			var ab_yes = false;

			if( pref_stopwords.length > 0)
			{
				var stoparray = pref_stopwords.split(/[^A-Za-z0-9]+/);
				for( var s = 0; s < stoparray.length; s++)
				{
					var regstop = new RegExp(stoparray[s], "gim");
					if( result.match(regstop))
					{
						ab_stop = true;
						s = stoparray.length; // break
					}
				}
			}
			if( pref_yeswords.length > 0)
			{
				var yesarray = pref_yeswords.split(/[^A-Za-z0-9]+/);
				for( var y = 0; y < yesarray.length; y++)
				{
					var regyes = new RegExp(yesarray[y], "gim");
					if( result.match(regyes))
					{
						ab_yes = true;
						y = yesarray.length; // break
					}
				}
			}
			if( !ab_stop && ab_yes)
			{
				// search all urls on page
				var urls = result.match(/href="http:\/\/[\w]+[\.\w+]+[^<\s"]*/g);

				// add new urls to urllist
				if( urls)
				{
					//alert('adding max ' + urls.length + ' links to list of ' + urllist.length);
					var max_count = 100;
					if( urls.length < max_count)
					{
						max_count = urls.length;
					}
					for( var i = 0; i < max_count; i++)
					{
						if( urls[i])
						{
							var baseurl = /.*https?:\/\/(\w+\.\w+)\/.*/.exec(urls[i]);
							if( !baseurl)
							{
								baseurl = /.*https?:\/\/[\w\.]*\.(\w+\.\w+)\/.*/.exec(urls[i]);
							}

							if( baseurl)
							{
								// first check if link is extern, only add if extern
								var matchurl = "/.*"+baseurl[1]+".*/";
								if(! externurl.match(matchurl))
								{
									//alert('extern link found');

									// then check if domain is on settings-list
									var ab_domainarray = pref_topleveldomain.split(/[^A-Za-z0-9\.]+/);
									var ab_isindomainlist = false;
									for( var d = 0; d < ab_domainarray.length; d++)
									{
										var ab_regdom = new RegExp(ab_domainarray[d], "i");
										//alert(" baseurl '" + baseurl[1] + "'\n reg '" + ab_regdom + "'\n ab_domainarray '" + ab_domainarray[d] + "'");
										if( baseurl[1].match(ab_regdom))
										{
											ab_isindomainlist = true;
											d = ab_domainarray.length; // break
										}
									}

									if( ab_isindomainlist)
									{
										var baseurlalreadyinlist = false;
										// then check if already in list
										for( var j = (urllist.length-1); j >= 0; j--) 
										{
											if( urllist)
											{
												if( urllist[j])
												{
													if( urllist[j].match(matchurl))
													{
														baseurlalreadyinlist = true;
													}
												}
											}
										}
									
										if( baseurlalreadyinlist == false)
										{
											if( urls[i].match(/http.*/))
											{
												urllist.push(urls[i].match(/http.*/)[0]);
											//	alert('added: ' + urls[i].match(/http.*/)[0]);
											}
										}
									} // is in domainlist
								} // if external link
							} // if baseurl
						} // if urls
					} // foreach url
				} // if urls
			} // if contains no stopword and if contains yesword
			
			
			if( visitedlist.length > 30)
			{
				visitedlist.splice(0,15);
			}
			if( urllist.length > 100)
			{
				urllist.splice(0,30);
			}
		}

	}, // onExternSearchFinished

	// selects randomly one link from the urllist and starts a corresponding request
	newRequest: function()
	{
		// now determine random-link
		var f = false;
		var count = 0;
		while( f == false )
		{ 	externurlindex = Math.round((urllist.length-1)*Math.random())
			f = true;

			// check if shortly visited
			for( var k = 0; k < visitedlist.length; k++)
			{
				if( visitedlist[k] == urllist[externurlindex])
				{	f = false; // try again
				}
			}
			count++;
			if( count > 20)
			{
				//alert('delete history');
				visitedlist.splice(0, visitedlist.length); // empty complete history
			}
		}

		externurl = urllist[externurlindex]; // remember current url

		// seite laden
		visitedlist.push(externurl);
		//alert(urls[i]);

		// Request erstellen (globale variable)
		xmlhttpext = new XMLHttpRequest();
		// Callback Registrieren wenn der Server fertig ist
		xmlhttpext.onreadystatechange = AutoBrowse.onExternSearchFinished;
		// Request methode, url und asyncron (true/false) definieren
		xmlhttpext.open("GET", externurl, true); 
		// Request senden
		xmlhttpext.send(null);
	} // newRequest
}; // AutoBrowse

// Window-Listener (einmalig initalisierung, dann aktualisierung der URL)
window.addEventListener(
	"focus", 
	function(e) 
	{ 
		AutoBrowse.onLoad(e); 
	}, 
	true); 


// EOF
