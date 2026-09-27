/**
 * GovTrack - Express REST API Router
 * Endpoints for Citizen Portal and Government Admin Operations
 */

import { Router } from 'express';
import {
  createDocumentRequest,
  getCitizenRequests,
  trackByNumber,
  getAllRequestsAdmin,
  updateRequestStatusAdmin,
  streamLiveEvents,
  getSystemStats,
  resetData,
} from '../controllers/requestController.ts';

const router = Router();

// Real-time Event Stream (Server-Sent Events)
router.get('/events', streamLiveEvents);

// Statistics & Diagnostic Overview
router.get('/stats', getSystemStats);

// Reset demo seed data
router.post('/seed/reset', resetData);

// Public Tracking Endpoint (Visual Step Tracker)
router.get('/requests/track/:trackingNumber', trackByNumber);

// Citizen Portal Endpoints
router.post('/requests', createDocumentRequest);
router.get('/requests/:userId', getCitizenRequests);

// Government Admin Portal Endpoints
router.get('/admin/requests', getAllRequestsAdmin);
router.patch('/admin/requests/:id', updateRequestStatusAdmin);

export default router;
