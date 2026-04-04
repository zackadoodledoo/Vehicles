import {
  createServiceRequest,
  getServiceRequestsByUser,
  getAllServiceRequests,
  updateServiceRequestStatus
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
    const { vehicle_id, message } = req.body;

    await createServiceRequest({
      user_id: req.session.user.id,
      vehicle_id,
      message
    });

    res.redirect("/account/service-requests");
  } catch (err) {
    next(err);
  }
}


export async function showUserRequests(req, res, next) {
  try {
    const requests = await getServiceRequestsByUser(req.session.user.id);
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

    await updateServiceRequestStatus(req.params.id, status);
    return res.redirect(303, '/admin/service-requests');
  } catch (err) {
    next(err);
  }
}
