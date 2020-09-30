<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 30.09.2020
 * Time: 11:38
 */
class OdorsParser
{
    private $collection;
    
    function __construct($collection)
    {
        $this->collection = $collection;
    }
    
    public function parse(){
        $odors = array();
        
        foreach($this->collection as $odor){

            $id = $odor->ID;
            $name = $odor->post_title;
            $permalink = $odor->guid;
            $thumb = get_the_post_thumbnail_url($id, array(80,110));

            $typeCollection = get_post_meta($id, "tip_aromata")[0];
            $startNotes = get_post_meta($id, "nachalnaja_nota")[0];
            $heartNotes = get_post_meta($id, "nota_serdca")[0];
            $finalNotes = get_post_meta($id, "konechnaja_nota")[0];


            $notes = array();
            for($i=0; $i<sizeof($startNotes); $i++){
                array_push($notes, $startNotes[$i]);
            }
            for($i=0; $i<sizeof($heartNotes); $i++){
                array_push($notes, $heartNotes[$i]);
            }
            for($i=0; $i<sizeof($finalNotes); $i++){
                array_push($notes, $finalNotes[$i]);
            }
            
            array_push($odors,  json_encode(array("id"=>$id, "name"=>$name, "types"=>json_encode($typeCollection), "notes"=>json_encode($notes), "permalink"=>$permalink)));
        }

        return $odors;
    }
}