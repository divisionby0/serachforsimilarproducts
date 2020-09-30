<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 30.09.2020
 * Time: 12:54
 */

/*
1) находим все товары этих же типов (типа)
        - 100%-49% совпадения типов +50% схожести
        - 50%-24% совпадения типов +40% схожести
        - 25%-1% совпадения типов +30% схожести
2) в найденных ищем похожие по кол-ву совпадений нот
3) у найденных 76%-100% совпадения нот +30%, 75%-49% совпадения нот +20%, 50%-24% совпадения нот +15%,  25%-1% совпадения нот +5%
 */

class SimilarFinder
{
    private $odors;
    
    private $typeEquals_from_100_to_49_percent_value = 50;
    private $typeEquals_from_50_to_49_percent_value = 50;
    
    function __construct($odors)
    {
        // TODO сначала найти похожие по типам, сохранить их в коллекции $sampleOdor->similarOdors с высчитанными процентами схожести
        // TODO затем для этого же $sampleOdor пройтись по каждому из $sampleOdor->similarOdors и пересчитать % схожести на основании нот

        $this->odors = $odors;
    }
    
    public function find(){
        $odorsIterator = $this->odors->getIterator();

        while($odorsIterator->hasNext()){
            $currentOdor = $odorsIterator->next();
            echo "<p><b>current odor:  ".$currentOdor->getName()."</b></p>";

            $this->findSimilarByType($currentOdor);
        }
    }

    private function findSimilarByType($sampleOdor)
    {
        // получение типов выбранного из общей коллекции запаха
        $sampleOdorTypeCollection = $sampleOdor->getTypeCollection();

        // получение итератора общей коллекции запахов
        $collectionOdorsIterator = $this->odors->getIterator();

        echo "<p>sampleOdor types:</p>";
        print_r($sampleOdor->getTypeCollection());

        // типы каждого из общей коллекции запахов сравнивается с типами эталонного (полученным в цикле выше)
        while($collectionOdorsIterator->hasNext()){
            $similarOdor = $collectionOdorsIterator->next();

            if($similarOdor->getId()!=$sampleOdor->getId()){

                echo "<p>similar odor: <a href='".$similarOdor->getPermalink()."'>".$similarOdor->getName()."</a></p>";

                $similarOdorTypeCollection = $similarOdor->getTypeCollection();

                // сравнение типов эталонного (текущего) запаха с типами запаха, полученного перечислением
                $tmp = $this->getTypePercent($sampleOdorTypeCollection, $similarOdorTypeCollection);

                echo "<b>SAMPLE odor:".$sampleOdor->getName()." possible similar odor:".$similarOdor->getName()."  type total matches=<span style='font-size:2em;'>".$tmp."</span></b>";
            }
        }
    }

    private function getTypePercent($sampleArray, $similarArray){
        $percent = 0;
        $totalMatches = 0;
        for($i=0; $i<sizeof($sampleArray); $i++){
            $sampleType =  $sampleArray[$i];

            echo "<p>sample type:".$sampleType."</p>";

            for($j=0; $j<sizeof($similarArray); $j++){
                $similarType = $similarArray[$j];
                echo "<p>similar type:".$similarType."</p>";
                if($sampleType == $similarType){
                    $totalMatches++;
                }
            }
        }
        return $totalMatches;
    }
}