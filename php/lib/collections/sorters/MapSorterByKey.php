<?php


class MapSorterByKey
{
    public function sort($array){
        ksort($array);
        return $array;
    }
}