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
            this.getOwnerComponent().getModel("attachflag").setProperty("/flag", '');
            this.suser = '';
            if(sap.ushell !== undefined){
                this.suser = sap.ushell.Container.getService("UserInfo").getId();
            }
            if(this.suser === ''){
                this.suser = 'T_12001954';
            }
            
            this.ongetdropdowns();
            this.getOwnerComponent().getModel("display").setProperty("/results", []);
            this.getOwnerComponent().getModel("create").setProperty("/results", []);
            this.getOwnerComponent().getModel("create").setProperty("/user", []);
            this.getOwnerComponent().getModel("create").setProperty("/userdetails", []);
            this.getOwnerComponent().getModel("user").setProperty("/results", []);
            
            //getting claimno begin
            var sclaimno = "";            
            if(this.getOwnerComponent().getComponentData() !== undefined &&
                this.getOwnerComponent().getComponentData().startupParameters.Claimno !== undefined){
                sclaimno = this.getOwnerComponent().getComponentData().startupParameters.Claimno[0];
            }
            
                if(window.location.href.indexOf("Claimno") !== -1){
                    var complete_url = window.location.href;
                    var pieces = complete_url.split("?");
                    var params = pieces[1].split("&");
                    $.each(params, function (key, value) {
                        var param_value = value.split("=");
                        if(param_value[0]==='Claimno'){
                            sclaimno = param_value[1];
                        }
                    });
                }
            if(sclaimno.indexOf("#zfiempclaimreq-display") !== -1){
                sclaimno = sclaimno.replace("#zfiempclaimreq-display",'');
            }  
            if(sclaimno.indexOf("#zfiempclaimreq-create") !== -1){
                sclaimno = sclaimno.replace("#zfiempclaimreq-create",'');
            }  
            //getting claimno END

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
            //this.setinitialdata1(sclaimno,stype);
        },
        setinitialmodels1:function(sclaimno,stype){
            var smodel = stype;
            if (stype === 'manage') {
                smodel='create';
            }
           
            
            this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "')", smodel, null,true).then((response) => {
                this.getOdata("/USREMPSet(Usrid='" + this.suser + "')", "user", null).then((res) => {
                    this.getOdata("/EMPDTSet(Pernr='" + res.Pernr + "')", "userdetails", null).then((res1) => {
                        debugger;
                        this.setinitialdata1(sclaimno,stype,response,res,res1,smodel);                    
                    });
                });
            });
            
            if(sclaimno !== '')
            {                       
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle ='';
                var oFilter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, sclaimno);
                this.getOdata("/CRWFLOGSet","approvallog", oFilter);
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
            }else{
                this.getOwnerComponent().getModel("claimno").setProperty("/results", true);
            }
            
        this.getOdata("/TAXCODESet","Taxcode", null);
        },
        setinitialdata1:function(sclaimno,stype,response,res,res1,smodel){  
            var oData = [];
            var ddate = new Date();
            var sTimeformat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern : "PThh'H'mm'M'ss'S'"
            });
            var scurtime = sTimeformat.format(ddate);
            if(sclaimno === ''){
                this.getOwnerComponent().getModel("claimno").setProperty("/results", true);
                this.getOwnerComponent().getModel(smodel).getData().results.Crtdat = null;
                this.getOwnerComponent().getModel(smodel).getData().results.Crttime = null;
                if(response.Pernr === '00000000'){
                    this.getOwnerComponent().getModel(smodel).getData().results.Pernr = '';
                }
                if(response.Totamt === '0.00'){
                    this.getOwnerComponent().getModel(smodel).getData().results.Totamt = '';
                }
                this.getOwnerComponent().getModel(smodel).refresh(true); 
            }else{
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
            }

            if(stype === 'display' ){
                var sstr2 = {
                    "create": false,
                    "display": true,
                    "onbehalf":false,
                    "emp":false,
                }
                this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                this.getOwnerComponent().getModel("ViewVis").refresh(true);
                this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";
                
                 
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
                
                if(sclaimno === ''){
                    this.getOwnerComponent().getModel("create").getData().results.Pernr = res1.Pernr,//'12000334',12000941
                    this.getOwnerComponent().getModel("create").getData().results.Claimdat = null;
                    this.getOwnerComponent().getModel("create").getData().results.Kostl = res1.Kostl;// '1010100315',
                    this.getOwnerComponent().getModel("create").getData().results.Ktext = res1.Ktext;//'TALENT ACQUISITION',
                    this.getOwnerComponent().getModel("create").getData().results.Crtdat = ddate;
                    this.getOwnerComponent().getModel("create").getData().results.Crttime = scurtime;
                    this.getOwnerComponent().getModel("create").refresh(true);
                    }
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
            
            var sstr1 = {
                "editable": true
            }
            this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
        },

       
        getnewrow:function(){
            this.showBusy(true);
            return new Promise((resolve, reject) => {
            this.getOwnerComponent().getModel().read("/CLAIMREQSet('')/ClaimToItems", {
                success: function (oData) {
                    this.showBusy(false);
                    oData.results[0].Claimno = '0';
                    oData.results.forEach(function (item, index) {
                        item.Amt = '';
                    });
                    resolve(oData.results);
                }.bind(this),
                error: function (oError) {
                    this.showBusy(false);
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);                    
                    reject();
                }.bind(this)
            });
        });
        },
        onPressAddRow: function (e)
        {
            this.getnewrow().then(function(response){
                var sData = response[0];
                var odata = [];
                if(this.getView().getModel("item").getProperty("/results") !== undefined){
                    odata=this.getView().getModel("item").getProperty("/results");
                }
                odata.push(sData);
                odata.forEach(function (item, index) {
                        item.Claimitem = (index + 1).toString();
                    });
                this.getView().getModel("item").setProperty("/results", odata);
                
            }.bind(this));
        },

        deleteRow: function (oEvent) {
            debugger;
            var ideleteRecord = oEvent.getSource().getParent().getId().split("-");
            ideleteRecord=ideleteRecord[ideleteRecord.length - 1];
            var odata = this.getView().getModel("item").getProperty("/results");
            odata.splice(parseInt(ideleteRecord), 1); //removing 1 record from i th index.
            this.getView().getModel("item").refresh(true);
        },
        onNavBack: function () {
            var sstr2 = {
                "create": false,
                "display": true,
                "onbehalf":false,
                "emp":false,
            }
            this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
            this.getOwnerComponent().getModel("ViewVis").refresh(true);
            this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";
            this.getOdata("/CLAIMREQSet(Claimno='')", "display", null,true).then((response) => {
                if(response.Pernr === '00000000'){
                    this.getOwnerComponent().getModel("display").getData().results.Pernr = '';
                }
                if(response.Amt === '0.00'){
                    this.getOwnerComponent().getModel("display").getData().results.Amt = '';
                }
                this.getOwnerComponent().getModel("display").getData().results.Crtdat = null;
                this.getOwnerComponent().getModel("display").getData().results.Crttime = null;
                this.getOwnerComponent().getModel("display").refresh(true);
                this.getOwnerComponent().getModel("create").setProperty("/results", []);
                this.getOwnerComponent().getModel("create").refresh(true);
                this.getOwnerComponent().getModel("approvallog").setProperty("/results", []);
                this.getOwnerComponent().getModel("approvallog").refresh(true);

                
           
            });
            
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
                        this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "')","display", null,true);
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
                oPayload.ClaimToItems = this.getOwnerComponent().getModel("item").getData().results;
                debugger;
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
                        oPayload.ClaimToItems = this.getOwnerComponent().getModel("item").getData().results;
                        oPayload.Totamt = '0.00';
                        oPayload.ClaimToItems.forEach(function (item, index) {
                            if(item.Amt !== ''){
                                oPayload.Totamt = parseFloat(oPayload.Totamt) + parseFloat(item.Amt);
                            }
                            
                        });
                        oPayload.Totamt = (oPayload.Totamt).toString();
                        this.showBusy(true);  
                        debugger;                      
                        this.getModel().create("/CLAIMREQSet", oPayload, {
                            method: "POST",
                            success: function (oData,res) {
                                
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
        },
        setinitialmodels2:function(sclaimno,stype){
            
            var oData = [];
            var ddate = new Date();
            var sTimeformat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern : "PThh'H'mm'M'ss'S'"
            });
            var scurtime = sTimeformat.format(ddate);
            
            if (stype === 'manage') {
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "')", "create", null,true).then((response) => {
                    this.getOwnerComponent().getModel("create").getData().results.Crtdat = null;
                    this.getOwnerComponent().getModel("create").getData().results.Crttime = null;
                    this.getOwnerComponent().getModel("create").refresh(true);
                });
            }
            if (stype === 'create') {
                this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "')", "create", null,true).then((response) => {
                    this.getOdata("/USREMPSet(Usrid='" + this.suser + "')", "user", null).then((res) => {
                        this.getOdata("/EMPDTSet(Pernr='" + res.Pernr + "')", "userdetails", null).then((res1) => {
                            if(sclaimno === ''){
                            this.getOwnerComponent().getModel("create").getData().results.Pernr = res1.Pernr,//'12000334',12000941
                            this.getOwnerComponent().getModel("create").getData().results.Claimdat = null;
                            this.getOwnerComponent().getModel("create").getData().results.Kostl = res1.Kostl;// '1010100315',
                            this.getOwnerComponent().getModel("create").getData().results.Ktext = res1.Ktext;//'TALENT ACQUISITION',
                            this.getOwnerComponent().getModel("create").getData().results.Crtdat = ddate;
                            this.getOwnerComponent().getModel("create").getData().results.Crttime = scurtime;
                            this.getOwnerComponent().getModel("create").refresh(true);
                            }
                        });
                    });
                });
            }
            if (stype === 'display') {
                
                this.getOdata("/CLAIMREQSet(Claimno='" + sclaimno + "')", "display", null,true).then((response) => {
                    if(sclaimno === ''){
                    if(response.Pernr === '00000000'){
                        this.getOwnerComponent().getModel("display").getData().results.Pernr = '';
                    }
                    if(response.Amt === '0.00'){
                        this.getOwnerComponent().getModel("display").getData().results.Amt = '';
                    }
                    if(sclaimno === ''){
                    this.getOwnerComponent().getModel("display").getData().results.Crtdat = null;
                    this.getOwnerComponent().getModel("display").getData().results.Crttime = null;
                    this.getOwnerComponent().getModel("display").refresh(true);  
                    }                     
                }
                });
                if(sclaimno === ''){
                    this.getOwnerComponent().getModel("claimno").setProperty("/results", true);
                }else{
                    this.getOwnerComponent().getModel("claimno").setProperty("/results", false);
                }
            }
            if(sclaimno !== '')
                {                       
                    this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle ='';
                    var oFilter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, sclaimno);
                    this.getOdata("/CRWFLOGSet","approvallog", oFilter);
                    this.getOdata("/USREMPSet(Usrid='" + this.suser + "')","user", null);
                }
            var sstr1 = {
                "editable": true
            }
            this.getOwnerComponent().getModel("Header").setProperty("/data", sstr1);
            this.getOdata("/TAXCODESet","Taxcode", null);
        },
    });
});