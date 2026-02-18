import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './router/auth_route.js';
import appointmentRoute from './router/appointment_route.js';
import doctorRoute from './router/doctor_route.js';
import patientRoute from './router/patient_route.js';
import visitRoute from './router/visit_route.js';
import medicationRoute from './router/medication_route.js';
import problemRoute from './router/problem_route.js';
import invoiceRoute from './router/invoice_route.js';
import backupRoute from './router/backup_route.js';
import connectDb from './utils/db.js';
import cors from 'cors';
import 'dotenv/config';
import cron from 'node-cron';
import { performAutomatedBackup } from './controllers/backup_controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', router);
app.use('/api/appointments', appointmentRoute);
app.use('/api/doctor', doctorRoute);
app.use('/api/patient', patientRoute);
app.use('/api/visits', visitRoute);
app.use('/api/medications', medicationRoute);
app.use('/api/problems', problemRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/backup', backupRoute);

// Connect to database
connectDb().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Automated Backups
  // Daily backup at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily backup...');
    performAutomatedBackup('daily');
  });

  // Weekly backup on Sunday at 1 AM
  cron.schedule('0 1 * * 0', () => {
    console.log('Running weekly backup...');
    performAutomatedBackup('weekly');
  });
}).catch((error) => {
  console.error('Database connection failed:', error);
});
