import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import User from '../model/user_model.js';
import Patient from '../model/patient_model.js';
import Doctor from '../model/doctor_model.js';
import Appointment from '../model/appointment_model.js';
import Invoice from '../model/invoice_model.js';
import Medication from '../model/medication_model.js';
import Problem from '../model/problem_model.js';
import Receptionist from '../model/receptionist_model.js';
import Visit from '../model/visit_model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
    { name: 'users', model: User },
    { name: 'patients', model: Patient },
    { name: 'doctors', model: Doctor },
    { name: 'appointments', model: Appointment },
    { name: 'invoices', model: Invoice },
    { name: 'medications', model: Medication },
    { name: 'problems', model: Problem },
    { name: 'receptionists', model: Receptionist },
    { name: 'visits', model: Visit }
];

const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const createBackup = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${timestamp}`;
        const backupPath = path.join(BACKUP_DIR, `${backupName}.zip`);

        const output = fs.createWriteStream(backupPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.status(200).json({
                message: 'Backup created successfully',
                filename: `${backupName}.zip`,
                size: archive.pointer()
            });
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        for (const { name, model } of models) {
            const data = await model.find({});
            archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
        }

        await archive.finalize();
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ message: 'Backup failed', error: error.message });
    }
};

export const getBackups = async (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const backupFiles = files
            .filter(file => file.endsWith('.zip'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    filename: file,
                    size: stats.size,
                    createdAt: stats.birthtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json(backupFiles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch backups', error: error.message });
    }
};

export const downloadBackup = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'Backup file not found' });
    }
};

export const deleteBackup = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'Backup deleted successfully' });
    } else {
        res.status(404).json({ message: 'Backup file not found' });
    }
};

import AdmZip from 'adm-zip';

export const restoreBackup = async (req, res) => {
    try {
        const { filename } = req.body;
        const filePath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Backup file not found' });
        }

        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
            const collectionName = entry.entryName.replace('.json', '');
            const modelObj = models.find(m => m.name === collectionName);

            if (modelObj) {
                const data = JSON.parse(entry.getData().toString('utf8'));

                // Clear collection
                await modelObj.model.deleteMany({});

                // Re-insert data
                if (data.length > 0) {
                    await modelObj.model.insertMany(data);
                }
            }
        }

        res.status(200).json({ message: 'System restored successfully from backup' });
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).json({ message: 'Restore failed', error: error.message });
    }
};

// Internal function for automated backups
export const performAutomatedBackup = async (type) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${type}-backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, `${backupName}.zip`);

    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise(async (resolve, reject) => {
        output.on('close', () => {
            console.log(`${type} backup completed: ${backupName}.zip`);
            resolve();
        });

        archive.on('error', (err) => {
            console.error(`${type} backup error:`, err);
            reject(err);
        });

        archive.pipe(output);

        for (const { name, model } of models) {
            const data = await model.find({});
            archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
        }

        archive.finalize();
    });
};
