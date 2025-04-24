<?php
namespace CravenDunnill\ClickCollect\Block\Checkout;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use CravenDunnill\ClickCollect\Helper\Data as ClickCollectHelper;
use Magento\Checkout\Model\Session as CheckoutSession;

class ClickCollectDates extends Template
{
	/**
	 * @var ClickCollectHelper
	 */
	protected $helper;

	/**
	 * @var CheckoutSession
	 */
	protected $checkoutSession;

	/**
	 * @param Context $context
	 * @param ClickCollectHelper $helper
	 * @param CheckoutSession $checkoutSession
	 * @param array $data
	 */
	public function __construct(
		Context $context,
		ClickCollectHelper $helper,
		CheckoutSession $checkoutSession,
		array $data = []
	) {
		$this->helper = $helper;
		$this->checkoutSession = $checkoutSession;
		parent::__construct($context, $data);
	}

	/**
	 * Get heading text
	 *
	 * @return string
	 */
	public function getHeading()
	{
		return $this->helper->getHeading();
	}

	/**
	 * Get description text
	 *
	 * @return string
	 */
	public function getDescription()
	{
		return $this->helper->getDescription();
	}

	/**
	 * Get available collection dates
	 *
	 * @return array
	 */
	public function getAvailableCollectionDates()
	{
		return $this->helper->getAvailableCollectionDates();
	}

	/**
	 * Check if module is enabled
	 *
	 * @return bool
	 */
	public function isEnabled()
	{
		return $this->helper->isEnabled();
	}

	/**
	 * Get current selected collection date
	 *
	 * @return string|null
	 */
	public function getSelectedCollectionDate()
	{
		$quote = $this->checkoutSession->getQuote();
		if ($quote) {
			return $quote->getClickCollectDate();
		}
		return null;
	}
}