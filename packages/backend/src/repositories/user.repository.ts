import { v4 as uuidV4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { User } from '../models';
import { Logger } from '../utils';

export class UserRepository {
    static async registerUser(username: string, password: string, apiKey: string): Promise<User | null> {
        // Generate an uuid for the user
        const id = uuidV4();
        // Hash the given password
        const passwordHash = await hash(password, 10);

        try {
            // Create a user
            const user = new User({
                uuid: id,
                apiKey,
                passwordHash,
                username,
            });
            // Save it in the database
            await user.save();
            Logger.info(`Added user "${username}"`);

            return user;
        } catch (e) {
            Logger.error(`Failed to add user "${username}": ${e}`);

            return null;
        }
    }

    /**
     * Edits the given user
     * @param username The name of the existing user (not editable)
     * @param newPassword The new password. Leave undefined to ignore
     * @param newApiKey The new api key. Leave undefined to ignore
     * @returns the updated fields if it worked, null if it failed
     */
    static async editUser(username: string, newPassword?: string, newApiKey?: string): Promise<string[] | null> {
        try {
            const user = await UserRepository.getUserByName(username);
            if (user) {
                const updatedFields = [];

                // Update password
                if (newPassword) {
                    user.passwordHash = await hash(newPassword, 10);
                    updatedFields.push('password');
                }
                // Update api key
                if (newApiKey) {
                    user.apiKey = newApiKey;
                    updatedFields.push('apiKey');
                }
                // Save it in the database
                await user.save();
                Logger.info(`Updated user "${username}"`);

                return updatedFields;
            }
        } catch (e) {
            Logger.error(`Failed to update user "${username}"`);
        }

        return null;
    }

    /** Find an user with the given username.
     * @returns The user if found, null otherwise
     */
    static async getUserByName(username: string): Promise<User | null> {
        try {
            return await User.findOne({
                where: {
                    username: username,
                }
            });
        } catch (e) {
            Logger.error(`Failed to get user "${username}": ${e}`);

            return null;
        }
    }

    /**
     * Checks if the given password matches the one of the given user
     * @param user The user to check
     * @param password The password to check
     * @returns true if the passwords have the same hash
     */
    static async checkUserPassword(user: User, password: string): Promise<boolean> {

        // Check with the stored password
        return await compare(password, user.passwordHash);
    }
}