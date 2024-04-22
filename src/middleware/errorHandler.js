export const errorHandler = (error, req, res, next) => {
    if (error) {
        if (error.code && error.code >= 400 && error.code < 500) { 
            if (error.message === 'File type not supported') {
                return res.status(415).redirect('/uploads?error=Unsupported file type');
            }
            return res.status(error.code).json({ error: `${error.name}: ${error.message}` });
        } else {
            console.error(error);
            return res.status(500).json({ error: 'Unexpected server error' });
        }
    }

    next();
};