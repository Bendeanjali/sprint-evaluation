sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"psa/emp/employeeapp/test/integration/pages/EmployeeList.gen",
	"psa/emp/employeeapp/test/integration/pages/EmployeeObjectPage.gen"
], function (JourneyRunner, EmployeeListGenerated, EmployeeObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('psa/emp/employeeapp') + '/test/flp.html#app-preview',
        pages: {
			onTheEmployeeListGenerated: EmployeeListGenerated,
			onTheEmployeeObjectPageGenerated: EmployeeObjectPageGenerated
        },
        async: true
    });

    return runner;
});

