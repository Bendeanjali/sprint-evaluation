using BillingService as service from '../../srv/billing-service';

annotate service.Invoices with @(
    UI.HeaderInfo : {
        TypeName       : 'Invoice',
        TypeNamePlural : 'Invoices',
        Title : {
            $Type : 'UI.DataField',
            Value : ID
        },
        Description : {
            $Type : 'UI.DataField',
            Value : clientName
        }
    },

    UI.SelectionFields : [
        status,
        clientName,
        projectName,
      
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'Invoice ID'
        },
        {
            $Type : 'UI.DataField',
            Value : clientName,
            Label : 'Client'
        },
        {
            $Type : 'UI.DataField',
            Value : projectName,
            Label : 'Project'
        },
          {
            $Type : 'UI.DataField',
            Value : status,
            Label : 'Status',
            Criticality : statusCriticality
        },
        {
            $Type : 'UI.DataField',
            Value : invoiceDate,
            Label : 'Invoice Date'
        },
        {
            $Type : 'UI.DataField',
            Value : dueDate,
            Label : 'Due Date'
        },
        {
            $Type : 'UI.DataField',
            Value : billableHours,
            Label : 'Billable Hours'
        },
        {
            $Type : 'UI.DataField',
            Value : totalAmt,
            Label : 'Total Amount'
        },
      
    ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'InvoiceDetails',
            Label  : 'Invoice Details',
            Target : '@UI.FieldGroup#InvoiceDetails'
        },
     
    ],

    UI.FieldGroup #InvoiceDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
                Label : 'Invoice ID'
            },
            {
                $Type : 'UI.DataField',
                Value : clientName,
                Label : 'Client'
            },
            {
                $Type : 'UI.DataField',
                Value : projectName,
                Label : 'Project'
            },
            {
                $Type : 'UI.DataField',
                Value : invoiceDate,
                Label : 'Invoice Date'
            },
            {
                $Type : 'UI.DataField',
                Value : dueDate,
                Label : 'Due Date'
            },
            {
                $Type : 'UI.DataField',
                Value : billableHours,
                Label : 'Billable Hours'
            },
            {
                $Type : 'UI.DataField',
                Value : totalAmt,
                Label : 'Total Amount'
            },
            {
                $Type : 'UI.DataField',
                Value : status,
                Label : 'Status',
                Criticality : statusCriticality
            }
        ]
    }
);


// Standard backend actions
annotate service.Invoices with @UI.Identification : [
    {
        $Type  : 'UI.DataFieldForAction',
        Action : 'BillingService.issueInvoice',
        Label  : 'Issue Invoice',
        ![@UI.Hidden] : {
            $edmJson : {
                $Ne : [
                    { $Path : 'status' },
                    'Draft'
                ]
            }
        }
    },
    {
        $Type  : 'UI.DataFieldForAction',
        Action : 'BillingService.markInvoicePaid',
        Label  : 'Mark Invoice Paid',
        ![@UI.Hidden] : {
            $edmJson : {
                $Ne : [
                    { $Path : 'status' },
                    'Issued'
                ]
            }
        }
    }
];


// Client value help
annotate service.Invoices with {
    clientName @(
        Common.Label : 'Client',
        Common.ValueList : {
            CollectionPath : 'Clients',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : clientName,
                    ValueListProperty : 'clientName'
                }
            ]
        }
    );
};


// Project value help
annotate service.Invoices with {
    projectName @(
        Common.Label : 'Project',
        Common.ValueList : {
            CollectionPath : 'Projects',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : projectName,
                    ValueListProperty : 'projectName'
                }
            ]
        }
    );
};


// Invoice status value help
annotate service.Invoices with {
    status @(
        Common.ValueListWithFixedValues : true,
        Common.ValueList : {
            CollectionPath : 'Invoicestatus',
            Parameters : [{
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : status,
                ValueListProperty : 'code'
            }]
        }
    );
};

