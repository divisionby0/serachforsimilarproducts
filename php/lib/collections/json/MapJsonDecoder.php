<?php

// TODO add json decoder exception
class MapJsonDecoder {
    private $dataString;

    public function __construct($dataString){
        $this->dataString = $dataString;
    }

    public function decode(){
        $rootMap = new Map('rootMap');
        $this->decodeObject($rootMap, $this->dataString);
        return $rootMap;
    }

    private function decodeObject($parentMap, $dataString){

        Logger::logMessage('Decoding '.$dataString);

        $decodedObject = json_decode($dataString);

        foreach($decodedObject as $key=>$value){

            //Logger::logMessage("key: ".$key);
            $elementIsObject= is_object($value);

            //Logger::logMessage(' isObject:'.$elementIsObject);

            //$valueIsMap = $this->isMap($value);
            if($elementIsObject){
                $subMap = new Map('subMap');
                $this->addToMap($parentMap, $key, $subMap);
                $this->iterateObject($subMap, $value);
            }
            else{

                //Logger::logMessage('adding property to map '.$parentMap->getId().' prop key:'.$key.'  propValue: '.$value);
                if($key === "id"){
                   // Logger::logMessage('set id '.$value.' to map '.$parentMap->getId());
                    $parentMap->setId($value);
                }
                else{
                    $this->addToMap($parentMap, $key, $value);
                }
            }
        }
    }

    private function iterateObject($parentMap, $object){

        //Logger::logMessage('<h1>Iterate Object</h1>');
        //var_dump($object);

        foreach($object as $key=>$value){
            //$valueIsMap = $this->isMap($value);
            //Logger::logMessage("key: ".$key);
            $elementIsObject= is_object($value);

            //Logger::logMessage(' isObject:'.$elementIsObject);

            if($elementIsObject){
                $subSubMap = new Map('subSubMap');
                $this->addToMap($parentMap, $key, $subSubMap);
                $this->iterateObject($subSubMap, $value);
            }
            else{
                //Logger::logMessage('adding property to map '.$parentMap->getId().' prop key:'.$key.'  propValue: '.$value);
                if($key === "id"){
                    $parentMap->setId($key);
                }
                else{
                    $this->addToMap($parentMap, $key, $value);
                }
            }
        }
    }

    private function addToMap($map, $key, $value){
        try{
            $map->add($key, $value);
        }
        catch(CollectionException $exception){
            Logger::logError($exception->getMessage());
        }
    }



    private function isMap($data) {
        try{
            $reflect = new ReflectionClass($data);
            $elementClass = $reflect->getShortName();
            //Logger::logMessage('element class: '.$elementClass);

            if($elementClass === "stdClass"){
                return true;
            }
            else{
                return false;
            }
        }
        catch(ReflectionException $exception){
            Logger::logError($exception->getMessage());
            return false;
        }

        return false;
    }
} 