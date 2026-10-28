using { psa as db } from '../db/schema';

@(requires:'Finance')

service BillingService {

    entity Invoices as projection on db.Billing.Invoices {
        *,
        project.projectName       as projectName,
        project.client.clientName as clientName,

        case
            when status = 'Paid'    then 3
            when status = 'Issued'  then 2
            when status = 'Overdue' then 1
            else 0
        end as statusCriticality : Integer
    } actions {
        action generateInvoice() returns LargeString;
        action issueInvoice();
        action markInvoicePaid(paymentDate : Date);
    };

    entity Milestones as projection on db.ProjectManagement.Milestones;

    entity Projects as projection on db.ProjectManagement.Projects;

    @cds.redirection.target
    entity Timesheets as projection on db.TimeManagement.Timesheets;

    entity Clients as projection on db.master.Clients {
        key ID,
        clientName
    };

    entity Invoicestatus as projection on db.InvoiceStatuses;

    @readonly
    entity ReadyToInvoice as
        select from db.TimeManagement.Timesheets {
            ID,
            employee,
            totalBillableHours,
            weekStartDate,
            weekEndDate,
            approvedDate,
            invoice,
            status
        }
        where status = 'Approved';
}