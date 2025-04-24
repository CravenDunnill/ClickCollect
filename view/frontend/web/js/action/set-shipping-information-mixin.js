define([
	'jquery',
	'mage/utils/wrapper',
	'Magento_Checkout/js/model/quote'
], function ($, wrapper, quote) {
	'use strict';

	return function (setShippingInformationAction) {
		return wrapper.wrap(setShippingInformationAction, function (originalAction, messageContainer) {
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
					var errorMessage = $.mage.__('Please select a collection date.');
					messageContainer.addErrorMessage({ message: errorMessage });
					return false;
				}
				
				// Add collection date to extensionAttributes
				var shippingAddress = quote.shippingAddress();
				if (shippingAddress && !shippingAddress.extensionAttributes) {
					shippingAddress.extensionAttributes = {};
				}
				
				if (shippingAddress && shippingAddress.extensionAttributes) {
					shippingAddress.extensionAttributes.click_collect_date = collectionDate;
				}
			}
			
			return originalAction(messageContainer);
		});
	};
});