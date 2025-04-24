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
		fallbackDates: ko.observableArray([]),
		
		/**
		 * @returns {*}
		 */
		initialize: function () {
			this._super();
			
			var self = this;
			
			// Generate fallback dates immediately
			this.generateFallbackDates();
			
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
		 * Check if dynamic dates are available from server
		 *
		 * @returns {boolean}
		 */
		hasDynamicDates: function () {
			return window.checkoutConfig && 
				   window.checkoutConfig.clickCollectDates && 
				   window.checkoutConfig.clickCollectDates.length > 0;
		},
		
		/**
		 * Generate fallback dates dynamically if server doesn't provide them
		 */
		generateFallbackDates: function() {
			var dates = [];
			var today = new Date();
			var dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
			var currentHour = today.getHours();
			
			// Determine cutoff time - default to 2pm if not in config
			var cutoffTime = 14;
			if (window.checkoutConfig && window.checkoutConfig.clickCollectCutoffTime) {
				cutoffTime = parseInt(window.checkoutConfig.clickCollectCutoffTime);
			}
			
			// If it's past cutoff time, start from tomorrow
			var startDay = (currentHour >= cutoffTime) ? 1 : 0;
			
			// Look ahead 14 days to find 7 available days
			for (var i = startDay; i < startDay + 14; i++) {
				var testDate = new Date();
				testDate.setDate(today.getDate() + i);
				var testDayOfWeek = testDate.getDay();
				
				// Skip weekends (adjust as needed based on your working days)
				if (testDayOfWeek === 0 || testDayOfWeek === 6) {
					continue;
				}
				
				// Format date for value
				var year = testDate.getFullYear();
				var month = (testDate.getMonth() + 1).toString().padStart(2, '0');
				var day = testDate.getDate().toString().padStart(2, '0');
				var dateValue = year + '-' + month + '-' + day;
				
				// Format date for display
				var options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
				var formattedDate = testDate.toLocaleDateString('en-US', options);
				
				// Add date to options
				dates.push({
					value: dateValue,
					label: formattedDate + ' (09:00 - 16:00)'
				});
				
				// Stop when we have 7 dates
				if (dates.length >= 7) {
					break;
				}
			}
			
			this.fallbackDates(dates);
		}
	});
});