<?php
/**
 * Plugin Name: Search for similar products
 * Plugin URI:
 * Description: Searches for similar products by custom fields values
 * Version: 1.0
 * Author: Ilya Vasilyev
 * Author URI: https://divisionby0.ru
 */

include_once ("php/GetOdors.php");
include_once ("php/GetIDs.php");
include_once ("php/OdorsParser.php");
include_once ("php/SimilarFinder.php");

includeJS();
includeCss();


$catIDs;

// AJAX
add_action( 'wp_ajax_get_odor', 'get_odor_callback' );
function get_odor_callback(){
    $id = $_POST["id"];
    
    $title = get_the_title($id);

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

    $data = new stdClass();
    $data->id = $id;
    $data->title = $title;
    $data->notes = $notes;

    echo json_encode($data);
    wp_die();
}

add_action( 'wp_ajax_find_odors', 'find_odors_callback' );
function find_odors_callback() {

    $getOdors = new GetOdors();
    $odors = $getOdors->execute();
    
    echo json_encode($odors);
    wp_die();
}

add_action( 'wp_ajax_update_similarity', 'update_similarity_callback' );
function update_similarity_callback() {
    $odorId = $_POST["odorId"];
    $similarOdors = $_POST["similarOdors"];
    $simDataArray = json_decode($similarOdors);

    $simArray = array();

    for($i=0; $i<sizeof($simDataArray); $i++){
        array_push($simArray, $simDataArray[$i]);
    }
    
    $result = update_post_meta( $odorId, 'similar', $similarOdors);

    echo json_encode($result);
    wp_die();
}

add_action( 'wp_ajax_save_plugin_settings', 'save_plugin_settings_callback' );
function save_plugin_settings_callback() {
    $maxNoteSimilarityPercentageAllocated = $_POST["maxNoteSimilarityPercentageAllocated"];
    $minNoteSimilarityPercentageToAllow = $_POST["minNoteSimilarityPercentageToAllow"];

    if(false == get_option( 'maxNoteSimilarityPercentageAllocated')){
        $result = add_option('maxNoteSimilarityPercentageAllocated', $maxNoteSimilarityPercentageAllocated);
    }
    else{
        $result = update_option('maxNoteSimilarityPercentageAllocated',$maxNoteSimilarityPercentageAllocated);
    }
    
    if(false == get_option( 'minNoteSimilarityPercentageToAllow')){
        $result = add_option('minNoteSimilarityPercentageToAllow', $minNoteSimilarityPercentageToAllow);
    }
    else{
        $result = update_option('minNoteSimilarityPercentageToAllow',$minNoteSimilarityPercentageToAllow);
    }
    
    echo $result;
    wp_die();
}

function searchforsimilarproducts_admin_page(){
    $defaultMaxNoteSimilarityPercentageAllocated = 90;
    $defaultMinNoteSimilarityPercentageToAllow = 19;

    $maxOdorsToLoad = -1;

    $maxNoteSimilarityPercentageAllocatedOption = get_option( 'maxNoteSimilarityPercentageAllocated');
    $minNoteSimilarityPercentageToAllow = get_option( 'minNoteSimilarityPercentageToAllow');

    if($maxNoteSimilarityPercentageAllocatedOption){
        $defaultMaxNoteSimilarityPercentageAllocated = $maxNoteSimilarityPercentageAllocatedOption;
    }

    if(!isset($minNoteSimilarityPercentageToAllow) || $minNoteSimilarityPercentageToAllow == false){
        $minNoteSimilarityPercentageToAllow = $defaultMinNoteSimilarityPercentageToAllow;
    }

    $getIDs = new GetIDs();

    ?>
    <div class="wrap">
        <?php
        echo "<div id='currentScreen' style='display: none;'>searchsimilarodorpluginscreen</div>";
        echo "<div id='ids' style='display: none;'>".json_encode($getIDs->execute())."</div>";
        ?>
        <div style="width: 100%; text-align: center;">
            <div style="float: left; display: none;">
                <label style="display: block; float: left; padding-top: 5px; padding-left:6px; padding-right: 6px;" for="maxNoteSimilarityPercentageAllocatedInput">%, которые поделим на кол-во совпадений по нотам и получим % за одно свопадение:</label>
                <input id="maxNoteSimilarityPercentageAllocatedInput" type="number" min="0" max="100" value="<?php echo $defaultMaxNoteSimilarityPercentageAllocated;?>">
            </div>
            <div style="display: none; float: left;">
                <label style="display: block; float: left; padding-top: 5px; padding-left:6px; padding-right: 6px;" for="minNoteSimilarityPercentageToAllowInput">% по достижении которого запах считается похожим:</label>
                <input id="minNoteSimilarityPercentageToAllowInput" type="number" min="0" max="100" value="<?php echo $minNoteSimilarityPercentageToAllow;?>">
            </div>

            <div style="display: block; float: left;">
                <label style="display: block; float: left; padding-top: 5px; padding-left:6px; padding-right: 6px;" for="maxOdorsToLoadInput">maxOdorsToLoad (-1 = all odors):</label>
                <input id="maxOdorsToLoadInput" type="number" min="-1" max="100000" value="<?php echo $maxOdorsToLoad;?>">
            </div>

            <div style="display: none; float: left; padding-left:6px; padding-right: 6px;">
                <input id="savePluginSettingsButton" type="button" value="Сохранить настройки"/>
            </div>

            <div style="display: block; float: left; text-align: center;">
                <input id="searchButton" type="submit" name="SearchButton" value="Поиск похожих" style="margin-top: 2px;"/>
            </div>
            <div style="width: 100%; display:block; float:left; text-align: center;">
                <div id="timeElement"></div>
            </div>
            
            <div style="width: 100%; display:block; float:left; text-align: center;">
                <div id="phaseElement"></div>
            </div>
        </div>
        <div id="logView" style="width: 100%; height: 200px; overflow-y: scroll; background-color: white; margin-top: 10px;"></div>

        <details>
            <summary>О плагине</summary>
            <ul>
                <li>
                    <div>В админке добавлено поле в общих настройках, в котором вписаны категории товаров через запятую (<b>ID категорий товаров</b>). У вас же все - пост, соответственно, товар ли это, определяется по родительской категории</div>
                    <a href="https://wiki-aroma.com/wp-admin/options-general.php">https://wiki-aroma.com/wp-admin/options-general.php</a>
                </li>
                <li>
                    <div>В каждом посте (товаре, в других нет) появилась область в админке 'Similar products', например</div>
                    <a href="https://wiki-aroma.com/wp-admin/post.php?post=9171&action=edit">https://wiki-aroma.com/wp-admin/post.php?post=9171&action=edit</a>
                </li>
                <li>
                    <div>Работа плагина разделена на 3 этапа:</div>
                    <ul>
                        <li> - чтение из базы по-очереди товаров (медленно. браузер-сервер)</li>
                        <li> - поиск похожих (быстро, в памяти компа это происходит. только браузер)</li>
                        <li> - изменение информации в каждом из товаров, добавление похожих и сохранение (медленно. браузер-сервер)</li>
                    </ul>
                </li>
            </ul>
        </details>
    </div>
    <?php
}

function product_admin() {
    $pluginUrl = plugin_dir_url(__FILE__);

    //echo "<div id='pluginUrlElement' style='display: none;'>".$pluginUrl."</div>";
    $isProduct = detectIsProduct();

    if($isProduct == true || $isProduct == 1){
        createMetaboxes();
    }
}

function detectIsProduct(){
    $productCategoriesOption = get_option("productCategories");
    $productCategories = array_map('intval', explode(',', $productCategoriesOption));

    if(!isset($_GET['post'])){
        return false;
    }

    $post_id = $_GET['post'];
    $postCategories = get_the_category($post_id);

    $catIDs = array();

    foreach ( (array) $postCategories as $cat )
    {
        if ( empty($cat->slug ) )
            continue;
        array_push($catIDs, $cat->cat_ID);
    }

    $isProduct = false;

    for($i=0; $i<sizeof($catIDs); $i++){
        $postCategoryId = $catIDs[$i];
        $equals = in_array(intval($postCategoryId), $productCategories);
        if($equals == true || $equals == 1){
            $isProduct = true;
            break;
        }
    }

    return $isProduct;
}

function createMetaboxes(){
    add_meta_box( 'edit_similar_meta_box',
        'Similar products',
        'display_product_similar_meta_box',
        'post', 'normal', 'high'
    );
}

function display_product_similar_meta_box( $post ) {
    $post_id = $post->ID;

    if(!isset(get_post_meta($post_id, 'similar')[0])){
        showSimilarProductsNotSetYet();
    }
    else{
        $similarMetaDataArray = json_decode(get_post_meta($post_id, 'similar')[0]);

        echo "<div style='width: 100%; height: 160px; overflow-y: scroll;'>";

        if(sizeof($similarMetaDataArray)>0){
            for($i=0; $i<sizeof($similarMetaDataArray); $i++){

                $similarProductId = $similarMetaDataArray[$i]->id;
                $similarProductPercentage = $similarMetaDataArray[$i]->perc;
                $postTitle = get_the_title($similarProductId);
                $postThumb = get_the_post_thumbnail($similarProductId, array(100,130));
                $postPermalink = get_post_permalink($similarProductId);

                $typeCollection = get_post_meta($similarProductId, "tip_aromata")[0];
                $startNotes = get_post_meta($similarProductId, "nachalnaja_nota")[0];
                $heartNotes = get_post_meta($similarProductId, "nota_serdca")[0];
                $finalNotes = get_post_meta($similarProductId, "konechnaja_nota")[0];

                $notes = array();
                for($k=0; $k<sizeof($startNotes); $k++){
                    array_push($notes, $startNotes[$k]);
                }
                for($k=0; $k<sizeof($heartNotes); $k++){
                    array_push($notes, $heartNotes[$k]);
                }
                for($k=0; $k<sizeof($finalNotes); $k++){
                    array_push($notes, $finalNotes[$k]);
                }

                sort($typeCollection);
                sort($notes);

                $typesString = implode(', ',$typeCollection);
                $notesString = implode(', ',$notes);

                displaySimilarProduct($postTitle, $postThumb, $postPermalink, $similarProductPercentage, $typesString, $notesString);
            }
        }
        else{
            showSimilarProductsNotSetYet();
        }
        echo "</div>";
    }
}

function showSimilarProductsNotSetYet(){
    $siteUrl = get_site_url();
    echo "<b>No similar products set yet. Please execute <a target='_blank' href='".$siteUrl."/wp-admin/admin.php?page=serachforsimilarproducts%2Fserachforsimilarproducts-admin-page.php'>'Search for similar plugin'</a> first.</b>";
}

function displaySimilarProduct($postTitle, $postThumb, $postPermalink, $similarProductPercentage, $types, $notes){
    echo "<div style='width: 30%; display: block; float: left; text-align: center;'>";
    echo "<a href='".$postPermalink."' target='_blank'><h2 style='width: 100%;'>".$postTitle."  <span style='font-weight:bold; font-size:2em;'>".$similarProductPercentage."%</span></h2>";
    echo "<div style='width: 100%;'>".$postThumb."</div>";
    echo "</a>";
    echo "<div style='width: 100%;'><b>Тип: </b>".$types."</div>";
    echo "<div style='width: 100%;'><b>Ноты: </b>".$notes."</div>";
    echo "</div>";
}


function display_application_meta_box( $post ) {
    echo '<p>display_application_meta_box SIMILAR products</p>';
}

function serachforsimilarproducts_admin_menu() {
    add_menu_page( 'Search for similar products', 'Search for similar products', 'manage_options', 'serachforsimilarproducts/serachforsimilarproducts-admin-page.php', 'searchforsimilarproducts_admin_page', 'dashicons-tickets', 6  );
}

function add_option_field_to_general_admin_page(){
    $option_name = 'productCategories';
    register_setting( 'general', $option_name );

    add_settings_field(
        'productCategories_setting-id',
        'ID категорий товаров',
        'productCategories_setting_callback_function',
        'general',
        'default',
        array(
            'id' => 'productCategories_setting-id',
            'option_name' => 'productCategories'
        )
    );
}

function productCategories_setting_callback_function( $val ){
    $id = $val['id'];
    $option_name = $val['option_name'];

    ?>
    <input
        type="text"
        name="<?php echo $option_name ?>"
        id="<?php echo $id ?>"
        value="<?php echo esc_attr( get_option($option_name) ) ?>"
    />
    <?php
}

function includeJS(){
    //wp_enqueue_script( 'testData', plugin_dir_url( __FILE__ ) . '/js/testData.js');
    wp_enqueue_script( 'keyMap', plugin_dir_url( __FILE__ ) . '/js/lib/collections/KeyMap.js');
    wp_enqueue_script( 'list', plugin_dir_url( __FILE__ ) . '/js/lib/collections/List.js');
    wp_enqueue_script( 'ListIterator', plugin_dir_url( __FILE__ ) . '/js/lib/collections/iterators/ListIterator.js');
    wp_enqueue_script( 'KeyMapIterator', plugin_dir_url( __FILE__ ) . '/js/lib/collections/iterators/KeyMapIterator.js');
    wp_enqueue_script( 'MapJsonEncoder', plugin_dir_url( __FILE__ ) . '/js/lib/collections/json/MapJsonEncoder.js');
    wp_enqueue_script( 'MapJsonDecoder', plugin_dir_url( __FILE__ ) . '/js/lib/collections/json/MapJsonDecoder.js');
    wp_enqueue_script( 'eventBus', plugin_dir_url( __FILE__ ) . '/js/lib/events/EventBus.js');

    wp_enqueue_script( 'Odor', plugin_dir_url( __FILE__ ) . '/js/Odor.js');
    wp_enqueue_script( 'OdorsParser', plugin_dir_url( __FILE__ ) . '/js/OdorsParser.js');
    wp_enqueue_script( 'GetOdorsRequest', plugin_dir_url( __FILE__ ) . '/js/ajax/GetOdorsRequest.js');
    wp_enqueue_script( 'UpdateOdorSimilarityRequest', plugin_dir_url( __FILE__ ) . '/js/ajax/UpdateOdorSimilarityRequest.js');
    wp_enqueue_script( 'similarFinderApp', plugin_dir_url( __FILE__ ) . '/js/SimilarFinderApp.js');
    wp_enqueue_script( 'iteratingOdorsFinder', plugin_dir_url( __FILE__ ) . '/js/IteratingOdorsFinder.js');
    wp_enqueue_script( 'findSimilar', plugin_dir_url( __FILE__ ) . '/js/findSimilar.js', array ( 'jquery' ), null, true);
}

function includeCss(){
    wp_enqueue_style("overrideCss", plugin_dir_url( __FILE__ ) . '/style.css', array(), null, true);
}


add_action('admin_menu', 'add_option_field_to_general_admin_page');
add_action( 'admin_menu', 'serachforsimilarproducts_admin_menu' );

add_action( 'admin_init', 'product_admin' );