/**
 * @file Definition of a Scaffold component
 * @version 1.0
 * @author Martin Danhier
 */

import './scaffold.style.css';

import clsx from 'clsx';
import React from 'react';
import { RouteComponentProps } from 'react-router';

import { AppBar, Divider, Drawer, IconButton, Toolbar, Typography } from '@material-ui/core';
import { ChevronLeft, Menu } from '@material-ui/icons';

import DrawerMenu, { DrawerMenuItem } from './drawer-menu';

/** Props of a Scaffold component */
export interface ScaffoldProps<T> extends RouteComponentProps {
    /** Title of the page */
    title?: string;
    /** Should the drawer be open by default when there is enough space ? */
    showDrawerByDefault?: boolean;
    /** Actions to place at the right of the app bar */
    appBarActions?: JSX.Element[] | JSX.Element;
    /** Items of the drawer menu */
    drawerMenuItems?: DrawerMenuItem<T>[];
    /** The drawer width in rem */
    drawerWidth?: number;
    /** Children of the scaffold */
    children?: JSX.Element | JSX.Element[];
}

/** State of a Scaffold component */
export interface ScaffoldState {
    /** If true, the drawer is open */
    drawerOpen: boolean;
}

/** Scaffold of a page. Inspired by Flutter scaffold.
 *
 * Controls the app bar and the side menu.
*/
class Scaffold<T> extends React.Component<ScaffoldProps<T>, ScaffoldState> {
    /** The drawer width in rem, effectively used */
    private _drawerWidth: number;

    constructor(props: ScaffoldProps<T>) {
        super(props);

        // Set drawer width
        this._drawerWidth = this.props.drawerWidth ?? 25;

        // Init state
        const openByDefault = props.showDrawerByDefault ?? false;
        this.state = {
            drawerOpen: openByDefault && window.innerWidth > this._drawerWidth * 45,
        };
    }

    /** Toggle the "open" state of the drawer */
    toggleDrawer = (): void => this.setState(prev => ({
        ...prev,
        drawerOpen: !prev.drawerOpen,
    }));

    /**
     * Main method of a React component. Called each time the component needs to render.
     * @returns a tree of react elements
     */
    render(): JSX.Element {
        return (
            /* Provide the drawer width to the css via a variable */
            <div style={{
                '--Scaffold-drawerWidth': `${this._drawerWidth}rem`,
            } as React.CSSProperties}>
                {/* App bar */}
                <AppBar
                    className={clsx('Scaffold-appBar', this.props.drawerMenuItems && this.state.drawerOpen && 'Scaffold-appBar-shift')}
                    color='primary'
                >
                    <Toolbar>
                        {/* Menu */}
                        {this.props.drawerMenuItems &&
                            <IconButton
                                className={clsx('Scaffold-appBarMenuButton', this.state.drawerOpen && 'Scaffold-appBarMenuButton-hide')}
                                color='inherit'
                                onClick={(): void => this.toggleDrawer()}
                            >
                                <Menu />
                            </IconButton>}

                        {/* Title */}
                        <Typography variant='h6' className='expand'>{this.props.title}</Typography>

                        {/* Other actions */}
                        {this.props.appBarActions}
                    </Toolbar>
                </AppBar>

                {/* Drawer */}
                {this.props.drawerMenuItems && <Drawer
                    open={this.state.drawerOpen}
                    variant='persistent'
                    anchor='left'
                    className='Scaffold-drawer'
                    classes={{
                        paper: 'Scaffold-drawerPaper'
                    }}
                >
                    <div className={'Scaffold-drawerHeader'}>
                        <IconButton onClick={(): void => this.toggleDrawer()} >
                            <ChevronLeft />
                        </IconButton>
                    </div>

                    <Divider />

                    <DrawerMenu
                        history={this.props.history}
                        match={this.props.match}
                        location={this.props.location}
                        staticContext={this.props.staticContext}
                        items={this.props.drawerMenuItems}
                    />
                </Drawer>}

                {/* Children */}
                <main className={clsx('Scaffold-content', this.props.drawerMenuItems && this.state.drawerOpen && 'Scaffold-content-shift')}>
                    {this.props.children}
                </main>
            </div>);
    }
}

export default Scaffold;