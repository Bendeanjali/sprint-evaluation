/*using EmployeeService as service from '../../srv/employee-service';
annotate service.Employee with {
    reportingManager @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Employee',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : reportingManager_ID,
                ValueListProperty : 'ID',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'firstName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'lastName',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'email',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'phoneNo',
            },
        ],
    }
};*/
using EmployeeService as service from '../../srv/employee-service';

/* =====================================================
   VALUE HELP
===================================================== */
annotate service.Timesheets with @(
    UI.Identification : [

        {
            $Type : 'UI.DataFieldForAction',
            Action : 'EmployeeService.submitTimesheet',
            Label : 'Submit Timesheet',

            ![@UI.Hidden] : {
                $edmJson : {
                    $If : [
                        { $Eq : [ { $Path : 'status' }, 'Draft' ] },
                        false,
                        true
                    ]
                }
            }
        }

    ]
);
annotate service.Employee with {
    reportingManager @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Employee',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : reportingManager_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'firstName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'lastName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'email'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'phoneNo'
            }
        ]
    };
};

/* =====================================================
   LIST REPORT
===================================================== */

annotate service.Employee with @(
    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'First Name',
            Value : firstName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Last Name',
            Value : lastName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Email',
            Value : email
        },

        {
            $Type : 'UI.DataField',
            Label : 'Job Title',
            Value : jobTitle
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status


        }

    ]
);

/* =====================================================
   OBJECT PAGE HEADER
===================================================== */

annotate service.Employee with @(
    UI.HeaderInfo : {
        TypeName : 'Employee',
        TypeNamePlural : 'Employees',

        Title : {
            Value : firstName
        },

        Description : {
            Value : ID
        }
    }
);

/* =====================================================
   EMPLOYEE INFORMATION
===================================================== */

annotate service.Employee with @(
    UI.FieldGroup #EmployeeInfo : {
        Data : [

            {
                $Type : 'UI.DataField',
                Label : 'Employee ID',
                Value : ID
            },

            {
                $Type : 'UI.DataField',
                Label : 'First Name',
                Value : firstName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Last Name',
                Value : lastName
            },

            {
                $Type : 'UI.DataField',
                Label : 'Email',
                Value : email
            },

            {
                $Type : 'UI.DataField',
                Label : 'Phone',
                Value : phoneNo
            },

            {
                $Type : 'UI.DataField',
                Label : 'Job Title',
                Value : jobTitle
            },

            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status
            }

        ]
    }
);

/* =====================================================
   TIMESHEET TABLE
===================================================== */

annotate service.Timesheets with @(
    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Week Start',
            Value : weekStartDate
        },

        {
            $Type : 'UI.DataField',
            Label : 'Week End',
            Value : weekEndDate
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status,
            Criticality : statusCriticality,

        },

        {
            $Type : 'UI.DataField',
            Label : 'Hours',
            Value : totalBillableHours
        },
      /*  {
            $Type : 'UI.DataFieldForAction',
            Label : 'Submit',
            Action : 'EmployeeService.submitTimesheet',
            Inline : true,

            ![@UI.Hidden] : {
                $edmJson : {
                    $If : [
                        { $Eq : [ { $Path : 'status' }, 'Draft' ] },
                        false,
                        true
                    ]
                }
            }
        }*/
        {
    $Type : 'UI.DataFieldForAction',
    Label : 'Submit',
    Action : 'EmployeeService.submitTimesheet',
    Inline : true,

    ![@UI.Hidden] : {
        $edmJson : {
            $If : [
                { $Eq : [ { $Path : 'status' }, 'Draft' ] },
                false,
                true
            ]
        }
    }
}
 
    

    ]
);

/* =====================================================
   OBJECT PAGE FACETS
===================================================== */

annotate service.Employee with @(
    UI.Facets : [

        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Employee Information',
            Target : '@UI.FieldGroup#EmployeeInfo'
        },

        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Timesheet History',
            Target : 'timesheets/@UI.LineItem'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Assigned Tasks',
            Target : 'assignedTasks/@UI.LineItem'
        }

    ]
);

/* =====================================================
   CREATE TIMESHEET BUTTON
===================================================== */

annotate service.Employee with @(
    UI.Identification : [
        {
            $Type  : 'UI.DataFieldForAction',
            Action : 'EmployeeService.EntityContainer/createTimesheet',
            Label  : 'Create Timesheet'
        }
    ]
);


annotate service.Tasks with @(
    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Task',
            Value : taskName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status
        },

        {
            $Type : 'UI.DataField',
            Label : 'Estimated Hours',
            Value : estimatedHours
        },

        {
            $Type : 'UI.DataField',
            Label : 'Actual Hours',
            Value : actualHours
        }

    ]
);