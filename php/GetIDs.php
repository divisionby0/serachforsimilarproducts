<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 01.10.2020
 * Time: 1:38
 */
class GetIDs
{
    function __construct()
    {
        $productCategoriesOption = get_option("productCategories");
        $this->productCategories = array_map('intval', explode(',', $productCategoriesOption));
    }

    public function execute(){
        return $this->getOdors();
    }

    private function getOdors(){
        $ids = get_posts( array(
            'numberposts' => -1,
            'category'    => $this->productCategories,
            'post_type'   => 'post',
            'fields' => 'ids',
            'suppress_filters' => true
        ) );
        
        return $ids;
    }
}