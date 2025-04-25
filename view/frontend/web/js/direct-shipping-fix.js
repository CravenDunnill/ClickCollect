require(['jquery', 'domReady!'], function($) {
	'use strict';
	
	console.log('🔧 Click & Collect FORCEFUL FIX loaded');
	
	// First, remove any existing date selectors to avoid duplication
	function cleanupExistingSelectors() {
		$('#cc-date-selector, #simple-click-collect-dates').remove();
		console.log('🧹 Removed any existing date selectors');
	}
	
	// Create the date selector with a very simple structure
	function createDateSelector() {
		console.log('🛠️ Creating new date selector');
		
		// Get config data
		var config = window.checkoutConfig || {};
		var dates = config.clickCollectDates || [];
		var heading = config.clickCollectHeading || 'Collect your order from 2 hours';
		var description = config.clickCollectDescription || 
						  'It\'s free to collect your order from our warehouse. We\'re open Monday to Friday 9am to 4pm.';
		
		// Create sample dates if none exist
		if (!dates.length) {
			var today = new Date();
			for (var i = 1; i <= 5; i++) {
				var date = new Date();
				date.setDate(today.getDate() + i);
				var dateStr = date.toISOString().split('T')[0];
				var dateLabel = date.toLocaleDateString('en-GB', { 
					weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
				}) + ' (from 9am-4pm)';
				
				dates.push({
					value: dateStr,
					label: dateLabel
				});
			}
		}
		
		// Create HTML with distinct styling to ensure it's visible
		var html = '<div id="cc-date-selector" class="click-collect-dates-container" style="display:none; margin-top:20px; padding:15px; border:2px solid #ff5500; background:#f8f8f8;">' +
				  '<div class="step-title" style="font-weight:bold; font-size:16px; margin-bottom:10px;">' + heading + '</div>' +
				  '<div class="click-collect-description" style="margin-bottom:15px;">' + description + '</div>' +
				  '<div class="field required">' +
				  '<label class="label" for="click_collect_date" style="font-weight:bold;">Select Collection Date:</label>' +
				  '<div class="control">' +
				  '<select name="click_collect_date" id="click_collect_date" class="required-entry" style="width:100%; padding:8px; margin-top:5px;">' +
				  '<option value="">Please select a collection date</option>';
		
		// Add options
		for (var j = 0; j < dates.length; j++) {
			html += '<option value="' + dates[j].value + '">' + dates[j].label + '</option>';
		}
		
		html += '</select></div></div></div>';
		
		// Insert after shipping methods table with clear visual separation
		$('.table-checkout-shipping-method').after('<div style="margin-top:20px;"></div>').after(html);
		console.log('✅ Date selector created and inserted');
	}
	
	// Force radio button selection and apply visual feedback
	function forceRadioSelection() {
		// First, remove any existing handlers from rows
		$('.table-checkout-shipping-method tbody tr').off('click');
		
		// Apply enhanced click handler to each row
		$('.table-checkout-shipping-method tbody tr').each(function() {
			var $row = $(this);
			var $radio = $row.find('input[name="shipping_method"]');
			
			// Add visual indicator for the row
			$row.css({
				'cursor': 'pointer',
				'transition': 'background-color 0.3s'
			});
			
			// Add strong click handler
			$row.on('click', function(e) {
				// Don't double-process if clicking directly on the radio
				if (!$(e.target).is('input[type="radio"]')) {
					console.log('🖱️ Row clicked for method: ' + $radio.val());
					
					// Explicitly uncheck all other radios first
					$('input[name="shipping_method"]').prop('checked', false);
					
					// Force THIS radio to be checked
					$radio.prop('checked', true);
					
					// Trigger multiple events to ensure capture
					$radio.trigger('click').trigger('change');
					
					// Update the UI immediately
					updateShippingMethodUI();
					
					// Toggle date selector visibility
					updateDateSelectorVisibility();
				}
			});
		});
		
		// Also add direct handlers to radio buttons themselves
		$('input[name="shipping_method"]').off('change').on('change', function() {
			console.log('📻 Radio directly changed: ' + $(this).val());
			updateShippingMethodUI();
			updateDateSelectorVisibility();
		});
		
		console.log('🔄 Radio button handlers applied');
	}
	
	// Update the UI to clearly show selected shipping method
	function updateShippingMethodUI() {
		// Reset all rows
		$('.table-checkout-shipping-method tbody tr').css('background-color', '');
		
		// Highlight the selected row
		$('.table-checkout-shipping-method input:checked').closest('tr')
			.css('background-color', '#f0f7fd');
	}
	
	// Check and update date selector visibility
	function updateDateSelectorVisibility() {
		// Get the currently selected shipping method
		var selectedMethod = $('.table-checkout-shipping-method input:checked').val();
		console.log('🔍 Current selected method: ' + selectedMethod);
		
		// Show/hide date selector based on selection
		if (selectedMethod === 'clickcollect_clickcollect') {
			console.log('✓ Click & Collect selected, showing date selector');
			$('#cc-date-selector').show();
		} else {
			console.log('❌ Click & Collect not selected, hiding date selector');
			$('#cc-date-selector').hide();
		}
	}
	
	// Initialize everything
	function initialize() {
		console.log('🚀 Initializing forceful Click & Collect fix');
		
		// Clean up existing selectors
		cleanupExistingSelectors();
		
		// Create a fresh date selector
		createDateSelector();
		
		// Apply forceful radio selection handlers
		forceRadioSelection();
		
		// Update UI for initial state
		updateShippingMethodUI();
		
		// Force the date selector to be hidden initially
		$('#cc-date-selector').hide();
		
		console.log('✨ Initialization complete');
	}
	
	// Run initialization with a slight delay to let other scripts complete
	setTimeout(initialize, 1500);
	
	// Periodically reapply radio handlers (in case they get overwritten)
	setInterval(function() {
		forceRadioSelection();
		updateShippingMethodUI();
	}, 3000);
	
	// Handle AJAX completion
	$(document).ajaxComplete(function() {
		setTimeout(function() {
			console.log('♻️ AJAX completed, reapplying handlers');
			forceRadioSelection();
			updateShippingMethodUI();
			updateDateSelectorVisibility();
		}, 500);
	});
});