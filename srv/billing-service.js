const cds = require("@sap/cds");
const PDFDocument = require("pdfkit");

const { SELECT, UPDATE } = cds.ql;

module.exports = cds.service.impl(async function () {
    const { Invoices } = this.entities;

    /*
     * Generate and download the selected invoice as a PDF.
     * The invoice record is read only; no accounting data is changed.
     */
    this.on("generateInvoice", "Invoices", async (req) => {
        const invoiceID = req.params?.[0]?.ID;

        if (!invoiceID) {
            return req.reject(400, "Could not identify the selected invoice.");
        }

        const invoice = await SELECT.one
            .from(Invoices)
            .where({ ID: invoiceID });

        if (!invoice) {
            return req.reject(404, "Invoice not found.");
        }

        const pdfBuffer = await createInvoicePdf(invoice);

        // The UI decodes this Base64 string and downloads the PDF.
        return pdfBuffer.toString("base64");
    });

    /*
     * Issue Invoice:
     * Only Draft invoices can be issued.
     */
    this.on("issueInvoice", "Invoices", async (req) => {
        const invoiceID = req.params?.[0]?.ID;

        if (!invoiceID) {
            return req.reject(400, "Could not identify the selected invoice.");
        }

        const invoice = await SELECT.one
            .from(Invoices)
            .where({ ID: invoiceID });

        if (!invoice) {
            return req.reject(404, "Invoice not found.");
        }

        if (invoice.status !== "Draft") {
            return req.reject(400, "Only Draft invoices can be issued.");
        }

        await UPDATE(Invoices)
            .set({ status: "Issued" })
            .where({ ID: invoiceID });

        return;
    });

    /*
     * Mark Invoice Paid:
     * Only Issued invoices can be marked as Paid.
     *
     * paymentDate is saved only if the database actually has
     * a paymentDate field.
     */
    this.on("markInvoicePaid", "Invoices", async (req) => {
        const invoiceID = req.params?.[0]?.ID;
        const { paymentDate } = req.data;

        if (!invoiceID) {
            return req.reject(400, "Could not identify the selected invoice.");
        }

        const invoice = await SELECT.one
            .from(Invoices)
            .where({ ID: invoiceID });

        if (!invoice) {
            return req.reject(404, "Invoice not found.");
        }

        if (invoice.status !== "Issued") {
            return req.reject(400, "Only Issued invoices can be marked as Paid.");
        }

        const updateData = {
            status: "Paid"
        };

        if (paymentDate && Invoices.elements?.paymentDate) {
            updateData.paymentDate = paymentDate;
        }

        await UPDATE(Invoices)
            .set(updateData)
            .where({ ID: invoiceID });

        return;
    });
});


/*
 * Creates a professional one-page invoice PDF.
 *
 * Field names such as invoiceNumber, billableHours, totalAmt,
 * invoiceDate, dueDate, clientName and projectName should match
 * the fields exposed by your BillingService.Invoices projection.
 */
function createInvoicePdf(invoice) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margins: {
                top: 48,
                bottom: 48,
                left: 52,
                right: 52
            },
            info: {
                Title: `Invoice ${invoice.invoiceNumber || invoice.ID}`,
                Author: "Billing Service",
                Subject: "Customer invoice"
            }
        });

        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const pageWidth = 491;
        const invoiceNumber = invoice.invoiceNumber || invoice.ID || "N/A";
        const invoiceDate = formatDate(invoice.invoiceDate);
        const dueDate = formatDate(invoice.dueDate);
        const clientName = invoice.clientName || "Client not specified";
        const projectName = invoice.projectName || "Project not specified";
        const status = invoice.status || "Unknown";

        const hours = Number(invoice.billableHours || 0);
        const total = Number(invoice.totalAmt || 0);
        const hourlyRate = hours > 0 ? total / hours : 0;

        const money = (value) =>
            "INR " + Number(value || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        // Heading
        doc
            .font("Helvetica-Bold")
            .fontSize(25)
            .text("INVOICE", 52, 48);

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#555555")
            .text("Billing statement", 52, 80);

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#222222")
            .text(`Invoice No: ${invoiceNumber}`, 330, 54, {
                width: 210,
                align: "right"
            });

        doc
            .font("Helvetica")
            .fontSize(10)
            .text(`Invoice Date: ${invoiceDate}`, 330, 73, {
                width: 210,
                align: "right"
            });

        doc
            .text(`Due Date: ${dueDate}`, 330, 90, {
                width: 210,
                align: "right"
            });

        doc
            .moveTo(52, 120)
            .lineTo(543, 120)
            .lineWidth(1)
            .strokeColor("#B8B8B8")
            .stroke();

        // Bill-to and project details
        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#222222")
            .text("BILL TO", 52, 143);

        doc
            .font("Helvetica")
            .fontSize(11)
            .text(clientName, 52, 163, {
                width: 220
            });

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .text("PROJECT", 320, 143);

        doc
            .font("Helvetica")
            .fontSize(11)
            .text(projectName, 320, 163, {
                width: 220
            });

        // Status
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("Invoice Status:", 52, 211);

        doc
            .font("Helvetica")
            .text(status, 145, 211);

        // Billing table
        const tableTop = 253;
        const col = {
            description: 52,
            hours: 330,
            rate: 405,
            amount: 480
        };

        doc
            .rect(52, tableTop, pageWidth, 30)
            .fill("#F0F2F5");

        doc
            .fillColor("#222222")
            .font("Helvetica-Bold")
            .fontSize(9)
            .text("Description", col.description + 8, tableTop + 10)
            .text("Hours", col.hours, tableTop + 10, {
                width: 50,
                align: "right"
            })
            .text("Rate", col.rate, tableTop + 10, {
                width: 55,
                align: "right"
            })
            .text("Amount", col.amount, tableTop + 10, {
                width: 55,
                align: "right"
            });

        const rowY = tableTop + 43;

        doc
            .font("Helvetica")
            .fontSize(10)
            .text("Billable project services", col.description + 8, rowY, {
                width: 245
            })
            .text(hours.toFixed(2), col.hours, rowY, {
                width: 50,
                align: "right"
            })
            .text(money(hourlyRate), col.rate - 10, rowY, {
                width: 65,
                align: "right"
            })
            .text(money(total), col.amount - 10, rowY, {
                width: 65,
                align: "right"
            });

        doc
            .moveTo(52, rowY + 30)
            .lineTo(543, rowY + 30)
            .lineWidth(0.5)
            .strokeColor("#D0D0D0")
            .stroke();

        // Total
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .text("Total Amount Due", 300, rowY + 56, {
                width: 135,
                align: "right"
            })
            .fontSize(14)
            .text(money(total), 440, rowY + 54, {
                width: 103,
                align: "right"
            });

        // Payment information
        const paymentY = rowY + 105;

        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .text("Payment Information", 52, paymentY);

        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#555555")
            .text(
                status === "Paid"
                    ? "This invoice is marked as paid."
                    : "Please arrange payment by the due date shown above.",
                52,
                paymentY + 20,
                { width: 490 }
            );

        // Footer
        doc
            .moveTo(52, 735)
            .lineTo(543, 735)
            .strokeColor("#B8B8B8")
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#666666")
            .text(
                "Thank you for your business.",
                52,
                749,
                { width: 491, align: "center" }
            );

        doc.end();
    });
}


function formatDate(value) {
    if (!value) {
        return "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}