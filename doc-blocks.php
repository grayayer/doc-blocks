<?php
/**
 * Plugin Name: Documentation Blocks
 * Description: Adds Gutenberg blocks to help you build out documentation sites. Currently includes a sibling navigation block and a page hierarchy block.
 * Version: .1
 * Author: Gray Ayer
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: docs-blocks
 * @package GraysDocsBlocks
 */

namespace GraysDocsBlocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants.
define( 'GDB_VERSION', '1.0.0' );
define( 'GDB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GDB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once GDB_PLUGIN_DIR . 'includes/functions/parent-siblings.php';
require_once GDB_PLUGIN_DIR . 'includes/functions/documentation-nav.php';
require_once GDB_PLUGIN_DIR . 'includes/blocks/sibling-navigation.php';
require_once GDB_PLUGIN_DIR . 'includes/blocks/page-hierarchy.php';

/**
 * Check for rest api access.
 */
add_action(
	'rest_api_init',
	function() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error( 'rest_forbidden', __( 'You do not have permissions to access this endpoint.' ), array( 'status' => 403 ) );
		}
	}
);

/**
 * Register the new block.
 */
function register_page_sibling_navigation_block() {
	register_block_type(
		'page-hierarchy-block/sibling-navigation',
		array(
			'editor_script'   => 'page-hierarchy-block-editor-script',
			'render_callback' => __NAMESPACE__ . '\Functions\render_page_sibling_navigation_block',
		)
	);
}
add_action( 'init', __NAMESPACE__ . '\register_page_sibling_navigation_block' );

/**
 * Make sure to enqueue your script.
 */
function enqueue_page_hierarchy_block_editor_script() {
	wp_enqueue_script(
		'page-hierarchy-block-editor-script',
		plugins_url( 'build/index.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-i18n' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' ),
		true
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_page_hierarchy_block_editor_script' );