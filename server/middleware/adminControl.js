const isAdmin = (req, res, next) => {
    const user = req.user;
    if(!user){
        return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için admin yetkilerine sahip değilsiniz' });
    }

    if (user.userType === "Sistem Yetkilisi" || user.userType === "Onay Yetkilisi") {
        next();
    }else{
        return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için admin yetkilerine sahip değilsiniz' });
    }

    
};

module.exports = isAdmin;