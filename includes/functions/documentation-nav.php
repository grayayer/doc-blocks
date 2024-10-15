<?php

namespace GraysDocsBlocks\Functions;

// SIBLING NAVIGATION BLOCKS.

function render_page_sibling_navigation_block( $attributes ) {
	$use_page_order         = isset( $attributes['usePageOrder'] ) ? $attributes['usePageOrder'] : false;
	$navigation_type        = isset( $attributes['navigationType'] ) ? $attributes['navigationType'] : 'both';
	$use_parent_as_previous = isset( $attributes['useParentAsPrevious'] ) ? $attributes['useParentAsPrevious'] : false;
	$use_next_topic_as_next = isset( $attributes['useNextTopicAsNext'] ) ? $attributes['useNextTopicAsNext'] : false;

	if ( ! is_page() ) {
		return ''; // Only render for pages.
	}

	$current_page = get_post();
	$parent_id	  = wp_get_post_parent_id( $current_page );

	if ( ! $parent_id ) {
		return ''; // Only render for pages with a parent.
	}

	$siblings = get_pages(
		array(
			'child_of'    => $parent_id,
			'sort_column' => $use_page_order ? 'menu_order' : 'post_date',
			'sort_order'  => 'ASC',
		)
	);

	$current_index = array_search( $current_page->ID, wp_list_pluck( $siblings, 'ID' ) );

	if ( false === $current_index ) {
		return '';
	}

	// Debugging: Log the values of the attributes and key variables.
	error_log( 'useNextTopicAsNext: ' . ( $use_next_topic_as_next ? 'true' : 'false' ) );
	error_log( 'current_index: ' . $current_index );
	error_log( 'siblings count: ' . count( $siblings ) );

	$output = '<nav class="navigation page-sibling-navigation" role="navigation">
		<h2 class="screen-reader-text">Page navigation</h2>
		<div class="nav-links">';

	if ( 'both' === $navigation_type || 'previous' === $navigation_type ) {
		$prev_index = $current_index - 1;
		if ( 0 <= $prev_index ) {
			$prev_page = $siblings[ $prev_index ];
			$output  .= sprintf(
				'<a class="wayfinding nav-previous" href="%s">
					<i class="fa-solid fa-angles-left"></i>
					<span class="words">
						<span class="meta-nav">Previous Article</span>
						<span class="adjacent-sibling-page-title">%s</span>
					</span>
				</a>',
				get_permalink( $prev_page ),
				esc_html( $prev_page->post_title )
			);
		} elseif ( $use_parent_as_previous ) {
			$parent_page = get_post( $parent_id );
			$output	 .= sprintf(
				'<a class="wayfinding nav-previous" href="%s">
					<i class="fa-solid fa-angles-left"></i>
					<span class="words">
						<span class="meta-nav">Parent Topic</span>
						<span class="adjacent-sibling-page-title">%s</span>
					</span>
				</a>',
				get_permalink( $parent_page ),
				esc_html( $parent_page->post_title )
			);
		}
	}

if ( 'both' === $navigation_type || 'next' === $navigation_type ) {
    $next_index = $current_index + 1;

    if ( $next_index < count( $siblings ) ) {
		$next_page = $siblings[ $next_index ];
		$output   .= sprintf(
			'<a class="wayfinding nav-next" href="%s">
				<span class="words">
					<span class="meta-nav">Next Article</span>
					<span class="adjacent-sibling-page-title">%s</span>
				</span>
				<i class="fa-solid fa-angles-right"></i>
			</a>',
			get_permalink( $next_page ),
			esc_html( $next_page->post_title )
		);
    } elseif ( $use_next_topic_as_next ) {
        $next_parent_sibling_id = get_next_parent_sibling_id( $current_page->ID );

        if ( $next_parent_sibling_id ) {
            $next_topic = get_post( $next_parent_sibling_id );
            $output    .= sprintf(
                '<a class="wayfinding nav-next" href="%s">
                    <span class="words">
                        <span class="meta-nav">Next Topic</span>
                        <span class="adjacent-sibling-page-title">%s</span>
                    </span>
                    <i class="fa-solid fa-angles-right"></i>
                </a>',
                get_permalink( $next_topic ),
                esc_html( $next_topic->post_title )
            );
        } else {
            // Debugging: Log if no next topic is found.
            error_log( 'No next topic found.' );
        }
    }
}

	$output .= '</div></nav>';

	// Debugging: Log the final output.
	error_log( 'Navigation output: ' . $output );

	return $output;
}