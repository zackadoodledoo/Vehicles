import {
  createServiceRequest,
  getUserServiceRequests,
  getAllServiceRequests,
  updateServiceStatus
} from '../models/serviceRequest.model.js';

export async function showNewServiceRequestForm(req, res, next) {
  try {
    res.render('service-requests/new', { user: req.session.user });
  } catch (err) {
    next(err);
  }
}

export async function submitServiceRequest(req, res, next) {
  try {
    const userId = req.session.user.id;
    const { vehicle_id, service_type, description } = req.body;

    if (!service_type || !service_type.trim()) {
      return res.status(400).render('service-requests/new', {
        user: req.session.user,
        error: 'Service type is required.'
      });
    }

    await createServiceRequest({
      userId,
      vehicleId: vehicle_id ? Number(vehicle_id) : null,
      serviceType: service_type.trim(),
      description: (description || '').trim()
    });

    return res.redirect('/account/service-requests');
  } catch (err) {
    next(err);
  }
}

export async function showUserRequests(req, res, next) {
  try {
    const requests = await getUserServiceRequests(req.session.user.id);
    res.render('account/service-requests', { requests, user: req.session.user });
  } catch (err) {
    next(err);
  }
}

export async function showAdminRequests(req, res, next) {
  try {
    const requests = await getAllServiceRequests();
    res.render('admin/service-requests', { requests, user: req.session.user });
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatus(req, res, next) {
  try {
    const allowed = new Set(['submitted', 'in_progress', 'completed']);
    const status = (req.body.status || '').toString();

    if (!allowed.has(status)) {
      return res.status(400).send('Invalid status');
    }

    await updateServiceStatus(req.params.id, status);
    return res.redirect('/admin/service-requests');
  } catch (err) {
    next(err);
  }
}
