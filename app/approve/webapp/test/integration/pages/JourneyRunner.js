sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"psa/approve/approve/test/integration/pages/TimesheetsList.gen",
	"psa/approve/approve/test/integration/pages/TimesheetsObjectPage.gen"
], function (JourneyRunner, TimesheetsListGenerated, TimesheetsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('psa/approve/approve') + '/test/flp.html#app-preview',
        pages: {
			onTheTimesheetsListGenerated: TimesheetsListGenerated,
			onTheTimesheetsObjectPageGenerated: TimesheetsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

