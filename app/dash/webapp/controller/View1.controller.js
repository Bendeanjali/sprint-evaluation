sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (Controller, JSONModel,MessageToast, Filter,
    FilterOperator) {
    "use strict";

    return Controller.extend(
        "psa.dash.dash.controller.View1",
        {

           
           onInit: function () {

    var oDashboardModel = new JSONModel();

    oDashboardModel.loadData(
        "/odata/v4/manager-dashboard/DashboardKPIs"
    );

    oDashboardModel.attachRequestCompleted(function () {

        const oData = oDashboardModel.getData();

        if (oData.value && oData.value.length > 0) {
            oDashboardModel.setData(oData.value[0]);
        }

    });

    

    this.getView().setModel(
        oDashboardModel,
        "dashboard"
    );
},
            onGenerateInvoice: function () {

                sap.m.MessageToast.show(
                    "Generate Invoice Clicked"
                );

            },

            onProjectPress: function (oEvent) {

    const oContext =
        oEvent.getSource()
            .getBindingContext();

    const oProject =
        oContext.getObject();

    console.log("Clicked Project", oProject);

    this.getOwnerComponent()
        .getRouter()
        .navTo("ProjectDetail", {

            projectId: oProject.ID

        });
},
formatProjectStatusState: function (sStatus) {

    switch (sStatus) {

        case "Active":
            return "Success";

        case "Completed":
            return "Success";

        case "On Hold":
            return "Warning";

        case "Draft":
            return "Information";

        case "Cancelled":
            return "Error";

        default:
            return "None";
    }
},
/*onNotificationPress: function () {

    console.log("Bell Clicked");

    const oPanel = this.byId("notificationPanel");

    console.log(oPanel);

    oPanel.setVisible(
        !oPanel.getVisible()
    );
},*/
onNotificationPress: function () {

    if (!this._oDialog) {

        this._oDialog = new sap.m.Dialog({
            title: "Notifications",
            content: [
                new sap.m.List({
                    items: {
                        path: "/Notifications",
                        template: new sap.m.StandardListItem({
                            title: "{title}",
                            description: "{description}"
                        })
                    }
                })
            ],
            endButton: new sap.m.Button({
                text: "Close",
                press: function () {
                    this._oDialog.close();
                }.bind(this)
            })
        });

        this.getView().addDependent(this._oDialog);
    }

    this._oDialog.open();
},
onSearchProjects: function (oEvent) {

    var sValue = oEvent.getParameter("newValue");

    var oTable = this.byId("projectsTable");

    var oBinding = oTable.getBinding("items");

    if (!sValue) {
        oBinding.filter([]);
        return;
    }

    var oFilter = new Filter({
        filters: [
            new Filter(
                "projectCode",
                FilterOperator.Contains,
                sValue
            ),
            new Filter(
                "projectName",
                FilterOperator.Contains,
                sValue
            ),
            new Filter(
                "billingType",
                FilterOperator.Contains,
                sValue
            ),
            
            new Filter(
    "projectStatus",
    FilterOperator.Contains,
    sValue
),
        ],
        and: false
    });

    oBinding.filter([oFilter]);
},

onTimesheetPress: function () {

    window.open(
        "/psa.approve.approve/index.html",
        "_self"
    );

},
            onCreateProject: function () {

    if (!this._oDialog) {

        this._oDialog = new sap.m.Dialog({
            title: "Create Project",

            content: [
            
                new sap.m.Label({ text: "Project Name" }),
    new sap.m.Input("projectNameInput"),
   

    new sap.m.Label({ text: "Description" }),
    new sap.m.TextArea("projectDescInput"),

    new sap.m.Label({ text: "Billing Type" }),
    new sap.m.Select("billingTypeInput", {
        items: [
            new sap.ui.core.Item({ key: "Fixed", text: "Fixed" }),
            new sap.ui.core.Item({ key: "T&M", text: "T&M" }),
            new sap.ui.core.Item({ key: "Retainer", text: "Retainer" })
        ]
    }),

    new sap.m.Label({ text: "Start Date" }),
    new sap.m.DatePicker("startDateInput"),

    new sap.m.Label({ text: "End Date" }),
    new sap.m.DatePicker("endDateInput"),

    new sap.m.Label({ text: "Priority" }),
    new sap.m.Select("priorityInput", {
        items: [
            new sap.ui.core.Item({ key: "Low", text: "Low" }),
            new sap.ui.core.Item({ key: "Medium", text: "Medium" }),
            new sap.ui.core.Item({ key: "High", text: "High" }),
            new sap.ui.core.Item({ key: "Critical", text: "Critical" })
        ]
    }),

    new sap.m.Label({ text: "Planned Hours" }),
    new sap.m.Input("plannedHoursInput", {
        type: "Number"
    }),
    new sap.m.Label({
                text: "Budget Amount"
            }),
            new sap.m.Input(
                "budgetAmountInput",
                {
                    type: "Number"
                }
            ),

            new sap.m.Label({
                text: "Billing Rate"
            }),
            new sap.m.Input(
                "billingRateInput",
                {
                    type: "Number"
                }
            ),

            new sap.m.Label({
                text: "Currency"
            }),
            new sap.m.Select(
                "currencyInput",
                {
                    items: [
                        new sap.ui.core.Item({
                            key: "INR",
                            text: "INR"
                        }),
                        new sap.ui.core.Item({
                            key: "USD",
                            text: "USD"
                        })
                    ]
                }
            ),


                
            
            ],

            beginButton: new sap.m.Button({
                text: "Create",

                press: async () => {

    try {

        const oModel =
    this.getView().getModel();
/*console.log(oModel.sServiceUrl);
console.log("creating project");*/
            const oBinding =
                oModel.bindList("/Projects");
            const oStartDate = sap.ui.getCore()
                .byId("startDateInput")
                .getDateValue();

            const oEndDate = sap.ui.getCore()
                .byId("endDateInput")
                .getDateValue();

            const sStartDate =
                oStartDate.getFullYear() + "-" +
                String(oStartDate.getMonth() + 1).padStart(2, "0") + "-" +
                String(oStartDate.getDate()).padStart(2, "0");

                const sEndDate =
                    oEndDate.getFullYear() + "-" +
                    String(oEndDate.getMonth() + 1).padStart(2, "0") + "-" +
                    String(oEndDate.getDate()).padStart(2, "0");
          

console.log("Start Date:", sStartDate);
console.log("End Date:", sEndDate);

const oContext = oBinding.create({

    projectCode: "PRJ-" + Date.now(),

    projectName:
        sap.ui.getCore()
            .byId("projectNameInput")
            .getValue(),
 
        
    description:
        sap.ui.getCore()
            .byId("projectDescInput")
            .getValue(),

       
    billingType:
        sap.ui.getCore()
            .byId("billingTypeInput")
            .getSelectedKey(),

    startDate: sStartDate,

    endDate: sEndDate,

    priority:
        sap.ui.getCore()
            .byId("priorityInput")
            .getSelectedKey(),

    plannedHours:
        Number(
            sap.ui.getCore()
                .byId("plannedHoursInput")
                .getValue()
        ),

    status: "Draft",

    consumedHours: 0
});


//wait oContext.created();

await oContext.created();

//const sProjectId =oContext.getProperty("ID");

console.log(
    "PROJECT CREATED",
    oContext.getObject()
);

const oProject =
    oContext.getObject();

const sProjectId =
    oProject.ID;

const oBudgetBinding =
    oModel.bindList("/Budgets");

const oBudgetContext =
    oBudgetBinding.create({

        project_ID:
            sProjectId,

        budgetAmt:
            Number(
                sap.ui.getCore()
                    .byId("budgetAmountInput")
                    .getValue()
            ),

        consumedAmt: 0,

        remainingAmt:
            Number(
                sap.ui.getCore()
                    .byId("budgetAmountInput")
                    .getValue()
            ),

        billingRateHr:
            Number(
                sap.ui.getCore()
                    .byId("billingRateInput")
                    .getValue()
            ),

        status:
    "WithinBudget",

        currencyCode:
            sap.ui.getCore()
                .byId("currencyInput")
                .getSelectedKey()
    });

await oBudgetContext.created();

oModel.refresh();

this._oDialog.close();
sap.ui.getCore().byId("projectNameInput").setValue("");
sap.ui.getCore().byId("projectDescInput").setValue("");
sap.ui.getCore().byId("plannedHoursInput").setValue("");
sap.ui.getCore().byId("budgetAmountInput").setValue("");
sap.ui.getCore().byId("billingRateInput").setValue("");

MessageToast.show(
    "Project and Budget Created Successfully"
);
}
catch (err) {

    console.error(
        "CREATE ERROR",
        err
    );

    if (err.error) {
        console.error(err.error);
    }

    MessageToast.show(
        err.message || JSON.stringify(err)
    );
}
    }
                }
            ),
            endButton: new sap.m.Button({
                text: "Cancel",
                press: () => this._oDialog.close()
            })
        });

        this.getView().addDependent(
            this._oDialog
        );
    }

    this._oDialog.open();
}

        }

    );
    
});