<?php
namespace CravenDunnill\ClickCollect\Model;

use Magento\Checkout\Model\ConfigProviderInterface;
use CravenDunnill\ClickCollect\Helper\Data as ClickCollectHelper;

class CheckoutConfigProvider implements ConfigProviderInterface
{
	/**
	 * @var ClickCollectHelper
	 */
	protected $helper;

	/**
	 * @param ClickCollectHelper $helper
	 */
	public function __construct(
		ClickCollectHelper $helper
	) {
		$this->helper = $helper;
	}

	/**
	 * Add Click & Collect configuration to checkout config
	 *
	 * @return array
	 */
	public function getConfig()
	{
		$config = [];
		
		if ($this->helper->isEnabled()) {
			$dates = $this->helper->getAvailableCollectionDates();
			
			// Debug - log available dates
			$writer = new \Zend\Log\Writer\Stream(BP . '/var/log/click_collect_dates.log');
			$logger = new \Zend\Log\Logger();
			$logger->addWriter($writer);
			$logger->info('Available dates: ' . print_r($dates, true));
			
			$formattedDates = [];
			foreach ($dates as $date) {
				$formattedDates[] = [
					'value' => $date['date'],
					'label' => $date['day_name'] . ' ' . $date['formatted_date'] . ' (from ' . $date['opening'] . '-' . $date['closing'] . ')'
				];
			}
			
			$config['clickCollectDates'] = $formattedDates;
			$config['clickCollectHeading'] = $this->helper->getHeading();
			$config['clickCollectDescription'] = $this->helper->getDescription();
			$config['clickCollectCutoffTime'] = $this->helper->getCutoffTime();
			
			// Get and add holidays to config for JavaScript with hard-coded test date
			$holidays = $this->helper->getHolidays();
			// Ensure our test date is in the array for testing
			if (!in_array('2025-04-25', $holidays)) {
				$holidays[] = '2025-04-25';
			}
			$config['clickCollectHolidays'] = $holidays;
			
			// Debug - log formatted dates and holidays
			$logger->info('Formatted dates for checkout: ' . print_r($formattedDates, true));
			$logger->info('Holidays for checkout: ' . print_r($this->helper->getHolidays(), true));
		}
		
		return $config;
	}
}