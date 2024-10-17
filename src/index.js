const { registerBlockType } = wp.blocks;
const { useBlockProps, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, ToggleControl } = wp.components;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

// "Parent & Child Pages" block code
registerBlockType( 'page-hierarchy-block/main', {
    title: 'Parent & Child Pages',
    icon: 'list-view',
    category: 'widgets',
    attributes: {
        selectedPageId: {
            type: 'number',
            default: 0,
        },
        listType: {
            type: 'string',
            default: 'ul', // Default to unordered list
        },
        hideParentPage: {
            type: 'boolean',
            default: false,
        },
    },
    edit: function( props ) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();

        const pages = useSelect( ( select ) => {
            try {
                const fetchedPages = select( 'core' ).getEntityRecords( 'postType', 'page', { per_page: -1 } );
                return fetchedPages;
            } catch ( error ) {
                console.error( 'Error fetching pages:', error );
                return [];
            }
        }, [] );

        const onChangePageId = function( newPageId ) {
            setAttributes( { selectedPageId: parseInt( newPageId ) } );
        };

        const selectedPage = pages?.find( function( page ) {
            return page.id === attributes.selectedPageId;
        } );
        const childPages = pages?.filter( function( page ) {
            return page.parent === attributes.selectedPageId;
        } );

        let pageOptions = [ { label: __( 'Select a page' ), value: 0 } ];
        if ( Array.isArray( pages ) ) {
            pageOptions = [
                ...pageOptions,
                ...pages.map( function( page ) {
                    return {
                        label: page.title.rendered,
                        value: page.id,
                    };
                } ),
            ];
        }

        return (
            <div { ...blockProps }>
                <InspectorControls>
                    <PanelBody title={ __( 'Page Selection' ) }>
                        <SelectControl
                            label={ __( 'Select Parent Page' ) }
                            value={ attributes.selectedPageId }
                            options={ pageOptions }
                            onChange={ onChangePageId }
                        />
                        <ToggleControl
                            label={ __( 'Hide Parent Page' ) }
                            checked={ attributes.hideParentPage }
                            onChange={ ( newValue ) => setAttributes( { hideParentPage: newValue } ) }
                        />
                        <SelectControl
                            label={ __( 'List Type' ) }
                            value={ attributes.listType }
                            options={ [
                                { label: __( 'Unordered List (UL)' ), value: 'ul' },
                                { label: __( 'Ordered List (OL)' ), value: 'ol' },
                            ] }
                            onChange={ ( newListType ) => setAttributes( { listType: newListType } ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="page-hierarchy-block">
                    { null === pages ? (
                        <p>{ __( 'Loading pages...' ) }</p>
                    ) : 0 === pages.length ? (
                        <p>{ __( 'No pages found.' ) }</p>
                    ) : selectedPage ? (
                        <>
                            { ! attributes.hideParentPage && (
                                <h2>{ selectedPage.title.rendered }</h2>
                            ) }
                            { childPages && childPages.length > 0 ? (
                                attributes.listType === 'ul' ? (
                                    <ul>
                                        { childPages.map( function( childPage ) {
                                            return <li key={ childPage.id }>{ childPage.title.rendered }</li>;
                                        } ) }
                                    </ul>
                                ) : (
                                    <ol>
                                        { childPages.map( function( childPage ) {
                                            return <li key={ childPage.id }>{ childPage.title.rendered }</li>;
                                        } ) }
                                    </ol>
                                )
                            ) : (
                                <p>{ __( 'No child pages found.' ) }</p>
                            ) }
                        </>
                    ) : (
                        <p>{ __( 'Please select a parent page.' ) }</p>
                    ) }
                </div>
            </div>
        );
    },
    save: function() {
        return null; // We'll use PHP to render the block
    },
} );

// Updated "Page Sibling Navigation" block
registerBlockType('page-hierarchy-block/sibling-navigation', {
    title: 'Page Sibling Navigation',
    icon: 'admin-links',
    category: 'widgets',
    attributes: {
        usePageOrder: {
            type: 'boolean',
            default: false,
        },
        navigationType: {
            type: 'string',
            default: 'both',
        },
        useParentAsPrevious: {
            type: 'boolean',
            default: false,
        },
        useNextTopicAsNext: {
            type: 'boolean',
            default: false,
        },
    },
    edit: function( props ) {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();

        const currentPageId = useSelect( ( select ) => {
            return select( 'core/editor' ).getCurrentPostId();
        }, [] );

        const { parentId, siblings, currentPageIndex, isLoading } = useSelect( ( select ) => {
            const page = select( 'core/editor' ).getCurrentPost();
            const parentId = page ? page.parent : 0;
            const allPages = select( 'core' ).getEntityRecords( 'postType', 'page', { per_page: -1 } );

            // Check if pages are still loading
            const isLoading = select( 'core' ).isResolving( 'getEntityRecords', ['postType', 'page', { per_page: -1 }] );

            if ( isLoading || !allPages ) {
                return { parentId, siblings: null, currentPageIndex: -1, isLoading };
            }

            const siblings = allPages.filter( p => p.parent === parentId );
            const currentPageIndex = siblings.findIndex( p => p.id === currentPageId );
            return { parentId, siblings, currentPageIndex, isLoading };
        }, [] );

        // Get the theme's color palette
        const { colors } = useSelect(select => {
            return select('core/block-editor').getSettings();
        }, []);

        // Find a suitable highlight color from the theme's palette
        const highlightColor = colors.find(color =>
            color.slug === 'highlight' || color.slug === 'accent'
        )?.color || '#E0A315'; // Fallback to previous color if not found

        const renderNavigation = () => {
            if (isLoading) {
                return <p>{ __( 'Loading sibling navigation...' ) }</p>;
            }

            if (!siblings || siblings.length === 0 || currentPageIndex === -1) {
                return <p>{ __( 'No sibling pages found.' ) }</p>;
            }

            const prevSibling = siblings[currentPageIndex - 1];
            const nextSibling = siblings[currentPageIndex + 1];

            const hasPrevious = attributes.navigationType !== 'next' && (prevSibling || (attributes.useParentAsPrevious && parentId));
            const hasNext = attributes.navigationType !== 'previous' && (nextSibling || attributes.useNextTopicAsNext);

            return (
                <nav className={`sibling-navigation-preview ${hasPrevious && hasNext ? 'has-both' : hasNext ? 'has-only-next' : ''}`}>
                    {hasPrevious && (
                        <a className="nav-previous wayfinding">
                            <i>←</i>
                            <div className="words">
                                <span className="meta-nav">Previous</span>
                                <span className="adjacent-sibling-page-title">
                                    {prevSibling ? prevSibling.title.rendered : 'Parent Page'}
                                </span>
                            </div>
                        </a>
                    )}
                    {hasNext && (
                        <a className="nav-next wayfinding">
                            <div className="words">
                                <span className="meta-nav">Next</span>
                                <span className="adjacent-sibling-page-title">
                                    {nextSibling ? nextSibling.title.rendered : 'Next Topic'}
                                </span>
                            </div>
                            <i>→</i>
                        </a>
                    )}
                </nav>
            );
        };

        return (
            <div { ...blockProps }>
                <style>
                    {`
                        .sibling-navigation-preview {
                            display: flex;
                            justify-content: space-between;
                            border-top: 1px solid rgba(38, 74, 69, 0.5);
                            padding-top: 1rem;
                        }
                        .sibling-navigation-preview.has-only-next {
                            justify-content: flex-end;
                        }
                        .sibling-navigation-preview a {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            column-gap: 1rem;
                            text-decoration: none;
                            max-width: 45%;
                        }
                        .sibling-navigation-preview a i {
                            font-size: 1.5rem;
                            transition: 100ms all ease-in-out;
                        }
                        .sibling-navigation-preview a .words {
                            display: flex;
                            flex-direction: column;
                        }
                        .sibling-navigation-preview a:hover span.meta-nav {
                                color: var(--global-palette-highlight-alt, #E0A315);
                        }
                        .sibling-navigation-preview a .adjacent-sibling-page-title {
                            transition: 100ms all ease-in-out;
                        }
                        .sibling-navigation-preview span.meta-nav {
                            text-transform: uppercase;
                            font-size: 0.9rem;
                            color: #333;
                            transition: 300ms all ease-in-out;
                        }
                        .sibling-navigation-preview .nav-next {
                            text-align: right;
                        }
                    `}
                </style>
                <InspectorControls>
                    <PanelBody title={ __( 'Navigation Settings' ) }>
                        <ToggleControl
                            label={ __( 'Use Page Order' ) }
                            checked={ attributes.usePageOrder }
                            onChange={ ( value ) => setAttributes( { usePageOrder: value } ) }
                        />
                        <SelectControl
                            label={ __( 'Navigation Type' ) }
                            value={ attributes.navigationType }
                            options={ [
                                { label: __( 'Previous and Next' ), value: 'both' },
                                { label: __( 'Previous Only' ), value: 'previous' },
                                { label: __( 'Next Only' ), value: 'next' },
                            ] }
                            onChange={ ( value ) => setAttributes( { navigationType: value } ) }
                        />
                        <ToggleControl
                            label={ __( 'Use Parent as Previous' ) }
                            help={ __( 'If there is no previous sibling, use the parent page as the previous link' ) }
                            checked={ attributes.useParentAsPrevious }
                            onChange={ ( value ) => setAttributes( { useParentAsPrevious: value } ) }
                        />
                        <ToggleControl
                            label={ __( 'Use Next Topic as Next' ) }
                            help={ __( 'If there is no next sibling, use the next topic (parent\'s next sibling) as the next link' ) }
                            checked={ attributes.useNextTopicAsNext }
                            onChange={ ( value ) => setAttributes( { useNextTopicAsNext: value } ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <div className="wp-block-page-sibling-navigation">
                    {parentId ? (
                        renderNavigation()
                    ) : (
                        <p style={{ color: '#999999' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '1em', height: '1em', marginRight: '0.5em', verticalAlign: 'middle', fill: '#999999' }}>
                                <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM192 352l0 32 16 0 96 0 16 0 0-32-16 0-32 0 0-112 0-16-16 0-40 0-16 0 0 32 16 0 24 0 0 96-32 0-16 0zm88-168l0-48-48 0 0 48 48 0z"/>
                            </svg>
                            <em>{ __( 'This page has no parent so the Sibling Navigation block is not applicable.' ) }</em>
                        </p>
                    )}
                </div>
            </div>
        );
    },
    save: function() {
        return null; // We'll use PHP to render the block
    },
});
