/**
 * Step 2: Backend APIs (Node.js/Express)
 * REST API Controllers for Document Requests & Administrative Management
 */

import { Request, Response } from 'express';
import { dbService, liveEventHub } from '../db.ts';
import { DocumentStatus } from '../../types/index.ts';

/**
 * Controller: Citizen submits a new document request
 * POST /api/requests
 */
export async function createDocumentRequest(req: Request, res: Response) {
  try {
    const {
      userId,
      applicant,
      department,
      documentType,
      priority,
      deliveryMethod,
      deliveryAddress,
      feesPaid,
      supportingDocuments,
    } = req.body;

    // Validation
    if (!applicant?.fullName || !applicant?.email || !applicant?.nationalId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required applicant details (fullName, email, nationalId)',
      });
    }

    if (!department || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Target government department and document type are mandatory',
      });
    }

    const newRequest = await dbService.create({
      userId: userId || 'user-citizen-01',
      applicant,
      department,
      documentType,
      priority: priority || 'standard',
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryAddress: deliveryAddress || '',
      feesPaid: feesPaid || 25.0,
      supportingDocuments: supportingDocuments || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Government document request lodged successfully',
      data: newRequest,
      trackingNumber: newRequest.trackingNumber,
    });
  } catch (err: any) {
    console.error('Error creating request:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing document application',
    });
  }
}

/**
 * Controller: Citizen fetches all their requests
 * GET /api/requests/:userId
 */
export async function getCitizenRequests(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const requests = await dbService.getByUserId(userId);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err: any) {
    console.error('Error fetching citizen requests:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve document requests',
    });
  }
}

/**
 * Controller: Track by tracking number (Public visual tracking)
 * GET /api/requests/track/:trackingNumber
 */
export async function trackByNumber(req: Request, res: Response) {
  try {
    const { trackingNumber } = req.params;
    if (!trackingNumber) {
      return res.status(400).json({ success: false, error: 'Tracking number is required' });
    }

    const request = await dbService.getByTrackingNumber(trackingNumber);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: `No official record found for tracking identifier: ${trackingNumber}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err: any) {
    console.error('Error tracking document:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tracking information',
    });
  }
}

/**
 * Controller: Admin fetches all requests with optional filters
 * GET /api/admin/requests
 */
export async function getAllRequestsAdmin(req: Request, res: Response) {
  try {
    const { status, department, search, priority } = req.query;

    const requests = await dbService.getAll({
      status: status as string,
      department: department as string,
      search: search as string,
      priority: priority as string,
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err: any) {
    console.error('Error fetching admin requests:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch administrative records',
    });
  }
}

/**
 * Controller: Admin updates the status of a document
 * PATCH /api/admin/requests/:id
 */
export async function updateRequestStatusAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      status,
      changedBy,
      officerBadge,
      officerRemarks,
      rejectionReason,
      counterLocation,
      officerRole,
    } = req.body;

    const validStatuses: DocumentStatus[] = [
      'submitted',
      'under_verification',
      'processing',
      'ready_for_pickup',
      'rejected',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status: must be one of ${validStatuses.join(', ')}`,
      });
    }

    const updated = await dbService.updateStatus(id, {
      status,
      changedBy: changedBy || 'Supervising Official',
      officerBadge: officerBadge || 'GOV-DESK-01',
      officerRemarks: officerRemarks || '',
      rejectionReason: rejectionReason || '',
      counterLocation,
      officerRole: officerRole || 'official',
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Document request #${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Document status successfully transitioned to ${status}`,
      data: updated,
    });
  } catch (err: any) {
    console.error('Error updating status:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update document status',
    });
  }
}

/**
 * Controller: Real-Time Server-Sent Events (SSE) Stream
 * GET /api/events
 */
export function streamLiveEvents(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const onEvent = (payload: any) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  liveEventHub.on('event', onEvent);

  req.on('close', () => {
    liveEventHub.removeListener('event', onEvent);
    res.end();
  });
}

/**
 * Controller: Admin system overview statistics
 * GET /api/stats
 */
export async function getSystemStats(req: Request, res: Response) {
  try {
    const all = await dbService.getAll();
    const stats = {
      total: all.length,
      submitted: all.filter((r) => r.status === 'submitted').length,
      underVerification: all.filter((r) => r.status === 'under_verification').length,
      processing: all.filter((r) => r.status === 'processing').length,
      readyForPickup: all.filter((r) => r.status === 'ready_for_pickup').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
    };
    return res.status(200).json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to compute statistics' });
  }
}

/**
 * Controller: Reset seed data for testing
 * POST /api/seed/reset
 */
export async function resetData(req: Request, res: Response) {
  try {
    await dbService.resetSeed();
    const all = await dbService.getAll();
    return res.status(200).json({
      success: true,
      message: 'Seed database reset to default 5 official cases',
      data: all,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to reset seed database' });
  }
}
