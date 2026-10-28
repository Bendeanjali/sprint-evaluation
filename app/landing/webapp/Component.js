sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
  "use strict";

  return UIComponent.extend("com.company.landing.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      var oDeviceModel = new JSONModel(Device);
      oDeviceModel.setDefaultBindingMode("OneWay");
      this.setModel(oDeviceModel, "device");

      this.getRouter().initialize();
    },

    getContentDensityClass: function () {
      if (!this._sContentDensityClass) {
        this._sContentDensityClass = Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
      }
      return this._sContentDensityClass;
    }
  });
});
