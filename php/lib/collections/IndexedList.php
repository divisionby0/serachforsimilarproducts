<?php


class IndexedList extends AbstractCollection
{
    public function __construct(){
        $this->collection = array();
    }

    public function add($value){
        array_push($this->collection, $value);
    }
    public function get($index){
        $indexIsInteger = is_integer($index);

        if(!$indexIsInteger){
            throw new CollectionException('Index not integer');
        }

        if($index < 0){
            throw new CollectionException('Negative index');
        }

        $indexExists = $this->isRequiredIndexExists($index);

        if($indexExists){
            return $this->collection[$index];
        }
        else{
            throw new CollectionException('Out of size. index was '.$index.'  list size is '.$this->size());
        }
    }

    public function remove($index){
        $indexIsInteger = is_integer($index);

        if(!$indexIsInteger){
            throw new CollectionException('Index not integer');
        }
        
        if($index < 0){
            throw new CollectionException('Negative index');
        }
        
        $indexExists = $this->isRequiredIndexExists($index);
        if ($indexExists) {
            $newCollection = array();
            for ($i = 0; $i < $this->size(); $i++) {
                if ($index != $i) {
                    array_push($newCollection, $this->collection[$i]);
                }
            }
            $this->collection = $newCollection;
        } else {
            throw new CollectionException('Out of size. index was ' . $index . '  list size is ' . $this->size());
        }
    }

    private function isRequiredIndexExists($index){
        if($index <= $this->size() - 1){
            return true;
        }
        else{
            return false;
        }
    }

    public function getIterator(){
        return new IndexedListIterator($this->collection);
    }
}