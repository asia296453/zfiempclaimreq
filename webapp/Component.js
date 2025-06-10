sap.ui.define([
    "sap/ui/core/UIComponent",
    "zfiempclaimreq/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("zfiempclaimreq.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(new sap.ui.model.json.JSONModel(), "create");
            this.setModel(new sap.ui.model.json.JSONModel(), "display");
            this.setModel(new sap.ui.model.json.JSONModel(), "approvaldetails");
            this.setModel(new sap.ui.model.json.JSONModel(), "Header");
            this.setModel(new sap.ui.model.json.JSONModel(), "ExpType");
            this.setModel(new sap.ui.model.json.JSONModel(), "ViewVis");
            this.setModel(new sap.ui.model.json.JSONModel(), "approvallog");
            this.setModel(new sap.ui.model.json.JSONModel(), "userdetails");
            this.setModel(new sap.ui.model.json.JSONModel(), "user");
            this.setModel(new sap.ui.model.json.JSONModel(), "Currency");
            this.setModel(new sap.ui.model.json.JSONModel(), "DisplayAttachmentModel");
            this.setModel(new sap.ui.model.json.JSONModel(), "UploadAttachmentModel");
            this.setModel(new sap.ui.model.json.JSONModel(), "AttachmentType");
            this.setModel(new sap.ui.model.json.JSONModel(), "claimno");
            this.setModel(new sap.ui.model.json.JSONModel(), "usertype");
            // enable routing
            this.getRouter().initialize();
            //this.getuserdtls();
        },
        getuserdtls: function () {

            var appId = this.getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
          //  debugger;
            var surl1 = appModulePath + "/odata/v2/carVendorName"; 
            var surl2 = "/DEST_SF_TEST/User('12000941')";
            debugger;
            var aData = $.get({
                type: "GET",
                contentType: "application/json",
                url: surl2,
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {
                   debugger;
                }.bind(this),
                error: function (oMsg) {
                  debugger;
                 }
            });

            
        }
    });
});