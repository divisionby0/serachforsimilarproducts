<?php


interface ICollection
{
    public function clear();
    public function size();
    public function getIterator();
}