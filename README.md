# opplive

A remote interface for live access to OMNeT++ simulations

Installation
============

The code provided in this repository was built to work with our existing
demo for openDSME. If you want to try out this configuration, checkout
the 'opplive' branch of our inet-dsme repository.

For more information on how to run the inet-dsme simulations check out
our web page at http://opendsme.org/. There we also provide a link to a
short tutorial series on openDSME.

After successful configuration, the script at
https://github.com/openDSME/inet-dsme/blob/opplive/simulations/live.sh
can be used to launch to run a set of OMNeT++ simulations ready to connect
to the live interface.

Running the Live Interface
==========================

If you use our openDSME example, you only have to configure the correct
host names in the index.html file and open it in a modern web browser.
The demo.html file is optimised for a vertical screen resolution of 3840
pixels and is therefore not recommended, to begin with.

Using this Code for Your Own Demo
=================================

Feel free to adapt and use this code in any of your own projects. If you
feel that your changes might provide benefit to other users, please
submit a pull request.

The interface is constructed from different widgets which can be found
in the `scripts` subfolder. Most of the use the *Autobahn.js* framework
to communicate with a running OMNeT++ simulation via the Web Application
Messaging Protocol (WAMP). These widgets are instanciated and configured
inside of a single '.html' file. All dependencies like *jQuery* and *ChartJS*
are provided from within this repository.

If you want to add or change functionality of this interface, you should
aim at adding or modifying widgets in the `scripts` directory.
