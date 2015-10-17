Milwaukee Police Calls for Service Scraper
===========================
The Milwaukee Police Department publishes a list of dispatched calls for service on the City of Milwaukee website in an effort to provide transparent data and policing. However, this is done using a software product that offers no APIs. This CasperJS script changes that, scraping the list of calls and transforming it to a JSON file. Also, it provides more friendly call descriptions and formats addresses. This is used by the Milwaukee DataHaus for processing and storing Milwaukee Police Calls for Service.

Technologies Used
-----------------
 - [PhantomJS](http://phantomjs.org/ "PhantomJS")
 - [CasperJS](http://casperjs.org/ "CasperJS")  (Provides Additional Functionality to PhantomJS)

Data Sets Used
---------
 - [Milwaukee Police Calls for Service](http://itmdapps.milwaukee.gov/MPDCallData/currentCADCalls/callsService.faces "Milwaukee Police Calls for Service")

License
---------
The Milwaukee DataHaus' public code is licensed using the MIT license, allowing for usage with attribution and no included warranty. See LICENSE for the full license text.