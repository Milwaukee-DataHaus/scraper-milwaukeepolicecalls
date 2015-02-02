//Include NodeJS Modules
var casper = require('casper').create();
var fs = require('fs');
//Title Case
String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
//Friendly Nature of Call
var getFriendlyName = function(call) {
    switch (call) {
        case 'ACC PDO':
            return 'Accident (Property Damange Only)'
        case 'ACC PI':
            return 'Accident (Person Injured)'
        case 'BATTERY DV':
            return 'Battery (Domestic Violence)'
        case 'WELFARE CHK':
            return 'Welfare Check'
        case 'SUSP PERS/AUTO':
            return 'Suspicious Person or Vehicle'
        case 'SUBJ WANTED':
            return 'Subject Wanted'
        case 'OAI/INTOX DRIVER':
            return 'Intoxicated Driver'
        case 'SUBJ STOP':
            return 'Subject Stopped'
        case 'TRBL W/SUBJ':
            return 'Trouble With Subject'
        case 'SUBJ DOWN':
            return 'Subject Down'
        case 'SUBJ W/WEAP':
            return 'Subject With a Weapon'
        case 'SUBJ W/GUN':
            return 'Subject With a Gun'
        case 'BUS INV':
            return 'Business Investigation'
        case 'SHOTSPOTTER':
            return 'ShotSpotter Alert'
        case 'VEHICLE MAINT':
            return 'Vehicle Maintenance'
        case 'LANDLORD/TEN TRB':
            return 'Landlord / Tenant Trouble'
        case 'RECK USE OF WEAP':
            return 'Reckless Use of Weapon'
        case 'LOUD MUSIC - RES':
            return 'Loud Music (Residence)'
        case 'LOUD MUSIC - VEH':
            return 'Loud Music (Vehicle)'
        case 'ACC UNK INJ':
            return 'Accident (Injuries Unknown)'
        case 'INJ/SICK PERS':
            return 'Injured/Sick Person'
        default:
            return call.toTitleCase();
    }
};
//Prepare Casper
casper.start('http://itmdapps.milwaukee.gov/MPDCallData/currentCADCalls/callsService.faces', function() {
    //Output Array
    var output = {
        meta: {
            last_updated: '',
            num_calls: ''
        },
        calls: []
    };
    this.echo("Beginning Scrape...");
    output.meta.last_updated = this.fetchText('span[id="formId:updatedId"]');
    output.meta.num_calls = parseInt(this.fetchText('span[id="formId:textTotalCallId"]').substring(25));
    var pages = Math.round(output.meta.num_calls / 20);
    this.repeat(pages, function() {
        var callsForService = this.getElementsInfo('table[class="dataTableEx"] tbody tr[class^="rowClass"]');
        for (var i = 0; i < callsForService.length; i++) {
            var callInfo = callsForService[i].text.split('\n');
            var tempCall = {};
            tempCall['call_number'] = parseInt(callInfo[0]);
            tempCall['date_time'] = callInfo[1];
            tempCall['location'] = callInfo[2].substring(0, callInfo[2].length - 4).toTitleCase();
            tempCall['police_district'] = parseInt(callInfo[3]);
            tempCall['nature_of_call'] = getFriendlyName(callInfo[4]);
            tempCall['status'] = callInfo[5];
            output.calls.push(tempCall);
            this.echo("Processing Call " + tempCall['call_number']);
            fs.write("mpd_calls_for_service.json", JSON.stringify(output, null, 4), 'w');
        }
        this.click('input[id="formId:tableExUpdateId:deluxe1__pagerNext"]');
    });
});
//Run Casper
casper.run();