<?php
/**
 * Custom Page Navigation Blocks
 * Description: Adds custom blocks for navigating between sibling pages.
 * Version: 1.0
 * Author: Gray Ayer
 */

namespace GraysDocsBlocks\Blocks;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function register_custom_navigation_blocks() {
	$script_path = plugin_dir_path( __FILE__ ) . 'build/index.js';
	$script_url  = plugins_url( 'build/index.js', __FILE__ );

	if ( file_exists( $script_path ) ) {
		wp_register_script(
			'custom-navigation-blocks',
			$script_url,
			array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
			filemtime( $script_path )
		);
	} else {
		// Handle the error, e.g., log it or provide a fallback
		error_log( 'Custom Navigation Blocks: build/index.js file not found.' );
		return;
	}

	register_block_type(
		'custom/next-page',
		array(
			'editor_script'   => 'custom-navigation-blocks',
			'render_callback' => 'render_next_page_link',
		)
	);

	register_block_type(
		'custom/previous-page',
		array(
			'editor_script'   => 'custom-navigation-blocks',
			'render_callback' => 'render_previous_page_link',
		)
	);
}

// Use the fully qualified function name when adding the action
add_action( 'init', __NAMESPACE__ . '\register_custom_navigation_blocks' );

function render_next_page_link( $attributes ) {
	$next_page = get_adjacent_post( false, '', false );
	if ( ! $next_page ) {
		return '';
	}
	return sprintf(
		'<a href="%1$s">%2$s</a>',
		esc_url( get_permalink( $next_page->ID ) ),
		esc_html( $attributes['label'] )
	);
}

function render_previous_page_link( $attributes ) {
	$previous_page = get_adjacent_post( false, '', true );
	if ( ! $previous_page ) {
		return '';
	}
	return sprintf(
		'<a href="%1$s">%2$s</a>',
		esc_url( get_permalink( $previous_page->ID ) ),
		esc_html( $attributes['label'] )
	);
}