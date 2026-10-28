
using { psa as db } from '../db/schema';
@(requires:'Manager')

service ManagerDashboardService {
entity Projects as projection on db.ProjectManagement.Projects {
    ID,
    projectCode,
    projectName,
    description,
    billingType,
    startDate,
    endDate,
    status,
    priority,
    plannedHours,
    consumedHours
};
 entity Employees as projection on db.master.Employees {
        ID,
        firstName,
        lastName,
        email
    };
   // entity Clients as projection on db.master.Clients;
    entity Notifications
    as projection on db.Notifications;
    
    entity Budgets
        as projection on db.ProjectManagement.Budgets;

   


    @readonly
    entity DashboardKPIs {
        key ID : Integer;

        activeProjects   : Integer;
        atRiskBudgets    : Integer;
        pendingApprovals : Integer;
        unbilledHours    : Decimal(15,2);
    };

    @readonly
    @cds.redirection.target
    entity ProjectOverview as select from db.ProjectManagement.Projects as P {
        key P.ID,
        P.projectCode,
        P.projectName,
        P.billingType,
        P.status as projectStatus,
        P.consumedHours,
        P.client.clientName as  clientName,
        P.budget.status          as budgetStatus,
        P.budget.budgetAmt       as budgetAmount,
        P.budget.consumedAmt     as budgetConsumedAmount,
        P.budget.remainingAmt    as remainingAmount,
        P.budget.billingRateHr   as billingRatePerHour,
        P.budget. currencyCode as currencyCode

    };

  
    entity Milestones
        as projection on db.ProjectManagement.Milestones;

    
    entity Tasks
        as projection on db.ProjectManagement.Tasks;

    @readonly
    entity TimesheetApprovals
        as projection on db.TimeManagement.Timesheets;

    @readonly
    entity InvoiceOverview
        as projection on db.Billing.Invoices;
}