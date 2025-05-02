<?php
// add_action( 'wp_enqueue_scripts', 'add_child_theme_stylesheets', PHP_INT_MAX );
// function add_child_theme_stylesheets() {
// 	$theme = wp_get_theme();
// 	$theme_version = $theme->version;  
// 	wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );  	 	
//  	wp_enqueue_style( 'launchpad-platform-child-style', get_stylesheet_directory_uri() . '/assets/css/launchpad-platform-child.css', array(), $theme_version, 'all' );
// 	wp_enqueue_script( 'launchpad-platform-child-script', get_stylesheet_directory_uri() . '/assets/js/launchpad-platform-child.js', array('jquery'), $theme_version, true );
// }
add_action('wp_enqueue_scripts', 'add_child_theme_stylesheets', PHP_INT_MAX);
function add_child_theme_stylesheets()
{
    $theme = wp_get_theme();
    $theme_version = $theme->version;
    //for development purpose
    $theme_version = time();
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    wp_enqueue_style('launchpad-platform-child-style', get_stylesheet_directory_uri() . '/assets/css/launchpad-platform-child.css', array(), $theme_version, 'all');
    wp_enqueue_script('launchpad-platform-child-jszip-script', 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    wp_enqueue_script('launchpad-platform-child-FileSaver-script', 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
    wp_enqueue_script('launchpad-platform-child-script', get_stylesheet_directory_uri() . '/assets/js/launchpad-platform-child.js', array('jquery'), $theme_version, true);
    // Enqueue rover-range.js only on the specific page
    if (is_page('rover-range')) { // Check if the current page is the Rover Range page
        wp_enqueue_script(
            'rover-range-script',
            get_stylesheet_directory_uri() . '/assets/js/rover-range.js',
            array('jquery'),
            $theme_version,
            true
        );
    }
    // Enqueue acoustiq.js and acoustiq.css only on the Acoustiq page
    if (is_page('acoustiq')) {
        wp_enqueue_style(
            'acoustiq-style',
            get_stylesheet_directory_uri() . '/assets/css/acoustiq.css',
            array(),
            $theme_version,
            'all'
        );
        wp_enqueue_script(
            'acoustiq-script',
            get_stylesheet_directory_uri() . '/assets/js/acoustiq.js',
            array('jquery'),
            $theme_version,
            true
        );
    }
}
/* Sample Theme Element Arguments Overrides
 * 
 * This example shows how to override Post Element registered "view" template path. You need to copy the element template
 * to the child theme and do your changes there. Make sure to define the correct child path of the template.
 */
/*
 add_filter('hi_register_element_args', function($args, $element){
    if($element == 'posts'){
        $args['views'] = get_stylesheet_directory() . '/template/parts/content-posts.php';
    }
    return $args;
}, 10, 2); 
*/
/* Sample Plugin Element Arguments Overrides
 * 
 * This example shows how to override Event Plugin - Event Element registered "view" template path. You need to copy the 
 * element template to the child theme and do your changes there. Make sure to define the correct child path of the template.
 */
/*
apply_filters('hi_update_element_args', 'events', 'views', array(
    'reference' => 'layout_type', 
    'sub_views' => array(
        'map' => get_stylesheet_directory() . '/template/parts/content-events-map.php',
        'grid' => get_stylesheet_directory() . '/template/parts/content-events-grid-carousel.php',
        'carousel' => get_stylesheet_directory() . '/template/parts/content-events-grid-carousel.php',
    ),
));
*/
// add_filter('hi_register_element_args', function($args, $element){
// 	if($element == 'products'){
// 		$args['views'] = get_stylesheet_directory() . '/content-products-grid-carousel.php';
// 	}
// 	return $args;
// }, 10, 2); 
// Product Resources Shortcode
function hic_product_resources($atts)
{
    extract(shortcode_atts(
        array(
            'heading' => '',
            'type' => '',
            'class' => '',
        ),
        $atts
    ));
    ob_start();
    $downloadable_files = get_field('downloadable_files');
    ?>
    <div class="product-downloadable-files">
        <?php if ($heading): ?>
            <h4><?php echo str_replace("%title%", $type, $heading); ?></h4>
        <?php endif; ?>
        <ul <?php echo $class ? 'class="' . $class . '"' : ''; ?>>
            <?php
            $found_files = false; // Flag to track if files of specified type are found
            if (is_array($downloadable_files)):
                foreach ($downloadable_files as $file): ?>
                    <?php if ($file['prod_file_type'] === $type): ?>
                        <li class="file">
                            <?php
                            $url = isset($file['url']) ? esc_url($file['url']) : '';
                            $label = isset($file['name']) ? esc_html($file['name']) : '';
                            // Extract file extension from URL
                            $file_extension = pathinfo($url, PATHINFO_EXTENSION);
                            $file_type = strtoupper($file_extension); // Convert to uppercase
                            // Get filename from URL if not provided
                            if (empty($label) && !empty($url)) {
                                // Extract filename from URL and remove extension
                                $label = pathinfo(basename($url), PATHINFO_FILENAME);
                                // Replace underscores with spaces
                                $label = str_replace('_', ' ', $label);
                            }
                            // Get file size from URL
                            $file_size = '';
                            if (!empty($url)) {
                                $headers = get_headers($url, true);
                                if (isset($headers['Content-Length'])) {
                                    $file_size_bytes = $headers['Content-Length'];
                                    $file_size = size_format($file_size_bytes, 2); // Format file size
                                }
                                $found_files = true;
                            }
                            // Output file details
                            echo "<span class='file-url'><a href='{$url}' target='_blank'>{$label}</a></span>";
                            if (!empty($file_type)) {
                                echo "<span class='file-type'><i class='fas fa-download'></i> <a href='{$url}' target='_blank'>{$file_type}</a></span>";
                            }
                            if (!empty($file_size)) {
                                echo "<span class='file-size'>{$file_size}</span>";
                            }
                            ?>
                        </li>
                    <?php endif; ?>
                <?php endforeach;
            endif; ?>
        </ul>
        <?php if (!$found_files): ?>
            <p>No <?php echo $type; ?> files to be downloaded.</p>
        <?php endif; ?>
    </div>
    <?php
    $html = ob_get_clean();
    return $html;
}
add_shortcode('product-resources', 'hic_product_resources');
// Product Details Shortcode
function product_details_shortcode($atts)
{
    // Extract shortcode attributes
    extract(shortcode_atts(array(
        'show_image' => true, // Default value for show_image attribute
    ), $atts));
    ob_start();
    $id = get_the_ID();
    $featured_image = get_the_post_thumbnail_url($id, 'full'); // Get featured image URL
    $content = get_the_content();
    $title = get_the_title();
    $link = get_permalink();
    // Output the HTML
    ?>
    <ul class="product-listing">
        <li class="listing-item">
            <?php if ($show_image && $featured_image): ?>
                <!--                 <a href="<?php echo $link; ?>">
                    <div class="featured-image hic-image" style="background-image: url('<?php //echo $featured_image; ?>');"></div>
                </a> -->
            <?php endif; ?>
            <div class="widget-post-content">
                <a href="<?php echo $link; ?>" class="secondary-link">
                    <div class="widget-post-title">
                        <?php echo $title; ?>
                    </div>
                </a>
                <?php echo $content; ?>
                <?php if ($price): ?>
                    <div class="widget-meta product-price"><?php echo $price; ?></div>
                <?php endif; ?>
            </div>
        </li>
    </ul>
    <?php
    // Return buffered content
    return ob_get_clean();
}
add_shortcode('product-details', 'product_details_shortcode');
// Category Gallery Shortcode
if (!function_exists('hi_sc_cat_gallery')) {
    function hi_sc_cat_gallery($atts)
    {
        extract(shortcode_atts(
            array(
                // Add any attributes you need for customization
            ),
            $atts
        ));
        $term_id = get_queried_object_id();
        // Get ACF field values for the specified category ID
        $field = get_field('cat_gal_images', 'product_cat_' . $term_id);
        // Check if $field is not empty
        if (empty($field)) {
            return ''; // Return empty string if no images are found
        }
        // Output the HTML structure for the gallery using Slick slider
        ob_start();
        ?>
        <section class="page-element product-category-gallery grey-section large-container default-alignment contain-images">
            <div class="inner-section">
                <div class="grid-container">
                    <div class="grid-x grid-padding-x section-body">
                        <div class="cell hic-item">
                            <div class="hic-box">
                                <div class="hic-media-container">
                                    <div class="hic-gallery">
                                        <div class="hic-gallery-images slick-slider">
                                            <?php foreach ($field as $image_url): ?>
                                                <div class="hic-media-container slick-slide">
                                                    <div class="hic-image"
                                                        style="background-image: url('<?php echo esc_url($image_url); ?>');"></div>
                                                </div>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span class="prev-arrow"><i class="fas fa-arrow-left"></i></span>
                        <span class="next-arrow"><i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </div>
        </section>
        <?php
        $output = ob_get_clean();
        // Initialize Slick slider only if there are images
        $output .= '<script type="text/javascript">
                        jQuery(document).ready(function($) {
						$(".product-category-gallery .hic-gallery-images").slick({
							// Add your Slick slider options here
							infinite: true,
							slidesToShow: 4,
							slidesToScroll: 1,
							// Add any other options you need
							prevArrow: $(".product-category-gallery .prev-arrow"),
							nextArrow: $(".product-category-gallery .next-arrow"),
							responsive: [
								{
									breakpoint: 1024,
									settings: {
										slidesToShow: 3,
										slidesToScroll: 1
										// Adjust other settings as needed
									}
								},
								{
									breakpoint: 768,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 1
										// Adjust other settings as needed
									}
								},
								{
									breakpoint: 480,
									settings: {
										slidesToShow: 1,
										slidesToScroll: 1
										// Adjust other settings as needed
									}
								}
							]
						});
					});
                    </script>';
        return $output;
    }
}
if (!shortcode_exists('category-gallery')) {
    add_shortcode('category-gallery', 'hi_sc_cat_gallery');
}
add_action('hi_after_hero_message', function () {
    global $post;
    $tags = wp_get_post_terms($post->ID, 'project_tag');
    $categories = wp_get_post_terms($post->ID, 'project_cat');
    if ($post->post_type != 'project') {
        return false;
    }
    $_cats = [];
    $_tags = [];
    foreach ($categories as $category) {
        $_cats[] = $category->name;
    }
    foreach ($tags as $tag) {
        $_tags[] = $tag->name;
    }
    ?>
    <?php if (!empty($_cats)): ?>
        <div class="project_cat"><span><?php echo implode(", ", $_cats); ?></span></div>
    <?php endif; ?>
    <?php if (!empty($_cats)): ?>
        <div class="project_tag"><span><?php echo implode(", ", $_tags); ?></span></div>
    <?php endif; ?>
<?php
});