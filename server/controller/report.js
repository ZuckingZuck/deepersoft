const ProjectDB = require('../model/Project');
const ProjectPozDB = require('../model/ProjectPoz');
const exceljs = require('exceljs');

/**
 * Filtrelere göre projeleri getiren ve Excel formatında sunan fonksiyon
 * @param {Object} req - HTTP istek nesnesi
 * @param {Object} res - HTTP yanıt nesnesi
 */
const GetProjectReport = async (req, res) => {
    try {
        // Gelen filtreleri al
        const { name, city, fieldType, contractor, status, supervisor, clusterName, fieldName, ddo, tellcordiaNo } = req.query;
        
        // Filtre nesnesini oluştur
        const filter = {};
        
        // Filtreleri ekle (eğer boş değilse)
        if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive arama
        if (city) filter.city = city;
        if (fieldType) filter.fieldType = fieldType;
        if (contractor) filter.contractor = contractor;
        if (status) filter.status = status;
        if (supervisor) filter.supervisor = supervisor;
        if (clusterName) filter.clusterName = { $regex: clusterName, $options: 'i' };
        if (fieldName) filter.fieldName = { $regex: fieldName, $options: 'i' };
        if (ddo) filter.ddo = { $regex: ddo, $options: 'i' };
        if (tellcordiaNo) filter.tellcordiaNo = { $regex: tellcordiaNo, $options: 'i' };
        
        console.log("Uygulanan filtreler:", filter);
        
        // Projeleri filtrelerle getir ve populate işlemi yap
        const projects = await ProjectDB.find(filter)
            .populate('contractor', 'fullName')
            .populate('supervisor', 'fullName')
            .lean(); // JSON'a dönüştürmek için daha verimli
        
        // Excel dosyası oluştur
        if (req.query.format === 'excel') {
            return await generateExcel(res, projects);
        }
        
        // Normal JSON yanıtı
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        console.error("Rapor oluşturma hatası:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Rapor oluşturulurken bir hata oluştu.' 
        });
    }
};

/**
 * Proje verilerinden Excel dosyası oluşturup indiren fonksiyon
 * @param {Object} res - HTTP yanıt nesnesi
 * @param {Array} projects - Proje verileri
 */
const generateExcel = async (res, projects) => {
    // Excel çalışma kitabı oluştur
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Projeler');
    
    // Başlık satırı
    worksheet.columns = [
        { header: 'Proje Adı', key: 'name', width: 30 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Şehir', key: 'city', width: 15 },
        { header: 'Alan Tipi', key: 'fieldType', width: 20 },
        { header: 'Cluster Adı', key: 'clusterName', width: 20 },
        { header: 'Alan Adı', key: 'fieldName', width: 20 },
        { header: 'DDO', key: 'ddo', width: 15 },
        { header: 'Tellcordia No', key: 'tellcordiaNo', width: 20 },
        { header: 'LOC', key: 'loc', width: 15 },
        { header: 'SIR', key: 'sir', width: 15 },
        { header: 'HomePass', key: 'homePass', width: 15 },
        { header: 'Tarih', key: 'date', width: 15 },
        { header: 'Taşeron', key: 'contractor', width: 25 },
        { header: 'Sorumlu', key: 'supervisor', width: 25 },
        { header: 'IMLT', key: 'IMLT', width: 10 },
        { header: 'AKTV', key: 'AKTV', width: 10 },
        { header: 'ISLH', key: 'ISLH', width: 10 },
        { header: 'HSRSZ', key: 'HSRSZ', width: 10 },
        { header: 'KMZ', key: 'KMZ', width: 10 },
        { header: 'OTDR', key: 'OTDR', width: 10 },
        { header: 'MTBKT', key: 'MTBKT', width: 10 },
        { header: 'KSF', key: 'KSF', width: 10 },
        { header: 'BRKD', key: 'BRKD', width: 10 },
        { header: 'Oluşturulma Tarihi', key: 'createdAt', width: 20 },
        { header: 'Güncellenme Tarihi', key: 'updatedAt', width: 20 }
    ];
    
    // Başlık satırını kalın yap
    worksheet.getRow(1).font = { bold: true };
    
    // Verileri ekle
    projects.forEach(project => {
        // Referans edilen alanları düzenle
        const formattedProject = {
            ...project,
            contractor: project.contractor ? project.contractor.fullName : '',
            supervisor: project.supervisor ? project.supervisor.fullName : '',
            date: project.date ? new Date(project.date).toLocaleDateString('tr-TR') : '',
            createdAt: project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : '',
            updatedAt: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('tr-TR') : '',
            // Boolean değerleri Evet/Hayır olarak göster
            IMLT: project.IMLT ? 'Evet' : 'Hayır',
            AKTV: project.AKTV ? 'Evet' : 'Hayır',
            ISLH: project.ISLH ? 'Evet' : 'Hayır',
            HSRSZ: project.HSRSZ ? 'Evet' : 'Hayır',
            KMZ: project.KMZ ? 'Evet' : 'Hayır',
            OTDR: project.OTDR ? 'Evet' : 'Hayır',
            MTBKT: project.MTBKT ? 'Evet' : 'Hayır',
            KSF: project.KSF ? 'Evet' : 'Hayır',
            BRKD: project.BRKD ? 'Evet' : 'Hayır'
        };
        
        worksheet.addRow(formattedProject);
    });
    
    // Tüm hücrelere sınır ekle
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
    
    // Başlık satırını renklendir
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Açık gri
    };
    
    // HTTP başlıklarını ayarla
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    // Dosya adını ayarla
    const date = new Date().toISOString().split('T')[0];
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=Proje_Raporu_${date}.xlsx`
    );
    
    // Excel'i HTTP yanıtına yaz
    await workbook.xlsx.write(res);
    
    // Yanıtı sonlandır
    res.end();
    
    return true;
};

/**
 * Filtrelere göre proje pozlarını getiren ve Excel formatında sunan fonksiyon
 * @param {Object} req - HTTP istek nesnesi
 * @param {Object} res - HTTP yanıt nesnesi
 */
const GetProjectPozReport = async (req, res) => {
    try {
        // Gelen filtreleri al
        const { name, city, fieldType, contractor, status, supervisor, clusterName, fieldName, ddo, tellcordiaNo } = req.query;
        
        // Önce projeleri filtreleyeceğiz
        const projectFilter = {};
        
        // Proje filtreleri (eğer boş değilse)
        if (name) projectFilter.name = { $regex: name, $options: 'i' };
        if (city) projectFilter.city = city;
        if (fieldType) projectFilter.fieldType = fieldType;
        if (contractor) projectFilter.contractor = contractor;
        if (status) projectFilter.status = status;
        if (supervisor) projectFilter.supervisor = supervisor;
        if (clusterName) projectFilter.clusterName = { $regex: clusterName, $options: 'i' };
        if (fieldName) projectFilter.fieldName = { $regex: fieldName, $options: 'i' };
        if (ddo) projectFilter.ddo = { $regex: ddo, $options: 'i' };
        if (tellcordiaNo) projectFilter.tellcordiaNo = { $regex: tellcordiaNo, $options: 'i' };
        
        console.log("Uygulanan proje filtreleri:", projectFilter);
        
        // Filtrelenen projelerin ID'lerini al
        const projects = await ProjectDB.find(projectFilter).select('_id');
        const projectIds = projects.map(project => project._id);
        
        if (projectIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }
        
        // Bu projelere ait pozları getir
        const projectPozes = await ProjectPozDB.find({ project: { $in: projectIds } })
            .populate({
                path: 'project',
                select: 'name status city fieldType clusterName fieldName ddo tellcordiaNo homePass date',
                populate: [
                    { path: 'contractor', select: 'fullName' },
                    { path: 'supervisor', select: 'fullName' }
                ]
            })
            .populate('poz', 'code name price priceType unit')
            .populate('user', 'fullName')
            .lean();
            
        console.log(`${projectPozes.length} adet poz bulundu.`);
        
        // Excel dosyası oluştur
        if (req.query.format === 'excel') {
            return await generatePozExcel(res, projectPozes);
        }
        
        // Normal JSON yanıtı
        res.status(200).json({
            success: true,
            count: projectPozes.length,
            data: projectPozes
        });
    } catch (error) {
        console.error("Poz raporu oluşturma hatası:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Poz raporu oluşturulurken bir hata oluştu.' 
        });
    }
};

/**
 * Poz verilerinden Excel dosyası oluşturup indiren fonksiyon
 * @param {Object} res - HTTP yanıt nesnesi
 * @param {Array} projectPozes - Poz verileri
 */
const generatePozExcel = async (res, projectPozes) => {
    // Excel çalışma kitabı oluştur
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Proje Pozları');
    
    // Başlık satırı
    worksheet.columns = [
        { header: 'Proje Adı', key: 'projectName', width: 30 },
        { header: 'Proje Durumu', key: 'projectStatus', width: 15 },
        { header: 'Şehir', key: 'city', width: 15 },
        { header: 'Alan Tipi', key: 'fieldType', width: 20 },
        { header: 'Cluster Adı', key: 'clusterName', width: 20 },
        { header: 'Alan Adı', key: 'fieldName', width: 20 },
        { header: 'DDO', key: 'ddo', width: 15 },
        { header: 'Tellcordia No', key: 'tellcordiaNo', width: 20 },
        { header: 'HomePass', key: 'homePass', width: 15 },
        { header: 'Proje Tarihi', key: 'projectDate', width: 15 },
        { header: 'Taşeron', key: 'contractor', width: 25 },
        { header: 'Sorumlu', key: 'supervisor', width: 25 },
        { header: 'Poz Kodu', key: 'pozCode', width: 15 },
        { header: 'Poz Adı', key: 'pozName', width: 30 },
        { header: 'Poz Fiyatı', key: 'pozPrice', width: 15 },
        { header: 'Poz Tipi', key: 'pozType', width: 15 },
        { header: 'Birim', key: 'unit', width: 10 },
        { header: 'Miktar', key: 'amount', width: 10 },
        { header: 'Toplam Tutar', key: 'totalPrice', width: 15 },
        { header: 'Ekleyen Kişi', key: 'userFullName', width: 25 },
        { header: 'Eklenme Tarihi', key: 'createdAt', width: 20 }
    ];
    
    // Başlık satırını kalın yap
    worksheet.getRow(1).font = { bold: true };
    
    // Verileri ekle
    projectPozes.forEach(poz => {
        // Veriyi düzenle
        const formattedPoz = {
            projectName: poz.project?.name || '',
            projectStatus: poz.project?.status || '',
            city: poz.project?.city || '',
            fieldType: poz.project?.fieldType || '',
            clusterName: poz.project?.clusterName || '',
            fieldName: poz.project?.fieldName || '',
            ddo: poz.project?.ddo || '',
            tellcordiaNo: poz.project?.tellcordiaNo || '',
            homePass: poz.project?.homePass || '',
            projectDate: poz.project?.date ? new Date(poz.project.date).toLocaleDateString('tr-TR') : '',
            contractor: poz.project?.contractor?.fullName || '',
            supervisor: poz.project?.supervisor?.fullName || '',
            pozCode: poz.poz?.code || '',
            pozName: poz.poz?.name || '',
            pozPrice: poz.poz?.price || 0,
            pozType: poz.poz?.priceType || '',
            unit: poz.poz?.unit || poz.unit || '',
            amount: poz.amount || 0,
            totalPrice: (poz.amount || 0) * (poz.poz?.price || 0),
            userFullName: poz.user?.fullName || '',
            createdAt: poz.createdAt ? new Date(poz.createdAt).toLocaleDateString('tr-TR') : ''
        };
        
        worksheet.addRow(formattedPoz);
    });
    
    // Tüm hücrelere sınır ekle
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });
    
    // Sayısal sütunları para birimi olarak formatla
    worksheet.getColumn('pozPrice').numFmt = '#,##0.00 ₺';
    worksheet.getColumn('totalPrice').numFmt = '#,##0.00 ₺';
    
    // Başlık satırını renklendir
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Açık gri
    };
    
    // HTTP başlıklarını ayarla
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=proje_pozlar_raporu_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    
    // Dosyayı yazıp gönder
    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    GetProjectReport,
    GetProjectPozReport
};
