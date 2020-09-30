<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 30.09.2020
 * Time: 11:32
 */
class SimilarOdor
{
    private $id;
    private $percent;
    function __construct($id, $percent)
    {
        $this->id = $id;
        $this->percent = $percent;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getPercent()
    {
        return $this->percent;
    }
}