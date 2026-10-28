const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const { DashboardKPIs } = this.entities;

    this.on('READ', DashboardKPIs, async () => {

        const activeProjects = await SELECT.one
            `count(*) as count`
            .from('psa.ProjectManagement.Projects')
            .where({ status: 'Active' });

        const atRiskBudgets = await SELECT.one
            `count(*) as count`
            .from('psa.ProjectManagement.Budgets')
            .where({ status: 'AtRisk' });

        const pendingApprovals = await SELECT.one
            `count(*) as count`
            .from('psa.TimeManagement.Timesheets')
            .where({ status: 'Submitted' });

        const invoiceHours = await SELECT.one
            `sum(billableHours) as total`
            .from('psa.Billing.Invoices');

        return [{
            ID: 1,
            activeProjects: activeProjects.count || 0,
            atRiskBudgets: atRiskBudgets.count || 0,
            pendingApprovals: pendingApprovals.count || 0,
            unbilledHours: invoiceHours.total || 0
        }];
    });
});