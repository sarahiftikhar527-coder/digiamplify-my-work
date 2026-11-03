import * as service from "./public.service.js";

const ok = (res, data) =>
  res.status(200).json({
    success: true,
    message: data?.message,
    data,
  });

export const submitContact = async (req, res, next) => {
  try {
    const data = await service.submitContact(req.validated?.body || {});
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const data = await service.subscribeNewsletter(req.validated?.body || {});
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
};

export const unsubscribeNewsletter = async (req, res, next) => {
  try {
    const data = await service.unsubscribeNewsletter(
      req.validated?.body?.token
    );
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
};
