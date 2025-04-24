<?php
namespace CravenDunnill\ClickCollect\Model\Carrier;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Quote\Model\Quote\Address\RateRequest;
use Magento\Shipping\Model\Carrier\AbstractCarrier;
use Magento\Shipping\Model\Carrier\CarrierInterface;
use Magento\Shipping\Model\Rate\Result;
use Magento\Quote\Model\Quote\Address\RateResult\ErrorFactory;
use Magento\Quote\Model\Quote\Address\RateResult\MethodFactory;
use Magento\Shipping\Model\Rate\ResultFactory;
use Psr\Log\LoggerInterface;

class ClickCollect extends AbstractCarrier implements CarrierInterface
{
	/**
	 * @var string
	 */
	protected $_code = 'clickcollect';

	/**
	 * @var bool
	 */
	protected $_isFixed = true;

	/**
	 * @var ResultFactory
	 */
	protected $_rateResultFactory;

	/**
	 * @var MethodFactory
	 */
	protected $_rateMethodFactory;

	/**
	 * @param ScopeConfigInterface $scopeConfig
	 * @param ErrorFactory $rateErrorFactory
	 * @param LoggerInterface $logger
	 * @param ResultFactory $rateResultFactory
	 * @param MethodFactory $rateMethodFactory
	 * @param array $data
	 */
	public function __construct(
		ScopeConfigInterface $scopeConfig,
		ErrorFactory $rateErrorFactory,
		LoggerInterface $logger,
		ResultFactory $rateResultFactory,
		MethodFactory $rateMethodFactory,
		array $data = []
	) {
		$this->_rateResultFactory = $rateResultFactory;
		$this->_rateMethodFactory = $rateMethodFactory;
		parent::__construct($scopeConfig, $rateErrorFactory, $logger, $data);
	}

	/**
	 * Collect and get rates
	 *
	 * @param RateRequest $request
	 * @return Result|bool
	 */
	public function collectRates(RateRequest $request)
	{
		// Debug logging - IMPORTANT for troubleshooting
		$this->_logger->debug('ClickCollect::collectRates called');
		
		if (!$this->getConfigFlag('active')) {
			$this->_logger->debug('ClickCollect shipping method is not active');
			return false;
		}
		
		// Check for minimum order amount
		$minOrderTotal = $this->getConfigData('min_order_total');
		if ($minOrderTotal && $request->getBaseSubtotalInclTax() < $minOrderTotal) {
			$this->_logger->debug('Order total less than minimum: ' . $request->getBaseSubtotalInclTax() . ' < ' . $minOrderTotal);
			return false;
		}
		
		// Check for maximum order amount
		$maxOrderTotal = $this->getConfigData('max_order_total');
		if ($maxOrderTotal && $request->getBaseSubtotalInclTax() > $maxOrderTotal) {
			$this->_logger->debug('Order total greater than maximum: ' . $request->getBaseSubtotalInclTax() . ' > ' . $maxOrderTotal);
			return false;
		}
		
		// Check specific country restrictions
		if ($this->getConfigData('sallowspecific') == 1) {
			$allowedCountries = explode(',', $this->getConfigData('specificcountry'));
			if (!in_array($request->getDestCountryId(), $allowedCountries)) {
				$this->_logger->debug('Country not allowed: ' . $request->getDestCountryId());
				return false;
			}
		}
		
		$this->_logger->debug('ClickCollect is active, creating rate result');

		/** @var Result $result */
		$result = $this->_rateResultFactory->create();

		/** @var \Magento\Quote\Model\Quote\Address\RateResult\Method $method */
		$method = $this->_rateMethodFactory->create();

		$method->setCarrier($this->_code);
		$method->setCarrierTitle($this->getConfigData('title'));
		$method->setMethod($this->_code);
		$method->setMethodTitle($this->getConfigData('method_name'));
		$method->setPrice(0);
		$method->setCost(0);

		$result->append($method);
		
		$this->_logger->debug('Added method to result: ' . $this->_code);

		return $result;
	}

	/**
	 * Get allowed shipping methods
	 *
	 * @return array
	 */
	public function getAllowedMethods()
	{
		return [$this->_code => $this->getConfigData('method_name')];
	}

	/**
	 * Check if carrier has shipping tracking option available
	 *
	 * @return bool
	 */
	public function isTrackingAvailable()
	{
		return false;
	}
	
	/**
	 * Check if carrier has shipping labels available
	 *
	 * @return bool
	 */
	public function isShippingLabelsAvailable()
	{
		return false;
	}
}