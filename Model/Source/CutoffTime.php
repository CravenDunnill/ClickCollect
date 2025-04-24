<?php
namespace CravenDunnill\ClickCollect\Model\Source;

use Magento\Framework\Option\ArrayInterface;

class CutoffTime implements ArrayInterface
{
	/**
	 * Return array of cutoff time options
	 *
	 * @return array
	 */
	public function toOptionArray()
	{
		return [
			['value' => '0.25', 'label' => __('15 minutes')],
			['value' => '0.5', 'label' => __('30 minutes')],
			['value' => '0.75', 'label' => __('45 minutes')],
			['value' => '1', 'label' => __('1 hour')],
			['value' => '1.25', 'label' => __('1 hour 15 minutes')],
			['value' => '1.5', 'label' => __('1 hour 30 minutes')],
			['value' => '1.75', 'label' => __('1 hour 45 minutes')],
			['value' => '2', 'label' => __('2 hours')]
		];
	}
	
	/**
	 * Get options in "key-value" format
	 *
	 * @return array
	 */
	public function toArray()
	{
		$options = [];
		foreach ($this->toOptionArray() as $option) {
			$options[$option['value']] = $option['label'];
		}
		return $options;
	}
}