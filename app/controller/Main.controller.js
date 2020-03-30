sap.ui.define([
	'jquery.sap.global',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/m/Dialog',
	'./BaseController',
	'../model/CommonManager'
], function (jQuery, JSONModel, MessageBox, MessageToast, Dialog, BaseController, CommonCallManager) {
	"use strict";

	var MainController = BaseController.extend("resourcesefficiency.controller.Main", {
		modelEfficiency: new JSONModel(),
		onInit: function () {
			this.datePicker = this.getView().byId("datePicker");
			this.tableEfficiency = this.getView().byId("tableEfficiency");
			this.getView().setModel(this.getInfoModel(), "info");
			this.tableEfficiency.setModel(this.modelEfficiency);
			this.bestLine = this.getView().byId("bestLine");
			this.worstLine = this.getView().byId("worstLine");
		},
		onAfterRendering: function () {
      this.datePicker.setDateValue(new Date());
			this.datePicker.setSecondDateValue(new Date());
      this.getResourcesEfficiency();
		},
		onSearchPress: function () {
			this.getResourcesEfficiency();
		},
		getResourcesEfficiency: function () {

			var that = this;

      var dateFrom = this.datePicker.getDateValue().toISOString().substr(0,10);
			var dateTo = this.datePicker.getSecondDateValue().toISOString().substr(0,10);
      var resourceType = jQuery.sap.getUriParameters().get("resourceType");

			var transaction = "ES/TRANSACTIONS/LATHES/EFFICIENCY/GET_EFFICIENCY_BY_DATE_RANGE";

			if (!dateFrom || dateFrom === "" || !dateTo || dateTo === "") {
				var mes = sap.ui.getCore().getModel("i18n").getProperty("resourcesefficiency.errors.no_input_name");
				MessageToast.show(mes);
				return;
			}

			function success(data) {
				if (data.Rows) {

					var best = {
						RESRCE: '',
						PERC: 0
					};
					var worst = {
						RESRCE: '',
						PERC: 999
					};
					for (var n in data.Rows) {
						var rowEff = parseInt(data.Rows[n].PERC, 10);
						if (rowEff > best.PERC) {
							best.PERC = rowEff;
							best.RESRCE = data.Rows[n].RESRCE;
						}
						if (rowEff < worst.PERC) {
							worst.PERC = rowEff;
							worst.RESRCE = data.Rows[n].RESRCE;
						}
					}

					that.bestLine.setText(best.RESRCE + ' @ ' + best.PERC + ' %');
					that.worstLine.setText(worst.RESRCE + ' @ ' + worst.PERC + ' %');

					data.Rows.map(function (row) {
						switch (true) {
							case (row.PERC < 90) :
								row.STATUS = 'Error';
								break;
							case (row.PERC >= 95) :
								row.STATUS = 'Success';
								break;
							default :
								row.STATUS = 'Warning';
								break;
						}
						return row;
					});
					that.modelEfficiency.setProperty("/", data.Rows);
				}
			}

			function failure(err) {

			}

			var callData = {
				RESOURCE_TYPE: resourceType,
				DATE_FROM: dateFrom,
				DATE_TO: dateTo
			};

			CommonCallManager.getRows(transaction, callData, success, failure);
		}
	});

	return MainController;
});
