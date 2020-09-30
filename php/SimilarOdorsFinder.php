<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 29.09.2020
 * Time: 16:15
 */
class SimilarOdorsFinder
{
    private $productCategories;

    function __construct()
    {
        $productCategoriesOption = get_option("productCategories");
        $this->productCategories = array_map('intval', explode(',', $productCategoriesOption));
    }
    
    public function start(){
        return $this->getOdors();
    }


    private function getOdors(){
        $odors = get_posts( array(
            'numberposts' => -1,
            'category'    => $this->productCategories,
            'post_type'   => 'post',
            'suppress_filters' => true
        ) );
        
        //echo "<p>total odors: ".sizeof($odors)."</p>";
        
        $this->parseOdors($odors);
    }

    private function parseOdors($odors)
    {
        $parser = new OdorsParser($odors);
        return $parser->parse();
        
        //$finder = new SimilarFinder($odors);
        //$finder->find();
    }
}