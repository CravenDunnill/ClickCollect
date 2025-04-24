<?php
namespace CravenDunnill\ClickCollect\Model\Checkout;

use Magento\Checkout\Model\ShippingInformationManagement;
use Magento\Framework\App\RequestInterface;
use Magento\Quote\Api\Data\ShippingInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Quote\Model\QuoteRepository;

class SaveCollectionDateToOrderPlugin
{
	/**
	 * @var RequestInterface
	 */
	protected $request;

	/**
	 * @var QuoteRepository
	 */
	protected $quoteRepository;

	/**
	 * @param RequestInterface $request
	 * @param QuoteRepository $quoteRepository
	 */
	public function __construct(
		RequestInterface $request,
		QuoteRepository $quoteRepository
	) {
		$this->request = $request;
		$this->quoteRepository = $quoteRepository;
	}

	/**
	 * Save collection date to quote
	 *
	 * @param ShippingInformationManagement $subject
	 * @param $cartId
	 * @param \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
	 * @return array
	 * @throws NoSuchEntityException
	 */
	public function beforeSaveShippingInformation(
		ShippingInformationManagement $subject,
		$cartId,
		\Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
	) {
		$shippingCarrierCode = $addressInformation->getShippingCarrierCode();
		$shippingMethodCode = $addressInformation->getShippingMethodCode();

		if ($shippingCarrierCode == 'clickcollect' && $shippingMethodCode == 'clickcollect') {
			$extAttributes = $addressInformation->getExtensionAttributes();
			
			// Get collection date from extension attributes
			if ($extAttributes && $extAttributes->getClickCollectDate()) {
				$collectionDate = $extAttributes->getClickCollectDate();
				
				// Save to quote
				$quote = $this->quoteRepository->getActive($cartId);
				$quote->setClickCollectDate($collectionDate);
				$this->quoteRepository->save($quote);
			}
		}

		return [$cartId, $addressInformation];
	}
}