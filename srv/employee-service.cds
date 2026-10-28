using { psa as db } from '../db/schema';
@(requires:'Employee')

service EmployeeService {
    @Capabilities.InsertRestrictions.Insertable : true
    @Capabilities.UpdateRestrictions.Updatable : true
    @Capabilities.DeleteRestrictions.Deletable : true
    entity Timesheets as projection on db.TimeManagement.Timesheets{
    *,
    case
        when status = 'Approved' then 3
        when status = 'Submitted' then 2
        when status = 'Rejected' then 1
        else 0
    end as statusCriticality : Integer}
    actions {
    action submitTimesheet();
};
     @Capabilities.DeleteRestrictions:{
        Deletable : false}
    entity Employee as projection on db.master.Employees actions {
    action createTimesheet();
};
    entity TimesheetEntries as projection on db.TimeManagement.TimesheetEntries;

     action createTimesheet(
        employeeID : UUID,
        weekStartDate : Date,
        weekEndDate : Date,
        hours           : Decimal(4,2)
    ) returns UUID;

    entity Tasks as projection on db.ProjectManagement.Tasks;
    entity Projects as projection on db.ProjectManagement.Projects;

    

    //action submitTimesheet(timesheetID : UUID);

}
