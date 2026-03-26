import {
  createServiceRequest,
  getUserServiceRequests,
  getAllServiceRequests,
  updateServiceStatus,
} from "../models/serviceRequest.model.js";

export async function showServiceRequestForm(req, res) {
  res.render("service-requests/create");
}

export async function submitServiceRequest(req, res, next) {
  try {
    let { vehicle_id, message } = req.body;

    // Normalize vehicle_id for FK safety
    vehicle_id = vehicle_id?.trim();
    const vehicleId =
      vehicle_id && !isNaN(vehicle_id) ? Number(vehicle_id) : null;

    await createServiceRequest(
      req.session.user.id,
      vehicleId,
      message
    );

    res.redirect("/service-requests");
  } catch (err) {
    next(err);
  }
}

export async function showUserRequests(req, res, next) {
  try {
    const requests = await getUserServiceRequests(req.session.user.id);
    res.render("service-requests/user", { requests });
  } catch (err) {
    next(err);
  }
}

export async function showAllRequests(req, res, next) {
  try {
    const requests = await getAllServiceRequests();
    res.render("service-requests/admin", { requests });
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatus(req, res, next) {
  try {
    const { status } = req.body;
    await updateServiceStatus(req.params.id, status);
    res.redirect("/admin/service-requests");
  } catch (err) {
    next(err);
  }
}
