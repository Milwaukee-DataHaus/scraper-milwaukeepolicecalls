//Include Modules
var casper = require('casper').create();
var fs = require('fs');
//Title Case
String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
//Friendly Nature of Call Descriptions
var getFriendlyName = function(call) {
    switch (call) {
        case 'ACC PDO':
            return 'Accident (Property Damange Only)'
        case 'ACC PI':
            return 'Accident (Injuries)'
        case 'BATTERY DV':
            return 'Battery (Domestic Violence)'
        case 'WELFARE CHK':
            return 'Welfare Check'
        case 'SUSP PERS/AUTO':
            return 'Suspicious Person in Vehicle'
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
            return 'ShotSpotter'
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
        case 'LOUD MUSIC - OTH':
            return 'Loud Music (Other)'
        case 'ACC UNK INJ':
            return 'Accident (Injuries Unknown)'
        case 'ACC PI HWY':
            return 'Accident on Highway (Injuries)'
        case 'ACC UNK INJ HWY':
            return 'Accident on Highway (Injuries Unknown)'
        case 'INJ/SICK PERS':
            return 'Injured/Sick Person'
        case 'HOSP GUARD':
            return 'Hospital Guard'
        case 'PRISONER TRANS':
            return 'Prisoner Transport'
        case 'REPORTS STATION':
            return 'Report to Station'
        case 'RETURN STATION':
            return 'Return to Station'
        case 'SPECIAL ASSIGN':
            return 'Special Assignment'
        case 'VIOL REST ORDER':
            return 'Restraining Order Violation'
        case 'CRUELTY ANIMAL':
            return 'Animal Cruelty'
        case 'ROBBERY ARMED':
            return 'Armed Robbery'
        case 'TS TARGETED':
            return 'Traffic Stop'
        case 'ROBBERY ST ARM':
            return 'Strong-Armed Robbery'
        case 'THEFT VEHICLE':
            return 'Stolen Vehicle'
        case 'IND EXPOSURE':
            return 'Indecent Exposure'
        case 'MEET PD/OTHER':
            return 'Other'
        case 'PROBATION/PAROLE':
            return 'Probation/Parole'
        case 'VACANT HOUSE CHK':
            return 'Vacant House Check'
        case 'TRBL W/JUV':
            return 'Trouble With Juvenile'
        case 'BOAT_STOP':
            return 'Boat Stop'
        case 'COMMUNITY MTNG':
            return 'Community Meeting'
        case 'MED RUN':
            return 'Medical Run'
        case 'ABAND PROPERTY':
            return 'Abandoned Property'
        case 'SCHL PRESENTATIO':
            return 'School Presentation'
        case 'SCHL MONITORING':
            return 'School Monitoring'
        case 'SCHL PRESENTATIO':
            return 'School Presentation'
        default:
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
        fs.write("/datahaus/mpd_calls_for_service/mpd_calls_for_service.json", JSON.stringify(output, null, 4), 'w');
        this.echo("Data Collection Complete!");
    });
});
//Run Casper
casper.run();