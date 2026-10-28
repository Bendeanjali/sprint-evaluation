/*namespace psa;

using { cuid, managed } from '@sap/cds/common';

// MASTER DATA

type ProjectStatus : String enum {
    Draft;
    Active;
    OnHold;
    Completed;
    Cancelled;
}

type EmployeeRole : String enum {
    Employee;
    Manager;
    Finance;
    DeptHead;
    Admin;
}

type EmployeeStatus : String enum {
    Active;
    Inactive;
    OnLeave;
}

type ClientStatus : String enum {
    Active;
    Inactive;
    Prospect;
}

type InvoiceStatus : String enum {
    Draft;
    Issued;
    Paid;
    Overdue;
    Cancelled;
}

type DepartmentStatus : String enum {
    Active;
    Inactive;
}

type MilestoneStatus : String enum {
    NotStarted;
    InProgress;
    Completed;
    Delayed;
};

type TaskStatus : String enum {
    ToDo;
    InProgress;
    Done;
    Blocked;
};

type TimesheetStatus : String enum {
    Draft;
    Submitted;
    Approved;
    Rejected;
    Invoiced;
}

type BillingType : String enum {
    Fixed;
    TM;
    Retainer;
}

type PriorityType : String enum {
    Low;
    Medium;
    High;
    Critical;
}

type BudgetStatus : String enum {
    WithinBudget;
    AtRisk;
    Breached;
}

// MASTER DATA

context master {

    entity Clients : cuid, managed {

        clientName      : String(100) @assert.unique;
        contactPerson   : String(100);
        email           : String(100) @assert.unique;
        phoneNo         : String(20);
        address         : String(255);
        country         : String(3);
        industry        : String(50);

        status          : ClientStatus;

        projects : Association to many project.Projects
            on projects.client = $self;

       // invoices : Association to many billing.Invoices
         //   on invoices.client = $self;
    }

    entity Departments : cuid, managed {

        departmentName  : String(60) @assert.unique;
        description     : String(255);

        headOfDepartment : Association to Employees;

        status          : DepartmentStatus;

        employees : Association to many Employees
            on employees.department = $self;
    }

    entity Employees : cuid, managed {

        employeeNumber  : String(20) @assert.unique;

        firstName       : String(60);
        lastName        : String(60);

        email           : String(100) @assert.unique;
        phoneNo         : String(20);

        jobTitle        : String(60);

        role            : EmployeeRole;

        department      : Association to Departments;

        reportingManager : Association to Employees;

        joinDate        : Date;

        hourlyRate      : Decimal(15,2);

        status          : EmployeeStatus;

        timesheets : Association to many timesheet.Timesheets
            on timesheets.employee = $self;

        approvedTimesheets : Association to many timesheet.Timesheets
            on approvedTimesheets.approvedBy = $self;

        managedProjects : Association to many project.Projects
            on managedProjects.manager = $self;

        assignedTasks : Association to many project.Tasks
            on assignedTasks.assignedTo = $self;
    }
}


// PROJECT MANAGEMENT


context project {

    entity Projects : cuid, managed {

        client          : Association to master.Clients;

        manager         : Association to master.Employees;

        projectCode     : String(20) @assert.unique;

        projectName     : String(100);

        description     : String(500);

        billingType     : BillingType;

        startDate       : Date;

        endDate         : Date;

        status          : ProjectStatus;

        priority        : PriorityType;

        plannedHours    : Decimal(10,2);

        consumedHours   : Decimal(10,2);

        budget : Composition of one Budgets
            on budget.project = $self;

        milestones : Composition of many Milestones
            on milestones.project = $self;

        invoices : Association to many billing.Invoices
            on invoices.project = $self;
    }


    entity Budgets : cuid, managed {

        project         : Association to one Projects @assert.unique;

        budgetAmt       : Decimal(15,2);

        consumedAmt     : Decimal(15,2);

        remainingAmt    : Decimal(15,2);

        billingRateHr   : Decimal(15,2);

        currencyCode    : String(3);

        
        status          : BudgetStatus;
    }


    entity Milestones : cuid, managed {

        project             : Association to Projects;

        milestoneName       : String(100);

        description         : String(500);

        startDate           : Date;

        endDate             : Date;

        completionPercent   : Decimal(5,2);

        priority : PriorityType;
        
        status              : MilestoneStatus;

        tasks : Composition of many Tasks
            on tasks.milestone = $self;
    }


    entity Tasks : cuid, managed {

        milestone       : Association to Milestones;

        taskName        : String(100);

        description     : String(500);

        startDate       : Date;

        endDate         : Date;

        priority        : PriorityType;

        status          : TaskStatus;

        estimatedHours  : Decimal(10,2);

        actualHours     : Decimal(10,2);

        assignedTo       :Association to master.Employees;

        entries : Association to many timesheet.TimesheetEntries
            on entries.task = $self;
    }
}


// TIMESHEET


context timesheet {

    entity Timesheets : cuid, managed {

        employee            : Association to master.Employees;

        approvedBy          : Association to master.Employees;

        invoice             : Association to billing.Invoices;

        weekStartDate       : Date;

        weekEndDate         : Date;

        totalBillableHours  : Decimal(10,2);

        submittedDate       : Date;

        approvedDate        : Date;

        rejectionReason     : String(255);

        status              : TimesheetStatus;

        entries : Composition of many TimesheetEntries
            on entries.timesheet = $self;
    }


    entity TimesheetEntries : cuid, managed {

        timesheet       : Association to Timesheets;

        task            : Association to project.Tasks;

        workDate        : Date;

        hours           : Decimal(4,2);

        isBillable      : Boolean default true;

        notes           : String(255);

        //billingRate     :Decimal(15,2)
    }
}

// BILLING


context billing {

    entity Invoices : cuid, managed {

        invoiceNumber  : String(30) @assert.unique;

        
        //client         : Association to master.Clients;

        project        : Association to project.Projects;

        invoiceDate    : Date;

        dueDate        : Date;

        billableHours  : Decimal(10,2);

        totalAmt       : Decimal(15,2);

        taxAmt         : Decimal(15,2);

        currencyCode   : String(3);

        status : InvoiceStatus;

        //paymentStatus  : String(20);

        //status         : String(20);

        timesheets : Association to many timesheet.Timesheets
            on timesheets.invoice = $self;
    }
}*/
namespace psa;

using { cuid, managed } from '@sap/cds/common';

using {psa.common as common} from './common';

// MASTER DATA
context master {
    @odata.draft.enabled
    entity Clients : cuid, managed {

        clientName      : common.string100 @assert.unique;
        contactPerson   : common.string100;
        email           : common.string100 @assert.unique;
        phoneNo         : common.string20;
        address         : common.string255;
        country         : common.string20;
        industry        : common.string50;
        status          : common.ClientStatus;
        projects : Association to many ProjectManagement.Projects
            on projects.client = $self;
    }
    entity Departments : cuid, managed {

        departmentName   : common.string60 @assert.unique;
        description      : String(255);
        status           : common.DepartmentStatus;
        employees : Association to many Employees
            on employees.department = $self;
    }
    entity Employees : cuid, managed {
        //employeeNumber   : String(20) @assert.unique;
        firstName        : common.string60;
        lastName         : common.string60;
        email            : common.string100 @assert.unique;
        phoneNo          : common.string20;
        jobTitle         : String(60);
        role             : common.EmployeeRole;
        department       : Association to Departments;
        reportingManager : Association to Employees;
        joinDate         : Date;
        hourlyRate       : Decimal(15,2);
        status           : common.EmployeeStatus;
        timesheets : Association to many TimeManagement.Timesheets
            on timesheets.employee = $self;
        approvedTimesheets : Association to many TimeManagement.Timesheets
            on approvedTimesheets.approvedBy = $self;
        managedProjects : Association to many ProjectManagement.Projects
            on managedProjects.manager = $self;
        assignedTasks : Association to many ProjectManagement.Tasks
            on assignedTasks.assignedTo = $self;
    }
}

// PROJECT MANAGEMENT
context ProjectManagement {
    entity Projects : cuid, managed {
        client          : Association to master.Clients;
        manager         : Association to master.Employees;
        projectCode     : common.string20 @assert.unique;
        projectName     : common.string100;
        description     : common.String500;
        billingType     : common.BillingType;
        startDate       : Date;
        endDate         : Date;
        status          : common.ProjectStatus;
        priority        : common.PriorityType;
        plannedHours    : Decimal(10,2);
        consumedHours   : Decimal(10,2) default 0;
         budget : Association to one Budgets
        on budget.project = $self;

        milestones : Association to many Milestones
        on milestones.project = $self;
        invoices : Association to many Billing.Invoices
            on invoices.project = $self;
    }
    entity Budgets : cuid, managed {
        project         : Association to one Projects @assert.unique;
        budgetAmt       : Decimal(15,2);
        consumedAmt     : Decimal(15,2) default 0;
        remainingAmt    : Decimal(15,2) default 0;
        billingRateHr   : Decimal(15,2);
        currencyCode    : common.string3;
        status          : common.BudgetStatus;
    }
    entity Milestones : cuid, managed {
        project             : Association to Projects;
        milestoneName       : common.string100;
        //description         : String(500);
        startDate           : Date;
        endDate             : Date;
        completionPercent   : Decimal(5,2);
        priority            : common.PriorityType;
        status              : common.MilestoneStatus;
        tasks : Association to many Tasks
            on tasks.milestone = $self;
    }
    entity Tasks : cuid, managed {
        milestone       : Association to Milestones;
        taskName        : common.string100;
        description     : common.String500;
        startDate       : Date;
        endDate         : Date;
        priority        : common.PriorityType;
        status          : common.TaskStatus;
        estimatedHours  : Decimal(10,2);
        actualHours     : Decimal(10,2) default 0;
        assignedTo      : Association to master.Employees;
        entries : Association to many TimeManagement.TimesheetEntries
            on entries.task = $self;
    }
}
// TIMESHEET
context TimeManagement {
    entity Timesheets : cuid, managed {
        employee            : Association to master.Employees;
        approvedBy          : Association to master.Employees;
        invoice             : Association to Billing.Invoices;
        weekStartDate       : Date;
        weekEndDate         : Date;
        totalBillableHours  : Decimal(10,2);
        submittedDate       : Date;
        approvedDate        : Date;
        rejectionReason     : common.string255;
        status              : common.TimesheetStatus;
        entries : Association to many TimesheetEntries
            on entries.timesheet = $self;
    }
    entity TimesheetEntries : cuid, managed {
        timesheet       : Association to Timesheets;
        task            : Association to ProjectManagement.Tasks;
        workDate        : Date;
        hours           : Decimal(4,2);
        isBillable      : Boolean default true;
        notes           : common.string255;
    }
}
// BILLING
context Billing {
    entity Invoices : cuid, managed {
        invoiceNumber  : String(30) @assert.unique;
        project        : Association to ProjectManagement.Projects;
        invoiceDate    : Date;
        dueDate        : Date;
        billableHours  : Decimal(10,2);
        totalAmt       : Decimal(15,2);
        taxAmt         : Decimal(15,2);
        currencyCode   : common.string3;
        status         : common.InvoiceStatus;
        timesheets : Association to many TimeManagement.Timesheets
            on timesheets.invoice = $self;
    }
}

entity timeStatuses {
    key code : String(20);
    text     : String(50);
}


entity Notifications : cuid, managed {
    title       : String(100);
    description : String(500);
    type        : String(20);
    threshold   : Integer;
    isRead      : Boolean default false;
    project     : Association to ProjectManagement.Projects;
}


entity AuditLog : managed {

    key ID : UUID;

    entityName : String(100);

    entityId : UUID;

    action : String(30);

    oldValue : LargeString;

    newValue : LargeString;

    userId : String(100);

}

entity InvoiceStatuses {
key code : String(20);
text : String(50);
}