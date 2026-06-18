const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../utils/response');
const store = require('../../store');
const { genId } = require('../../utils/id');
const { validateMomRecordBody } = require('../../services/recordValidate');
const { formatRecord } = require('../../services/recordFormat');
const confinement = require('../../services/confinement');
const AppError = require('../../utils/AppError');

const router = express.Router();

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { date, type, page = '1', pageSize = '50' } = req.query;
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(100, Math.max(1, Number(pageSize) || 50));
    const result = await store.listMomRecords(req.userId, {
      date,
      type,
      page: p,
      pageSize: ps,
    });
    success(res, {
      list: result.list.map(formatRecord),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  })
);

router.get(
  '/today',
  auth,
  asyncHandler(async (req, res) => {
    const today = confinement.todayStr();
    const result = await store.listMomRecords(req.userId, { date: today, page: 1, pageSize: 200 });
    success(res, {
      list: result.list.map(formatRecord),
      total: result.total,
      date: today,
    });
  })
);

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    validateMomRecordBody(req.body);
    const { type, date, time, payload } = req.body;
    const item = {
      id: genId(),
      type,
      date,
      time,
      payload: normalizePayload(type, payload),
      deleted: false,
      createTime: Date.now(),
    };
    await store.createMomRecord(req.userId, item);
    success(res, formatRecord(item));
  })
);

router.put(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const existing = await store.findMomRecord(req.userId, req.params.id);
    if (!existing) throw new AppError('记录不存在', { status: 404, code: 40401 });

    const date = req.body.date !== undefined ? req.body.date : existing.date;
    const time = req.body.time !== undefined ? req.body.time : existing.time;
    const payload = req.body.payload
      ? { ...existing.payload, ...normalizePayload(existing.type, req.body.payload) }
      : existing.payload;

    validateMomRecordBody({ type: existing.type, date, time, payload });

    const record = await store.updateMomRecord(req.userId, req.params.id, { date, time, payload });
    success(res, formatRecord(record));
  })
);

router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const ok = await store.softDeleteMomRecord(req.userId, req.params.id);
    if (!ok) throw new AppError('记录不存在', { status: 404, code: 40401 });
    success(res, { id: req.params.id, deleted: true });
  })
);

function normalizePayload(type, payload) {
  if (type === 'weight' && payload.kg != null) {
    return { ...payload, kg: Math.round(Number(payload.kg) * 10) / 10 };
  }
  if (type === 'breast' && payload.blocked === 'no') {
    return { ...payload, side: '' };
  }
  return payload;
}

module.exports = router;
