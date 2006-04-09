/*
* 	AutoBrowse, automatically browsing the net
* 	Copyright (C) 2006 Jan Kechel
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
*
*	global variables: ab_prefs, initialized in function onLoad
*/

// Settings OK-Button
var AutoBrowseSettings =
{
	onSettingsOK: function()
	{
		ab_prefs.setCharPref("settings.searchurl", document.getElementById("ab-searchurl").value);
		ab_prefs.setCharPref("settings.searchforkeyword", document.getElementById("ab-searchforkeyword").value);
		ab_prefs.setCharPref("settings.frequency", document.getElementById("ab-frequency").value);
		ab_prefs.setCharPref("settings.stopwords", document.getElementById("ab-stopwords").value);
		ab_prefs.setCharPref("settings.yeswords", document.getElementById("ab-yeswords").value);
		ab_prefs.setCharPref("settings.topleveldomain", document.getElementById("ab-topleveldomain").value);
		return true;
	}, //onSettingsOK

	// Settings Cancel-Button
	onSettingsCancel: function()
	{
		return true;
	}, // onSettingsCancel

	// Settings-Dialog gets loaded
	onSettingsLoad: function()
	{
		ab_prefs = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefService).
			getBranch("extensions.autobrowse."); // this declares the global variable

		// Get the settings and insert em into the text-fields
		var searchurl = ab_prefs.getCharPref("settings.searchurl");
		var searchtextbox = document.getElementById("ab-searchurl");
		searchtextbox.value = searchurl;

		var searchf = ab_prefs.getCharPref("settings.searchforkeyword");
		var searchtfor = document.getElementById("ab-searchforkeyword");
		searchtfor.value = searchf;

		var searchfreq = ab_prefs.getCharPref("settings.frequency");
		var textfreq= document.getElementById("ab-frequency");
		textfreq.value = searchfreq;

		var stopwords = ab_prefs.getCharPref("settings.stopwords");
		var textstop = document.getElementById("ab-stopwords");
		textstop.value = stopwords;

		var yeswords = ab_prefs.getCharPref("settings.yeswords");
		var textyes = document.getElementById("ab-yeswords");
		textyes.value = yeswords;

		var topleveldomain = ab_prefs.getCharPref("settings.topleveldomain");
		var texttopleveldomain = document.getElementById("ab-topleveldomain");
		texttopleveldomain.value = topleveldomain;


	}, // onSettingsLoad

};


