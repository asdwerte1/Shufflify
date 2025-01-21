# PlayList-Shuffler
An app to shuffle a given playlist into a random order - designed to combat the limited shuffle algorithm that Spotify has.

Ever noticed that the spotify shuffle algorithm always play the same songs over and over? Even on that huge playlist of yours? This is because the shuffle adds weight to songs you play more...which leads to hearing the same songs more.

Instead, the aim of this app will be to truely randomise the order of your playlists.

How?

Simply use the app to randomise the orde of the playlists if choice, ensure it is sorted by "Custom" in Spotify, then simply play from the top down!

## Changes:

* Simple version of app working - designed to run as a docker container on local network

## Current work:

* Separate front and back end - update front end to React
* Improve UX - aiming to reduce the number of new tab opens - this can happen quite a lot for large playlists as songs are done in blocks of 50
* Bug Fix - app does not funciton when deployed as Docker container but does when deployed directly - attempting to fix this however when updating to React also likely to change backend logic to node, this may remove issue (time will tell)
