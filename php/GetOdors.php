<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 30.09.2020
 * Time: 22:52
 */
class GetOdors
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
        $odors = get_posts( array(
            'numberposts' => 60,
            'category'    => $this->productCategories,
            'post_type'   => 'post',
            'suppress_filters' => true
        ) );
        
        return $this->parseOdors($odors);
    }

    private function parseOdors($odors)
    {
        $parser = new OdorsParser($odors);
        return $parser->parse();

        //$finder = new SimilarFinder($odors);
        //$finder->find();
    }
}