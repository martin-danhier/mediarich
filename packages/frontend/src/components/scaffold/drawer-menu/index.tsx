/**
 * @file Definition of a DrawerMenu component
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

import './drawer-menu.style.css';

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { IconButton } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { TreeItem, TreeItemProps, TreeView } from '@material-ui/lab';

/** Item in the drawer menu tree.
 *
 * T is the type of a custom value that can be stored in the "data" field.
 * It is not used by the drawer, but you can set it to store the id of the represented object for instance
 * and use it outside of the drawer.
 */
export interface DrawerMenuItem<T> {
    /** Label of the item (displayed in the menu) */
    label: string;
    /** Children of this item (other items) */
    children?: DrawerMenuItem<T>[];
    /** Callback to call when the item is clicked */
    onClick?: (e: React.MouseEvent) => void;
    /** URL of the resource (move when clicked). */
    url: string;
    /** Data not used by the drawer */
    data: T;
}

/** Props of a DrawerMenu component */
export interface DrawerMenuProps<T> extends RouteComponentProps {
    /** Drawer menu items */
    items: DrawerMenuItem<T>[];
}

/** State of a DrawerMenu component */
export interface DrawerMenuState {
    /** Which item is selected (by url) */
    selected?: string;
    /** Which items are expanded ? (by url) */
    expanded: string[];
}

/** Tree menu that can be displayed in a Drawer.
 *
 * T is the type of a data set in the menu items, not used by the DrawerMenu.
 * You can store anything you want in it for your own usage.
 * It defaults to undefined (no data field)
*/
class DrawerMenu<T = undefined> extends React.Component<DrawerMenuProps<T>, DrawerMenuState> {

    constructor(props: DrawerMenuProps<T>) {
        super(props);

        // Try to get parents of the current url
        const current = props.location.pathname;
        const parents = this.getParents(current, props.items);

        this.state = {
            // Select the current route if it exist
            selected: parents ? current : '',
            // Expand the root level if there isn't a path
            expanded: parents ?? props.items.map(item => item.url),
        };
    }

    /** Add or remove an item id from the expansion list */
    toggleItemExpansion(item: string): void {
        const newState = { ...this.state };

        const index = newState.expanded.indexOf(item);
        // If item in array, remove it
        if (index !== -1) {
            newState.expanded.splice(index, 1);
        }
        // Else add it
        else {
            newState.expanded.push(item);
        }

        this.setState(newState);
    }

    /** Pushes the item url */
    handleItemClicked = (item: DrawerMenuItem<T>): void => {
        const newState = { ...this.state };

        // Select that url
        newState.selected = item.url;

        this.setState(newState);

        // Go to that url
        this.props.history.push(item.url);
    }

    /* Recursively renders a drawer menu item and its elements */
    renderMenuItem = (item: DrawerMenuItem<T>, index: number): React.ReactElement<TreeItemProps> => {
        return <TreeItem
            classes={{
                label: 'DrawerMenu-treeViewItemLabel',
                group: 'DrawerMenu-treeViewItemGroup',
                iconContainer: 'DrawerMenu-treeViewIconContainer',
            }}
            key={index.toString()}
            nodeId={item.url}
            label={<>
                {item.children ?
                    <IconButton
                        className='DrawerMenu-iconButton'
                        onClick={(e): void => {
                            // Prevent the click event from propagating to the item
                            e.stopPropagation();
                            // Toggle the expansion
                            this.toggleItemExpansion(item.url);
                        }}
                    >
                        {
                            this.state.expanded.includes(item.url) ?
                                <ExpandLess />
                                : <ExpandMore />

                        }
                    </IconButton>
                    // Take the space of an iconButton if there isn't one
                    : <div className='DrawerMenu-iconButton' />
                }
                <div className='DrawerMenu-labelText'>{item.label}</div>
            </>}
            onClick={(): void => this.handleItemClicked(item)}
        >
            {/* Render children, if any */}
            {item.children && item.children.map(this.renderMenuItem)}
        </TreeItem >;
    }

    /** Search for the parents of a given url.
     *
     * @returns an array of parents (reversed), or undefined if the url was not found
     */
    getParents(url: string, list: DrawerMenuItem<T>[]): string[] | undefined {
        // For each item
        for (const item of list) {
            if (item.url === url) {
                // If the destination is found, go back up with an empty string
                return [];
            }
            else if (item.children && item.children.length > 0) {
                // Call recursively on children if there is any
                const res = this.getParents(url, item.children);
                if (res !== undefined) {
                    res.push(item.url);
                    return res;
                }
            }
        }
    }

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return <TreeView
            expanded={this.state.expanded}
            selected={this.state.selected}
            className="DrawerMenu-treeView"
        >
            {this.props.items.map(this.renderMenuItem)}
        </TreeView>;
    }
}

export default DrawerMenu;