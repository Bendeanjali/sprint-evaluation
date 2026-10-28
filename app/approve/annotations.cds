using ProjectService as service from '../../srv/project-service';

//using UI from '@sap/cds/common';

annotate service.Timesheets with @(

    UI.SelectionFields : [
        employee,
        status
    ],

    UI.LineItem : [

        {
            $Type : 'UI.DataField',
            Label : 'Employee',
            Value : employee.firstName
        },

        {
            $Type : 'UI.DataField',
            Label : 'Submitted Date',
            Value : submittedDate
        },

        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status
        },
        



        {
            $Type : 'UI.DataFieldForAction',
            Label : 'Approve',
            Action : 'ProjectService.approveTimesheet',
            Inline : true,
            ![@UI.Hidden] : {
                $edmJson : {
                    $If : [
                        { $Eq : [ { $Path : 'status' }, 'Submitted' ] },
                        false,
                        true
                    ]
                }
            }
        },

        {
            $Type : 'UI.DataFieldForAction',
            Label : 'Reject',
            Action : 'ProjectService.rejectTimesheet',
            Inline : true,
            ![@UI.Hidden] : {
                $edmJson : {
                    $If : [
                        { $Eq : [ { $Path : 'status' }, 'Submitted' ] },
                        false,
                        true
                    ]
                }
            }
        }
    ]
  
);

annotate service.Timesheets with {
    employee @Common.ValueList: {
        CollectionPath : 'Employees'
    };
};
/*annotate service.Timesheets with {
    employee_ID @(
        Common.ValueList : {
            CollectionPath : 'Employees',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : employee_ID,
                    ValueListProperty : 'ID'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'firstName'
                }
            ]
        }
    );
};*/


annotate service.Timesheets with {
    status @(
        Common.ValueList : {
            CollectionPath : 'timestatuses',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : status,
                    ValueListProperty : 'code'
                },
               /* {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'text'
                }*/
            ]
        }
    );
};

annotate service.Timesheets with {
    status @Common.ValueListWithFixedValues;
};