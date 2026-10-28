const cds = require('@sap/cds');

async function recalculateProject(projectID) {

    const db = await cds.connect.to('db');

    // ----------------------------
    // 1. Get all tasks of project
    // ----------------------------
    const tasks = await SELECT.from(
        'psa.ProjectManagement.Tasks'
    )
    .columns('ID')
    .where({
        milestone_project_ID: projectID
    });

    // ----------------------------
    // 2. Update actual hours
    // ----------------------------
    for (const task of tasks) {

        const entries = await SELECT.from(
            'psa.TimeManagement.TimesheetEntries'
        )
        .columns('hours')
        .where({
            task_ID: task.ID
        });

        const totalHours =
            entries.reduce(
                (sum, e) => sum + Number(e.hours || 0),
                0
            );

        await UPDATE(
            'psa.ProjectManagement.Tasks'
        )
        .set({
            actualHours: totalHours
        })
        .where({
            ID: task.ID
        });
    }

    // ----------------------------
    // 3. Calculate Project Hours
    // ----------------------------
    const updatedTasks = await SELECT.from(
        'psa.ProjectManagement.Tasks'
    )
    .columns('actualHours')
    .where({
        milestone_project_ID: projectID
    });

    const projectHours =
        updatedTasks.reduce(
            (sum, t) => sum + Number(t.actualHours || 0),
            0
        );

    await UPDATE(
        'psa.ProjectManagement.Projects'
    )
    .set({
        consumedHours: projectHours
    })
    .where({
        ID: projectID
    });

    // ----------------------------
    // 4. Get Budget
    // ----------------------------
    const budget = await SELECT.one
        .from('psa.ProjectManagement.Budgets')
        .where({
            project_ID: projectID
        });

    if (!budget) return;

    // ----------------------------
    // 5. Billable Hours
    // ----------------------------
    const billableEntries =
        await SELECT.from(
            'psa.TimeManagement.TimesheetEntries'
        )
        .columns('hours')
        .where({
            isBillable: true
        });

    const billableHours =
        billableEntries.reduce(
            (sum, e) => sum + Number(e.hours || 0),
            0
        );

    const consumedAmt =
        billableHours *
        Number(budget.billingRateHr);

    const remainingAmt =
        Number(budget.budgetAmt) -
        consumedAmt;

    // ----------------------------
    // 6. Budget Status
    // ----------------------------
    const percentage =
        (consumedAmt /
            Number(budget.budgetAmt)) * 100;

    let budgetStatus = 'Within Budget';

    if (percentage >= 100) {
        budgetStatus = 'Breached';
    }
    else if (percentage >= 80) {
        budgetStatus = 'At Risk';
    }

    await UPDATE(
        'psa.ProjectManagement.Budgets'
    )
    .set({
        consumedAmt,
        remainingAmt,
        budgetStatus
    })
    .where({
        ID: budget.ID
    });
}

module.exports = {
    recalculateProject
};