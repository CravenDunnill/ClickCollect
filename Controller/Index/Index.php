<?php
namespace CravenDunnill\ClickCollect\Controller\Index;

use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\App\Action\Context;
use CravenDunnill\ClickCollect\Helper\Data as ClickCollectHelper;

class Index implements HttpGetActionInterface
{
	/**
	 * @var JsonFactory
	 */
	protected $resultJsonFactory;

	/**
	 * @var ClickCollectHelper
	 */
	protected $helper;

	/**
	 * @param JsonFactory $resultJsonFactory
	 * @param ClickCollectHelper $helper
	 */
	public function __construct(
		JsonFactory $resultJsonFactory,
		ClickCollectHelper $helper
	) {
		$this->resultJsonFactory = $resultJsonFactory;
		$this->helper = $helper;
	}

	/**
	 * Return available collection dates as JSON
	 *
	 * @return \Magento\Framework\Controller\Result\Json
	 */
	public function execute()
	{
		$result = $this->resultJsonFactory->create();
		$dates = $this->helper->getAvailableCollectionDates();
		
		$formattedDates = [];
		foreach ($dates as $date) {
			$formattedDates[] = [
				'value' => $date['date'],
				'label' => $date['day_name'] . ' ' . $date['formatted_date'] . ' (from ' . $date['opening'] . '-' . $date['closing'] . ')'
			];
		}
		
		return $result->setData($formattedDates);
	}
}