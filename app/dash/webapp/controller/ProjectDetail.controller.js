sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    History,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend(
        "psa.dash.dash.controller.ProjectDetail",
        {

            onInit: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("ProjectDetail")
                    .attachPatternMatched(
                        this._onObjectMatched,
                        this
                    );
            },
       
            _updateProjectStatus: async function (sNewStatus) {

    try {

        const oModel = this.getView().getModel();

        const oBinding = oModel.bindContext(
            `/Projects(${this._sProjectId})`
        );

        const oContext = oBinding.getBoundContext();

        if (!oContext) {
            sap.m.MessageToast.show(
                "Project context not found"
            );
            return;
        }

        oContext.setProperty(
            "status",
            sNewStatus
        );

        await oModel.submitBatch("$auto");

        oModel.refresh();

        this._updateButtons(sNewStatus);

        sap.m.MessageToast.show(
            "Project status updated to " +
                sNewStatus
        );

    } catch (oError) {

        console.error(oError);

        sap.m.MessageBox.error(
            "Failed to update project status"
        );
    }
},
onActivateProject: function () {
    this._updateProjectStatus("Active");
},

onHoldProject: function () {
    this._updateProjectStatus("On Hold");
},

onCompleteProject: function () {
    this._updateProjectStatus("Completed");
},

onCancelProject: function () {
    this._updateProjectStatus("Cancelled");
},
   
            _updateButtons: function (sStatus) {

    const oActivateBtn = this.byId("btnActivate");
    const oCompleteBtn = this.byId("btnComplete");
    const oCancelBtn = this.byId("btnCancel");
    const oHoldBtn = this.byId("btnPutOnHold");
                console.log("INSIDE UPDATE BUTTONS");
            console.log("STATUS RECEIVED =", sStatus);

    // Hide all buttons first
    oActivateBtn.setVisible(false);
    oCompleteBtn.setVisible(false);
    oCancelBtn.setVisible(false);
    oHoldBtn.setVisible(false);

    switch (sStatus) {

        case "Draft":
            oActivateBtn.setVisible(true);
            oCancelBtn.setVisible(true);
            break;

        case "Active":
            oCompleteBtn.setVisible(true);
            oCancelBtn.setVisible(true);
            oHoldBtn.setVisible(true);
            break;

        case "On Hold":
            oActivateBtn.setVisible(true); // Resume Project
            oCancelBtn.setVisible(true);
            break;

        case "Completed":
        case "Cancelled":
            break;
    }

    console.log("Project Status:", sStatus);
},

            _onObjectMatched: function (oEvent) {

                const sProjectId =
                    oEvent.getParameter("arguments").projectId;
                this._sProjectId = sProjectId;
                console.log("Project ID:", sProjectId);

                /*const sPath =
                    "/ProjectOverview('" +
                    sProjectId +
                    "')";*/
                    const sPath = `/ProjectOverview(${sProjectId})`;

                console.log("Binding Path:", sPath);

                this.getView().bindElement({
                    path: sPath,
                    events: {
                        dataRequested: function () {
                            console.log("Loading...");
                        },
                        /*dataReceived: function (oEvent) {
                            console.log(
                                "Received:",
                                oEvent.getParameter("data")
                            );
                        },*/
                        dataReceived: function () {

                        const oContext = this.getView().getBindingContext();

                        if (!oContext) {
                            return;
                        }

                        const oData = oContext.getObject();

                        console.log(JSON.stringify(oData, null, 2));
                        console.log("Status:", oData.projectStatus);

                        this._updateButtons(oData.projectStatus);
                        

                    }.bind(this)
                                                        }
                });

                // Bind tables
                this._bindMilestones(sProjectId);
                this._bindTasks();
            },
           
        
           onAddMilestone: function () {

    if (!this._oDialog) {

        this._oDialog = new sap.m.Dialog({
            title: "Add Milestone",

            content: [

                new sap.m.Label({
                    text: "Milestone Name"
                }),

                new sap.m.Input(
                    "milestoneNameInput"
                ),

                new sap.m.Label({
                    text: "Status"
                }),

                new sap.m.Input(
                    "milestoneStatusInput"
                ),

                new sap.m.Label({
                    text: "StartDate"
                }),

              /*  new sap.m.Input(
                    "milestoneStartdateInput"
                ),*/
                new sap.m.DatePicker(
    "milestoneStartdateInput"
)
,

                new sap.m.Label({
                    text: "EndDate "
                }),

                /*new sap.m.Input(
                    "milestoneenddateInput"
                ),*/
                new sap.m.DatePicker(
    "milestoneEnddateInput"
),

                new sap.m.Label({
                    text: "Completion Percentage"
                }),

                new sap.m.Input(
                    "milestoneperInput"
                ),

            ],

            beginButton: new sap.m.Button({
                text: "Save",
                press: this.onSaveMilestone.bind(this)
            }),

            endButton: new sap.m.Button({
                text: "Cancel",
                press: function () {
                    this._oDialog.close();
                }.bind(this)
            })
        });

        this.getView().addDependent(
            this._oDialog
        );
    }

    this._oDialog.open();
},
onSaveMilestone: function () {

    const oModel = this.getView().getModel();

    const sName = sap.ui.getCore()
        .byId("milestoneNameInput")
        .getValue();

    const sStatus = sap.ui.getCore()
        .byId("milestoneStatusInput")
        .getValue();

    /*const startdate = sap.ui.getCore()
    .byId("milestonestartdateInput")
    .getValue();

     const enddate = sap.ui.getCore()
    .byId("milestoneenddateInput")
    .getValue();*/

    const startdate = sap.ui.getCore()
    .byId("milestoneStartdateInput")
    .getDateValue();

const enddate = sap.ui.getCore()
    .byId("milestoneEnddateInput")
    .getDateValue();

    const startDateISO =
    startdate.toISOString().split("T")[0];

const endDateISO =
    enddate.toISOString().split("T")[0];

     const comper = sap.ui.getCore()
    .byId("milestoneperInput")
    .getValue();

    console.log("Payload", {
        milestoneName: sName,


        status: sStatus,
        project_ID: this._sProjectId,
        startDate:startDateISO,

        endDate:endDateISO,

        completionPercent:comper


    });

    const oContext =
    oModel.bindList("/Milestones")
          .create({
              milestoneName: sName,
              status: sStatus,
              project_ID: this._sProjectId,
              startDate: startDateISO,
              endDate: endDateISO,
              completionPercent: 0
          });

oContext.created()
.then(() => {

    sap.m.MessageToast.show(
        "Milestone Created"
    );

    this._oDialog.close();

})
.catch((err) => {

    console.error(err);

    sap.m.MessageBox.error(
        "Failed to create milestone"
    );

});
    /*this.byId("pdMilestoneTable")
        .getBinding("items")
        .refresh();*/

    this._oDialog.close();
},


            _bindMilestones: function (sProjectId) {

                const oTable =
                    this.byId("pdMilestoneTable");
                console.log(
    this.getView()
        .getBindingContext()
        .getObject()
);
                oTable.bindItems({
                    path: "/Milestones",
                    filters: [
                        new Filter(
                            "project_ID",
                            FilterOperator.EQ,
                            sProjectId
                        )
                    ],
                    template: new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({
                                text: "{milestoneName}"
                            }),
                            new sap.m.Text({
                               text: "{startDate}"
                           }),
                           new sap.m.Text({
                              text: "{endDate}"
                          }),
                          new sap.m.Text({
                              text: "{priority}"
                            }),
                            new sap.m.Text({
                                text: "{status}"
                            }),
                             new sap.m.Text({
                                text: "{completionPercent}"
                            }),
                            
                        ]
                    })
                });
            },

            onAddTask: function () {

    if (!this._oTaskDialog) {

        this._oTaskDialog = new sap.m.Dialog({

            title: "Add Task",

            content: [

                new sap.m.Label({
                    text: "Task Name"
                }),

                new sap.m.Input(
                    "taskNameInput"
                ),
                new sap.m.Label({
                    text: "Assign Employee"
                }),

                new sap.m.Select(
                    "taskEmployeeInput"
                ),

                new sap.m.Label({
                    text: "Milestone"
                }),

                new sap.m.Select(
                    "taskMilestoneInput"
                ),

                new sap.m.Label({
                    text: "Start Date"
                }),

                new sap.m.DatePicker(
                    "taskStartDateInput"
                ),

                new sap.m.Label({
                    text: "End Date"
                }),

                new sap.m.DatePicker(
                    "taskEndDateInput"
                ),

                new sap.m.Label({
                    text: "Priority"
                }),

                new sap.m.Input(
                    "taskPriorityInput"
                ),

                new sap.m.Label({
                    text: "Status"
                }),

                new sap.m.Input(
                    "taskStatusInput"
                ),

                new sap.m.Label({
                    text: "Estimated Hours"
                }),

                new sap.m.Input(
                    "taskEstimatedHoursInput"
                )

            ],

            beginButton: new sap.m.Button({
                text: "Save",
                press: this.onSaveTask.bind(this)
            }),

            endButton: new sap.m.Button({
                text: "Cancel",
                press: function () {
                    this._oTaskDialog.close();
                }.bind(this)
            })

        });

        this.getView().addDependent(
            this._oTaskDialog
        );
    }

    this._loadMilestonesForTask();
    this._loadEmployees();

    this._oTaskDialog.open();
},

_loadEmployees: function () {
        console.log("Loading Employees");

    const oSelect =
        sap.ui.getCore()
            .byId("taskEmployeeInput");

    oSelect.destroyItems();

    const oModel =
        this.getView().getModel();

    oModel.bindList("/Employees")
        .requestContexts()
        .then(function (aContexts) {

            aContexts.forEach(function (oContext) {

                const oEmp =
                    oContext.getObject();

                oSelect.addItem(
                    new sap.ui.core.Item({
                        key: oEmp.ID,
                        text:
                            oEmp.firstName +
                            " " +
                            oEmp.lastName
                    })
                );

            });

        });

},
_loadMilestonesForTask: function () {

    const oSelect =
        sap.ui.getCore()
            .byId("taskMilestoneInput");

    oSelect.destroyItems();

    const oModel =
        this.getView().getModel();

    oModel.bindList(
        "/Milestones",
        undefined,
        undefined,
        [
            new sap.ui.model.Filter(
                "project_ID",
                sap.ui.model.FilterOperator.EQ,
                this._sProjectId
            )
        ]
    )
    .requestContexts()
    .then(function (aContexts) {

        aContexts.forEach(function (oContext) {

            const oMilestone =
                oContext.getObject();

            oSelect.addItem(
                new sap.ui.core.Item({
                    key: oMilestone.ID,
                    text: oMilestone.milestoneName
                })
            );

        });

    });

},
onSaveTask: function () {

    const oModel =
        this.getView().getModel();

    const sTaskName =
        sap.ui.getCore()
        .byId("taskNameInput")
        .getValue();

        const sEmployeeId =
    sap.ui.getCore()
        .byId("taskEmployeeInput")
        .getSelectedKey();

    const sMilestoneId =
        sap.ui.getCore()
        .byId("taskMilestoneInput")
        .getSelectedKey();

    const sMilestoneName =
        sap.ui.getCore()
        .byId("taskMilestoneInput")
        .getSelectedItem()
        .getText();

    const sPriority =
        sap.ui.getCore()
        .byId("taskPriorityInput")
        .getValue();

    const sStatus =
        sap.ui.getCore()
        .byId("taskStatusInput")
        .getValue();

    const startDate =
        sap.ui.getCore()
        .byId("taskStartDateInput")
        .getDateValue();

    const endDate =
        sap.ui.getCore()
        .byId("taskEndDateInput")
        .getDateValue();

    const estimatedHours =
        parseFloat(
            sap.ui.getCore()
            .byId("taskEstimatedHoursInput")
            .getValue()
        );
       
    const startDateISO =
        startDate.toISOString().split("T")[0];

    const endDateISO =
        endDate.toISOString().split("T")[0];

    const oContext=oModel.bindList("/Tasks").create({

        taskName: sTaskName,

        assignedTo_ID: sEmployeeId,


        //project_ID: this._sProjectId,

        milestone_ID: sMilestoneId,

        //milestoneName: sMilestoneName,

        startDate: startDateISO,

        endDate: endDateISO,

        priority: sPriority,

        status: sStatus,

        estimatedHours: estimatedHours,

        actualHours: 0,

        //burnPercent: burnPercent


    });
    oContext.created()
.then(() => {
sap.m.MessageToast.show("Task Created");
});

    

    this._oTaskDialog.close();

},
    formatBurnPercent: function(actualHours, estimatedHours) {

    if (!estimatedHours || estimatedHours === 0) {
        return "0%";
    }

    return Math.round(
        (Number(actualHours) / Number(estimatedHours)) * 100
    ) + "%";
},  
formatEmployeeName: function(firstName, lastName) {

    if (!firstName) {
        return "";
    }

    return firstName + " " + (lastName || "");
},
        /* _bindTasks: function (sProjectId) {

    const oTable = this.byId("pdTaskTable");

    oTable.bindItems({
        path: "/Tasks",
        filters: [
            new Filter(
                "project_ID",
                FilterOperator.EQ,
                sProjectId
            )
        ],
        template: new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({
                    text: "{taskName}"
                }),
                new sap.m.Text({
                    text: "{milestoneName}"
                }),
                new sap.m.Text({
                    text: "{startDate}"
                }),
                new sap.m.Text({
                    text: "{endDate}"
                }),
                new sap.m.Text({
                    text: "{priority}"
                }),
                new sap.m.Text({
                    text: "{status}"
                }),
                new sap.m.Text({
                    text: "{estimatedHours}"
                }),
                new sap.m.Text({
                    text: "{actualHours}"
                }),
                new sap.m.Text({
                     text: {
        parts: [
            "actualHours",
            "estimatedHours"
        ],
        formatter: this.formatBurnPercent.bind(this)
    }
                })
            ]
        })
    });

},*/
formatBudgetStatusState: function(sStatus){

    switch(sStatus){

        case "WithinBudget":
            return "Success";

        case "AtRisk":
            return "Warning";

        case "Breached":
            return "Error";

        default:
            return "None";
    }

},
formatMilestoneState: function(sStatus){

    switch(sStatus){

        case "Completed":
            return "Success";

        case "In Progress":
            return "Information";

        case "Delayed":
            return "Error";

        case "Not Started":
            return "Warning";

        default:
            return "None";
    }

},
_bindTasks: function () {

    const oTable =
        this.byId("pdTaskTable");

    oTable.bindItems({

        path: "/Tasks",
         parameters: {
        $expand: "milestone,assignedTo"
    },
        template: new sap.m.ColumnListItem({

            cells: [

                new sap.m.Text({
                    text: "{taskName}"
                }),

                new sap.m.Text({
                    text: "{milestone/milestoneName}"
                }),

                new sap.m.Text({
                    text: "{startDate}"
                }),

                new sap.m.Text({
                    text: "{endDate}"
                }),

                new sap.m.Text({
                    text: "{priority}"
                }),

                new sap.m.Text({
                    text: "{status}"
                }),
                new sap.m.Text({
    text: {
        parts: [
            "assignedTo/firstName",
            "assignedTo/lastName"
        ],
        formatter: function (fName, lName) {
            return (fName || "") + " " + (lName || "");
        }
    }
}),

                new sap.m.Text({
                    text: "{estimatedHours}"
                }),

                new sap.m.Text({
                    text: "{actualHours}"
                }),

               new sap.m.ObjectStatus({

    text: {
        parts: [
            "actualHours",
            "estimatedHours"
        ],
        formatter: this.formatBurnPercent.bind(this)
    },

    state: {
        parts: [
            "actualHours",
            "estimatedHours"
        ],
        formatter: function(actual, estimated) {

            const burn =
                estimated > 0
                    ? (actual / estimated) * 100
                    : 0;

            if (burn >= 100) {
                return "Error";
            }

            if (burn >= 80) {
                return "Warning";
            }

            return "Success";
        }
    }

}),

            ]

        })

    });

},

            onNavBack: function () {

                const oHistory =
                    History.getInstance();

                const sPreviousHash =
                    oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {

                    window.history.go(-1);

                } else {

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo(
                            "RouteView1",
                            {},
                            true
                        );
                }
            }
        }
    );
});