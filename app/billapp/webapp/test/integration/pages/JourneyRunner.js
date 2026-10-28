sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"psa/bill/billapp/test/integration/pages/InvoicesList.gen",
	"psa/bill/billapp/test/integration/pages/InvoicesObjectPage.gen"
], function (JourneyRunner, InvoicesListGenerated, InvoicesObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('psa/bill/billapp') + '/test/flp.html#app-preview',
        pages: {
			onTheInvoicesListGenerated: InvoicesListGenerated,
			onTheInvoicesObjectPageGenerated: InvoicesObjectPageGenerated
        },
        async: true
    });

    return runner;
});

