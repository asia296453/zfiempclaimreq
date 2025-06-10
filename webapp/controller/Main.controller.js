sap.ui.define([
    "zfiempclaimreq/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History", "sap/m/MessageBox", 'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel",
     "sap/ui/core/Fragment", "sap/m/UploadCollectionParameter"
], (BaseController, Controller,History ,MessageBox, Filter, FilterOperator, JSONModel, Fragment, r) => {
    "use strict";

    return BaseController.extend("zfiempclaimreq.controller.Main", {
        onInit() {
            this.suser = '';
            if(sap.ushell !== undefined){
                this.suser = sap.ushell.Container.getService("UserInfo").getId();
            }
            if(this.suser === ''){
                this.suser = 'NTT_VENU';
            }
            
            this.ongetdropdowns();
            this.getOwnerComponent().getModel("display").setProperty("/results", []);
            this.getOwnerComponent().getModel("create").setProperty("/results", []);
            this.getOwnerComponent().getModel("create").setProperty("/user", []);
            this.getOwnerComponent().getModel("create").setProperty("/userdetails", []);

            var sclaimno = "";
           
            if(this.getOwnerComponent().getComponentData() !== undefined &&
                this.getOwnerComponent().getComponentData().startupParameters.Claimno !== undefined){
                sclaimno = this.getOwnerComponent().getComponentData().startupParameters.Claimno[0];
            }
            
            var stype = '';
            if(window.location.href.indexOf("zfiempclaimreq-display") !== -1){
                stype = "display";
            }
            else if(window.location.href.indexOf("zfiempclaimreq-create") !== -1){
                stype = "create";
            }
            else if(window.location.href.indexOf("zfiempclaimreq-manage") !== -1){
                stype = "manage";
            }else{
                stype = "display";
            }
            this.setinitialmodels1(sclaimno,stype);
            this.setinitialdata1(sclaimno,stype);
        },
        setinitialdata1:function(sclaimno,stype){  
                    
            if(stype === 'display' || sclaimno !== ''){
                var sstr2 = {
                    "create": false,
                    "display": true,
                    "onbehalf":false,
                    "emp":false,
                }
                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";

                if(sclaimno !== '')
                    {
                        if(sclaimno.indexOf("#zfiempclaimreq-display") !== -1){
                            sclaimno = sclaimno.replace("#zfiempclaimreq-display",'');
                        }
                        this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle ='';
                        var oFilter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, sclaimno);
                        this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "',Pernr='')","display", null);
                        this.getOdata("/CRWFLOGSet","approvallog", oFilter);
                    }

            }else if(stype === 'create'){
                var sstr2 = {
                    "create": true,
                    "display": false,
                    "onbehalf":false,
                    "emp":true,
                }

                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request";
            }
            else if(stype === 'manage'){
                var sstr2 = {
                    "create": true,
                    "display": false,
                    "onbehalf":true,
                    "emp":false,
                }

                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request-On Behalf";
                
                
            }
            else{
                var sstr2 = {
                    "create": false,
                    "display": true,
                }
                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";
            }
        },

        setinitialmodels1:function(sclaimno,stype){
            debugger;
            var oData = [];
            var ddate = new Date();
            var sTimeformat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern : "PThh'H'mm'M'ss'S'"
            });
            var scurtime = sTimeformat.format(ddate);
            debugger;
            if (stype === 'manage') {
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                this.getOdata("/CLAIMREQSet(Claimno='',Pernr='')", "create", null).then((response) => {
                    this.getOwnerComponent().getModel("create").getData().results.Crtdat = null;
                    this.getOwnerComponent().getModel("create").getData().results.Crttime = null;
                    this.getOwnerComponent().getModel("create").refresh(true);
                });
            }
            if (stype === 'create') {
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                this.getOdata("/CLAIMREQSet(Claimno='',Pernr='')", "create", null).then((response) => {
                    this.getOdata("/USREMPSet(Usrid='" + this.suser + "')", "user", null).then((res) => {
                        this.getOdata("/EMPDTSet(Pernr='" + res.Pernr + "')", "userdetails", null).then((res1) => {
                            if (res1.Kostl === '') {
                                res1.Kostl = '1010100315'
                            }
                            this.getOwnerComponent().getModel("create").getData().results.Pernr = res1.Pernr,//'12000334',12000941
                            this.getOwnerComponent().getModel("create").getData().results.Claimdat = null;
                            this.getOwnerComponent().getModel("create").getData().results.Kostl = res1.Kostl;// '1010100315',
                            this.getOwnerComponent().getModel("create").getData().results.Ktext = res1.Ktext;//'TALENT ACQUISITION',
                            this.getOwnerComponent().getModel("create").getData().results.Crtdat = ddate;
                            this.getOwnerComponent().getModel("create").getData().results.Crttime = scurtime;
                            this.getOwnerComponent().getModel("create").refresh(true);
                        });
                    });
                });
            }
            if (stype === 'display') {
                
                this.getOdata("/CLAIMREQSet(Claimno='',Pernr='')", "display", null).then((response) => {
                    this.getOwnerComponent().getModel("display").getData().results.Crtdat = null;
                    this.getOwnerComponent().getModel("display").getData().results.Crttime = null;
                    this.getOwnerComponent().getModel("display").refresh(true);
                });
                if(sclaimno === ''){
                    this.getOwnerComponent().getModel("claimno").setProperty("/results", true);
                }else{
                    this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                }
            }
           
            var sstr1 = {
                "editable": true
            }
            this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
       
        },

        setinitialdata:function(sclaimno){           
            if(window.location.href.indexOf("zfiempclaimreq-display") !== -1 || sclaimno !== ''){
                var sstr2 = {
                    "create": false,
                    "display": true,
                    "onbehalf":false,
                    "emp":false,
                }
                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";

                if(sclaimno !== '')
                    {
                        if(sclaimno.indexOf("#zfiempclaimreq-display") !== -1){
                            sclaimno = sclaimno.replace("#zfiempclaimreq-display",'');
                        }
                        this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle ='';
                        var oFilter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, sclaimno);
                        this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "',Pernr='')","display", null);
                        this.getOdata("/CRWFLOGSet","approvallog", oFilter);
                    }

            }else if(window.location.href.indexOf("zfiempclaimreq-create") !== -1){
                var sstr2 = {
                    "create": true,
                    "display": false,
                    "onbehalf":false,
                    "emp":true,
                }

                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request";
            }
            else if(window.location.href.indexOf("zfiempclaimreq-manage") !== -1){
                var sstr2 = {
                    "create": true,
                    "display": false,
                    "onbehalf":true,
                    "emp":false,
                }

                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request-On Behalf";
                
                
            }
            else{
                var sstr2 = {
                    "create": false,
                    "display": true,
                }
                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";
            }
        },

        setinitialmodels:function(sclaimno){
            
            var oData = [];
            var ddate = new Date();
            var sTimeformat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern : "PThh'H'mm'M'ss'S'"
            });
            var scurtime = sTimeformat.format(ddate);
            debugger;
            if(window.location.href.indexOf("zfiempclaimreq-create") !== -1 ||
                window.location.href.indexOf("zfiempclaimreq-manage") !== -1){
            this.getOdata("/USREMPSet(Usrid='" + this.suser + "')","user", null).then((res) => {
                
                this.getOdata("/EMPDTSet(Pernr='" + res.Pernr + "')","userdetails", null).then((res1) => {
                if(res1.Kostl === ''){
                    res1.Kostl = '1010100315'
                }
                var sstr = {
                "Claimno": '',
                "Status": '',
                "Pernr":res1.Pernr ,//'12000334',12000941
                "Belnr": '',
                "Onbehalf": '',
                "Claimdat": null,
                "Kostl":res1.Kostl,// '1010100315',
                "Ktext": res1.Ktext,//'TALENT ACQUISITION',
                "ExpType": '',
                "ExpName": '',
                "Saknr": '',
                "Stext": '',
                "Amt": '',
                "Curr": '',
                "Comments": '',
                "Crtby": '',
                "Crtdat": ddate,
                "Crttime": scurtime
            }
            if(window.location.href.indexOf("zfiempclaimreq-manage") !== -1){
                sstr.Pernr = '';
                sstr.Kostl = '';
                sstr.Ktext = '';
                this.getOwnerComponent().getModel("userdetails").getData().results.Pernr = '';
                this.getOwnerComponent().getModel("userdetails").getData().results.Perna = '';
                this.getOwnerComponent().getModel("userdetails").refresh();
            }
            this.getOwnerComponent().getModel("create").setProperty("/results", sstr);
        });
    }); }
            var sstr = {
                "Claimno": '',
                "Status": '',
                "Pernr": '',
                "Belnr": '',
                "Onbehalf": '',
                "Claimdat": null,
                "Kostl": '',
                "Ktext": '',
                "ExpType": '',
                "ExpName": '',
                "Saknr": '',
                "Stext": '',
                "Amt": '',
                "Curr": '',
                "Comments": '',
                "Crtby": '',
                "Crtdat": null,
                "Crttime": null
            }
            // if(window.location.href.indexOf("zfiempclaimreq-display") !== -1 || sclaimno === ''){
            //     this.getOwnerComponent().getModel("userdetails").getData().results.Pernr = '';
            //     this.getOwnerComponent().getModel("userdetails").getData().results.Perna = '';
            //     this.getOwnerComponent().getModel("userdetails").refresh();
                
            // }
            if(sclaimno === ''){
                this.getOwnerComponent().getModel("display").setProperty("/results", sstr);
                this.getOwnerComponent().getModel("claimno").setProperty("/results", true);

            }else{
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
            }
            

            var sstr1 = {
                "editable": true
            }
            this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
       
        },
        onchangeOnbehalf: function (oEvent) {
            
            var sval = oEvent.getSource().getValue();
                this.getOdata("/EMPDTSet(Pernr='" + sval + "')","userdetails", null).then((res1) => {
                    var ddate = new Date();
                    var sTimeformat = sap.ui.core.format.DateFormat.getDateInstance({
                            pattern : "PThh'H'mm'M'ss'S'"
                        });
                    var scurtime = sTimeformat.format(ddate);
                    this.getOwnerComponent().getModel("create").getData().results.Crtdat = ddate;
                    this.getOwnerComponent().getModel("create").getData().results.Crttime = scurtime;
                    this.getOwnerComponent().getModel("create").getData().results.Pernr = res1.Pernr;
                    this.getOwnerComponent().getModel("create").getData().results.Kostl = res1.Kostl;
                    this.getOwnerComponent().getModel("create").getData().results.Ktext = res1.Ktext;
                    this.getOwnerComponent().getModel("create").refresh(true);
                });
        },
        ongetdropdowns: function () {
            this.getOdata("/CurrencySet","Currency",null);
        },
        onSave: function (oEvent) {
            var bflag = this.onValidation(this.getOwnerComponent().getModel("create").getData().results);
            if (bflag) {
                var oPayload = this.getOwnerComponent().getModel("create").getData().results;
                oPayload.Status = 'CR';
                this.showBusy(true);
                this.getModel().create("/CLAIMREQSet", oPayload, {
                    method: "POST",
                    success: function (oData,res) {
                        this.showBusy(false);
                        var sMsg = "Claim No." + oData.Claimno + " saved Successfully ";
                        MessageBox.success(sMsg, {
                            actions: ["OK"],
                            onClose: (sAction) => {
                                if (sAction === "OK") {

                                    this.getOwnerComponent().getModel("create").setProperty("/results", oData);
                                    var sstr1 = {
                                        "editable": true
                                    }
                                    this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
                                }
                            },
                        });

                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg); 
                    }.bind(this)
                });
            }
        },
        onSubmit: function (oEvent) {
            var bflag = this.onValidation(this.getOwnerComponent().getModel("create").getData().results);
            if(bflag)
                {sap.m.MessageBox.confirm("Please confirm to Submit?", {
                initialFocus: sap.m.MessageBox.Action.CANCEL,
                onClose: function (sButton) {
                    if (sButton == "OK") {                        
                        var oPayload = this.getOwnerComponent().getModel("create").getData().results;
                        oPayload.Status = 'SU';
                        this.showBusy(true);                        
                        this.getModel().create("/CLAIMREQSet", oPayload, {
                            method: "POST",
                            success: function (oData,res) {
                                debugger;
                                this.showBusy(false); 
                                if(oData.Claimno !== ''){  
                                    this.getOwnerComponent().getModel("create").setProperty("/results", oData);
                                this.onStartUpload(oData.Claimno); 
                                var sMsg = "Claim No."+oData.Claimno+" Submitted Successfully ";
                                MessageBox.success(sMsg, {
                                    actions: ["OK"],
                                    onClose: (sAction) => {
                                        if (sAction === "OK") {                                            
                                            var sstr1 = {
                                                "editable": false
                                            }
                                            this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
                                            
                                        }
                                    },
                                });
                            }else{
                                    var msg = JSON.parse(res.headers["sap-message"]).message;
                                    MessageBox.error(msg); 
                            }

                            }.bind(this),
                            error: function (oError) {
                                debugger;
                                this.showBusy(false);
                                var msg = JSON.parse(oError.responseText).error.message.value;
                                    MessageBox.error(msg); 
                            }.bind(this)
                        });
                    }
                    if (sButton == "CANCEL") {
                        return;
                    }
                }.bind(this)
            });
        }
        },
        formateDate: function (sInput) {
            var d = new Date(sInput);
            var formatter = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });

            var sVal = formatter.format(sInput);

            return sVal;
        },
        formatDate: function (e) {
            if (e === undefined || e === null || e === "") {
                return
            }
            var t = new Date(e),
                i = "" + (e.getMonth() + 1),
                a = "" + e.getDate(),
                r = e.getFullYear();
            if (i.length < 2) i = "0" + i;
            if (a.length < 2) a = "0" + a;
            return [a, i, r].join(".")
        }
    });
});