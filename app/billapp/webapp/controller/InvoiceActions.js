sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (MessageBox, MessageToast) {
    "use strict";

    return {
        onGenerateInvoice: async function () {
            const oView = this.getView();
            const oContext = oView.getBindingContext();

            if (!oContext) {
                MessageBox.error("No invoice is currently selected.");
                return;
            }

            const oModel = oContext.getModel();
            let oAction;

            try {
                oView.setBusy(true);

                // Invoke the bound CAP action for the current invoice.
                oAction = oModel.bindContext(
                    oContext.getPath() + "/BillingService.generateInvoice(...)"
                );

                await oAction.execute();

                // Read the action result.
                const oResultContext = oAction.getBoundContext();
                const vResult = oResultContext?.getObject();

                const sBase64 =
                    typeof vResult === "string"
                        ? vResult
                        : vResult?.value;

                if (
                    typeof sBase64 !== "string" ||
                    sBase64.length === 0
                ) {
                    throw new Error(
                        "The server returned an empty PDF response."
                    );
                }

                // Decode Base64 into PDF bytes.
                const sBinary = window.atob(sBase64);
                const aBytes = new Uint8Array(sBinary.length);

                for (let i = 0; i < sBinary.length; i++) {
                    aBytes[i] = sBinary.charCodeAt(i);
                }

                const oBlob = new Blob([aBytes], {
                    type: "application/pdf"
                });

                const sUrl = URL.createObjectURL(oBlob);
                const oLink = document.createElement("a");

                const oInvoice = oContext.getObject();
                const sInvoiceNumber =
                    oInvoice.invoiceNumber ||
                    oInvoice.ID ||
                    "invoice";

                oLink.href = sUrl;
                oLink.download =
                    "Invoice-" + sInvoiceNumber + ".pdf";

                document.body.appendChild(oLink);
                oLink.click();
                oLink.remove();

                // Revoke after the browser has had time to start the download.
                window.setTimeout(function () {
                    URL.revokeObjectURL(sUrl);
                }, 1000);

                MessageToast.show("Invoice PDF download started.");
            } catch (oError) {
                console.error("Invoice PDF generation failed:", oError);

                MessageBox.error(
                    "Unable to download the invoice PDF.\n\n" +
                    (oError.message || "Check the browser console and server logs.")
                );
            } finally {
                oView.setBusy(false);
            }
        }
    };
});