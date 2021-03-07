// Reexport everything as a single module

// Even though there is only one router here, this architecture was tought to be
// easily scalable.
export { router as UserRouter } from './user.router';