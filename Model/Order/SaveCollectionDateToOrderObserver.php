<?php
namespace CravenDunnill\ClickCollect\Model\Order;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer;

class SaveCollectionDateToOrderObserver implements ObserverInterface
{
	/**
	 * Save collection date from quote to order
	 *
	 * @param Observer $observer
	 * @return void
	 */
	public function execute(Observer $observer)
	{
		$event = $observer->getEvent();
		$quote = $event->getQuote();
		$order = $event->getOrder();
		
		if ($quote->getShippingAddress()->getShippingMethod() === 'clickcollect_clickcollect') {
			$collectionDate = $quote->getClickCollectDate();
			if ($collectionDate) {
				$order->setClickCollectDate($collectionDate);
			}
		}
	}
}