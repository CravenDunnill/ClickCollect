<?php
namespace CravenDunnill\ClickCollect\Plugin;

use Magento\Sales\Model\ResourceModel\Order\Grid\Collection;

class AddCollectionDateToOrderGrid
{
	/**
	 * Add collection date to order grid
	 *
	 * @param Collection $subject
	 * @param Collection $result
	 * @return Collection
	 */
	public function afterGetItems(Collection $subject, $result)
	{
		if (!$subject->getFlag('click_collect_date_added')) {
			$subject->getSelect()->joinLeft(
				['sales_order' => $subject->getTable('sales_order')],
				'main_table.entity_id = sales_order.entity_id',
				['click_collect_date' => 'sales_order.click_collect_date']
			);
			$subject->setFlag('click_collect_date_added', true);
		}

		return $result;
	}
}