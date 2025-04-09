const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const CreateUser = async (req, res) => {
    try {
        const { userType, fullName, userName, password, phone, email } = req.body;

        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            userType,
            fullName,
            userName,
            password: hashedPassword,
            phone,
            email
        });

        await newUser.save();
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu." });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const LoginUser = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({ message: "Geçersiz kullanıcı adı veya şifre." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Geçersiz kullanıcı adı veya şifre." });
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: user._id, userType: user.userType, fullName: user.fullName } });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası." });
        console.log(error);
    }
};

const GetUsers = async (req, res) => {
    try {
        // Opsiyonel olarak userType'a göre filtreleme yapılabilir
        const { userType } = req.query;
        const filter = userType ? { userType } : {};
        
        // Password alanını çıkararak kullanıcıları getir
        const users = await User.find(filter).select('-password');
        
        res.status(200).json(users);
    } catch (error) {
        console.error("Kullanıcılar listelenirken hata oluştu:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;  // Parametre olarak id alıyoruz
        const currentUser = req.user;  // Silme işlemi yapan kullanıcı

        // Eğer kullanıcı "Sistem Yetkilisi" değilse işlem yapılmasın
        if (currentUser.userType !== 'Sistem Yetkilisi') {
            return res.status(403).json({ message: "Bu işlemi yapma yetkiniz yok." });
        }

        // Silinecek kullanıcıyı id ile bul
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        // Kullanıcıyı sil
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
    } catch (error) {
        console.error("Kullanıcı silinirken hata oluştu:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};


module.exports = { CreateUser, LoginUser, GetUsers, DeleteUser };
