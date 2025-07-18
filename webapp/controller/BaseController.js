sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/m/MessageBox", 'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", "sap/m/UploadCollectionParameter",
    "sap/m/MessageToast","sap/m/UploadCollectionParameter",
], function (e, t, MessageBox, Filter, FilterOperator, JSONModel, Fragment, r,MessageToast,UploadCollectionParameter) {
    "use strict";
    return e.extend("zfiempclaimreq.controller.BaseController", {
        onInit() {
        },
        getRouter: function () {
            return this.getOwnerComponent().getRouter()
        },
        getModel: function (e) {
            return this.getView().getModel(e)
        },
        setModel: function (e, t) {
            return this.getView().setModel(e, t)
        },
        showBusy: function (bBusy) {
            if (bBusy) {
                sap.ui.core.BusyIndicator.show(0);
            } else {
                sap.ui.core.BusyIndicator.hide();
            }
        },
        getText: function (sProperty, aArgs) {
            if (!this._oResourceBundle) {
                this._oResourceBundle = this.getModel("i18n").getResourceBundle();
            }
            return this._oResourceBundle.getText(sProperty, aArgs);
        },

        getResourceBundle: function (sText) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle()
        },

        onCloseExpType: function (oEvent) {
            this.irowindex = '';
            this.ExpType.close();
        },
        onOpenExpType: function (oEvent) {
            var irow = oEvent.getParameter("id").split("-");
            var irowindex = irow[irow.length-1];
            this.irowindex = irowindex;
            if (!this.ExpType) {
                this.ExpType = sap.ui.xmlfragment("zfiempclaimreq.fragment.ExpType", this);
                this.getView().addDependent(this.ExpType);
            };            
            this.getOdata("/EXPTYPESet","ExpType",null);
            this.ExpType.open();
        },
        onValidation:function(ovalue){
            var bflag = true;
            if(ovalue.Pernr === null || ovalue.Pernr === ''){
                MessageBox.error("Please enter Employee ID");
                bflag = false;
            }
            else if(ovalue.Kostl === null || ovalue.Kostl === ''){
                MessageBox.error("Please enter Cost Centre");
                bflag = false;
            }
            // else if(ovalue.ExpType === null || ovalue.ExpType === ''){
            //     MessageBox.error("Please enter Expense/Reimbursement");
            //     bflag = false;
            // }
            else if(ovalue.Claimdat === null || ovalue.Claimdat === ''){
                MessageBox.error("Please enter Expense Date");
                bflag = false;
            }
            // else if(ovalue.Amt === ''){
            //     MessageBox.error("Please enter Expense Amount");
            //     bflag = false;
            // }
            else if(ovalue.Curr === ''){
                MessageBox.error("Please enter Currency");
                bflag = false;
            }
            else if(ovalue.Ctext === ''){
                MessageBox.error(" Please enter  Description");
                bflag = false;
            }
            else if(this.getModel("UploadAttachmentModel").getData().ATTACHSet === undefined){
                MessageBox.error("Attachment is mandatory");
                bflag = false;
            }
            else if(this.getModel("UploadAttachmentModel").getData().ATTACHSet !== undefined
                && this.getOwnerComponent().getModel("attachflag").getProperty("/flag") !== undefined
                 && this.getOwnerComponent().getModel("attachflag").getProperty("/flag") === ''){
                MessageBox.error("Attachment is mandatory");
                bflag = false;
            }
            else if(this.getView().getModel("item").getData().results === undefined){
                MessageBox.error("Please enter Expense/Reimbursement");
                bflag = false;
            }
            else if(this.getView().getModel("item").getData().results !== undefined){
                this.getView().getModel("item").getData().results.forEach(function (item, index) {
                    if(item.Exptype === ''){
                        MessageBox.error("Please enter Expense/Reimbursement");
                        bflag = false;
                    }else if(item.Amt !== ''){
                        var fval = parseFloat(item.Amt);
                        if(fval === 0){
                            MessageBox.error("Please enter Expense Amount");
                            bflag = false;
                        }
                        else if(fval < 0){
                            MessageBox.error("Expense Amount cannot be negative");
                            bflag = false;
                        }
                    }                    
                    else if(item.Amt === '' ){
                        MessageBox.error("Please enter Expense Amount");
                        bflag = false;
                    }
                });
            }
           
            return bflag;
        },
        onSaveTaxCode: function (oEvent) {
            var oPayload = this.getOwnerComponent().getModel("display").getData().results;
            oPayload.ClaimToItems = this.getOwnerComponent().getModel("item").getData().results;            
            this.showBusy(true);
            
            this.getModel().create("/CLAIMREQSet", oPayload, {
                method: "POST",
                success: function (oData, res) {
                    this.showBusy(false);
                    if (oData.Claimno !== '') {                       
                        var sMsg ="Tax Code for Claim No." + oData.Claimno + " saved Successfully ";
                        MessageBox.success(sMsg);
                    } else {
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
            // var sclaimno = this.getView().getModel("display").getData().results.Claimno;
            // var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
            // var href = (xnavservice && xnavservice.hrefForExternal({
            //     target: { semanticObject: "zfiempclaimapp", action: "approve" },
            //     params: { "Claimno": sclaimno }
            // })) || "";
            // 
            // if (href.indexOf("&sap-app-origin-hint=") !== -1) {
            //     href.replaceAll("&sap-app-origin-hint=", "");
            // }
            // var sval = href.split("?");

            // var finalUrl = window.location.href.split("#")[0] + "&"+sval[1]+sval[0];
            // 
            // sap.m.URLHelper.redirect(finalUrl, true);

        },
        onSearchExpType: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("ExpType", sap.ui.model.FilterOperator.EQ, sValue);
            this.getOdata("/EXPTYPESet","ExpType", [oFilter]);
        },
        onPressDisplay: function (oEvent) {
            var suser = '';
            if(sap.ushell !== undefined){
                suser = sap.ushell.Container.getService("UserInfo").getId();
            }
            debugger;
            var sValue = this.getView().getModel("display").getData().results.Claimno;
            
            var oFilter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, sValue);
           //(Claimno='" + sValue + "',Pernr='" + sLotNo + "')
           if(sValue === ''){
            MessageBox.error("Please enter Claim no");
           }else{
            //this.getOdata("/CLAIMREQSet(Claimno='" + sValue + "')","display", null);
            this.getOdata("/CRWFLOGSet","approvallog", oFilter);
            this.getOdata("/CLAIMREQSet(Claimno='" + sValue + "')","display", null,true).then((response) => {
                if(response.Status === 'RE' && suser === response.Crtby){
                    this.getOwnerComponent().getModel("create").setProperty("/results", response);
                    var sstr2 = {
                        "create": true,
                        "display": false,
                        "onbehalf":false,
                        "emp":true,
                    }
    
                    this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                    this.getOwnerComponent().getModel("ViewVis").refresh(true);
                    this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request";
                    //this.getResourceBundle().refresh(true);
                }
                else{
                    var sstr2 = {
                        "create": false,
                        "display": true,
                        "onbehalf":false,
                        "emp":false,
                    }
                    this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                    this.getOwnerComponent().getModel("ViewVis").refresh(true);
                    this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "Employee Claim Request Display";
                    //this.getResourceBundle().refresh(true);
                }
            });
            //this.readAllAttachmentData('', '',sValue);
           }
            
        },

        handleValueHelpExpType: function (e) {
            var oFilter = new sap.ui.model.Filter("ExpType", sap.ui.model.FilterOperator.EQ, e.getParameter("selectedItem").getProperty("title"));
           this.showBusy(true);
            this.getView().getModel().read("/EXPTYPESet(ExpType='" + e.getParameter("selectedItem").getProperty("title") + "')", {
                   // filters: [oFilter],
                    success: function (oData) {
                        this.showBusy(false);
                        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[1].setValue( oData.ExpType);
                        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[2].setText( oData.ExpName);
                        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[3].setText( oData.Saknr);
                        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[4].setText( oData.Txt50);
                        // this.getView().getModel("create").getData().results.ExpType = oData.ExpType ;
                        // this.getView().getModel("create").getData().results.ExpName = oData.ExpName ;
                        // this.getView().getModel("create").getData().results.Saknr = oData.Saknr;
                        // this.getView().getModel("create").getData().results.Stext = oData.Txt50;
                        // this.getView().getModel("create").refresh(true);
                        this.irowindex = '';
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                    }.bind(this)
                });
           
            
        },
        formatstatusapp: function (sText) {
            var sTxt = '';
            if (sText === 'SAVE' || sText === 'IN') {
                sTxt = 'In Process';
            } else if (sText === 'SUFA') {
                sTxt = 'Submitted for Approval';
            }
            else if (sText === 'AP') {
                sTxt = 'Approved';
                
            } else if (sText === 'RE') {
                sTxt = 'Reopen';
            }
            else if (sText === 'RJ') {
                sTxt = 'Rejected';
            }else if (sText === 'PO') {
                sTxt = 'Posted';
            }

            return sTxt;
        },
        timeformat: function (val) {
            if(val !== null){
            if (typeof val === 'string' || val instanceof String) {
                val = val.replace(/^PT/, '').replace(/S$/, '');
                val = val.replace('H', ':').replace('M', ':');

                var multipler = 60 * 60;
                var result = 0;
                val.split(':').forEach(function (token) {
                    result += token * multipler;
                    multipler = multipler / 60;
                });
                var timeinmiliseconds = result * 1000;

                var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                    pattern: "KK:mm:ss a"
                });
                var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
                return timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
            } else {
                val = val.ms;
                var ms = val % 1000;
                val = (val - ms) / 1000;
                var secs = val % 60;
                val = (val - secs) / 60;
                var mins = val % 60;
                var hrs = (val - mins) / 60;

                return hrs + ':' + mins + ':' + secs;
            }
        }
        },
        DateFormatStr: function (oVal) {
            if(oVal !== null){
            if (typeof oVal === 'string' || oVal instanceof String) {
                return oVal.substr(8, 2) + "-" + oVal.substr(5, 2) + "-" + oVal.substr(0, 4);
            } else if (oVal instanceof Date) {
                var sDate = oVal.toJSON();
                return sDate.substr(8, 2) + "-" + sDate.substr(5, 2) + "-" + sDate.substr(0, 4);

            }
        }
        },
        getOdata: function (surl, smodelname, ofilter,sexpand) {
            var sparam = '';               
                if(sexpand !== undefined && sexpand === true){
                    sparam = "ClaimToItems";
                }
            return new Promise((resolve, reject) => {
            if (ofilter === null) {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    urlParameters: {
                        "$expand": sparam
                    },
                    success: function (oData) {
                        this.showBusy(false);
                        if(oData.results !== undefined){
                            this.getModel(smodelname).setProperty("/results", oData.results);
                            resolve(oData.results);
                        }else{
                            if(oData.Status !== undefined && oData.Status !== 'RE' 
                                && oData.Status !== '' &&
                                window.location.href.indexOf("zfiempclaimreq-create") !== -1 )
                                {
                                this.getOdata("/CLAIMREQSet(Claimno='')", smodelname, null,true)
                            }else{
                                this.getModel(smodelname).setProperty("/results", oData);
                            }
                            
                            if(oData.ClaimToItems !== undefined && oData.ClaimToItems.results.length > 0){
                                oData.ClaimToItems.results.forEach(function (item, index) {
                                    if(item.Amt === '0.000'){
                                        item.Amt = '';
                                    }                                    
                                });
                                this.getModel("item").setProperty("/results", oData.ClaimToItems.results);
                            }
                            resolve(oData);
                        }
                        
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg);                    
                        reject();
                    }.bind(this)
                });
            } else {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    filters: [ofilter],
                    success: function (oData) {
                        this.showBusy(false);
                        if(oData.results !== undefined){
                            this.getModel(smodelname).setProperty("/results", oData.results);
                            resolve(oData.results);
                        }else{
                            this.getModel(smodelname).setProperty("/results", oData);
                            resolve(oData);
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg); 
                        reject();
                    }.bind(this)
                });
            }
        });
        },
        ondisplayAttachments: function (oEvent) {
            var e = 'AT';
            var t = this.getView(),
                a = this.getModel("i18n");
         //   this._oAttachmentDialog = t.byId("idDialogUploadAttachments11");
            var LabelText = e;
            if (!this._oAttachmentDialog) {
                this._oAttachmentDialog = sap.ui.xmlfragment(t.getId(), "zfiempclaimreq.fragment.DisplayAttachments", this);
                t.addDependent(this._oAttachmentDialog)
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oAttachmentDialog);
            this.getView().setBusy(true);
            var sclaimno = this.getOwnerComponent().getModel("display").getData().results.Claimno;
            this.readAllAttachmentData(e, 'X',sclaimno);
            var i = this.getOwnerComponent().getModel("UploadAttachmentModel");
            i.setData({
                ATTACHSet: []
            })
            this._oAttachmentDialog.open();
        },
        onUploadAttachments: function (oEvent) {
            var e = 'AT';
            var t = this.getView(),
                a = this.getModel("i18n");
          //  this._oAttachmentDialog = t.byId("idDialogUploadAttachments");
            var LabelText = e;
            if (!this._oAttachmentDialog) {
                this._oAttachmentDialog = sap.ui.xmlfragment(t.getId(), "zfiempclaimreq.fragment.UploadAttachments", this);
                t.addDependent(this._oAttachmentDialog)
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oAttachmentDialog);
            this.getView().setBusy(true);
            var sclaimno = this.getOwnerComponent().getModel("create").getData().results.Claimno;
            this.readAllAttachmentData(e, 'X',sclaimno);
            var i = this.getOwnerComponent().getModel("UploadAttachmentModel");
            i.setData({
                ATTACHSet: []
            })
            this._oAttachmentDialog.open();
        },
        readAllAttachmentData: function (e, bflag,sclaimno) {
            var t = this.getModel("AttachmentType").Claimno,
                r = this.getOwnerComponent().getModel(),
                surll = "/ATTACH1Set",
                s = [],
                sListType = e;

            if(sclaimno !== undefined){
                t = sclaimno;
            }
            s.push(new Filter("Claimno", FilterOperator.EQ, t));
           

            var n = this;
            n.getView().setBusy(true);
            r.read(surll, {
                filters: s,
                success: function (e, t) {
                    n.getView().setBusy(false);                    
                    if (bflag !== '') {
                        n._OpenAttachmentDialog(e);
                    }
                },
                error: function (e, t) {
                    n.getView().setBusy(false)
                }
            })
        },
        onFileDeletedListData: function (e) {
            var t = e.getParameter("documentId");
            var a = this.getModel("AttachmentType").Claimno;
            var i = this.getModel();
            var r = this.getModel("UploadAttachmentModel").getProperty("/ATTACHSet");
            var o = r[0].Uname;
            var sListType = this.getModel("AttachmentType").sListType;
            var sLotno = this.getModel("AttachmentType").LotNo;
            if (sListType === "AT" || sListType === "SI") {
                sLotno = '000';
            }

            i.remove("/ATTACHSet(Claimno='" + a + "',DocId='" + t + "',Uname='" + o + "')", {
                success: function () {
                        // this.AttachmentType.checkAttachmentData = "X";

                        this.readAllAttachmentData(sListType, 'X');
                    }
                    .bind(this),
                error: function (e) {
                    sap.m.MessageBox.error("Delete Failed")
                }
            })
        },
        _OpenAttachmentDialog: function (e) {

            var t = [],
                a = this.getModel("AttachmentType").Claimno,
                i = this.getOwnerComponent().getModel("UploadAttachmentModel"),
                r = {},
                sclaimno=this.getOwnerComponent().getModel("create").getData().results.Claimno,
                surl = '';
            i.setData([]);
            for (var o = 0; o < e.results.length; o++) {
                surl = "/sap/opu/odata/sap/ZFI_EMP_CLAIM_REQ_SRV/ATTACHSet(Claimno='" + e.results[o].Claimno + "',Zlevel=" + e.results[o].Zlevel + ",Serial=" + e.results[o].Serial + ")/$value";
                r = {
                    DocId: e.results[o].Serial,
                    FileName: e.results[o].FileName,
                    ProjectCode: "",
                    Mandt: "",
                    Mimetype: e.results[o].Mimetype,
                    Claimno: e.results[o].Claimno,
                    Serial: e.results[o].Serial,
                    UpldBy: e.results[o].UpldBy,
                    UploadedOn: e.results[o].UpldDat,
                    Uname: e.results[o].UpldBy,
                    Url: surl
                };
                t.push(r)
            }
            i.setData([]);
            i.setData({
                ATTACHSet: t
            });
            this.getView().setBusy(false);
            
        },
        onHandleCancelUpload1: function (e) {
            this._oAttachmentDialog.close();
         },
        onHandleCancelUpload: function (e) {
            this._oAttachmentDialog.close();
        },

        //BOC-EX-GOME
        _getBaseURL: function () {
            var e = this.getOwnerComponent()
                .getManifestEntry("/sap.app/id")
                .replaceAll(".", "/");
            return jQuery.sap.getModulePath(e);
        },
        //EOC-EX-GOME

        onBeforeUploadStartsListData: function (e) {
            var sClaimno = this.getOwnerComponent().getModel("create").getData().results.Claimno ,
                sListType = this.getModel("AttachmentType").sListType,
                a = this.getModel("i18n");
                
            var szlevel = '0';
            var sserial = '0';
            var i = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: e.getParameter("fileName") + "|" + sClaimno + "|" + szlevel + "|" + sserial //add lot no after t
            });
            var o = new sap.m.UploadCollectionParameter({
                name: "X-Requested-With",
                value: "XMLHttpRequest"
            });
            var s = new sap.m.UploadCollectionParameter({
                name: "Content-Disposition",
                value: e.getParameter("fileName")
            });
            var n = new sap.m.UploadCollectionParameter({
                name: "Content-Type",
                value: "application/octet-stream"
            });
            e.getParameters().addHeaderParameter(i);
            e.getParameters().addHeaderParameter(n);
            e.getParameters().addHeaderParameter(o);
            e.getParameters().addHeaderParameter(s)
        },
        onUploadCompleteListData: function (e) {
            
            this.readAllAttachmentData(this.getModel("AttachmentType").sListType, 'X');
        },
        onChangeListData: function (e) {
            //BOC-EX-GOME
            this.getOwnerComponent().getModel("attachflag").setProperty("/flag", 'X');
            var t = "/sap/opu/odata/sap/ZFI_EMP_CLAIM_REQ_SRV",
                //EOC-EX-GOME
                a = {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/atom+xml",
                    "X-CSRF-Token": "Fetch"
                },
                i = new sap.ui.model.odata.ODataModel(t, "false", "", "", a, true);
            sap.ui.getCore().setModel(i, "XCRFTokenModel");
            sap.ui.getCore().getModel("XCRFTokenModel").refreshSecurityToken();
            var r = sap.ui.getCore().getModel("XCRFTokenModel").getHeaders()["x-csrf-token"],
                o = e.getSource(),
                s = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: r
                });
            o.addHeaderParameter(s)
        },
        onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			//MessageToast.show("Event change triggered");
		},

		onFileDeleted: function(oEvent) {
			//MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed: function(oEvent) {
			//MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed: function(oEvent) {
			//MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch: function(oEvent) {
			//MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload: function(oEvent) {
			var oUploadCollection = this.byId("idUploadCollectionAttachments");
            
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles > 0) {
				oUploadCollection.upload();

				
			}
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function() {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete: function(oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].FileName;
			setTimeout(function() {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
    });
});