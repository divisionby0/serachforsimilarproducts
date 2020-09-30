<?php


class AbstractCollectionIterator
{
    protected $collection;
    protected $index = -1;
    protected $nextIndex = -1;

    public function __construct($collection){
        $this->collection = $collection;
    }

    public function hasNext(){
        $this->nextIndex = $this->index + 1;
    }

    public function next(){
        $this->index = $this->index + 1;
    }
}