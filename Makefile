#
#	this file just packages the extension into an xpi-file
#
#	(c) 2005 Jan Kechel - GPL
#	22-NOV-2005
#
all:
	rm -rf build
	mkdir build
	cp src/chrome.manifest.xpi build/chrome.manifest
	cp src/install.rdf build
	mkdir build/defaults
	mkdir build/defaults/preferences
	cp src/defaults/preferences/*.js build/defaults/preferences
	mkdir build/chrome
	cd src; jar -cvf ../build/chrome/autobrowse.jar content/*.js content/*.xul skin/*.png  skin/*.css skin/*.txt locale/en-US/*
	cd build; zip -r ../autobrowse-0.8-fx+fl.xpi *

