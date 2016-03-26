//Include Modules and Files
var casper = require('casper').create();
var fs = require('fs');
var system = require('system');
var replacements = require('call_replacements.json');

//File Path
var curFilePath = fs.absolute(system.args[3]).split('/');

if (curFilePath.length > 1) {
    curFilePath.pop();
    curFilePath = curFilePath.join('/');
}

//Title Case
String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

//Friendly Nature of Call Descriptions
var getFriendlyName = function(call) {
    if(replacements.hasOwnProperty(call)) {
        return replacements[call];
    }
    else {
        return call.toTitleCase();
    }
};

//Prepare Casper Tasks
casper.start('http://itmdapps.milwaukee.gov/MPDCallData/currentCADCalls/callsService.faces', function() {
    //Output Array
    var output = {
        meta: {
            last_updated: '',
            num_calls: ''
        },
        calls: []
    };
    //Get Data We Need for Meta and Paging
    this.echo("Beginning Data Collection...");
    output.meta.last_updated = this.fetchText('span[id="formId:updatedId"]');
    output.meta.num_calls = parseInt(this.fetchText('span[id="formId:textTotalCallId"]').substring(25));
    var pages = parseInt(this.fetchText('span[id="formId:tableExUpdateId:deluxe1__pagerText"]').substring(9));
    //Loop Through Pages and Scrape Data
    this.repeat(pages, function() {
        var callsForService = this.getElementsInfo('table[class="dataTableEx"] tbody tr[class^="rowClass"]');
        for (var i = 0; i < callsForService.length; i++) {
            var callInfo = callsForService[i].text.split('\n');
            var addressParts = callInfo[2].split(",");
            var tempCall = {};
            tempCall['call_number'] = parseInt(callInfo[0]);
            tempCall['date_time'] = callInfo[1];
            tempCall['address'] = addressParts[0].toTitleCase();
            if(addressParts[1] == "MKE" || addressParts[1] === undefined) {
                addressParts[1] = "Milwaukee";
            }
            else if(addressParts[1] == "WMW") {
                addressParts[1] = "West Milwaukee";
            }
            tempCall['city'] = addressParts[1].toTitleCase();
            tempCall['state'] = "WI";
            tempCall['police_district'] = parseInt(callInfo[3]);
            tempCall['nature_of_call'] = getFriendlyName(callInfo[4]);
            tempCall['status'] = callInfo[5].toTitleCase();
            output.calls.push(tempCall);
            this.echo("Collecting Information for Call " + tempCall['call_number']);
        }
        //Click to Go to The Next Page
        this.click('input[id="formId:tableExUpdateId:deluxe1__pagerNext"]');
    });
    //Write JSON File and End Tasks
    this.then(function() {
        fs.write(curFilePath + "/mpd_calls_for_service.json", JSON.stringify(output, null, 4), 'w');
    });
});

//Run Casper, Exit on Complete
casper.run(function() {
    this.echo("MPD Scrape Complete!");
    this.exit();
});