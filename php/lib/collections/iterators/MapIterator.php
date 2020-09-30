<?php

class MapIterator extends AbstractCollectionIterator{
    private $keys;

    public function __construct($collection){
        parent::__construct($collection);
        $this->keys = array_keys($this->collection);
    }

    public function hasNext(){
        parent::hasNext();
        if($this->nextIndex<count($this->keys)){
            return true;
        }
        else{
            return false;
        }
    }

    public function next(){
        parent::next();
        $key = $this->keys[$this->index];
        return $this->collection[$key];
    }
} 