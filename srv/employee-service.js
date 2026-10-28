const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {  
    

   // return super.init();
    const { writeAuditLog } =
    require('./utils/audit');
    const { Timesheets, TimesheetEntries } = this.entities;
    const Notifications = cds.entities['psa.Notifications'];

    const Tasks = cds.entities['EmployeeService.Tasks'];
    const Projects = cds.entities['EmployeeService.Projects'];
    const Milestones = cds.entities['psa.ProjectManagement.Milestones'];
    const Budgets = cds.entities['psa.ProjectManagement.Budgets'];
   
this.on('createTimesheet', async req => {

    const {
        employeeID,
        weekStartDate,
        weekEndDate,
        hours
    } = req.data;

    const tx = cds.transaction(req);

    const result = await tx.run(
        INSERT.into('EmployeeService.Timesheets')
        .entries({
            employee_ID: employeeID,
            weekStartDate,
            weekEndDate,
            status: 'Draft',
            totalBillableHours: hours
          
        })
    );

    return result.ID;
});




    this.on('submitTimesheet', Timesheets, async (req) => {

    const tx = cds.transaction(req);
    const timesheetId = req.params[1].ID;

    const timesheet = await tx.run(
        SELECT.one.from(Timesheets)
        .where({ ID: timesheetId })
    );

    if (!timesheet) {
        return req.error(404, 'Timesheet not found');
    }

    await tx.run(
        UPDATE(Timesheets)
        .set({
            status: 'Submitted',
            submittedDate: new Date()
        })
        .where({ ID: timesheetId })
    );
   
    const oTimesheet = await tx.run(
    SELECT.one.from(Timesheets)
    .where({ ID: timesheetId })
    .columns(
        t => {
            t.totalBillableHours;
        }
    )
);

console.log(
    "Billable Hours:",
    oTimesheet.totalBillableHours
);
const billableHours =
    Number(oTimesheet.totalBillableHours || 0);

// For demo take first budget
const budget = await tx.run(
    SELECT.one.from(Budgets)
);

if (budget) {

    const additionalAmount =
        billableHours *
        Number(budget.billingRateHr);

    const newConsumedAmt =
        Number(budget.consumedAmt || 0) +
        additionalAmount;

    const remainingAmt =
        Number(budget.budgetAmt) -
        newConsumedAmt;

    const percentage =
        (newConsumedAmt /
        Number(budget.budgetAmt)) * 100;

    let status = "Within Budget";

    if (percentage >= 100) {
        status = "Breached";
    } else if (percentage >= 80) {
        status = "At Risk";
    }

    await tx.run(
        UPDATE(Budgets)
        .set({
            consumedAmt: newConsumedAmt,
            remainingAmt: remainingAmt,
            status: status
        })
        .where({
            ID: budget.ID
        })
    );

    console.log(
        "Budget %",
        percentage
    );

    if (percentage >= 75 && percentage < 90) {

    await tx.run(
        INSERT.into(Notifications).entries({
            title: "Budget Alert",
            description: "Budget crossed 75%",
            type: "Warning",
            threshold: 75
        })
    );

    console.log("75% Alert Created");
}

if (percentage >= 90 && percentage < 100) {

    await tx.run(
        INSERT.into(Notifications).entries({
            title: "Budget Alert",
            description: "Budget crossed 90%",
            type: "Warning",
            threshold: 90
        })
    );

    console.log("90% Alert Created");
}

if (percentage >= 100) {

    await tx.run(
        INSERT.into(Notifications).entries({
            title: "Budget Breached",
            description: "Budget crossed 100%",
            type: "Error",
            threshold: 100
        })
    );

    console.log("100% Alert Created");
}}

return {
    message: 'Timesheet submitted successfully'
};
   
    

    
});

});