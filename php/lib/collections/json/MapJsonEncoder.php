<?php

class MapJsonEncoder {
    private $mapId;
    private $dataArray; // source array of Map

    public function __construct($dataArray, $mapId){
        $this->mapId = $mapId;
        $this->dataArray = $dataArray;
    }

    public function encode(){
        return $this->getEncodedArray($this->dataArray);
    }

    private function getEncodedArray($dataArray){
        $collectionArray = array();
        $collectionArray["id"] = $this->mapId;

        $keys = array_keys($this->dataArray);

        for($i=0; $i<count($keys); $i++){
            $key = $keys[$i];
            $element = $dataArray[$key];

            $elementIsString = is_string($element);
            $elementIsFloat = is_float($element);
            $elementIsBoolean= is_bool($element);
            $elementIsInteger= is_int($element);

            if($elementIsString || $elementIsFloat || $elementIsBoolean || $elementIsInteger){
                $collectionArray[$key] = $element;
            }
            else{
                try{
                    $reflect = new ReflectionClass($element);
                    $elementClass = $reflect->getShortName();
                }
                catch(ReflectionException $exception){
                    throw new MapJsonEncoderException('Some elements are not Map. MapJsonEncoder supports only Map type of data.');
                }

                if($elementClass === 'Map'){
                    $mapJsonEncoder = $element->getJsonEncoder();

                    $collectionArray[$key] = $mapJsonEncoder->encode();
                }
            }
        }

        $encodedString = json_encode($collectionArray);
        return $encodedString;
    }
} 