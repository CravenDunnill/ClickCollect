define([
	'jquery',
	'mage/utils/wrapper',
	'Magento_Checkout/js/model/quote'
], function ($, wrapper, quote) {
	'use strict';

	return function (checkoutData) {
		var setShippingInformationOriginal = checkoutData.setShippingInformation;

		checkoutData.setShippingInformation = wrapper.wrap(setShippingInformationOriginal, function (originalFunction) {
			// Get the selected collection date
			var collectionDate = $('#click_collect_date').val();
			
			// Check if using Click & Collect shipping method
			var shippingMethod = quote.shippingMethod();
			if (shippingMethod && 
				shippingMethod.carrier_code === 'clickcollect' && 
				shippingMethod.method_code === 'clickcollect') {
				
				// Check if date is selected
				if (!collectionDate) {
					// Show validation error
					$('#click_collect_date').addClass('mage-error');
					return false;
				}
				
				// Add collection date to extensionAttributes
				if (quote.shippingAddress() && !quote.shippingAddress().extensionAttributes) {
					quote.shippingAddress().extensionAttributes = {};
				}
				
				if (quote.shippingAddress() && quote.shippingAddress().extensionAttributes) {
					quote.shippingAddress().extensionAttributes.click_collect_date = collectionDate;
				}
			}
			
			return originalFunction();
		});

		return checkoutData;
	};
});