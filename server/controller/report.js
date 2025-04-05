const ProjectDB = require('../model/Project');
const ProjectPozDB = require('../model/ProjectPoz');
const ContractorPozPriceDB = require('../model/ContractorPozPrice');
const UserDB = require('../model/User');
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
            return await generateExcel(projects, res);
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
const generateExcel = async (projects, res) => {
    // Excel çalışma kitabı oluştur
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Projeler');
    
    // Başlık satırı
    worksheet.columns = [
        { header: 'Proje Adı', key: 'name', width: 30 },
        { header: 'Şehir', key: 'city', width: 15 },
        { header: 'Alan Tipi', key: 'fieldType', width: 20 },
        { header: 'Küme', key: 'clusterName', width: 20 },
        { header: 'Saha Adı', key: 'fieldName', width: 20 },
        { header: 'DDO', key: 'ddo', width: 15 },
        { header: 'Tellcordia No', key: 'tellcordiaNo', width: 15 },
        { header: 'LOC', key: 'loc', width: 15 },
        { header: 'SIR', key: 'sir', width: 15 },
        { header: 'Home Pass', key: 'homePass', width: 15 },
        { header: 'Proje Tarihi', key: 'date', width: 20 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Denetçi', key: 'supervisor', width: 25 },
        { header: 'Taşeron', key: 'contractor', width: 25 },
        { header: 'İmalat', key: 'IMLT', width: 10 },
        { header: 'Aktivasyon', key: 'AKTV', width: 10 },
        { header: 'Islah', key: 'ISLH', width: 10 },
        { header: 'Hasarsızlık', key: 'HSRSZ', width: 10 },
        { header: 'KMZ', key: 'KMZ', width: 10 },
        { header: 'OTDR', key: 'OTDR', width: 10 },
        { header: 'Mutabakat', key: 'MTBKT', width: 10 },
        { header: 'Keşif', key: 'KSF', width: 10 },
        { header: 'Barkod', key: 'BRKD', width: 10 },
        { header: 'Oluşturulma Tarihi', key: 'createdAt', width: 20 },
        { header: 'Son Güncelleme', key: 'updatedAt', width: 20 }
    ];
    
    // Başlık satırını kalın yap
    worksheet.getRow(1).font = { bold: true };
    
    // Verileri ekle
    projects.forEach(project => {
        worksheet.addRow({
            name: project.name,
            city: project.city,
            fieldType: project.fieldType,
            clusterName: project.clusterName,
            fieldName: project.fieldName,
            ddo: project.ddo,
            tellcordiaNo: project.tellcordiaNo,
            loc: project.loc || '-',
            sir: project.sir || '-',
            homePass: project.homePass,
            date: project.date ? new Date(project.date).toLocaleDateString('tr-TR') : '-',
            status: project.status,
            supervisor: project.supervisor?.fullName || '-',
            contractor: project.contractor?.fullName || '-',
            IMLT: project.IMLT ? '✓' : '✗',
            AKTV: project.AKTV ? '✓' : '✗',
            ISLH: project.ISLH ? '✓' : '✗',
            HSRSZ: project.HSRSZ ? '✓' : '✗',
            KMZ: project.KMZ ? '✓' : '✗',
            OTDR: project.OTDR ? '✓' : '✗',
            MTBKT: project.MTBKT ? '✓' : '✗',
            KSF: project.KSF ? '✓' : '✗',
            BRKD: project.BRKD ? '✓' : '✗',
            createdAt: project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : '-',
            updatedAt: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('tr-TR') : '-'
        });
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
        
        // Paralel olarak tüm verileri getir
        const [projects, contractorPozPrices] = await Promise.all([
            // Filtrelenen projelerin ID'lerini al
            ProjectDB.find(projectFilter).select('_id'),
            // Taşeron poz fiyatlarını getir
            ContractorPozPriceDB.find()
                .populate({
                    path: 'contractorId',
                    model: 'users',
                    select: 'fullName'
                })
                .populate({
                    path: 'pozId',
                    model: 'pozes',
                    select: 'code name'
                })
                .lean()
        ]);

        const projectIds = projects.map(project => project._id);
        
        if (projectIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }
        
        // Proje pozlarını getir
        const projectPozes = await ProjectPozDB.find({ projectId: { $in: projectIds } })
            .populate({
                path: 'projectId',
                select: 'name status city fieldType clusterName fieldName ddo tellcordiaNo homePass date IMLT AKTV ISLH HSRSZ KMZ OTDR MTBKT KSF BRKD loc sir',
                populate: [
                    { path: 'contractor', select: 'fullName' },
                    { path: 'supervisor', select: 'fullName' }
                ]
            })
            .populate('pozId', 'code name price priceType unit')
            .lean();
            
        console.log(`${projectPozes.length} adet poz bulundu.`);

        // Taşeron poz fiyatlarını map'e dönüştür
        const contractorPriceMap = new Map();
        contractorPozPrices.forEach(cpp => {
            const key = `${cpp.contractorId._id}-${cpp.pozId._id}`;
            contractorPriceMap.set(key, cpp.price);
        });
        
        // Excel dosyası oluştur
        if (req.query.format === 'excel') {
            return await generatePozExcel(projectPozes, contractorPriceMap, res);
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
const generatePozExcel = async (projectPozes, contractorPriceMap, res) => {
    // Excel çalışma kitabı oluştur
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Poz Raporu');
    
    // Başlık satırı
    worksheet.columns = [
        { header: 'Proje Adı', key: 'projectName', width: 30 },
        { header: 'Şehir', key: 'city', width: 15 },
        { header: 'Alan Tipi', key: 'fieldType', width: 20 },
        { header: 'Küme', key: 'clusterName', width: 20 },
        { header: 'Saha Adı', key: 'fieldName', width: 20 },
        { header: 'DDO', key: 'ddo', width: 15 },
        { header: 'Tellcordia No', key: 'tellcordiaNo', width: 15 },
        { header: 'LOC', key: 'loc', width: 15 },
        { header: 'SIR', key: 'sir', width: 15 },
        { header: 'Home Pass', key: 'homePass', width: 15 },
        { header: 'Proje Tarihi', key: 'date', width: 20 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Denetçi', key: 'supervisor', width: 25 },
        { header: 'Taşeron', key: 'contractor', width: 25 },
        { header: 'Poz Kodu', key: 'pozCode', width: 15 },
        { header: 'Poz Adı', key: 'pozName', width: 30 },
        { header: 'Birim', key: 'unit', width: 10 },
        { header: 'Fiyat Tipi', key: 'priceType', width: 15 },
        { header: 'Birim Fiyat', key: 'price', width: 15 },
        { header: 'Taşeron Fiyatı', key: 'contractorPrice', width: 15 },
        { header: 'Miktar', key: 'quantity', width: 10 },
        { header: 'Toplam Fiyat', key: 'totalPrice', width: 15 },
        { header: 'Taşeron Toplam', key: 'contractorTotal', width: 15 },
        { header: 'Eklenme Tarihi', key: 'createdAt', width: 20 }
    ];
    
    // Başlık satırını kalın yap
    worksheet.getRow(1).font = { bold: true };
    
    // Verileri ekle
    const rows = projectPozes.map(poz => {
        const amount = poz.quantity || 0;
        const price = poz.price || 0;
        const contractorKey = `${poz.projectId.contractor._id}-${poz.pozId._id}`;
        const contractorPrice = contractorPriceMap.get(contractorKey) || 0;
        const totalPrice = amount * price;
        const contractorTotal = amount * contractorPrice;

        return {
            projectName: poz.projectId?.name || '',
            city: poz.projectId?.city || '',
            fieldType: poz.projectId?.fieldType || '',
            clusterName: poz.projectId?.clusterName || '',
            fieldName: poz.projectId?.fieldName || '',
            ddo: poz.projectId?.ddo || '',
            tellcordiaNo: poz.projectId?.tellcordiaNo || '',
            loc: poz.projectId?.loc || '-',
            sir: poz.projectId?.sir || '-',
            homePass: poz.projectId?.homePass || '',
            date: poz.projectId?.date ? new Date(poz.projectId.date).toLocaleDateString('tr-TR') : '-',
            status: poz.projectId?.status || '',
            supervisor: poz.projectId?.supervisor?.fullName || '-',
            contractor: poz.projectId?.contractor?.fullName || '-',
            pozCode: poz.pozId?.code || '',
            pozName: poz.pozId?.name || '',
            unit: poz.pozId?.unit || '',
            priceType: poz.pozId?.priceType === 'M' ? 'Malzeme' : 'Servis',
            price: price,
            contractorPrice: contractorPrice,
            quantity: amount,
            totalPrice: totalPrice,
            contractorTotal: contractorTotal,
            createdAt: poz.createdAt ? new Date(poz.createdAt).toLocaleDateString('tr-TR') : '-'
        };
    });

    // Tüm satırları tek seferde ekle
    worksheet.addRows(rows);
    
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
    worksheet.getColumn('price').numFmt = '#,##0.00 ₺';
    worksheet.getColumn('contractorPrice').numFmt = '#,##0.00 ₺';
    worksheet.getColumn('totalPrice').numFmt = '#,##0.00 ₺';
    worksheet.getColumn('contractorTotal').numFmt = '#,##0.00 ₺';
    
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
