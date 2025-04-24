define([
	'jquery',
	'ko',
	'uiComponent',
	'Magento_Checkout/js/model/quote',
	'mage/translate'
], function ($, ko, Component, quote, $t) {
	'use strict';

	return Component.extend({
		defaults: {
			template: 'CravenDunnill_ClickCollect/checkout/shipping/click-collect-dates'
		},
		
		selectedCollectionDate: ko.observable(''),
		availableDates: ko.observableArray([]),
		
		/**
		 * Component initialization
		 */
		initialize: function () {
			this._super();
			
			var self = this;
			
			// Load dates from config
			if (window.checkoutConfig && window.checkoutConfig.clickCollectDates) {
				this.availableDates(window.checkoutConfig.clickCollectDates);
			} else {
				this.generateFallbackDates();
			}
			
			// Get holidays from config if available
			this.holidays = [];
			if (window.checkoutConfig && window.checkoutConfig.clickCollectHolidays) {
				this.holidays = window.checkoutConfig.clickCollectHolidays;
			}
			
			// Subscribe to shipping method changes
			quote.shippingMethod.subscribe(function (method) {
				if (method && method.carrier_code === 'clickcollect' && method.method_code === 'clickcollect') {
					// Make collection date required
					$('#click_collect_date').addClass('required-entry');
				} else {
					// Remove required validation
					$('#click_collect_date').removeClass('required-entry');
					
					// Clear the selected date
					self.selectedCollectionDate('');
				}
			});
			
			// Subscribe to collection date changes
			this.selectedCollectionDate.subscribe(function (value) {
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
		 */
		isClickCollectMethod: function () {
			var method = quote.shippingMethod();
			return method && method.carrier_code === 'clickcollect' && method.method_code === 'clickcollect';
		},
		
		/**
		 * Check if a date is a holiday
		 */
		isHoliday: function(dateString) {
			// Specific exclusion for the problematic date
			if (dateString === '2025-04-25') {
				return true;
			}
			
			// Check if the date is in the holidays array
			return this.holidays && this.holidays.indexOf(dateString) !== -1;
		},
		
		/**
		 * Format time in am/pm format
		 */
		formatTimeAmPm: function(hours) {
			var suffix = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; // Convert hour '0' to '12'
			return hours + suffix;
		},
		
		/**
		 * Format time with minutes in am/pm format
		 */
		formatTimeWithMinutes: function(hours, minutes) {
			var suffix = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; // Convert hour '0' to '12'
			return hours + ':' + minutes.toString().padStart(2, '0') + suffix;
		},
		
		/**
		 * Get heading text from configuration
		 */
		getHeading: function() {
			if (window.checkoutConfig && window.checkoutConfig.clickCollectHeading) {
				return window.checkoutConfig.clickCollectHeading;
			}
			return 'Collect your order from 2 hours';
		},
		
		/**
		 * Get description text from configuration
		 */
		getDescription: function() {
			if (window.checkoutConfig && window.checkoutConfig.clickCollectDescription) {
				return window.checkoutConfig.clickCollectDescription;
			}
			return 'It\'s free to collect your order from our warehouse. We\'re open Monday to Friday 9am to 4pm.';
		},
		
		/**
		 * Generate fallback dates dynamically if server doesn't provide them
		 */
		generateFallbackDates: function() {
			var dates = [];
			var today = new Date();
			var dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
			var currentHour = today.getHours();
			var currentMinute = today.getMinutes();
			
			// Standard opening/closing hours
			var openingHour = 9;
			var closingHour = 16;
			
			// Look ahead 21 days to find 10 available days
			for (var i = 0; i < 21; i++) {
				var testDate = new Date();
				testDate.setDate(today.getDate() + i);
				var testDayOfWeek = testDate.getDay();
				
				// Format date for value and holiday check
				var year = testDate.getFullYear();
				var month = (testDate.getMonth() + 1).toString().padStart(2, '0');
				var day = testDate.getDate().toString().padStart(2, '0');
				var dateValue = year + '-' + month + '-' + day;
				
				// Skip weekends
				if (testDayOfWeek === 0 || testDayOfWeek === 6) {
					continue;
				}
				
				// Skip holidays
				if (this.isHoliday(dateValue)) {
					continue;
				}
				
				// Format date for display in British format
				var dayName = testDate.toLocaleDateString('en-GB', { weekday: 'long' });
				var dayNum = testDate.getDate();
				var monthName = testDate.toLocaleDateString('en-GB', { month: 'long' });
				var yearNum = testDate.getFullYear();
				var formattedDate = dayNum + ' ' + monthName + ' ' + yearNum;
				
				// Default opening and closing times
				var startHour = openingHour;
				var endHour = closingHour;
				
				// Special handling for today
				if (i === 0) {
					// Calculate collection time (current time + 2 hours)
					var collectionHour = currentHour + 2;
					var collectionMinute = currentMinute;
					
					// Round up to the nearest 5 minutes
					if (collectionMinute % 5 !== 0) {
						collectionMinute = Math.ceil(collectionMinute / 5) * 5;
						if (collectionMinute >= 60) {
							collectionHour++;
							collectionMinute = 0;
						}
					}
					
					// Check if collection time is before closing time
					if (collectionHour >= closingHour || 
						(collectionHour === closingHour && collectionMinute > 0)) {
						// Skip today as it's too late to collect
						continue;
					}
					
					// Use calculated collection time as opening time for today
					startHour = collectionHour;
					
					// Display with minutes for today only
					var label = dayName + ' ' + formattedDate + ' (from ' + 
						this.formatTimeWithMinutes(collectionHour, collectionMinute) + '-' + 
						this.formatTimeAmPm(endHour) + ')';
						
					dates.push({
						value: dateValue,
						label: label
					});
				} else {
					// Normal display for future dates
					dates.push({
						value: dateValue,
						label: dayName + ' ' + formattedDate + ' (from ' + 
							this.formatTimeAmPm(startHour) + '-' + 
							this.formatTimeAmPm(endHour) + ')'
					});
				}
				
				// Stop when we have 10 dates
				if (dates.length >= 10) {
					break;
				}
			}
			
			this.availableDates(dates);
		}
	});
});