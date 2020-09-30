<?php


class IndexedListIterator extends AbstractCollectionIterator
{
    public function hasNext(){
        parent::hasNext();
        
        if($this->nextIndex<count($this->collection)){
            return true;
        }
        else{
            return false;
        }
    }

    public function next(){
        parent::next();
        return $this->collection[$this->index];
    }
}