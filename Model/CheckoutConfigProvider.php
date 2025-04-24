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
					'label' => $date['day_name'] . ', ' . $date['formatted_date'] . ' (' . $date['opening'] . ' - ' . $date['closing'] . ')'
				];
			}
			
			// Ensure we have dates - if not, add fallback dates
			if (empty($formattedDates)) {
				$logger->info('No dates available, adding fallback dates');
				
				// Add fallback dates
				for ($i = 0; $i < 7; $i++) {
					$date = date('Y-m-d', strtotime("+$i days"));
					$dayName = date('l', strtotime($date));
					$formattedDate = date('M j, Y', strtotime($date));
					
					$formattedDates[] = [
						'value' => $date,
						'label' => $dayName . ', ' . $formattedDate . ' (09:00 - 16:00)'
					];
				}
			}
			
			$config['clickCollectDates'] = $formattedDates;
			$config['clickCollectHeading'] = $this->helper->getHeading();
			$config['clickCollectDescription'] = $this->helper->getDescription();
			
			// Debug - log formatted dates
			$logger->info('Formatted dates for checkout: ' . print_r($formattedDates, true));
		}
		
		return $config;
	}
}