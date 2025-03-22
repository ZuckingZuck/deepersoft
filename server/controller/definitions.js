const PozTypeDB = require("../model/PozType");
const PozUnitDB = require("../model/PozUnit");
const ClusterDB = require("../model/Cluster");
const FieldTypeDB = require("../model/FieldType");

//PozTypes
const AddPozType = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "İsim alanı zorunludur." });
        }
        
        const newPostType = new PozTypeDB({ name });
        await newPostType.save();
        
        res.status(201).json(newPostType);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetPozTypes = async (req, res) => {
    try {
        const postTypes = await PozTypeDB.find();
        res.status(200).json(postTypes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const DeletePozType = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedPostType = await PozTypeDB.findByIdAndDelete(id);
        if (!deletedPostType) {
            return res.status(404).json({ message: "Poz türü bulunamadı." });
        }
        
        res.status(200).json({ message: "Poz türü başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};


//PozUnits
const AddPozUnit = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "İsim alanı zorunludur." });
        }
        
        const newPozUnit = new PozUnitDB({ name });
        await newPozUnit.save();
        
        res.status(201).json(newPozUnit);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetPozUnits = async (req, res) => {
    try {
        const pozUnits = await PozUnitDB.find();
        res.status(200).json(pozUnits);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const DeletePozUnit = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedPozUnit = await PozUnitDB.findByIdAndDelete(id);
        if (!deletedPozUnit) {
            return res.status(404).json({ message: "Poz birimi bulunamadı." });
        }
        
        res.status(200).json({ message: "Poz birimi başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};


//Clusters
const AddCluster = async (req, res) => {
    try {
        const { city, name } = req.body;
        
        if (!city || !name) {
            return res.status(400).json({ message: "Şehir ve isim alanları zorunludur." });
        }
        
        const newCluster = new ClusterDB({ city, name });
        await newCluster.save();
        
        res.status(201).json(newCluster);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const GetClusters = async (req, res) => {
    try {
        const clusters = await ClusterDB.find();
        res.status(200).json(clusters);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

const DeleteCluster = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedCluster = await ClusterDB.findByIdAndDelete(id);
        if (!deletedCluster) {
            return res.status(404).json({ message: "Küme bulunamadı." });
        }
        
        res.status(200).json({ message: "Küme başarıyla silindi." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};

//FieldTypes
const AddFieldType = async (req, res) => {
    try {
        const { name } = req.body;
        const fieldType = new FieldTypeDB({ name });
        await fieldType.save();
        res.status(201).json(fieldType);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding FieldType', error });
    }
};

const GetFieldTypes = async (req, res) => {
    try {
        const fieldTypes = await FieldTypeDB.find();
        res.status(200).json(fieldTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving FieldTypes', error });
    }
};

const DeleteFieldType = async (req, res) => {
    const { id } = req.params;
    try {
        const fieldType = await FieldTypeDB.findByIdAndDelete(id);
        if (!fieldType) {
            return res.status(404).json({ message: 'FieldType not found' });
        }
        res.status(200).json({ message: 'FieldType deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FieldType', error });
    }
};


module.exports = { 
    AddPozType, GetPozTypes, DeletePozType, 
    AddPozUnit, GetPozUnits, DeletePozUnit, 
    AddCluster, GetClusters, DeleteCluster,
    AddFieldType, GetFieldTypes, DeleteFieldType 
};