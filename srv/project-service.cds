using { psa as db } from '../db/schema';

@(requires:'Manager')
service ProjectService {

    entity Projects as projection on db.ProjectManagement.Projects
    actions {
    action activateProject();
    action completeProject();
   
};
    @readonly
    //entity ProjectAnalytics as projection on db.ProjectManagement.Projects;
    entity Employees as projection on db.master.Employees;
    entity Budgets      as projection on db.ProjectManagement.Budgets;
    entity Milestones   as projection on db.ProjectManagement.Milestones;
    entity Tasks        as projection on db.ProjectManagement.Tasks;
    entity Invoices as projection on db.Billing.Invoices;
    entity Timesheets        as projection on db.TimeManagement.Timesheets
  
    actions{
        action approveTimesheet();
        action rejectTimesheet(reason : String);
    };
    
    entity TimesheetEntries  as projection on db.TimeManagement.TimesheetEntries;

    entity timestatuses as projection on db.timeStatuses;
    //action approveTimesheet(timesheetID : UUID);

   /* action rejectTimesheet(
        timesheetID : UUID,
        reason      : String
    );*/

   

    

}
