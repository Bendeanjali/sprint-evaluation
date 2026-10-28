const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { writeAuditLog } = require('./utils/audit');

    const { Projects, Budgets, Milestones, Tasks, Timesheets } = this.entities;
    const AuditLog = cds.entities('psa').AuditLog;
    this.before(['CREATE', 'UPDATE'], Projects, async (req) => {

        const { startDate, endDate } = req.data;

        if (startDate && endDate && startDate > endDate) {
            req.error('End Date must be greater than or equal to Start Date');
        }
    });

    this.before(['CREATE', 'UPDATE'], Budgets, async (req) => {

        const { budgetAmt } = req.data;

        if (budgetAmt <= 0) {
            req.error('Budget Amount must be greater than 0');
        }
    });

    this.before(['CREATE', 'UPDATE'], Milestones, async (req) => {

        const { startDate, endDate } = req.data;

        if (startDate && endDate && startDate > endDate) {
            req.error('Invalid Milestone Dates');
        }
    });

    this.before(['CREATE', 'UPDATE'], Tasks, async (req) => {

        const { estimatedHours } = req.data;

        if (estimatedHours <= 0) {
            req.error('Estimated Hours must be greater than 0');
        }
    });
    /*this.before('READ', 'Timesheets', req => {

    if (!req.query.SELECT.where) {
        req.query.SELECT.where = [];
    }

    req.query.SELECT.where.push(
        { ref: ['status'] },
        '=',
        { val: 'Submitted' }
    );

    req.query.where({
        status: { in: ['Submitted', 'Approved', 'Rejected'] }
    });

});*/

this.before('READ', 'Timesheets', (req) => {

    req.query.where({
        status: {
            in: [
                'Submitted',
                'Approved',
                'Rejected'
            ]
        }
    });

});
this.on('approveTimesheet',Timesheets, async req => {

    console.log('PARAMS:', req.params);
    const tx = cds.transaction(req);
    const ID = req.params[0].ID;

    const ts = await SELECT.one
        .from(Timesheets)
        .where({ ID });

    console.log('TIMESHEET:', ts);

    if (ts.status !== 'Submitted') {
        req.error(400,
            'Only submitted timesheets can be approved');
    }

    const oldTimesheet =
    await tx.run(
        SELECT.one
        .from(Timesheets)
        .where({ ID })
    );
    await UPDATE(Timesheets)
        .set({
            status: 'Approved',
            approvedDate: new Date()
        })
        .where({ ID });

    

    await writeAuditLog(
    tx,
    "Timesheet",
    ID,
    "APPROVE",
    oldTimesheet,
    {
        status: "Approved"
    },
    req.user?.id || "anonymous"
);
return {
        message: 'Timesheet Approved Successfully'
    };
    
});

    

    this.on('rejectTimesheet',Timesheets, async (req) => {

    const ID = req.params[0].ID;
    const { reason } = req.data;

    if (!reason) {
        req.error(400, 'Rejection reason is mandatory');
    }

    const result = await UPDATE(Timesheets)
        .set({
            status: 'Rejected',
            rejectionReason: reason
        })
        .where({ ID });

    return {
        updatedRows: result
    };
});

async function updateBudgetStatus(budgetID) {

    const budget = await SELECT.one
        .from('psa.ProjectManagement.Budgets')
        .where({ ID: budgetID });

    const percent =
        (budget.consumedAmt / budget.budgetAmt) * 100;

    let status = 'WithinBudget';

    if (percent >= 100) {
        status = 'Breached';
    }
    else if (percent >= 80) {
        status = 'AtRisk';
    }

    await UPDATE('psa.ProjectManagement.Budgets')
        .set({ status })
        .where({
            ID: budgetID
        });
}

this.on('activateProject', async (req) => {

    const ID = req.params[0].ID;

    await UPDATE(Projects)
        .set({
            status : 'Active'
        })
        .where({
            ID
        });

    return {
        message: 'Project Activated Successfully'
    };
});


this.on('completeProject', async (req) => {

    const ID = req.params[0].ID;

    await UPDATE(Projects)
        .set({
            status : 'Completed'
        })
        .where({
            ID
        });

    return {
        message: 'Project Completed Successfully'
    };
});




});