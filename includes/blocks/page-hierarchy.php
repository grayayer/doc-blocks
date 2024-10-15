<?php

/**
 * Enqueue block assets.
 */

namespace GraysDocsBlocks\Blocks;


function phb_enqueue_block_assets() {
	wp_enqueue_script(
		'page-hierarchy-block-editor',
		GDB_PLUGIN_URL . 'build/index.js',
		array( 'wp-blocks', 'wp-element', 'wp-editor' ),
		filemtime( GDB_PLUGIN_DIR . 'build/index.js' ),
		true
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\phb_enqueue_block_assets' );

/**
 * Register the block.
 */
function phb_register_block() {
	register_block_type(
		'page-hierarchy-block/main',
		array(
			'editor_script'   => 'page-hierarchy-block-editor',
			'render_callback' => __NAMESPACE__ . '\phb_render_block',
		)
	);
}
add_action( 'init', __NAMESPACE__ . '\phb_register_block' );


/**
 * Block render function.
 *
 * @param array $attributes Block attributes.
 * @return string Block content.
 */
function phb_render_block( $attributes ) {
	// Fetch pages
	$pages = get_pages(
		array(
			'sort_column' => 'menu_order',
			'sort_order'  => 'asc',
		)
	);

	if ( empty( $pages ) ) {
		return '<p>' . __( 'No pages found.', 'page-hierarchy-block' ) . '</p>';
	}

	$selected_page_id = isset( $attributes['selectedPageId'] ) ? intval( $attributes['selectedPageId'] ) : 0;
	$list_type = isset( $attributes['listType'] ) ? $attributes['listType'] : 'ul';
	$hide_parent_page = isset( $attributes['hideParentPage'] ) ? $attributes['hideParentPage'] : false;
	$selected_page = null;
	$child_pages = array();

	foreach ( $pages as $page ) {
		if ( $page->ID === $selected_page_id ) {
			$selected_page = $page;
		} elseif ( $page->post_parent === $selected_page_id ) {
			$child_pages[] = $page;
		}
	}

	if ( ! $selected_page ) {
		return '<p>' . __( 'Please select a parent page.', 'page-hierarchy-block' ) . '</p>';
	}

	ob_start();
	?>
	<div class="page-hierarchy-block">
		<?php if ( ! $hide_parent_page ) : ?>
			<h3><a href="<?php echo esc_url( get_permalink( $selected_page->ID ) ); ?>"><?php echo esc_html( $selected_page->post_title ); ?></a></h3>
		<?php endif; ?>
		<?php if ( ! empty( $child_pages ) ) : ?>
			<?php if ( 'ol' === $list_type ) : ?>
				<ol>
					<?php foreach ( $child_pages as $child_page ) : ?>
						<li>
							<a href="<?php echo esc_url( get_permalink( $child_page->ID ) ); ?>">
								<?php echo esc_html( $child_page->post_title ); ?>
							</a>
						</li>
					<?php endforeach; ?>
				</ol>
			<?php else : ?>
				<ul>
					<?php foreach ( $child_pages as $child_page ) : ?>
						<li>
							<a href="<?php echo esc_url( get_permalink( $child_page->ID ) ); ?>">
								<?php echo esc_html( $child_page->post_title ); ?>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		<?php else : ?>
			<p><?php echo __( 'No child pages found.', 'page-hierarchy-block' ); ?></p>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}