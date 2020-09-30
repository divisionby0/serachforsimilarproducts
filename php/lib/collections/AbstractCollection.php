<?php


abstract class AbstractCollection implements ICollection
{
    protected $collection;

    public function clear(){
        $this->collection = array();
    }
    public function size(){
        return count($this->collection);
    }

    public function getIterator(){
    }

    protected function isEmpty(){
        if($this->size() > 0){
            return false;
        }
        else{
            return true;
        }
    }
}