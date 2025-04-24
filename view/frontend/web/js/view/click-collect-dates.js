define([
	'jquery',
	'ko',
	'uiComponent',
	'Magento_Checkout/js/model/quote',
	'Magento_Checkout/js/model/shipping-service',
	'mage/translate'
], function ($, ko, Component, quote, shippingService, $t) {
	'use strict';

	return Component.extend({
		defaults: {
			template: 'CravenDunnill_ClickCollect/checkout/shipping/click-collect-dates'
		},
		
		selectedCollectionDate: ko.observable(''),
		
		/**
		 * @returns {*}
		 */
		initialize: function () {
			this._super();
			
			var self = this;
			
			// Debug - log checkout config
			console.log('Checkout Config:', window.checkoutConfig);
			console.log('Click & Collect Dates:', window.checkoutConfig ? window.checkoutConfig.clickCollectDates : 'Not Available');
			
			// Subscribe to shipping method changes
			quote.shippingMethod.subscribe(function (method) {
				console.log('Shipping method changed:', method);
				if (method && method.carrier_code === 'clickcollect' && method.method_code === 'clickcollect') {
					// Show the collection date selector
					$('#click-collect-dates-container').show();
					
					// Make collection date required
					$('#click_collect_date').addClass('required-entry');
				} else {
					// Hide the collection date selector for other shipping methods
					$('#click-collect-dates-container').hide();
					
					// Remove required validation
					$('#click_collect_date').removeClass('required-entry');
					
					// Clear the selected date
					self.selectedCollectionDate('');
				}
			});
			
			// Subscribe to collection date changes
			this.selectedCollectionDate.subscribe(function (value) {
				console.log('Selected collection date:', value);
				if (value) {
					// Save collection date to quote extension attributes
					var shippingAddress = quote.shippingAddress();
					if (shippingAddress && !shippingAddress.extensionAttributes) {
						shippingAddress.extensionAttributes = {};
					}
					
					if (shippingAddress && shippingAddress.extensionAttributes) {
						shippingAddress.extensionAttributes.click_collect_date = value;
					}
				}
			});
			
			return this;
		},
		
		/**
		 * Check if current shipping method is Click & Collect
		 *
		 * @returns {boolean}
		 */
		isClickCollectMethod: function () {
			var method = quote.shippingMethod();
			return method && method.carrier_code === 'clickcollect' && method.method_code === 'clickcollect';
		},
		
		/**
		 * Check if dynamic dates are available
		 *
		 * @returns {boolean}
		 */
		hasDynamicDates: function () {
			return window.checkoutConfig && 
				   window.checkoutConfig.clickCollectDates && 
				   window.checkoutConfig.clickCollectDates.length > 0;
		}
	});
});