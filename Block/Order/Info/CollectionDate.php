<?php
namespace CravenDunnill\ClickCollect\Block\Order\Info;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Framework\Registry;

class CollectionDate extends Template
{
	/**
	 * @var Registry
	 */
	protected $registry;

	/**
	 * @param Context $context
	 * @param Registry $registry
	 * @param array $data
	 */
	public function __construct(
		Context $context,
		Registry $registry,
		array $data = []
	) {
		$this->registry = $registry;
		parent::__construct($context, $data);
	}

	/**
	 * Get current order
	 *
	 * @return \Magento\Sales\Model\Order|null
	 */
	public function getOrder()
	{
		return $this->registry->registry('current_order');
	}

	/**
	 * Get collection date from order
	 *
	 * @return string|null
	 */
	public function getCollectionDate()
	{
		$order = $this->getOrder();
		if ($order && $order->getShippingMethod() === 'clickcollect_clickcollect') {
			return $order->getClickCollectDate();
		}
		return null;
	}
}