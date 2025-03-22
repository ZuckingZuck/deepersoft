const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const CreateUser = async (req, res) => {
    try {
        const { userType, fullName, userName, password, phone, email } = req.body;

        // Kullanıcı adı veya e-posta kontrolü
        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluştur
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

        // Kullanıcıyı bul
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({ message: "Geçersiz kullanıcı adı veya şifre." });
        }

        // Şifreyi doğrula
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Geçersiz kullanıcı adı veya şifre." });
        }

        // JWT oluştur
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user: { id: user._id, userType: user.userType, fullName: user.fullName } });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

module.exports = { CreateUser, LoginUser };
