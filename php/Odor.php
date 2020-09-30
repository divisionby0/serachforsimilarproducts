<?php

/**
 * Created by PhpStorm.
 * User: ilya
 * Date: 30.09.2020
 * Time: 11:25
 */
class Odor
{
    private $id;
    private $name;
    private $typeCollection;
    private $scentNoteCollection;
    private $permalink;
    private $thumb;
    
    private $similarOdorsList;

    function __construct($id, $name, $typeCollection, $scentNoteCollection, $permalink, $thumb)
    {
        $this->id = $id;
        $this->name = $name;
        $this->typeCollection = $typeCollection;
        $this->scentNoteCollection = $scentNoteCollection;
        $this->permalink = $permalink;
        $this->thumb = $thumb;
        $this->similarOdors = new IndexedList();
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getTypeCollection()
    {
        return $this->typeCollection;
    }

    /**
     * @return mixed
     */
    public function getScentNoteCollection()
    {
        return $this->scentNoteCollection;
    }

    /**
     * @return mixed
     */
    public function getPermalink()
    {
        return $this->permalink;
    }

    /**
     * @return mixed
     */
    public function getThumb()
    {
        return $this->thumb;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }


}