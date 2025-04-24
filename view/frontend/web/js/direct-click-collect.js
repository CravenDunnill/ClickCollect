require(['jquery', 'domReady!'], function($) {
	'use strict';
	
	// Function to check shipping method and show/hide dates
	function checkShippingMethod() {
		var shippingMethod = $('input[name="shipping_method"]:checked').val();
		
		if (shippingMethod === 'clickcollect_clickcollect') {
			$('#click-collect-dates-container').show();
		} else {
			$('#click-collect-dates-container').hide();
		}
	}
	
	// Set up event listeners
	$(document).on('change', 'input[name="shipping_method"]', function() {
		checkShippingMethod();
	});
	
	// Check initially and periodically
	setTimeout(checkShippingMethod, 1000);
	setInterval(checkShippingMethod, 2000);
});