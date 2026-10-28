sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("com.company.landing.controller.Landing", {

    // ===== CHANGE THE TARGETS HERE =====
    onAdminPress: function () {
      this._navigate("AdminApp", "manage", "/admin/webapp/index.html");
    },

    onManagerPress: function () {
      this._navigate("ManagerApp", "display", "/dash/webapp/index.html");
    },

    onEmployeePress: function () {
      this._navigate("EmployeeApp", "display", "/employee_app/webapp/index.html");
    },

    onBillingPress: function () {
      this._navigate("BillingApp", "display", "/billapp/webapp/index.html");
    },
    // ===================================

    /**
     * Inside Fiori Launchpad -> cross-app navigation (semantic object + action)
     * Standalone (CAP /app folder) -> plain URL
     */
    _navigate: function (sSemanticObject, sAction, sUrl) {
      var oUshell = sap.ushell && sap.ushell.Container;

      if (oUshell) {
        oUshell.getServiceAsync("CrossApplicationNavigation").then(function (oNav) {
          oNav.toExternal({
            target: { semanticObject: sSemanticObject, action: sAction }
          });
        });
        return;
      }

      window.location.href = sUrl;
    }
  });
});
