using ManagerDashboardService from './manager-dashboard-service';

annotate ManagerDashboardService.ProjectOverview with @(

    UI.LineItem : [

        {
            Value : projectCode,
            Label : 'Project Code'
        },

        {
            Value : projectName,
            Label : 'Project Name'
        },

        {
            Value : billingType,
            Label : 'Billing Type'
        },

        {
            Value : consumedHours,
            Label : 'Consumed Hours'
        },

        {
            Value : status,
            Label : 'Status'
        }

    ]
);

annotate ManagerDashboardService.TimesheetApprovals with @(

    UI.LineItem : [

        {
            Value : employee_ID,
            Label : 'Employee'
        },

        {
            Value : weekStartDate,
            Label : 'Week Start'
        },

        {
            Value : weekEndDate,
            Label : 'Week End'
        },

        {
            Value : totalBillableHours,
            Label : 'Hours'
        },

        {
            Value : status,
            Label : 'Status'
        }

    ]
);

annotate ManagerDashboardService.InvoiceOverview with @(

    UI.LineItem : [

        {
            Value : invoiceNumber,
            Label : 'Invoice'
        },

        {
            Value : billableHours,
            Label : 'Hours'
        },

        {
            Value : totalAmt,
            Label : 'Amount'
        },

        {
            Value : status,
            Label : 'Status'
        }

    ]
);