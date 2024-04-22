import UserService from '../services/usersService.js';
import { sendEmail } from '../utils/emailTransport.js';
import { createHash, generateToken, tokenVerify, validatePass } from '../utils/passportUtils.js';
import { getUserDocumentStatus } from '../utils/utils.js';


class UserController {
    constructor() {
        this.userService = new UserService();
    }
    premiumGet = async (req, res) => {
        try {
            const user = req.user
            let userDocuments = user.documents;
            let documentStatus = getUserDocumentStatus(userDocuments);
            if (user._id === req.params.uid) {
                res.render('premiumUser', { session: { user }, documentStatus });
            }
            else {
                res.status(403).send('Forbidden')
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    };

    premiumPost = async (req, res) => {
        try {
            const userId = req.params.uid;
            let user = req.user;
            let userDocuments = user.documents;
            let documentStatus = getUserDocumentStatus(userDocuments);

            if (user.role === "premium") {
                await this.userService.updateUser(userId, { role: "user" });
                const updatedUser = await this.userService.getUserById(userId);
                return res.json(updatedUser);
            }

            if (documentStatus.documentsId !== 'yes' ||
                documentStatus.documentsAdress !== 'yes' ||
                documentStatus.documentsAccount !== 'yes') {
                return res.status(400).json({ message: "Required documents are missing." });
            }

            await this.userService.updateUser(userId, { role: "premium" });
            const updatedUser = await this.userService.getUserById(userId);
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    };


    passwordReset = async (req, res) => {
        try {
            let { email } = req.body
            let user = await this.userService.showUser(email)
            let redirectUrl;

            if (!user) {
                redirectUrl = '/passwordreset?error=User not found or email invalid';
                return res.status(404).redirect(redirectUrl);
            } else {
                let token = generateToken(user);
                let resetLink = `http://localhost:8080/api/users/passwordreset2?token=${token}`;
                let emailMessage = `Hello. You have requested to reset your password. Please click on the following link: <a href="${resetLink}">Reset password</a> If you did not request a password reset, no action is required.`;

                let response = await sendEmail(email, "Password reset", emailMessage);

                if (response.accepted.length > 0) {
                    redirectUrl = '/passwordreset?message=We have sent a message to your email, please follow the steps outlined there.';
                    return res.status(200).redirect(redirectUrl);
                } else {
                    redirectUrl = '/passwordreset?error=Problem with your password reset detected';
                    return res.status(500).redirect(redirectUrl);
                }
            }
        } catch (error) {
            return res.status(500).send(error.message);
        }
    };

    passwordReset2 = async (req, res) => {
        try {
            let redirectUrl;
            let { token } = req.query
            let tokenCheck = tokenVerify(token)
            if (!tokenCheck) {
                redirectUrl = '/passwordreset?error=Token invalid or expired!';
                return res.status(400).redirect(redirectUrl);
            } else {
                redirectUrl = '/passwordreset2?token=' + token;
                return res.status(200).redirect(redirectUrl);
            }
        } catch (error) {
            redirectUrl = '/passwordreset?error=Problem with your password reset detected' + error.message;
            return res.status(500).redirect(redirectUrl);
        }
    };

    passwordReset3 = async (req, res) => {
        let { password, password2, token } = req.body;
        let redirectUrl;

        if (password !== password2) {
            redirectUrl = '/passwordreset2?error=Password dont match!&token=' + token;
            return res.status(400).redirect(redirectUrl);
        }

        try {
            let tokenCheck = tokenVerify(token)
            let user = await this.userService.showUser(tokenCheck.email)
            if (!user) {
                redirectUrl = '/passwordreset2?error=Problem creating new password&token=' + token;
                return res.status(400).redirect(redirectUrl);
            }
            if (validatePass(user, password)) {
                redirectUrl = '/passwordreset2?error=You cannot use the same old password&token=' + token;
                return res.status(400).redirect(redirectUrl);
            } else {
                let hashedPassword = createHash(password);
                await this.userService.updateOne({ email: user.email }, { password: hashedPassword });
                redirectUrl = '/login?message=Password changed successfully';
                return res.status(200).redirect(redirectUrl);
            }
        } catch (error) {
            redirectUrl = '/passwordreset2?error=Problem creating new password&token=' + token + error.message;
            return res.status(500).redirect(redirectUrl);
        }
    };

    uploadPost = async (req, res) => {
        const userId = req.params.uid;
        let redirectUrl;
        try {
            let user = await this.userService.getUserById(userId);
            let existingDocuments = user.documents || [];
            const uploadedFiles = [];

            if (req.files) {

                if (req.files.avatar) {
                    const avatarFile = req.files.avatar[0];
                    const avatarPath = avatarFile.path.replace(/\\/g, '/');
                    const startIndex = avatarPath.indexOf('/uploads/');
                    const reference = avatarPath.substring(startIndex);
                    uploadedFiles.push({ name: 'avatar', reference });
                }

                if (req.files.documentsId) {
                    const documentsIdFile = req.files.documentsId[0];
                    const documentsIdPath = documentsIdFile.path.replace(/\\/g, '/');
                    const startIndex = documentsIdPath.indexOf('/uploads/');
                    const reference = documentsIdPath.substring(startIndex);
                    uploadedFiles.push({ name: 'documentsId', reference });
                }

                if (req.files.documentsAdress) {
                    const documentsAdressFile = req.files.documentsAdress[0];
                    const documentsAdressPath = documentsAdressFile.path.replace(/\\/g, '/');
                    const startIndex = documentsAdressPath.indexOf('/uploads/');
                    const reference = documentsAdressPath.substring(startIndex);
                    uploadedFiles.push({ name: 'documentsAdress', reference });
                }

                if (req.files.documentsAccount) {
                    const documentsAccountFile = req.files.documentsAccount[0];
                    const documentsAccountPath = documentsAccountFile.path.replace(/\\/g, '/');
                    const startIndex = documentsAccountPath.indexOf('/uploads/');
                    const reference = documentsAccountPath.substring(startIndex);
                    uploadedFiles.push({ name: 'documentsAccount', reference });
                }

                if (req.files.products) {
                    req.files.products.forEach(productFile => {
                        const productPath = productFile.path.replace(/\\/g, '/');
                        const startIndex = productPath.indexOf('/uploads/');
                        const reference = productPath.substring(startIndex);
                        uploadedFiles.push({ name: 'products', reference });
                    });
                }
            }

            const updatedDocuments = [...existingDocuments];

            uploadedFiles.forEach(uploadedDoc => {
                const existingIndex = updatedDocuments.findIndex(doc => doc.name === uploadedDoc.name);
                if (existingIndex !== -1 && uploadedDoc.name !== 'products') {
                    updatedDocuments[existingIndex] = uploadedDoc;
                } else if (uploadedDoc.name === 'products') {
                    updatedDocuments.push(uploadedDoc);
                } else {
                    updatedDocuments.push(uploadedDoc);
                }
            });

            let updatedUser = await this.userService.updateUser(userId, { documents: updatedDocuments });
            return res.status(500).redirect('/uploads?message=Files uploaded successfully');

        } catch (error) {
            if (error.message === 'File type not supported') {
                return res.status(415).redirect('/uploads?error=Unsupported file type');
            } else {
                return res.status(500).redirect('/uploads?error=Server unexpected error, contact the administrator');
            }
        }
    }

    usersGet = async (req, res) => {
        try {
            const users = await this.userService.getFilteredUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
    
    usersClear = async (req, res) => {
        try {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const inactiveUsers = await this.userService.showLastConectionUsers(twoDaysAgo);
    
            if (inactiveUsers.length > 0) {
                let deletedCount = 0;
                for (const user of inactiveUsers) {
                    if (!user.status) {
                        req.logger.info(`Skipping deletion for user ${user.email}: Status already false.`)
                        continue;
                    }
    
                    await sendEmail(user.email, "Account Deletion Notification", "Your account has been inactive for too long and is scheduled for deletion.");
                    await this.userService.updateUsersStatus([user], false);
                    deletedCount++;
                }
    
                res.status(200).json(`Deleted ${deletedCount} inactive users and sent deletion notification emails.`);
            } else {
                res.status(404).json("No inactive user found.");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    userDelete = async (req, res) => {
        const userId = req.params.uid;
        try {

            const user = await this.userService.getUserById(userId);
            if (!user) {
                res.status(404).json("User not found.");
            }
            if (user.status === false){
                await this.userService.updateUser(userId, { status: true });
                res.status(200).json(`User ${user.email} restored successfully`);
            } else {
                await this.userService.updateUser(userId, { status: false });
                res.status(200).json(`User ${user.email} deleted successfully`);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }

    roleChange = async (req, res) => {
        const userId = req.params.uid;
        try {
            const user = await this.userService.getUserById(userId);
            if (!user) {
                return res.status(404).json("User not found.");
            }
            if (user.role === "admin") {
                return res.status(200).json(`User ${user.email} has admin role`);
            } else if (user.role === "user") {
                await this.userService.updateUser(userId, { role: "premium" });
                return res.status(200).json(`User ${user.email} role changed to premium`);
            } else if (user.role === "premium") {
                await this.userService.updateUser(userId, { role: "user" });
                return res.status(200).json(`User ${user.email} role changed to user`);
            } else {
                return res.status(500).json(`There was a problem reading your role`);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send(error.message);
        }
    }
}

export default new UserController();