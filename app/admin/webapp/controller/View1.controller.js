
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/DatePicker",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem"
], function (
    Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, Input, Label, VBox, Select, Item,
    DatePicker, Column, Text, ColumnListItem
) {
    "use strict";

    const CONFIG = {
        Employees: {
            path: "/Employees",
            title: "Employees",
            fields: [
                { key: "firstName", label: "First Name", required: true },
                { key: "lastName", label: "Last Name", required: true },
                { key: "email", label: "Email", required: true },
                { key: "phoneNo", label: "Phone" },
                { key: "jobTitle", label: "Job Title" },
                {
                    key: "role",
                    label: "Role",
                    type: "enum",
                    values: ["Employee", "Manager", "Finance", "DeptHead", "Admin"]
                },
                { key: "department_ID", label: "Department ID" },
                { key: "joinDate", label: "Join Date", type: "date" },
                { key: "hourlyRate", label: "Hourly Rate", type: "number" },
                {
                    key: "status",
                    label: "Status",
                    type: "enum",
                    values: ["Active", "Inactive", "OnLeave"]
                }
            ],
            columns: [
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                ["jobTitle", "Job Title"],
                ["role", "Role"],
                ["status", "Status"]
            ]
        },

        Managers: {
            path: "/Employees",
            title: "Managers",
            filter: ["role", "EQ", "Manager"],
            fields: [
                { key: "firstName", label: "First Name", required: true },
                { key: "lastName", label: "Last Name", required: true },
                { key: "email", label: "Email", required: true },
                { key: "phoneNo", label: "Phone" },
                { key: "jobTitle", label: "Job Title" },
                { key: "department_ID", label: "Department ID" },
                { key: "joinDate", label: "Join Date", type: "date" },
                {
                    key: "status",
                    label: "Status",
                    type: "enum",
                    values: ["Active", "Inactive", "OnLeave"]
                }
            ],
            columns: [
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                ["jobTitle", "Job Title"],
                ["department_ID", "Department"],
                ["status", "Status"]
            ]
        },

        Clients: {
            path: "/Clients",
            title: "Clients",
            fields: [
                { key: "clientName", label: "Client Name", required: true },
                { key: "contactPerson", label: "Contact Person" },
                { key: "email", label: "Email", required: true },
                { key: "phoneNo", label: "Phone" },
                { key: "industry", label: "Industry" },
                { key: "country", label: "Country" },
                { key: "address", label: "Address" },
                {
                    key: "status",
                    label: "Status",
                    type: "enum",
                    values: ["Active", "Inactive", "Prospect"]
                }
            ],
            columns: [
                ["clientName", "Client"],
                ["contactPerson", "Contact"],
                ["email", "Email"],
                ["phoneNo", "Phone"],
                ["industry", "Industry"],
                ["status", "Status"]
            ]
        },

        Departments: {
            path: "/Departments",
            title: "Departments",
            fields: [
                {
                    key: "departmentName",
                    label: "Department Name",
                    required: true
                },
                { key: "description", label: "Description" },
                {
                    key: "status",
                    label: "Status",
                    type: "enum",
                    values: ["Active", "Inactive"]
                }
            ],
            columns: [
                ["departmentName", "Department"],
                ["description", "Description"],
                ["status", "Status"]
            ]
        }
    };

    return Controller.extend("psa.admi.admin.controller.View1", {

        onInit: function () {
            this._section = "Dashboard";
            this._search = "";

            this.getView().setModel(new JSONModel({
                section: "Dashboard",
                pageTitle: "Dashboard",
                sidebarVisible: true
            }), "ui");

            this.getView().setModel(new JSONModel({
                employees: 0,
                managers: 0,
                clients: 0,
                departments: 0
            }), "stats");

            this.getView().setModel(new JSONModel({
                status: [],
                departments: []
            }), "charts");

            this.getView().setModel(
                new JSONModel({ items: [] }),
                "recent"
            );

            this._loadDashboard();
        },

        // Get the default OData V4 model from the component.
        _model: function () {
            const component = this.getOwnerComponent();

            return (component && component.getModel()) ||
                this.getView().getModel();
        },

        // Read records from an OData entity set.
        _read: async function (path, filter) {
            const model = this._model();

            if (!model || typeof model.bindList !== "function") {
                throw new Error(
                    "OData model is unavailable. Check manifest.json and /odata/v4/admin/$metadata."
                );
            }

            const list = model.bindList(
                path,
                null,
                null,
                filter || []
            );

            try {
                const contexts = await list.requestContexts(0, 1000);

                return contexts.map(function (context) {
                    return context.getObject();
                });
            } finally {
                list.destroy();
            }
        },

        // OData V4 list bindings do not provide requestCount().
        _count: async function (path, filter) {
            const records = await this._read(path, filter);
            return records.length;
        },

        // Load dashboard statistics and chart data.
        _loadDashboard: async function () {
            try {
                const employees = await this._read("/Employees");
                const clients = await this._count("/Clients");
                const departments = await this._read("/Departments");

                const managers = employees.filter(function (employee) {
                    return employee.role === "Manager";
                });

                this.getView().getModel("stats").setData({
                    employees: employees.length,
                    managers: managers.length,
                    clients: clients,
                    departments: departments.length
                });

                const statusCounts = {};

                employees.forEach(function (employee) {
                    const status = employee.status || "Unspecified";

                    statusCounts[status] =
                        (statusCounts[status] || 0) + 1;
                });

                const departmentCounts = {};

                employees.forEach(function (employee) {
                    const department =
                        employee.department_ID || "Unassigned";

                    departmentCounts[department] =
                        (departmentCounts[department] || 0) + 1;
                });

                this.getView().getModel("charts").setData({
                    status: Object.keys(statusCounts).map(function (status) {
                        return {
                            status: status,
                            count: statusCounts[status]
                        };
                    }),

                    departments: Object.keys(departmentCounts).map(
                        function (department) {
                            return {
                                department: department,
                                count: departmentCounts[department]
                            };
                        }
                    )
                });

                this.getView().getModel("recent").setData({
                    items: employees.slice(-5).reverse().map(
                        function (employee) {
                            return {
                                name:
                                    (employee.firstName || "") + " " +
                                    (employee.lastName || ""),
                                email: employee.email || "",
                                role: employee.role || "",
                                status: employee.status || ""
                            };
                        }
                    )
                });

            } catch (error) {
                this._error("Could not load dashboard data", error);
            }
        },

        _error: function (message, error) {
            console.error(message, error);

            const detail = error && error.message
                ? "\n\nDetails: " + error.message
                : "";

            MessageBox.error(
                message + detail +
                "\n\nVerify that /odata/v4/admin/$metadata returns OData XML."
            );
        },

        // Sidebar navigation.
        _navigate: function (section) {
            this._section = section;
            this._search = "";

            this.getView().getModel("ui").setData({
                section: section,
                pageTitle: section,
                sidebarVisible: true
            });

            if (section === "Dashboard") {
                this._loadDashboard();
            } else {
                this._buildTable();
                this._loadRecords();
            }
        },

        onDashboard: function () {
            this._navigate("Dashboard");
        },

        onEmployees: function () {
            this._navigate("Employees");
        },

        onManagers: function () {
            this._navigate("Managers");
        },

        onClients: function () {
            this._navigate("Clients");
        },

        onDepartments: function () {
            this._navigate("Departments");
        },

        onToggleSidebar: function () {
            const sidebar = this.byId("sidebar");

            if (sidebar) {
                sidebar.setVisible(!sidebar.getVisible());
            }
        },

        // Build the columns for the selected entity.
        _buildTable: function () {
            const table = this.byId("recordsTable");
            const config = CONFIG[this._section];

            if (!table || !config) {
                return;
            }

            table.destroyColumns();
            table.removeAllItems();

            config.columns.forEach(function (column) {
                table.addColumn(new Column({
                    header: new Text({
                        text: column[1]
                    })
                }));
            });

            table.addColumn(new Column({
                header: new Text({
                    text: "Actions"
                })
            }));
        },

        // Load rows. Store entity paths in the buttons rather than
        // retaining contexts from a list binding that is later destroyed.
        _loadRecords: async function () {
            const config = CONFIG[this._section];

            if (!config) {
                return;
            }

            const table = this.byId("recordsTable");

            if (!table) {
                return;
            }

            const filters = [];

            if (config.filter) {
                filters.push(new Filter(
                    config.filter[0],
                    FilterOperator[config.filter[1]],
                    config.filter[2]
                ));
            }

            let list;

            try {
                const model = this._model();

                if (!model || typeof model.bindList !== "function") {
                    throw new Error(
                        "OData model is unavailable. Check /odata/v4/admin/$metadata."
                    );
                }

                list = model.bindList(
                    config.path,
                    null,
                    null,
                    filters
                );

                const contexts = await list.requestContexts(0, 1000);

                table.removeAllItems();

                contexts.forEach(function (context) {
                    const object = context.getObject();

                    if (this._search) {
                        const recordText =
                            JSON.stringify(object).toLowerCase();

                        if (!recordText.includes(
                            this._search.toLowerCase()
                        )) {
                            return;
                        }
                    }

                    const cells = config.columns.map(function (column) {
                        return new Text({
                            text: String(object[column[0]] ?? "")
                        });
                    });

                    cells.push(new VBox({
                        items: [
                            new Button({
                                icon: "sap-icon://edit",
                                type: "Transparent",
                                tooltip: "Edit record",

                                press: function () {
                                    this._openForm(
                                        context.getPath(),
                                        object
                                    );
                                }.bind(this)
                            }),

                            new Button({
                                icon: "sap-icon://delete",
                                type: "Transparent",
                                tooltip: "Delete record",

                                press: function () {
                                    this._deleteRecord(
                                        context.getPath()
                                    );
                                }.bind(this)
                            })
                        ]
                    }));

                    table.addItem(new ColumnListItem({
                        cells: cells
                    }));

                }.bind(this));

            } catch (error) {
                this._error(
                    "Could not load " + config.title,
                    error
                );

            } finally {
                if (list) {
                    list.destroy();
                }
            }
        },

        onSearch: function (event) {
            this._search = event.getParameter("newValue") || "";
            this._loadRecords();
        },

        onRefresh: async function () {
            await this._loadRecords();
            await this._loadDashboard();

            MessageToast.show("Records refreshed");
        },

        onCreate: function () {
            this._openForm(null, {});
        },

        // Create or edit a record using its absolute OData entity path.
        _openForm: function (contextPath, object) {
            const config = CONFIG[this._section];
            const controls = {};
            const content = new VBox({
                width: "100%"
            });

            config.fields.forEach(function (field) {
                let control;

                if (field.type === "enum") {
                    control = new Select({
                        width: "100%",
                        selectedKey: object[field.key] || ""
                    });

                    control.addItem(new Item({
                        key: "",
                        text: "-- Select --"
                    }));

                    field.values.forEach(function (value) {
                        control.addItem(new Item({
                            key: value,
                            text: value
                        }));
                    });

                } else if (field.type === "date") {
                    control = new DatePicker({
                        width: "100%",
                        value: object[field.key] || "",
                        valueFormat: "yyyy-MM-dd",
                        displayFormat: "medium"
                    });

                } else {
                    control = new Input({
                        width: "100%",
                        value: object[field.key] == null
                            ? ""
                            : String(object[field.key]),
                        type: field.type === "number"
                            ? "Number"
                            : "Text",
                        required: !!field.required
                    });
                }

                controls[field.key] = control;

                content.addItem(new Label({
                    text: field.label,
                    required: !!field.required
                }));

                content.addItem(control);
            });

            const dialog = new Dialog({
                title: contextPath
                    ? "Edit " + config.title
                    : "Create " + config.title,

                contentWidth: "480px",
                content: [content],

                beginButton: new Button({
                    text: "Save",
                    type: "Emphasized",

                    press: async function () {
                        const payload = {};

                        for (const field of config.fields) {
                            const control = controls[field.key];
                            let value;

                            if (field.type === "enum") {
                                value = control.getSelectedKey();
                            } else if (field.type === "date") {
                                value = control.getValue();
                            } else {
                                value = control.getValue().trim();
                            }

                            if (field.required && !value) {
                                MessageBox.warning(
                                    field.label + " is required"
                                );
                                return;
                            }

                            if (value === "") {
                                continue;
                            }

                            if (field.type === "number") {
                                value = Number(value);

                                if (!Number.isFinite(value)) {
                                    MessageBox.warning(
                                        "Enter a valid number for " +
                                        field.label
                                    );
                                    return;
                                }
                            }

                            payload[field.key] = value;
                        }

                        let createBinding = null;
                        let editBinding = null;

                        try {
                            const model = this._model();

                            if (!model) {
                                throw new Error(
                                    "OData model is unavailable."
                                );
                            }

                            if (contextPath) {
                                // Reopen the selected entity. Do not use
                                // the old table context after its list
                                // binding has been destroyed.
                                editBinding = model.bindContext(contextPath);

                                await editBinding.requestObject();

                                const editContext =
                                    editBinding.getBoundContext();

                                if (!editContext) {
                                    throw new Error(
                                        "Could not reopen the selected record. Refresh and try again."
                                    );
                                }

                                for (const key of Object.keys(payload)) {
                                    editContext.setProperty(
                                        key,
                                        payload[key],
                                        "adminChanges"
                                    );
                                }

                            } else {
                                createBinding = model.bindList(
                                    config.path,
                                    null,
                                    null,
                                    [],
                                    {
                                        $$updateGroupId: "adminChanges"
                                    }
                                );

                                createBinding.create(payload);
                            }

                            await model.submitBatch("adminChanges");

                            if (createBinding) {
                                createBinding.destroy();
                                createBinding = null;
                            }

                            if (editBinding) {
                                editBinding.destroy();
                                editBinding = null;
                            }

                            dialog.close();

                            MessageToast.show(
                                "Record saved successfully"
                            );

                            await this._loadRecords();
                            await this._loadDashboard();

                        } catch (error) {
                            if (createBinding) {
                                createBinding.destroy();
                            }

                            if (editBinding) {
                                editBinding.destroy();
                            }

                            this._error("Save failed", error);
                        }

                    }.bind(this)
                }),

                endButton: new Button({
                    text: "Cancel",

                    press: function () {
                        dialog.close();
                    }
                }),

                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        // Delete by reopening the entity path, then submitting the change.
        _deleteRecord: function (contextPath) {
            MessageBox.confirm(
                "Are you sure you want to delete this record?",
                {
                    title: "Confirm deletion",

                    actions: [
                        MessageBox.Action.DELETE,
                        MessageBox.Action.CANCEL
                    ],

                    emphasizedAction: MessageBox.Action.DELETE,

                    onClose: async function (action) {
                        if (action !== MessageBox.Action.DELETE) {
                            return;
                        }

                        let deleteBinding = null;

                        try {
                            const model = this._model();

                            if (!model) {
                                throw new Error(
                                    "OData model is unavailable."
                                );
                            }

                            deleteBinding = model.bindContext(contextPath);

                            await deleteBinding.requestObject();

                            const deleteContext =
                                deleteBinding.getBoundContext();

                            if (!deleteContext) {
                                throw new Error(
                                    "Could not reopen the selected record. Refresh and try again."
                                );
                            }

                            await deleteContext.delete("adminChanges");

                            await model.submitBatch("adminChanges");

                            MessageToast.show("Record deleted");

                            await this._loadRecords();
                            await this._loadDashboard();

                        } catch (error) {
                            this._error(
                                "Delete failed. The record may be referenced by other records",
                                error
                            );

                        } finally {
                            if (deleteBinding) {
                                deleteBinding.destroy();
                            }
                        }

                    }.bind(this)
                }
            );
        }
    });
});
